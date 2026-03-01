import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { fileURLToPath } from "node:url";

const ResourceCategorySchema = z.enum([
  "web-animations", "web-pages", "ui-components", "patterns",
  "components", "pages", "prompts", "skills", "mcp-servers", "architectures", "boilerplates", "remotion",
]);

const ResourceTypeSchema = z.enum([
  "animation", "page", "component", "pattern",
  "prompt", "skill", "mcp-server", "architecture", "boilerplate",
]);

const ResourceDifficultySchema = z.enum(["easy", "med", "hard"]);

const ResourceTargetSchema = z.enum([
  "html", "react", "next", "vue", "svelte", "astro",
  "typescript", "python",
  "markdown", "yaml", "json",
]);

const resources = defineCollection({
  loader: glob({
    pattern: "*/index.mdx",
    base: fileURLToPath(new URL("../../../../packages/content/resources", import.meta.url)),
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
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
  }),
});

export const collections = { resources };
