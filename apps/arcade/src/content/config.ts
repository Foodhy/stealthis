import { join } from "node:path";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Astro Content Layer can't reuse the Zod schemas from @stealthis/schema directly because
// Astro requires schemas built from its own `z` instance. We mirror the shape loosely and
// rely on `loadChallenges()` from @schema for the strict parse at runtime.
const contentRoot = join(process.cwd(), "..", "..", "packages", "content");

const challenges = defineCollection({
  loader: glob({
    base: contentRoot,
    pattern: "challenges/**/index.mdx",
  }),
  schema: z.object({
    slug: z.string(),
    topic: z.string(),
    title: z.string(),
    type: z.enum(["quiz", "complete", "fix", "identify", "animation"]),
    difficulty: z.number().int().min(1).max(5).default(1),
    resourceSlug: z.string().optional(),
    estimatedSeconds: z.number().int().positive().default(30),
    quality: z.enum(["draft", "published"]).default("published"),
    tags: z.array(z.string()).default([]),
    createdAt: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
    updatedAt: z
      .union([z.string(), z.date()])
      .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
    // type-specific fields are passthrough — strict validation happens in @schema.
    question: z.string().optional(),
    options: z.array(z.string()).optional(),
    answer: z.union([z.number(), z.string()]).optional(),
    explanation: z.string().optional(),
    template: z.string().optional(),
    answers: z.record(z.string(), z.string()).optional(),
    caseSensitive: z.boolean().optional(),
    starter: z.string().optional(),
    solution: z.string().optional(),
    criterion: z.enum(["dom-equal", "regex", "visual"]).optional(),
    regexPattern: z.string().optional(),
    code: z.string().optional(),
    component: z.string().optional(),
    followUp: z
      .object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.number(),
      })
      .optional(),
  }),
});

export const collections = { challenges };
