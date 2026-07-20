import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { ChallengeMetaSchema, LessonSchema, PathSchema, ResourceMetaSchema } from "./schema.js";
import type { ChallengeMetaOutput, LessonOutput, PathOutput, ResourceMetaOutput } from "./schema.js";

// fast-glob only accepts forward slashes in patterns; node:path join() emits
// backslashes on Windows, which silently matches zero files there.
// Only the directory is converted — convertPathToPattern escapes glob
// metacharacters (`*`, `?`, …), so passing the full pattern through it
// silently matches zero files.
const globPattern = (contentDir: string, subpath: string) =>
  `${fg.convertPathToPattern(contentDir)}/${subpath}`;

export async function loadResources(contentDir: string): Promise<ResourceMetaOutput[]> {
  const pattern = globPattern(contentDir, "resources/*/index.mdx");
  const files = await fg(pattern, { onlyFiles: true });

  const resources: ResourceMetaOutput[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const { data } = matter(raw);

    const result = ResourceMetaSchema.safeParse(data);
    if (!result.success) {
      console.warn(`[schema] Invalid resource at ${file}:`, result.error.flatten());
      continue;
    }

    resources.push(result.data);
  }

  return resources.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getResourceCatalog(contentDir: string): Promise<ResourceMetaOutput[]> {
  return loadResources(contentDir);
}

export async function getResourceBySlug(
  contentDir: string,
  slug: string
): Promise<ResourceMetaOutput | null> {
  const resources = await loadResources(contentDir);
  return resources.find((r) => r.slug === slug) ?? null;
}

export function readSnippet(contentDir: string, slug: string, target: string): string | null {
  const extensions: Record<string, string> = {
    html: "html",
    style: "css",
    script: "js",
    react: "tsx",
    next: "tsx",
    vue: "vue",
    svelte: "svelte",
    astro: "astro",
  };

  const candidates = [
    join(contentDir, `resources/${slug}/snippets/${target}.${extensions[target] ?? target}`),
    join(contentDir, `resources/${slug}/snippets/${target}`),
  ];

  for (const candidate of candidates) {
    try {
      return readFileSync(candidate, "utf-8");
    } catch {
      // try next
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Arcade — Challenges & Lessons
// ---------------------------------------------------------------------------

export async function loadChallenges(contentDir: string): Promise<ChallengeMetaOutput[]> {
  const pattern = globPattern(contentDir, "challenges/**/index.mdx");
  const files = await fg(pattern, { onlyFiles: true });

  const challenges: ChallengeMetaOutput[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const { data } = matter(raw);

    const result = ChallengeMetaSchema.safeParse(data);
    if (!result.success) {
      console.warn(`[schema] Invalid challenge at ${file}:`, result.error.flatten());
      continue;
    }

    challenges.push(result.data);
  }

  return challenges.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function loadLessons(contentDir: string): Promise<LessonOutput[]> {
  const pattern = globPattern(contentDir, "challenges/_lessons/**/*.yaml");
  const files = await fg(pattern, { onlyFiles: true });

  const lessons: LessonOutput[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    // gray-matter can parse YAML directly with empty content
    const parsed = matter(`---\n${raw}\n---\n`);

    const result = LessonSchema.safeParse(parsed.data);
    if (!result.success) {
      console.warn(`[schema] Invalid lesson at ${file}:`, result.error.flatten());
      continue;
    }

    lessons.push(result.data);
  }

  return lessons.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export async function loadPaths(contentDir: string): Promise<PathOutput[]> {
  const pattern = globPattern(contentDir, "challenges/_paths/**/*.yaml");
  const files = await fg(pattern, { onlyFiles: true });

  const paths: PathOutput[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const parsed = matter(`---\n${raw}\n---\n`);

    const result = PathSchema.safeParse(parsed.data);
    if (!result.success) {
      console.warn(`[schema] Invalid path at ${file}:`, result.error.flatten());
      continue;
    }

    paths.push(result.data);
  }

  return paths.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}
