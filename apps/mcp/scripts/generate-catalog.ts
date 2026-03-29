/**
 * Generates catalog.json from the content package at build time.
 * Bundles snippet content so the Worker can serve it at runtime.
 * Run: bun run scripts/generate-catalog.ts
 */

import { fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { loadResources } from "@stealthis/schema";

const CONTENT_DIR = fileURLToPath(new URL("../../../packages/content", import.meta.url));

const SNIPPET_FILES: Record<string, string> = {
  html: "snippets/html.html",
  css: "snippets/style.css",
  js: "snippets/script.js",
  react: "snippets/react.tsx",
  next: "snippets/next.tsx",
  vue: "snippets/vue.vue",
  svelte: "snippets/svelte.svelte",
  astro: "snippets/astro.astro",
  "schema-sql": "snippets/schema.sql",
  "seed-sql": "snippets/seed.sql",
  "queries-sql": "snippets/queries.sql",
  "diagram-mmd": "snippets/diagram.mmd",
  "schema-dbml": "snippets/schema.dbml",
};

const resources = await loadResources(CONTENT_DIR);

const entries = resources.map((resource) => {
  const resourceDir = path.join(CONTENT_DIR, `resources/${resource.slug}`);
  const snippets: Record<string, string> = {};

  for (const [key, relPath] of Object.entries(SNIPPET_FILES)) {
    const fullPath = path.join(resourceDir, relPath);
    if (existsSync(fullPath)) {
      snippets[key] = readFileSync(fullPath, "utf-8").trim();
    }
  }

  return { ...resource, snippets };
});

const catalog = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  resources: entries,
};

const outDir = fileURLToPath(new URL("../src", import.meta.url));
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));

console.log(`✦ Generated catalog.json with ${entries.length} resources`);
