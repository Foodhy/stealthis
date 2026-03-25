import { z } from "zod";

export const ResourceCategorySchema = z.enum([
  // Phase 1
  "web-animations",
  "web-pages",
  "ui-components",
  "patterns",
  // Phase 2
  "components",
  "pages",
  "prompts",
  "skills",
  "mcp-servers",
  "architectures",
  "boilerplates",
  "remotion",
  "database-schemas",
  "ultra-high-definition-pages",
  "design-styles",
  "music",
  "3d-models",
  "3d-interactions",
]);

export const ResourceTypeSchema = z.enum([
  // Phase 1
  "animation",
  "page",
  "component",
  "pattern",
  // Phase 2
  "prompt",
  "skill",
  "mcp-server",
  "architecture",
  "boilerplate",
  "schema",
]);

export const ResourceDifficultySchema = z.enum(["easy", "med", "hard"]);

export const ResourceTargetSchema = z.enum([
  // Code targets
  "html",
  "react",
  "next",
  "vue",
  "svelte",
  "astro",
  "react-native",
  "expo",
  "typescript",
  "python",
  // Content targets
  "markdown",
  "yaml",
  "json",
  "sql",
  "mermaid",
  "dbml",
]);

export const ResourceCollectionSchema = z.enum([
  "saas",
  "motion",
  "hero",
  "cards",
  "dashboard",
  "remotion",
  "effects",
  "mobile-nav",
  "charts",
]);

export const CodePenExampleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  penUrl: z.string().url(),
  description: z.string().optional(),
  height: z.number().int().positive().default(520),
  defaultTab: z.enum(["result", "html,result", "css,result", "js,result"]).default("result"),
});

export const ResourceMetaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: ResourceCategorySchema,
  type: ResourceTypeSchema,
  tags: z.array(z.string()).default([]),
  collections: z.array(ResourceCollectionSchema).default([]),
  tech: z.array(z.string()).default([]),
  difficulty: ResourceDifficultySchema,
  targets: z.array(ResourceTargetSchema).default([]),
  preview: z.string().optional(),
  labRoute: z.string().optional(),
  license: z.string().default("MIT"),
  author: z
    .object({
      name: z.string(),
      src: z.string(),
    })
    .optional(),
  codepenExamples: z.array(CodePenExampleSchema).optional(),
  createdAt: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
  updatedAt: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
});

export type ResourceMetaInput = z.input<typeof ResourceMetaSchema>;
export type ResourceMetaOutput = z.output<typeof ResourceMetaSchema>;
