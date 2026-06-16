# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Reference docs (read these when relevant)

Before starting certain kinds of work, consult the matching guide — they hold the canonical
process and conventions so you don't have to re-derive them:

- **`PHASE-WORKFLOW.md`** — How to build a whole ROADMAP phase (20+ resources) with a **parallel
  multi-agent `Workflow`**. Read this whenever the user asks to "finish a phase", build many
  resources at once, or says "workflow"/"multi-agente". Explains the `agent()`/`parallel()`
  pattern, the resume-after-cutoff flow, and how to read `/workflows`. Template script lives at
  `docs/templates/phase-build.workflow.js`. **Workflows are opt-in** — only launch one when the
  user explicitly asks (keyword "workflow"/"multi-agente"); otherwise build by hand.
- **`CONTENT_AUTHORING.md`** — How to author a single resource under
  `packages/content/resources/<slug>/` (frontmatter schema, snippets, conventions). Read this
  when adding/editing one resource by hand.
- **`ROADMAP.md`** — The master phase plan (verticals: Clinic, Gym, Salon, Real Estate, …). Source
  of the work list for any phase. Update checkboxes + the per-phase "Progress" note as you finish.
- **`ROADMAP_RECOMMENDATION.md`** — Spec for `recommendation`-type resources (topic pages grouping
  alternatives). Read before authoring recommendations.
- **`apps/docs/src/content/docs/collections.mdx`** — User-facing catalog of library collections
  (`docs.stealthis.dev/collections/`). **Update this page whenever you add a new collection ID**
  (table row + link). For industry verticals, also add a row in `choose-your-path.mdx`.
- **`ROADMAP_ARCADE.md`** / **`PLAN_ARCADE.md`** — Plan + roadmap for `apps/arcade` (Duolingo-style
  challenges). Read when working on the arcade app.
- **`SUPPLY_CHAIN_SECURITY.md`** — How dependency installs are hardened against supply-chain
  attacks (3-day `minimumReleaseAge` cooldown + Socket scanner in `bunfig.toml`, default
  postinstall blocking, `bun audit`). Read before adding/updating deps, changing `bunfig.toml`,
  or setting up a new bun/pnpm project. The recurring "what's outdated / what to update across
  all 14 workspaces" check is the `/pkg-audit` command.
- **`AGENTS.md`** — General agent guide / project context for this repo.

---

## Commands

### Development (from monorepo root)

```bash
bun run dev:www    # apps/www  → http://localhost:4321
bun run dev:docs   # apps/docs → http://localhost:4322
bun run dev:lab    # apps/lab  → http://localhost:4323
bun run dev:build  # apps/build
bun run dev:mcp    # apps/mcp  (wrangler dev)
```

### Build

```bash
bun run build          # all apps sequentially
bun run build:www      # individual app
bun run build:mcp      # runs `bun run catalog` first (wrangler.toml [build] command)
```

### Per-app (from inside apps/*)

```bash
bunx astro dev         # Astro apps
wrangler dev           # MCP worker
```

### Linting / Formatting

```bash
bun run lint           # biome check .
bun run format         # biome format --write .
```

### MCP catalog (must re-run when resources change)

```bash
bun run --filter @stealthis/mcp catalog
# generates apps/mcp/src/catalog.json from packages/content
```

---

## Architecture

### Monorepo layout

```
stealthis/
├── apps/
│   ├── www/       @stealthis/www   — Astro 5 SSG, main showcase
│   ├── docs/      @stealthis/docs  — Astro + Starlight
│   ├── lab/       @stealthis/lab   — Astro SSG, full-screen iframe demos
│   ├── build/     @stealthis/build — Astro + React island (React Flow)
│   └── mcp/       @stealthis/mcp   — Hono on Cloudflare Workers
└── packages/
    ├── content/   @stealthis/content — raw MDX + snippets (source of truth)
    ├── schema/    @stealthis/schema  — TS types, Zod schema, loadResources()
    └── config/    @stealthis/config  — tsconfig.base.json, tailwind.preset.ts
```

### Content is the source of truth

All resource data lives in `packages/content/resources/<slug>/`:
- `index.mdx` — frontmatter (metadata) + prose README
- `snippets/html.html`, `snippets/style.css`, `snippets/script.js`
- `snippets/react.tsx` (and optionally next/vue/svelte/astro)

The frontmatter schema is defined in `packages/schema/src/schema.ts` (Zod) and `packages/schema/src/types.ts` (TS interface). **Important:** `gray-matter` parses YAML dates as JS `Date` objects, so the schema uses `z.union([z.string(), z.date()]).transform(...)` for `createdAt`/`updatedAt`.

### How apps consume content

