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
  "restaurant",
  "hotel",
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

// ---------------------------------------------------------------------------
// Arcade — Challenges & Lessons
// ---------------------------------------------------------------------------

export const ChallengeTypeSchema = z.enum([
  "quiz",
  "complete",
  "fix",
  "identify",
  "animation",
]);

export const ChallengeQualitySchema = z.enum(["draft", "published"]);

const ChallengeBase = {
  slug: z.string().min(1),
  topic: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.number().int().min(1).max(5).default(1),
  resourceSlug: z.string().optional(),
  estimatedSeconds: z.number().int().positive().default(30),
  quality: ChallengeQualitySchema.default("published"),
  tags: z.array(z.string()).default([]),
  createdAt: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
  updatedAt: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
};

export const QuizChallengeSchema = z.object({
  ...ChallengeBase,
  type: z.literal("quiz"),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  answer: z.number().int().min(0),
  explanation: z.string().optional(),
});

export const CompleteChallengeSchema = z.object({
  ...ChallengeBase,
  type: z.literal("complete"),
  template: z.string().min(1),
  answers: z.record(z.string(), z.string()),
  caseSensitive: z.boolean().default(false),
  explanation: z.string().optional(),
});

export const FixChallengeSchema = z.object({
  ...ChallengeBase,
  type: z.literal("fix"),
  starter: z.string().min(1),
  solution: z.string().min(1),
  criterion: z.enum(["dom-equal", "regex", "visual"]).default("dom-equal"),
  regexPattern: z.string().optional(),
  explanation: z.string().optional(),
});

export const IdentifyChallengeSchema = z.object({
  ...ChallengeBase,
  type: z.literal("identify"),
  code: z.string().min(1),
  answer: z.union([z.number().int().min(0), z.string()]),
  options: z.array(z.string().min(1)).optional(),
  explanation: z.string().optional(),
});

export const AnimationChallengeSchema = z.object({
  ...ChallengeBase,
  type: z.literal("animation"),
  component: z.string().optional(),
  embed: z.string().optional(),
  followUp: z
    .object({
      question: z.string().min(1),
      options: z.array(z.string().min(1)).min(2).max(6),
      answer: z.number().int().min(0),
    })
    .optional(),
  explanation: z.string().optional(),
});

export const ChallengeMetaSchema = z.discriminatedUnion("type", [
  QuizChallengeSchema,
  CompleteChallengeSchema,
  FixChallengeSchema,
  IdentifyChallengeSchema,
  AnimationChallengeSchema,
]);

export type ChallengeMetaInput = z.input<typeof ChallengeMetaSchema>;
export type ChallengeMetaOutput = z.output<typeof ChallengeMetaSchema>;

export const LessonSchema = z.object({
  slug: z.string().min(1),
  topic: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
  challenges: z.array(z.string().min(1)).min(1),
});

export type LessonInput = z.input<typeof LessonSchema>;
export type LessonOutput = z.output<typeof LessonSchema>;
