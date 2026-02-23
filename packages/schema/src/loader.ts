import { readFileSync } from "node:fs";
import { join } from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { ResourceMetaSchema } from "./schema.js";
import type { ResourceMetaOutput } from "./schema.js";

export async function loadResources(contentDir: string): Promise<ResourceMetaOutput[]> {
  const pattern = join(contentDir, "resources/*/index.mdx");
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