- **www** and **lab**: use Astro Content Layer (`glob` loader from `astro/loaders`) pointing to `packages/content/resources`. The content collection is defined in `apps/www/src/content/config.ts`. File paths use `process.cwd()` (not `import.meta.url`) because the Cloudflare adapter resolves the latter to the compiled worker path at build time.
- **lab**: reads snippets directly via `fast-glob` + `gray-matter` at build time in `getStaticPaths()`, then inlines CSS/JS into the HTML before rendering in `<iframe srcdoc>`.
- **mcp**: consumes `apps/mcp/src/catalog.json` — a static JSON file pre-generated by `scripts/generate-catalog.ts` using `loadResources()` from `@stealthis/schema`. Must be regenerated when content changes.
- **docs**: Starlight reads from `apps/docs/src/content/docs/` (MDX files copied/maintained there).

### Path aliasing (apps/www)

Configured in `astro.config.mjs` via Vite `resolve.alias`:
- `@content` → `packages/content`
- `@schema` → `packages/schema/src`
- `@lib` → `apps/www/src/lib`
- `@components` → `apps/www/src/components`
- `@layouts` → `apps/www/src/layouts`
- `@i18n` → `apps/www/src/i18n`

### i18n (apps/www)

Astro's built-in i18n with `defaultLocale: "en"`, `prefixDefaultLocale: false`. English routes are `/`, `/library`, `/r/[slug]`. Spanish routes are `/es/`, `/es/library`, `/es/r/[slug]`. Translations live in `apps/www/src/i18n/index.ts` as a flat map. Use `useTranslations(locale)` to get a typed `t()` function.

**Important:** Do not use `t(\`key.${var}\` as Parameters<typeof t>[0])` inside Astro template expressions — the `<typeof t>` syntax is parsed as an HTML tag. Extract to a typed `const` first.

### Tailwind (apps/www and apps/build)

Tailwind 3. The non-standard opacity values `/6`, `/8`, `/14` (used as `bg-white/6` etc.) are added in `tailwind.config.mjs` under `extend.opacity`. They cannot be used in `@apply` without this extension.

### MCP server (apps/mcp)

Hono v4 on Cloudflare Workers. Reads from the static `src/catalog.json` bundle — no filesystem access at runtime. Endpoints under `/tools/`. CORS open to all origins. Deploy via `wrangler deploy`.

### Adding a new resource

1. Create `packages/content/resources/<slug>/index.mdx` with full frontmatter
2. Add snippet files to `packages/content/resources/<slug>/snippets/`
3. If it has a lab demo, set `labRoute: /<category>/<slug>` in frontmatter
4. Regenerate the MCP catalog: `bun run --filter @stealthis/mcp catalog`

### Adding a new library collection

A new collection ID (e.g. `gym`, `editorial`) must be wired in **five places** before resources
can use it — plus the **docs catalog** so users and agents can discover it:

1. `packages/schema/src/schema.ts` — `ResourceCollectionSchema` enum
2. `apps/www/src/content/config.ts` — content collection enum
3. `apps/www/src/lib/collections.ts` — Collection Explorer card (`id`, `titleKey`, `descKey`, `accentToken`, `order`)
4. `apps/www/src/i18n/index.ts` — `collection.<id>.title` and `collection.<id>.desc` (at minimum `en`; `es` for Spanish routes)
5. **`apps/docs/src/content/docs/collections.mdx`** — add a row to the **All collections** table (ID, title, purpose, direct link). Preview at `http://localhost:4322/collections/` (`bun run dev:docs`).

For **industry vertical** collections, also add a row under **Build for a specific industry** in
`apps/docs/src/content/docs/choose-your-path.mdx`.

Optional: extend heuristics in `apps/www/src/lib/resource-collections.ts` if resources should auto-join without explicit `collections:` frontmatter.

See `PHASE-WORKFLOW.md` § Paso 3 for the grep checklist used during phase builds.

### tsconfig

**Never use `"extends": "@stealthis/config/tsconfig"`** in any app. Neither Vite/esbuild (Astro apps) nor Wrangler can resolve workspace package tsconfigs via `extends`. Astro apps extend `"astro/tsconfigs/strict"`. The MCP worker inlines its compiler options directly.

### Codebase graph (graphify, local only)

`graphify-out/` is **gitignored** — it is generated output (cache, `graph.json`, `graph.html`, `GRAPH_REPORT.md`). Regenerate locally or in a separate checkout; never commit it.

```bash
/graphify apps              # full build on apps/ (last run: ~2k nodes, 3k edges)
/graphify apps --update     # incremental after code changes
/graphify query "<question>"  # explore without rebuild (needs graphify-out/)
```

**Lift into docs / agent context (stable facts):** app inventory under `apps/` (www, lab, docs, build, mcp, arcade, dbviz, styleforge, prompt-designer, vibe, remotion); content flows through `packages/content` → www/lab content collections + `apps/mcp` catalog.json; cross-app hubs are `useI18n()`, `ResourceCard.astro`, `ForceGraph`, and per-app shells (DbVizStudioInner, useWorkspace).

**Leave in graphify-out only (ephemeral):** extraction cache, token cost, manifest, interactive HTML, raw graph JSON, community labels, Obsidian/wiki exports.
