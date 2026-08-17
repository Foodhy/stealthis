/**
 * Fase 3 — el cuerpo del DESIGN.md, escrito por el modelo.
 *
 * Es la primera fase que gasta dinero del usuario, y eso condiciona el diseño:
 *
 *  · Al modelo se le manda el frontmatter YA EXTRAÍDO, no el CSS capturado.
 *    Los 700 KB de CSS de una página no dicen nada que los tokens no digan ya,
 *    y meterlos en el prompt multiplicaría la factura por nada.
 *  · La ESTRUCTURA no la decide el modelo. Él escribe el contenido de cada
 *    sección; el orden y los encabezados de la spec los ponemos nosotros. Así
 *    "las ocho secciones en orden" es una garantía, no una esperanza.
 *  · Todo lo que devuelva se valida antes de guardarlo. Una referencia
 *    `{colors.no-existe}` rompe el archivo para cualquier agente que lo lea,
 *    así que se descarta en vez de propagarla.
 */

import { type ChatMessage, chat } from "@stealthis/ai-providers";
import type { AiProviderConfig } from "@stealthis/ai-providers";
import type { Frontmatter } from "./tokens";

/** Las ocho secciones de la spec, en su orden obligatorio. */
export const BODY_SECTIONS = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
] as const;

export type SectionId = (typeof BODY_SECTIONS)[number];

/**
 * Nombres alternativos que la propia spec admite para tres secciones. Un modelo
 * puede devolver "Layout & Spacing" y estar en lo cierto; rechazarlo por no ser
 * la cadena exacta perdería una sección bien escrita.
 */
const SECTION_ALIASES: Record<string, SectionId> = {
  "brand & style": "Overview",
  "layout & spacing": "Layout",
  elevation: "Elevation & Depth",
  "dos and don'ts": "Do's and Don'ts",
  "do's and don'ts": "Do's and Don'ts",
  "do’s and don’ts": "Do's and Don'ts",
};

/** Normaliza la clave que devolvió el modelo a la sección canónica. */
function canonicalSection(raw: string): SectionId | null {
  const trimmed = raw.trim();
  const exact = BODY_SECTIONS.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  return SECTION_ALIASES[trimmed.toLowerCase()] ?? null;
}

export type ProseResult = {
  /** Texto de cada sección, sin el encabezado. */
  sections: Record<string, string>;
  /** El bloque `components` del frontmatter, con referencias ya validadas. */
  components: Record<string, Record<string, string>>;
  /** Lo que se descartó por no validar, para poder enseñarlo. */
  discarded: string[];
};

/** Componentes que se detectan en el HTML, para que el modelo no los invente. */
export function detectComponents(html: string): string[] {
  const found = new Set<string>();
  const add = (name: string) => found.add(name);

  if (/<button\b/i.test(html)) add("button-primary");
  if (/<a\b[^>]*class="[^"]*\b(btn|button|cta)\b/i.test(html)) add("button-secondary");
  if (/<input\b[^>]*type=["']?(text|email|search|password)/i.test(html)) add("input-field");
  if (/<textarea\b/i.test(html)) add("textarea");
  if (/<select\b/i.test(html)) add("select");
  if (/class="[^"]*\bcard\b/i.test(html)) add("card");
  if (/<nav\b/i.test(html)) add("nav-link");
  if (/class="[^"]*\b(badge|tag|chip|pill)\b/i.test(html)) add("badge");
  if (/class="[^"]*\b(alert|banner|notice|toast)\b/i.test(html)) add("alert");
  if (/<table\b/i.test(html)) add("table-cell");
  if (/<footer\b/i.test(html)) add("footer");
  if (/role=["']?dialog/i.test(html) || /class="[^"]*\bmodal\b/i.test(html)) add("modal");

  return [...found];
}

const SYSTEM = `You write the prose body of a DESIGN.md file — the open format Google Labs published for describing a design system to coding agents.

The tokens are already extracted and are NOT yours to change. Your job is the reasoning a token table cannot carry: what each value is FOR, and when to reach for it.

Rules:
- Write rules an agent can apply, not adjectives. "Use the accent only for the single primary action per screen" is useful. "A bold, modern palette" is not.
- Refer to tokens by their name, so the prose and the front matter stay connected.
- Never invent tokens that are not in the front matter you were given.
- If a section has nothing real to say for this design system, say what the design does INSTEAD. A flat design still has an Elevation section: it explains how hierarchy is conveyed without shadows.
- 2 to 5 sentences per section. This is a reference document, not an essay.

Answer with JSON only, no markdown fence, in this exact shape:
{
  "sections": {
    "Overview": "...", "Colors": "...", "Typography": "...", "Layout": "...",
    "Elevation & Depth": "...", "Shapes": "...", "Components": "...", "Do's and Don'ts": "..."
  },
  "components": {
    "button-primary": { "backgroundColor": "{colors.primary}", "textColor": "{colors.surface}", "rounded": "{rounded.md}" }
  }
}

For "components", every value must be either a reference to a token that exists in the front matter, written as {group.name}, or a literal CSS value for something that genuinely is not a token (a glass overlay like rgba(255,255,255,0.1), for instance). Allowed property names: backgroundColor, textColor, typography, rounded, padding, size, height, width.`;

export function buildPrompt(front: Frontmatter, components: string[], url: string): ChatMessage[] {
  // Se manda el frontmatter, no el CSS: es lo que el modelo necesita y cuesta
  // dos órdenes de magnitud menos en tokens.
  const tokens = {
    name: front.name,
    colors: front.colors,
    typography: front.typography,
    rounded: front.rounded,
    spacing: front.spacing,
  };

  const user = [
    `Site: ${url}`,
    "",
    "Extracted tokens (the front matter of the DESIGN.md):",
    "```json",
    JSON.stringify(tokens, null, 2),
    "```",
    "",
    components.length
      ? `Components detected in the page markup: ${components.join(", ")}. Define each of these, plus any hover or active variant that makes sense, as sibling keys (button-primary-hover).`
      : "No components were detected in the markup; define the handful any interface needs.",
  ].join("\n");

  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ];
}

/** Extrae el JSON aunque el modelo lo envuelva en explicaciones o en un fence. */
export function parseJsonResponse(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? raw).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    // Segundo intento: el objeto más grande que haya en el texto.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("The model did not return JSON.");
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      throw new Error("The model returned JSON that does not parse.");
    }
  }
}

