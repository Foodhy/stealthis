import { z } from "zod";

export const STYLEFORGE_VERSION = "1.0";

export const StyleForgeProviderSchema = z.enum(["none", "openai", "anthropic", "google"]);

export const StyleForgeConstraintSchema = z.object({
  density: z.enum(["compact", "balanced", "airy"]),
  radius: z.enum(["sharp", "rounded", "pill"]),
  contrast: z.enum(["soft", "balanced", "high"]),
  motion: z.enum(["none", "subtle", "expressive"]),
  tone: z.enum(["neutral", "playful", "editorial", "bold", "premium"]),
});

export const StyleForgeReferenceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  labRoute: z.string().nullable().default(null),
});

export const StyleForgeSelectionSchema = z.object({
  pageReferenceSlugs: z.array(z.string().min(1)).min(1).max(8),
  componentReferenceSlugs: z.array(z.string().min(1)).min(1).max(12),
  constraints: StyleForgeConstraintSchema,
  customNotes: z.string().default(""),
});

export const StyleForgeDraftTokensSchema = z.object({
  background: z.string().min(1),
  surface: z.string().min(1),
  text: z.string().min(1),
  accent: z.string().min(1),
  accentStrong: z.string().min(1),
  radiusBase: z.string().min(1),
  shadow: z.string().min(1),
  fontDisplay: z.string().min(1),
  fontBody: z.string().min(1),
});

export const StyleForgeSuggestedComponentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rationale: z.string().min(1),
  sourceSlugs: z.array(z.string()).default([]),
});

export const StyleForgeDraftSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  visualDirection: z.array(z.string()).min(1),
  tokens: StyleForgeDraftTokensSchema,
  suggestedComponents: z.array(StyleForgeSuggestedComponentSchema).min(1),
  warnings: z.array(z.string()).default([]),
});

export const StyleForgeJobStatusSchema = z.enum(["queued", "generating", "ready", "error"]);

export const StyleForgeJobSchema = z.object({
  id: z.string().min(1),
  selection: StyleForgeSelectionSchema,
  status: StyleForgeJobStatusSchema,
  draftId: z.string().nullable().default(null),
  kitId: z.string().nullable().default(null),
  error: z.string().nullable().default(null),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const StyleForgeFileMetaSchema = z.object({
  path: z.string().min(1),
  hash: z.string().min(1),
  bytes: z.number().int().nonnegative(),
});

export const StyleForgeKitManifestSchema = z.object({
  version: z.literal(STYLEFORGE_VERSION),
  id: z.string().min(1),
  createdAt: z.string().min(1),
  draftId: z.string().min(1),
  sourceReferences: z.array(StyleForgeReferenceSchema),
  selection: StyleForgeSelectionSchema,
  files: z.array(StyleForgeFileMetaSchema).min(1),
  warnings: z.array(z.string()).default([]),
});

export const StyleForgeGeneratedFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  hash: z.string().min(1),
});

export const StyleForgeKitSchema = z.object({
  id: z.string().min(1),
  files: z.array(StyleForgeGeneratedFileSchema).min(1),
  manifest: StyleForgeKitManifestSchema,
  warnings: z.array(z.string()).default([]),
});

export type StyleForgeProvider = z.infer<typeof StyleForgeProviderSchema>;
export type StyleForgeReference = z.infer<typeof StyleForgeReferenceSchema>;
export type StyleForgeSelection = z.infer<typeof StyleForgeSelectionSchema>;
export type StyleForgeDraft = z.infer<typeof StyleForgeDraftSchema>;
export type StyleForgeJob = z.infer<typeof StyleForgeJobSchema>;
export type StyleForgeKitManifest = z.infer<typeof StyleForgeKitManifestSchema>;
export type StyleForgeGeneratedFile = z.infer<typeof StyleForgeGeneratedFileSchema>;
export type StyleForgeKit = z.infer<typeof StyleForgeKitSchema>;
