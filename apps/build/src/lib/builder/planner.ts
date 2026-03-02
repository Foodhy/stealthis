import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  BuilderExecutionPlanSchema,
  type BuilderExecutionPlanV1,
  type BuilderProjectV1,
  type BuilderProvider,
} from "./contracts";

export interface PlanningLLMConfig {
  provider: BuilderProvider;
  model: string;
  apiKey?: string;
}

export interface PlanningResult {
  plan: BuilderExecutionPlanV1;
  mode: "deterministic" | "ai";
}

function uniqueByPath(items: BuilderExecutionPlanV1["filePlan"]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
}

function baseDependencies(project: BuilderProjectV1): BuilderExecutionPlanV1["dependencies"] {
  if (project.stack === "astro-tailwind") {
    return [
      { name: "astro", version: "^5.0.0", dev: false },
      { name: "tailwindcss", version: "^3.4.0", dev: false },
      { name: "typescript", version: "^5.0.0", dev: true },
    ];
  }

  return [
    { name: "next", version: "^15.0.0", dev: false },
    { name: "react", version: "^19.0.0", dev: false },
    { name: "react-dom", version: "^19.0.0", dev: false },
    { name: "tailwindcss", version: "^3.4.0", dev: false },
    { name: "typescript", version: "^5.0.0", dev: true },
  ];
}

function baasDependencies(project: BuilderProjectV1): BuilderExecutionPlanV1["dependencies"] {
  if (project.baas === "supabase") {
    return [{ name: "@supabase/supabase-js", version: "^2.0.0", dev: false }];
  }

  if (project.baas === "firebase") {
    return [{ name: "firebase", version: "^11.0.0", dev: false }];
  }

  return [];
}

function scriptsForStack(project: BuilderProjectV1): BuilderExecutionPlanV1["scripts"] {
  if (project.stack === "astro-tailwind") {
    return [
      { name: "dev", command: "astro dev" },
      { name: "build", command: "astro build" },
      { name: "preview", command: "astro preview" },
    ];
  }

  return [
    { name: "dev", command: "next dev" },
    { name: "build", command: "next build" },
    { name: "start", command: "next start" },
  ];
}

function coreFilePlan(project: BuilderProjectV1): BuilderExecutionPlanV1["filePlan"] {
  const files: BuilderExecutionPlanV1["filePlan"] = [
    {
      path: "README.md",
      purpose: "Project setup instructions and generated architecture summary.",
      sourceNodeIds: [],
    },
    {
      path: "IMPLEMENTATION.md",
      purpose: "Implementation checklist generated from graph nodes.",
      sourceNodeIds: project.nodes.map((node) => node.id),
    },
    {
      path: ".stealthis/manifest.json",
      purpose: "Builder manifest with file hashes and snapshot metadata.",
      sourceNodeIds: [],
    },
    {
      path: ".env.example",
      purpose: "Environment variables template.",
      sourceNodeIds: [],
    },
  ];

  if (project.stack === "astro-tailwind") {
    files.push(
      {
        path: "package.json",
        purpose: "Project dependencies and scripts.",
        sourceNodeIds: [],
      },
      {
        path: "astro.config.mjs",
        purpose: "Astro runtime configuration.",
        sourceNodeIds: [],
      },
      {
        path: "tsconfig.json",
        purpose: "TypeScript compiler options.",
        sourceNodeIds: [],
      },
      {
        path: "src/pages/index.astro",
        purpose: "Generated homepage scaffold.",
        sourceNodeIds: project.nodes.map((node) => node.id),
      },
      {
        path: "src/styles/global.css",
        purpose: "Global Tailwind and base styles.",
        sourceNodeIds: [],
      }
    );
  } else {
    files.push(
      {
        path: "package.json",
        purpose: "Project dependencies and scripts.",
        sourceNodeIds: [],
      },
      {
        path: "next.config.mjs",
        purpose: "Next.js runtime configuration.",
        sourceNodeIds: [],
      },
      {
        path: "tsconfig.json",
        purpose: "TypeScript compiler options.",
        sourceNodeIds: [],
      },
      {
        path: "app/layout.tsx",
        purpose: "Root layout component.",
        sourceNodeIds: [],
      },
      {
        path: "app/page.tsx",
        purpose: "Generated homepage scaffold.",
        sourceNodeIds: project.nodes.map((node) => node.id),
      },
      {
        path: "app/globals.css",
        purpose: "Global Tailwind and base styles.",
        sourceNodeIds: [],
      }
    );
  }

  if (project.baas !== "none") {
    files.push({
      path: "src/lib/baas.ts",
      purpose: "BaaS client initialization and typed helper exports.",
      sourceNodeIds: project.nodes
        .filter((node) => node.kind === "auth" || node.kind === "db")
        .map((node) => node.id),
    });
  }

  return uniqueByPath(files);
}

