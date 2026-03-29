import type { CollectionEntry } from "astro:content";
import { existsSync } from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.resolve(process.cwd(), "../../packages/content");
const TS_SNIPPETS = ["react.tsx", "next.tsx", "typescript.ts", "typescript.tsx"];

export type SnippetFlags = {
  hasJS: boolean;
  hasTS: boolean;
  hasCSS: boolean;
  hasHTML: boolean;
};

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function getSnippetFlags(slug: string): SnippetFlags {
  const snippetsDir = path.join(CONTENT_DIR, `resources/${slug}/snippets`);

  const hasJS = existsSync(path.join(snippetsDir, "script.js"));
  const hasTS = TS_SNIPPETS.some((file) => existsSync(path.join(snippetsDir, file)));
  const hasCSS = existsSync(path.join(snippetsDir, "style.css"));
  const hasHTML = existsSync(path.join(snippetsDir, "html.html"));

  return { hasJS, hasTS, hasCSS, hasHTML };
}

export function getResourceFilterTechTokens(
  resource: CollectionEntry<"resources">,
  flags?: SnippetFlags
): string[] {
  const tokens = new Set<string>();

  for (const tech of resource.data.tech ?? []) {
    const normalized = normalizeToken(tech);
    if (normalized) tokens.add(normalized);
  }

  for (const target of resource.data.targets ?? []) {
    const normalized = normalizeToken(target);
    if (normalized) tokens.add(normalized);
  }

  const { hasJS, hasCSS, hasHTML } = flags ?? getSnippetFlags(resource.data.slug);
  if (hasJS) tokens.add("js");
  if (hasCSS) tokens.add("css");
  if (hasHTML) tokens.add("html");

  return [...tokens];
}

export function getResourceSearchTechTokens(
  resource: CollectionEntry<"resources">,
  flags?: SnippetFlags
): string[] {
  const snippetFlags = flags ?? getSnippetFlags(resource.data.slug);
  const tokens = new Set(
    getResourceFilterTechTokens(resource, snippetFlags).map((token) => token.toLowerCase())
  );

  if (snippetFlags.hasJS) tokens.add("javascript");
  if (snippetFlags.hasTS) {
    tokens.add("ts");
    tokens.add("typescript");
  }
  if (tokens.has("next")) tokens.add("next.js");

  return [...tokens];
}
