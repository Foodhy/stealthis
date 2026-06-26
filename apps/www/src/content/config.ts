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
  "recommendations",
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
  "recommendation",
]);

const RecommendationKindSchema = z.enum([
  "agent-frameworks",
  "ai-models",
  "creative-apps",
  "books",
  "practice-platforms",
  "hackathons-events",
  "internships",
  "app-builders",
  "payments",
  "libraries",
  "platforms",
  "learning",
  "editors",
  "backend",
  "local-ai",
  "vector-db",
  "agent-tools",
  "audio",
  "3d",
  "business-apps",
  "design-assets",
  "media",
  "mcp",
  "game-dev",
  "hosting",
  "design-tools",
  "graphics",
  "auth",
  "email",
  "databases",
  "analytics",
  "cms",
  "search",
  "realtime",
  "monitoring",
  "jobs",
  "feature-flags",
  "storage",
]);

const RecommendationOptionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
  docs: z.string().url().optional(),
  demo: z.string().url().optional(),
  github: z.string().url().optional(),
  video: z.string().url().optional(),
  logo: z.string().optional(),
  bestFor: z.string().optional(),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  highlight: z.boolean().default(false),
  attributes: z.record(z.string(), z.string()).default({}),
});

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
  "charts",
  "restaurant",
  "hotel",
  "clinic",
  "gym",
  "salon",
  "realestate",
  "editorial",
  "comics",
  "music",
  "wiki",
  "patterns",
  "web3",
  "gamedev",
  "storybook",
  "travel",
  "portfolio",
  "ecommerce",
  "science",
  "museum",
  "cookbook",
  "agency",
  "d2c",
  "ai-product",
  "fintech",
  "elearning",
  "delivery",
  "streaming",
  "jobs",
  "events",
  "nonprofit",
  "creator",
  "airline",
  "cowork",
  "auto",
  "legal",
  "insurance",
  "construction",
  "vet",
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
    externalUrl: z.string().url().optional(),
    logo: z.string().optional(),
    recommendationKind: RecommendationKindSchema.optional(),
    bestFor: z.string().optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    options: z.array(RecommendationOptionSchema).default([]),
    comparison: z.array(z.string()).default([]),
    createdAt: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
    updatedAt: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
  }),
});

export const collections = { resources };
