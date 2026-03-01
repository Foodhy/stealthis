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
  "typescript",
  "python",
  // Content targets
  "markdown",
  "yaml",
  "json",
]);

export const ResourceMetaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: ResourceCategorySchema,
  type: ResourceTypeSchema,
  tags: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  difficulty: ResourceDifficultySchema,
  targets: z.array(ResourceTargetSchema).default([]),
  preview: z.string().optional(),
  labRoute: z.string().optional(),
  license: z.string().default("MIT"),
  author: z.object({
    name: z.string(),
    src: z.string(),
  }).optional(),
  createdAt: z.union([z.string(), z.date()]).transform((v) =>
    v instanceof Date ? v.toISOString().slice(0, 10) : v
  ),
  updatedAt: z.union([z.string(), z.date()]).transform((v) =>
    v instanceof Date ? v.toISOString().slice(0, 10) : v
  ),
});

export type ResourceMetaInput = z.input<typeof ResourceMetaSchema>;
export type ResourceMetaOutput = z.output<typeof ResourceMetaSchema>;
