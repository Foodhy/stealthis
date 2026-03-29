import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  StyleForgeDraftSchema,
  StyleForgeDraftTokensSchema,
  StyleForgeSuggestedComponentSchema,
  type StyleForgeDraft,
  type StyleForgeProvider,
  type StyleForgeReference,
  type StyleForgeSelection,
} from "@stealthis/schema/styleforge";
import { generateText } from "ai";
import { z } from "zod";
import { createId } from "./ids";

export interface StyleForgeLLMConfig {
  provider: StyleForgeProvider;
  model: string;
  apiKey?: string;
}

export interface DraftGenerationInput {
  selection: StyleForgeSelection;
  pageReferences: StyleForgeReference[];
  componentReferences: StyleForgeReference[];
}

export interface DraftGenerationResult {
  draft: StyleForgeDraft;
  mode: "deterministic" | "ai";
}

const DraftModelOutputSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  visualDirection: z.array(z.string()).min(1),
  tokens: StyleForgeDraftTokensSchema,
  suggestedComponents: z.array(StyleForgeSuggestedComponentSchema).min(1),
  warnings: z.array(z.string()).default([]),
});

function mapTonePalette(tone: StyleForgeSelection["constraints"]["tone"]) {
  if (tone === "playful") {
    return {
      background: "#0b1020",
      surface: "#16213b",
      text: "#f8f7ff",
      accent: "#ff7dd4",
      accentStrong: "#ff4bb8",
      fontDisplay: "'Sora', 'Space Grotesk', sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
    };
  }

  if (tone === "editorial") {
    return {
      background: "#f8f5f0",
      surface: "#efe8dd",
      text: "#1f2937",
      accent: "#8b5cf6",
      accentStrong: "#6d28d9",
      fontDisplay: "'Fraunces', 'Playfair Display', serif",
      fontBody: "'Inter', system-ui, sans-serif",
    };
  }

  if (tone === "bold") {
    return {
      background: "#050816",
      surface: "#101935",
      text: "#f3f4f6",
      accent: "#22d3ee",
      accentStrong: "#06b6d4",
      fontDisplay: "'Archivo Black', 'Space Grotesk', sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
    };
  }

  if (tone === "premium") {
    return {
      background: "#09070f",
      surface: "#181226",
      text: "#f8f6ff",
      accent: "#d4af37",
      accentStrong: "#f59e0b",
      fontDisplay: "'Cormorant Garamond', 'Playfair Display', serif",
      fontBody: "'Manrope', system-ui, sans-serif",
    };
  }

  return {
    background: "#0b1220",
    surface: "#152237",
    text: "#e2e8f0",
    accent: "#38bdf8",
    accentStrong: "#0ea5e9",
    fontDisplay: "'Sora', 'Inter', sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
  };
}

function radiusToken(radius: StyleForgeSelection["constraints"]["radius"]): string {
  if (radius === "sharp") return "6px";
  if (radius === "pill") return "999px";
  return "14px";
}

function shadowToken(contrast: StyleForgeSelection["constraints"]["contrast"]): string {
  if (contrast === "soft") return "0 14px 32px rgba(15, 23, 42, 0.2)";
  if (contrast === "high") return "0 14px 36px rgba(2, 6, 23, 0.5)";
  return "0 12px 30px rgba(15, 23, 42, 0.32)";
}

function buildVisualDirection(input: DraftGenerationInput): string[] {
  const pageTitles = input.pageReferences.slice(0, 2).map((reference) => reference.title);
  const componentTitles = input.componentReferences.slice(0, 3).map((reference) => reference.title);

  const lines = [
    `Anchor aesthetic: ${pageTitles.join(" + ") || "Modern product landing"}.`,
    `Core building blocks: ${componentTitles.join(", ") || "hero, metrics, CTA modules"}.`,
    `Interaction cadence: ${input.selection.constraints.motion} motion with ${input.selection.constraints.density} density.`,
    `UI shape language: ${input.selection.constraints.radius} corners and ${input.selection.constraints.contrast} contrast.`,
  ];

  if (input.selection.customNotes.trim()) {
    lines.push(`Custom notes applied: ${input.selection.customNotes.trim()}.`);
  }

  return lines;
}

function slugToComponentName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function buildSuggestedComponents(input: DraftGenerationInput) {
  const selected = input.componentReferences.map((reference) => ({
    id: reference.slug,
    name: slugToComponentName(reference.slug),
    rationale: `Inspired by ${reference.title} and adapted to the selected constraints.`,
    sourceSlugs: [reference.slug],
  }));

  const fallback = [
    {
      id: "hero-spotlight",
      name: "Hero Spotlight",
      rationale: "Sets the visual direction with headline, support copy, and primary CTA.",
      sourceSlugs: input.pageReferences.map((reference) => reference.slug).slice(0, 2),
    },
    {
      id: "feature-matrix",
      name: "Feature Matrix",
      rationale: "Structured comparison block for product value messaging.",
      sourceSlugs: [],
    },
    {
      id: "social-proof-strip",
      name: "Social Proof Strip",
      rationale: "Logos and trust metrics aligned with the selected tone.",
      sourceSlugs: [],
    },
    {
      id: "cta-conversion-panel",
      name: "CTA Conversion Panel",
      rationale: "Final conversion zone with clear hierarchy and friction-free action.",
      sourceSlugs: [],
    },
  ];

  const merged = [...selected, ...fallback];
  const deduped = new Map(merged.map((component) => [component.id, component]));
  return [...deduped.values()].slice(0, 6);
}

