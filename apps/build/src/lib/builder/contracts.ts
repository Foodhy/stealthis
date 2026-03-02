import { z } from "zod";

export const BUILDER_PROJECT_VERSION = "1.0";

export const BuilderStackSchema = z.enum(["astro-tailwind", "next-tailwind"]);
export const BuilderBaasSchema = z.enum(["none", "supabase", "firebase"]);
export const BuilderProviderSchema = z.enum(["none", "openai", "anthropic", "google"]);
export const BuilderOverwriteStrategySchema = z.enum(["ask", "skip", "replace"]);

export const BuilderNodeKindSchema = z.enum([
  "stack",
  "tool",
  "mcp",
  "skill",
  "infra",
  "auth",
  "db",
  "deploy",
]);

export const BuilderNodeStatusSchema = z.enum(["idle", "planned", "generated", "error"]);

export const BuilderNodeIOSchema = z.object({
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
});

export const BuilderNodeSchema = z.object({
  id: z.string().min(1),
  kind: BuilderNodeKindSchema,
  label: z.string().min(1),
  config: z.record(z.unknown()).default({}),
  io: BuilderNodeIOSchema.default({ inputs: [], outputs: [] }),
  promptHints: z.array(z.string()).default([]),
  status: BuilderNodeStatusSchema.default("idle"),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const BuilderEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  animated: z.boolean().optional(),
});

export const BuilderProjectSettingsSchema = z.object({
  provider: BuilderProviderSchema.default("none"),
  model: z.string().default(""),
  useAI: z.boolean().default(false),
  overwrite: BuilderOverwriteStrategySchema.default("ask"),
});

export const BuilderProjectSchema = z.object({
  version: z.literal(BUILDER_PROJECT_VERSION),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  stack: BuilderStackSchema,
  baas: BuilderBaasSchema.default("none"),
  nodes: z.array(BuilderNodeSchema).default([]),
  edges: z.array(BuilderEdgeSchema).default([]),
  settings: BuilderProjectSettingsSchema,
});

export const BuilderFilePlanSchema = z.object({
  path: z.string().min(1),
  purpose: z.string().min(1),
  sourceNodeIds: z.array(z.string()).default([]),
});

export const BuilderDependencySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  dev: z.boolean().default(false),
});

export const BuilderScriptSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
});

export const BuilderExecutionProjectMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  stack: BuilderStackSchema,
  baas: BuilderBaasSchema,
});

export const BuilderExecutionPlanSchema = z.object({
  projectMeta: BuilderExecutionProjectMetaSchema,
  filePlan: z.array(BuilderFilePlanSchema).default([]),
  dependencies: z.array(BuilderDependencySchema).default([]),
  scripts: z.array(BuilderScriptSchema).default([]),
  warnings: z.array(z.string()).default([]),
});

export const BuilderGeneratedFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  hash: z.string().min(1),
});

export const BuilderManifestSchema = z.object({
  version: z.literal(BUILDER_PROJECT_VERSION),
  projectId: z.string().min(1),
  projectTitle: z.string().min(1),
  generatedAt: z.string().min(1),
  stack: BuilderStackSchema,
  baas: BuilderBaasSchema,
  files: z.array(
    z.object({
      path: z.string().min(1),
      hash: z.string().min(1),
      bytes: z.number().int().nonnegative(),
      updatedAt: z.string().min(1),
    })
  ),
  snapshots: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      createdAt: z.string().min(1),
      changedPaths: z.array(z.string()).default([]),
    })
  ),
});

export const BuilderScaffoldSchema = z.object({
  files: z.array(BuilderGeneratedFileSchema),
  manifest: BuilderManifestSchema,
  warnings: z.array(z.string()).default([]),
});

export const LegacyProjectExportSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  graph: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        kind: BuilderNodeKindSchema,
        label: z.string(),
      })
    ),
    edges: z.array(
      z.object({
        id: z.string().optional(),
        source: z.string(),
        target: z.string(),
        sourceHandle: z.string().nullable().optional(),
        targetHandle: z.string().nullable().optional(),
      })
    ),
  }),
});

export type BuilderStack = z.infer<typeof BuilderStackSchema>;
export type BuilderBaas = z.infer<typeof BuilderBaasSchema>;
export type BuilderProvider = z.infer<typeof BuilderProviderSchema>;
export type BuilderNodeKind = z.infer<typeof BuilderNodeKindSchema>;
export type BuilderNodeStatus = z.infer<typeof BuilderNodeStatusSchema>;
export type BuilderOverwriteStrategy = z.infer<typeof BuilderOverwriteStrategySchema>;

export type BuilderNodeV1 = z.infer<typeof BuilderNodeSchema>;
export type BuilderEdgeV1 = z.infer<typeof BuilderEdgeSchema>;
export type BuilderProjectV1 = z.infer<typeof BuilderProjectSchema>;
export type BuilderExecutionPlanV1 = z.infer<typeof BuilderExecutionPlanSchema>;
export type BuilderGeneratedFile = z.infer<typeof BuilderGeneratedFileSchema>;
export type BuilderManifest = z.infer<typeof BuilderManifestSchema>;
export type BuilderScaffold = z.infer<typeof BuilderScaffoldSchema>;
export type LegacyProjectExport = z.infer<typeof LegacyProjectExportSchema>;
