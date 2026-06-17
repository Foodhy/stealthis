# AGENTS.md — StealThis Agent Guide

## Project context

You are maintaining and extending `stealthis`, a Bun-workspace monorepo for:

- `apps/www`: Astro 5 main showcase
- `apps/docs`: Astro + Starlight documentation
- `apps/lab`: full-screen demo runner (iframe `srcdoc` from snippets)
- `apps/build`: Astro + React graph/build explorer
- `apps/mcp`: Hono worker serving tools from generated catalog
- `apps/remotion`: Remotion animation compositions
- `packages/content`: source of truth resources in `resources/<slug>/`
- `packages/schema`: Zod schema + loader/types
- `packages/config`: shared config

Build output lives in `dist/`; never edit generated files directly.

## Agent skills

Task-specific workflows live in `.agents/skills/<name>/SKILL.md`. Load the matching skill when the task fits:

| Skill | Use when |
| --- | --- |
| `create-site-pages` | New Astro route on `apps/www` (i18n, SEO, sitemap) |
| `page-resources` | Full-page Library template (`category: pages`, Lab demo) |
| `content-authoring` | Any resource under `packages/content/resources/` |
| `add-collection` | New Library collection ID (schema + i18n + docs) |

Index: `.agents/skills/README.md`

## Agent rules

1. Continue from current project state and existing planning docs (`todo.md`, `PROGRESS.md`) when relevant.
2. Treat `packages/content/resources/<slug>/` as the canonical source for resource data and snippets.
3. When creating a new resource, include:
   - `packages/content/resources/<slug>/index.mdx`
   - `packages/content/resources/<slug>/snippets/` files for supported targets (`html.html`, `style.css`, `script.js`, `react.tsx`, etc.)
4. If a resource must appear in Lab, set `labRoute: /<category>/<slug>` in frontmatter and ensure HTML/CSS/JS snippets exist.
5. Keep schema and consumers aligned:
   - `packages/schema/src/schema.ts`
   - `apps/www/src/content/config.ts`
   - translations/category labels in `apps/www/src/i18n/index.ts` when category/type changes
6. Reuse shared modules; do not duplicate schema, URL, i18n, or parsing logic across apps.
7. Use Bun commands only (this repo standard is Bun workspaces).

## Build, test, and development commands

- Dev:
  - `bun run dev:www` (`http://localhost:4321`)
  - `bun run dev:docs` (`http://localhost:4322`)
  - `bun run dev:lab` (`http://localhost:4323`)
  - `bun run dev:build` (`http://localhost:4324`)
  - `bun run dev:mcp` (Wrangler dev)
  - `bun run dev:remotion`
- Build:
  - `bun run build` (all apps except remotion)
  - `bun run build:www`, `bun run build:docs`, `bun run build:lab`, `bun run build:build`, `bun run build:mcp`, `bun run build:remotion`
- Quality:
  - `bun run lint`
  - `bun run format`
- Catalog:
  - `bun run --filter @stealthis/mcp catalog`

## Required checks before handoff

- Always run `bun run lint`.
- Build the app(s) you touched (minimum `bun run build:<app>` for each changed app).
- If content/schema changed, regenerate catalog and validate MCP build:
  - `bun run --filter @stealthis/mcp catalog`
  - `bun run build:mcp`
- For routing/UI changes, smoke test with dev server + `curl`:
  - `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/`
  - `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/library`
  - `curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/`
  - `curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/<category>/<slug>`

## Common tasks (adapted examples)

### Example 1: Add a new resource (equivalent to “add a new demo”)

1. Create `packages/content/resources/<slug>/index.mdx` with valid frontmatter.
2. Add snippet files in `packages/content/resources/<slug>/snippets/`.
3. If it has a runnable demo, add `labRoute: /<category>/<slug>`.
4. Regenerate `apps/mcp/src/catalog.json`.
5. Verify `/library` and `/lab` routes.

Minimal frontmatter example:

```mdx
---
slug: my-resource
title: My Resource
description: Reusable implementation example.
category: web-animations
type: animation
tags: ["scroll", "parallax"]
tech: ["css", "javascript"]
difficulty: med
targets: ["html", "react"]
labRoute: /web-animations/my-resource
license: MIT
createdAt: 2026-02-21
updatedAt: 2026-02-21
---
```

### Example 2: Modify the gallery/library hub

- Main library page: `apps/www/src/pages/library/index.astro`
- Home featured/category sections: `apps/www/src/pages/index.astro`
- Curated filter presets: `apps/www/src/lib/collections.ts`
- i18n labels: `apps/www/src/i18n/index.ts`
- **Docs catalog (when adding a collection ID):** `apps/docs/src/content/docs/collections.mdx` — add a table row; preview at `http://localhost:4322/collections/`

Resources are rendered from the Astro content collection (`apps/www/src/content/config.ts`), not from a manual JSON registry.

### Example 3: Update shared parsing/schema utilities

- Schema/types live in `packages/schema/src/`.
- If you add or rename category/type/target fields:
  - update `packages/schema/src/schema.ts`
  - update `packages/schema/src/types.ts`
  - update `apps/www/src/content/config.ts`
  - update UI labels/filters that depend on them (`apps/www/src/i18n/index.ts`, library pages)

### Example 4: Update Lab behavior

- Lab index: `apps/lab/src/pages/index.astro`
- Lab demo route: `apps/lab/src/pages/[category]/[slug].astro`
- Lab builds iframe `srcdoc` by inlining `html.html`, `style.css`, and `script.js` snippets.
- Missing HTML snippet should gracefully show fallback text.

### Example 5: Update MCP catalog workflow

- Catalog generator: `apps/mcp/scripts/generate-catalog.ts`
- Generated output: `apps/mcp/src/catalog.json`
- Regenerate after any resource metadata/content changes:
  - `bun run --filter @stealthis/mcp catalog`

## Category IDs

- `web-animations`
- `web-pages`
- `ui-components`
- `patterns`
- `components`
- `pages`
- `prompts`
- `skills`
- `mcp-servers`
- `architectures`
- `boilerplates`
- `remotion`

## Cursor Cloud specific instructions

### Toolchain

- **Bun** is the only package manager (`bun install` at repo root). If `bun` is not on `PATH`, use `export PATH="$HOME/.bun/bin:$PATH"` (installed via `curl -fsSL https://bun.sh/install | bash`).
- There is **no root `test` script**; quality gate is `bun run lint` (Biome). The repo has many pre-existing lint findings — a non-zero exit from `bun run lint` does not mean the environment is broken.

### Core dev servers (flagship library flow)

For browse → resource → live demo E2E, run **both**:

| App | Command | Port |
|-----|---------|------|
| www | `bun run dev:www` | 4321 |
| lab | `bun run dev:lab` | 4323 |

Use **tmux** for long-running dev servers (e.g. session `www-dev-server`, `lab-dev-server`). Other apps are independent — see root `package.json` `dev:*` scripts and `README.md`.

### Smoke checks

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/library
curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/
curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/ui-components/glass-card
```

Hello-world path: `/library` → `/r/glass-card` → **Open in Lab** → `http://localhost:4323/ui-components/glass-card`.

### Builds

- `bun run build:www` is slow (~12+ min) because it SSGs thousands of localized resource pages across 17 locales.
- After **content** changes, regenerate MCP catalog before `build:mcp`: `bun run --filter @stealthis/mcp catalog`.
- Optional post-install: `bun run sync:vendor` (lab vendor module sync) — not required for www/lab dev.