export function createDeterministicDraft(input: DraftGenerationInput): StyleForgeDraft {
  const palette = mapTonePalette(input.selection.constraints.tone);

  const base = DraftModelOutputSchema.parse({
    title: `${input.selection.constraints.tone.toUpperCase()} style system`,
    summary:
      "A cohesive linea grafica generated from selected references. Designed for modular HTML sections and reusable UI composition.",
    visualDirection: buildVisualDirection(input),
    tokens: {
      ...palette,
      radiusBase: radiusToken(input.selection.constraints.radius),
      shadow: shadowToken(input.selection.constraints.contrast),
    },
    suggestedComponents: buildSuggestedComponents(input),
    warnings: [],
  });

  return StyleForgeDraftSchema.parse({
    id: createId("sf-draft"),
    ...base,
  });
}

function unwrapJsonFromText(raw: string): string {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1).trim();
  }

  return raw.trim();
}

function buildAiPrompt(input: DraftGenerationInput): string {
  const context = {
    selectedPages: input.pageReferences,
    selectedComponents: input.componentReferences,
    constraints: input.selection.constraints,
    customNotes: input.selection.customNotes,
  };

  return [
    "You are a senior design system architect.",
    "Return ONLY valid JSON matching this shape:",
    '{"title":"string","summary":"string","visualDirection":["string"],"tokens":{"background":"string","surface":"string","text":"string","accent":"string","accentStrong":"string","radiusBase":"string","shadow":"string","fontDisplay":"string","fontBody":"string"},"suggestedComponents":[{"id":"string","name":"string","rationale":"string","sourceSlugs":["string"]}],"warnings":["string"]}',
    "Rules:",
    "- Suggest 4 to 6 components.",
    "- Keep tokens web-ready (hex, px, css shadow, web-safe font stacks).",
    "- Ensure output is tailored for HTML/CSS/JS implementation.",
    "- Avoid markdown.",
    "",
    "Input:",
    JSON.stringify(context, null, 2),
  ].join("\n");
}

async function runAiGeneration(prompt: string, config: StyleForgeLLMConfig): Promise<string> {
  if (!config.apiKey) {
    throw new Error("Missing API key.");
  }

  if (config.provider === "openai") {
    const openai = createOpenAI({ apiKey: config.apiKey });
    const { text } = await generateText({
      model: openai(config.model || "gpt-4o-mini"),
      prompt,
      system: "Respond with valid JSON only.",
      temperature: 0.4,
      maxRetries: 2,
      maxTokens: 1800,
    });
    return text;
  }

  if (config.provider === "anthropic") {
    const anthropic = createAnthropic({ apiKey: config.apiKey });
    const { text } = await generateText({
      model: anthropic(config.model || "claude-3-5-sonnet-latest"),
      prompt,
      system: "Respond with valid JSON only.",
      temperature: 0.4,
      maxRetries: 2,
      maxTokens: 1800,
    });
    return text;
  }

  const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
  const { text } = await generateText({
    model: google(config.model || "gemini-1.5-flash"),
    prompt,
    system: "Respond with valid JSON only.",
    temperature: 0.4,
    maxRetries: 2,
    maxTokens: 1800,
  });

  return text;
}

export async function generateStyleForgeDraft(
  input: DraftGenerationInput,
  config: StyleForgeLLMConfig
): Promise<DraftGenerationResult> {
  const deterministicDraft = createDeterministicDraft(input);

  if (config.provider === "none" || !config.apiKey) {
    return {
      draft: deterministicDraft,
      mode: "deterministic",
    };
  }

  try {
    const raw = await runAiGeneration(buildAiPrompt(input), config);
    const parsed = JSON.parse(unwrapJsonFromText(raw));
    const aiDraft = DraftModelOutputSchema.parse(parsed);

    return {
      mode: "ai",
      draft: StyleForgeDraftSchema.parse({
        id: createId("sf-draft"),
        ...aiDraft,
      }),
    };
  } catch (error) {
    return {
      mode: "deterministic",
      draft: {
        ...deterministicDraft,
        warnings: [
          ...deterministicDraft.warnings,
          `AI fallback used: ${error instanceof Error ? error.message : String(error)}`,
        ],
      },
    };
  }
}
