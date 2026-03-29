import { fileURLToPath } from "node:url";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const ResourceCategorySchema = z.enum([
  "web-animations",
  "web-pages",
  "ui-components",
  "patterns",
  "components",
  "pages",
  "prompts",
  "architectures",
  "boilerplates",
  "remotion",
  "database-schemas",
  "ultra-high-definition-pages",
  "design-styles",
  "music",
  "3d-models",
  "3d-interactions",
  "plugins",
]);

const ResourceTypeSchema = z.enum([
  "animation",
  "page",
  "component",
  "pattern",
  "prompt",
  "skill",
  "mcp-server",
  "architecture",
  "boilerplate",
  "schema",
]);

const ResourceDifficultySchema = z.enum(["easy", "med", "hard"]);

const ResourceTargetSchema = z.enum([
  "html",
  "react",
  "react-native",
  "expo",
  "next",
  "vue",
  "svelte",
  "astro",
  "typescript",
  "python",
  "markdown",
  "yaml",
  "json",
  "sql",
  "mermaid",
  "dbml",
]);

const ResourceCollectionSchema = z.enum([
  "saas",
  "motion",
  "hero",
  "cards",
  "dashboard",
  "remotion",
  "effects",
  "mobile-nav",
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
    codepenExamples: z
      .array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          penUrl: z.string().url(),
          description: z.string().optional(),
          height: z.number().int().positive().default(520),
          defaultTab: z
            .enum(["result", "html,result", "css,result", "js,result"])
            .default("result"),
        })
      )
      .optional(),
    createdAt: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
    updatedAt: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
  }),
});

export const collections = { resources };