const COMPONENT_PROPS = new Set([
  "backgroundColor",
  "textColor",
  "typography",
  "rounded",
  "padding",
  "size",
  "height",
  "width",
]);

const REFERENCE = /^\{([a-zA-Z0-9_.-]+)\}$/;

/** ¿Existe `colors.primary` en el frontmatter que le dimos? */
function referenceResolves(front: Frontmatter, path: string): boolean {
  const [group, ...rest] = path.split(".");
  const name = rest.join(".");
  const groups: Record<string, object | undefined> = {
    colors: front.colors,
    typography: front.typography,
    rounded: front.rounded,
    spacing: front.spacing,
  };
  const bag = groups[group];
  return Boolean(bag && name && Object.hasOwn(bag, name));
}

/**
 * Se queda con lo que es válido y anota lo que no. Un archivo con una
 * referencia rota es peor que un archivo con un componente de menos: el agente
 * que lo lea se encontrará con un valor que no existe.
 */
export function validate(front: Frontmatter, parsed: unknown): ProseResult {
  const discarded: string[] = [];
  const obj = (parsed ?? {}) as Record<string, unknown>;

  const rawSections =
    obj.sections && typeof obj.sections === "object"
      ? (obj.sections as Record<string, unknown>)
      : {};

  // Se indexa por sección canónica, aceptando los alias de la spec.
  const byCanonical = new Map<SectionId, string>();
  for (const [rawName, text] of Object.entries(rawSections)) {
    const canonical = canonicalSection(rawName);
    if (!canonical || typeof text !== "string" || !text.trim()) continue;
    if (!byCanonical.has(canonical)) byCanonical.set(canonical, text.trim());
  }

  const sections: Record<string, string> = {};
  for (const name of BODY_SECTIONS) {
    const text = byCanonical.get(name);
    if (text) sections[name] = text;
    else discarded.push(`section "${name}" came back empty`);
  }

  const rawComponents = (obj.components ?? {}) as Record<string, unknown>;
  const components: Record<string, Record<string, string>> = {};

  for (const [component, value] of Object.entries(rawComponents)) {
    if (!value || typeof value !== "object") {
      discarded.push(`component "${component}" was not an object`);
      continue;
    }
    const props: Record<string, string> = {};
    for (const [prop, raw] of Object.entries(value as Record<string, unknown>)) {
      if (!COMPONENT_PROPS.has(prop)) {
        discarded.push(`${component}.${prop} is not a component property in the spec`);
        continue;
      }
      if (typeof raw !== "string") {
        discarded.push(`${component}.${prop} was not a string`);
        continue;
      }
      const ref = raw.match(REFERENCE);
      if (ref && !referenceResolves(front, ref[1])) {
        discarded.push(`${component}.${prop} points at ${raw}, which does not exist`);
        continue;
      }
      props[prop] = raw;
    }
    if (Object.keys(props).length) components[component] = props;
    else discarded.push(`component "${component}" had nothing usable left`);
  }

  return { sections, components, discarded };
}

/** Monta el cuerpo Markdown con los encabezados de la spec, en su orden. */
export function renderBody(sections: Record<string, string>): string {
  return BODY_SECTIONS.map((name) => {
    const text = sections[name] ?? "_Nothing to say for this design system._";
    return `## ${name}\n\n${text}`;
  }).join("\n\n");
}

export type ProsePhaseInput = {
  front: Frontmatter;
  html: string;
  url: string;
  config: AiProviderConfig;
  signal?: AbortSignal;
  onToken?: (t: string) => void;
};

export async function runProsePhase(input: ProsePhaseInput): Promise<ProseResult> {
  if (!input.config.model) throw new Error("Pick a model first — this phase needs one.");
  if (input.config.provider !== "ollama" && !input.config.apiKey)
    throw new Error("This provider needs an API key before the phase can run.");

  const messages = buildPrompt(input.front, detectComponents(input.html), input.url);

  const answer = await chat({
    config: input.config,
    messages,
    ...(input.signal ? { signal: input.signal } : {}),
    ...(input.onToken ? { onToken: input.onToken } : {}),
  });

  if (!answer.trim()) throw new Error("The model returned an empty response.");

  return validate(input.front, parseJsonResponse(answer));
}