export function createDeterministicPlan(
  project: BuilderProjectV1,
  warnings: string[] = []
): BuilderExecutionPlanV1 {
  const allWarnings = [...warnings];

  if (!project.nodes.some((node) => node.kind === "stack")) {
    allWarnings.push("No stack node found; using stack selected in project settings.");
  }

  if (project.baas === "none") {
    allWarnings.push("No backend preset selected. Generated scaffold will be frontend-only.");
  }

  return BuilderExecutionPlanSchema.parse({
    projectMeta: {
      id: project.id,
      title: project.title,
      stack: project.stack,
      baas: project.baas,
    },
    dependencies: [...baseDependencies(project), ...baasDependencies(project)],
    scripts: scriptsForStack(project),
    filePlan: coreFilePlan(project),
    warnings: allWarnings,
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

function buildPlannerPrompt(project: BuilderProjectV1): string {
  return [
    "You are a software planning agent.",
    "Generate a JSON object that matches this TypeScript shape exactly:",
    '{"projectMeta":{"id":"string","title":"string","stack":"astro-tailwind|next-tailwind","baas":"none|supabase|firebase"},"filePlan":[{"path":"string","purpose":"string","sourceNodeIds":["string"]}],"dependencies":[{"name":"string","version":"string","dev":false}],"scripts":[{"name":"string","command":"string"}],"warnings":["string"]}',
    "Do not include markdown, comments, or additional keys.",
    "",
    "Project input:",
    JSON.stringify(project, null, 2),
  ].join("\n");
}

async function generatePlanWithSdk(prompt: string, config: PlanningLLMConfig): Promise<string> {
  if (!config.apiKey) {
    throw new Error("Missing API key.");
  }

  if (config.provider === "openai") {
    const openai = createOpenAI({ apiKey: config.apiKey });
    const { text } = await generateText({
      model: openai(config.model || "gpt-4o-mini"),
      prompt,
      system: "Respond with valid JSON only.",
      temperature: 0.2,
      maxRetries: 2,
      maxTokens: 2200,
    });
    return text;
  }

  if (config.provider === "anthropic") {
    const anthropic = createAnthropic({ apiKey: config.apiKey });
    const { text } = await generateText({
      model: anthropic(config.model || "claude-3-5-sonnet-latest"),
      prompt,
      system: "Respond with valid JSON only.",
      temperature: 0.2,
      maxRetries: 2,
      maxTokens: 2200,
    });

    return text;
  }

  const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
  const { text } = await generateText({
    model: google(config.model || "gemini-1.5-flash"),
    prompt,
    system: "Respond with valid JSON only.",
    temperature: 0.2,
    maxRetries: 2,
    maxTokens: 2200,
  });

  return text;
}

export async function generateExecutionPlan(
  project: BuilderProjectV1,
  config?: PlanningLLMConfig
): Promise<PlanningResult> {
  const deterministic = createDeterministicPlan(project);

  if (!config || !project.settings.useAI || config.provider === "none" || !config.apiKey) {
    return {
      plan: deterministic,
      mode: "deterministic",
    };
  }

  const prompt = buildPlannerPrompt(project);

  try {
    const raw = await generatePlanWithSdk(prompt, config);

    const parsed = JSON.parse(unwrapJsonFromText(raw));
    const validated = BuilderExecutionPlanSchema.parse(parsed);

    return {
      plan: validated,
      mode: "ai",
    };
  } catch (error) {
    return {
      plan: createDeterministicPlan(project, [
        `AI planning fallback used: ${error instanceof Error ? error.message : String(error)}`,
      ]),
      mode: "deterministic",
    };
  }
}
