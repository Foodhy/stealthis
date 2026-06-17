/**
 * Generates the MCP catalog from the content package at build time.
 *
 * Output is split to keep the Worker script under Cloudflare's 3 MiB limit:
 *   - src/catalog.json     — metadata only (+ snippetKeys), bundled into the script.
 *   - public/s/<slug>.json — per-resource snippet bodies, served as Workers
 *     Static Assets and fetched on demand by get_snippet (NOT in the script).
 *
 * Run: bun run scripts/generate-catalog.ts
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

// Recommendations are curated external links with no code snippets — keep them
// out of the MCP catalog, which exists to serve copyable code resources.
const resources = (await loadResources(CONTENT_DIR)).filter(
  (resource) => resource.type !== "recommendation"
);

// Per-resource snippet bodies go here, one file per slug, served as Static Assets.
const snippetsDir = fileURLToPath(new URL("../public/s", import.meta.url));
rmSync(snippetsDir, { recursive: true, force: true });
mkdirSync(snippetsDir, { recursive: true });

const entries = resources.map((resource) => {
  const resourceDir = path.join(CONTENT_DIR, `resources/${resource.slug}`);
  const snippets: Record<string, string> = {};

  for (const [key, relPath] of Object.entries(SNIPPET_FILES)) {
    const fullPath = path.join(resourceDir, relPath);
    if (existsSync(fullPath)) {
      snippets[key] = readFileSync(fullPath, "utf-8").trim();
    }
  }

  // Snippet bodies are written as a separate static asset; the bundled catalog
  // keeps only the list of available targets (snippetKeys).
  const snippetKeys = Object.keys(snippets);
  if (snippetKeys.length > 0) {
    writeFileSync(path.join(snippetsDir, `${resource.slug}.json`), JSON.stringify(snippets));
  }

  return { ...resource, snippetKeys };
});

const catalog = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  resources: entries,
};

const outDir = fileURLToPath(new URL("../src", import.meta.url));
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));

console.log(
  `✦ Generated catalog.json (${entries.length} resources) + ${entries.filter((e) => e.snippetKeys.length > 0).length} snippet asset files`
);
