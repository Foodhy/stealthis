# StealThis.dev

StealThis.dev is a Bun-workspace monorepo for an open-source resource library of reusable web implementations:

- Showcase site (`www`) for browsing and copying resources
- Documentation site (`docs`) with Starlight guides
- Full-screen demo runner (`lab`) for runnable snippets
- Project graph explorer (`build`) for planning implementations
- DB visualizer (`dbviz`) for relational schema commands and diagrams
- MCP server (`mcp`) to expose the catalog to AI tools
- Remotion app (`remotion`) for animation/video compositions

The canonical source of resource content lives in `packages/content/resources/<slug>/`.

## Website Locales

`apps/www` currently exposes these localized routes:

- `en` — English
- `es` — Spanish
- `fr` — French
- `ja` — Japanese
- `ms` — Malay
- `hi` — Hindi
- `ko` — Korean
- `nl` — Dutch
- `de` — German
- `pt-br` — Brazilian Portuguese
- `zh-hk` — Traditional Chinese (Hong Kong)
- `zh-cn` — Simplified Chinese (China)
- `it` — Italian
- `pl` — Polish
- `uk` — Ukrainian

Browser locale detection also maps `UA` users to `uk`.

## Monorepo Structure

```text
.
├── apps
│   ├── www        # Astro 5 showcase + library
│   ├── docs       # Astro + Starlight docs
│   ├── lab        # Full-screen demo runner (iframe srcdoc)
│   ├── build      # Astro + React graph builder
│   ├── dbviz      # Astro + React database visualizer
│   ├── mcp        # Hono + Cloudflare Worker MCP server
│   └── remotion   # Remotion compositions
├── packages
│   ├── content    # Source-of-truth resources and docs
│   ├── schema     # Zod schema + loaders/types
│   └── config     # Shared tsconfig/tailwind presets
└── scripts        # Import + vendor sync utilities
```

## Tech Stack

- Bun workspaces
- Astro 5 (multi-app)
- Starlight (docs)
- React (builder/remotion integrations)
- Tailwind CSS
- Hono + Wrangler (Cloudflare Worker for MCP)
- Zod + gray-matter + fast-glob (content schema/loading)
- Biome (lint/format)

## Local Prerequisites

- [Bun](https://bun.sh/) installed
- Node-compatible environment for Wrangler/Remotion tooling

## Quick Start

```bash
# from repo root
bun install
```

Run any app independently:

```bash
bun run dev:www      # http://localhost:4321
bun run dev:docs     # http://localhost:4322
bun run dev:lab      # http://localhost:4323
bun run dev:build    # http://localhost:4324
bun run dev:dbviz    # http://localhost:4327
bun run dev:mcp      # http://localhost:8787 (Wrangler)
bun run dev:remotion # http://localhost:4325
```

## Root Scripts

```bash
# development
bun run dev:www
bun run dev:docs
bun run dev:lab
bun run dev:build
bun run dev:dbviz
bun run dev:mcp
bun run dev:remotion

# builds
bun run build         # www + docs + lab + build + styleforge + dbviz + mcp
bun run build:www
bun run build:docs
bun run build:lab
bun run build:build
bun run build:dbviz
bun run build:mcp
bun run build:remotion

# quality
bun run lint
bun run format

# content/catalog tooling
bun run sync:vendor
bun run import:examples
bun run --filter @stealthis/mcp catalog
```

## Production URLs

- Main site: [https://stealthis.dev](https://stealthis.dev)
- Docs: [https://docs.stealthis.dev](https://docs.stealthis.dev)
- Lab: [https://lab.stealthis.dev](https://lab.stealthis.dev)
- Builder: [https://build.stealthis.dev](https://build.stealthis.dev)
- DBViz: [https://dbviz.stealthis.dev](https://dbviz.stealthis.dev)
- MCP: [https://mcp.stealthis.dev/mcp](https://mcp.stealthis.dev/mcp)

## Resource Content Model

Each resource is a self-contained folder:

```text
packages/content/resources/<slug>/
├── index.mdx
└── snippets/
    ├── html.html
    ├── style.css
    ├── script.js
    └── react.tsx (optional, plus other targets)
```

If a resource should appear in Lab:

- Set `labRoute: /<category>/<slug>` in frontmatter
- Provide `html.html`, `style.css`, and `script.js`

Supported category IDs:

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

## Add a New Resource

1. Create `packages/content/resources/<slug>/index.mdx` with valid frontmatter.
2. Add snippets in `packages/content/resources/<slug>/snippets/`.
3. If runnable in Lab, add `labRoute` and include HTML/CSS/JS snippets.
4. Regenerate MCP catalog:

```bash
bun run --filter @stealthis/mcp catalog
```

5. Validate:

```bash
bun run lint
bun run build:www
bun run build:lab
bun run build:mcp
```

## Schema + Consumer Alignment

If you add/rename category/type/target fields, keep these in sync:

- `packages/schema/src/schema.ts`
- `packages/schema/src/types.ts`
- `apps/www/src/content/config.ts`
- `apps/www/src/i18n/index.ts` (labels/filters)

## MCP Server

The MCP Worker serves a generated catalog (`apps/mcp/src/catalog.json`) built from `packages/content`.

Important commands:

```bash
# regenerate catalog after content changes
bun run --filter @stealthis/mcp catalog

# local worker
bun run dev:mcp

# validate worker bundle
bun run build:mcp
```

Primary endpoints:

- `POST /mcp` (MCP JSON-RPC transport)
- `GET /tools/list_resources`
- `GET /tools/get_resource/:slug`
- `GET /tools/get_snippet/:slug/:target`
- `GET /tools/search?q=...`
- `GET /tools/get_lab/:slug`

## Workspace Notes

- Do not edit generated output in `dist/`.
- Prefer reusing shared modules from `packages/schema` and `packages/config`.
- Use Bun commands across the monorepo (project standard).
- For app-specific docs:
  - `apps/mcp/README.md`
  - `apps/remotion/README.md`

## Deployment (Cloudflare)

Current deployment workflow uses:

- Cloudflare Pages for `www`, `docs`, `lab`, `build`
- Cloudflare Workers for `mcp`

Reference commands are documented in `COMMANDS.md`.

## Repository Health Checks

For routing/UI smoke tests after local dev starts:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/library
curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/
curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/<category>/<slug>
```

## License

Resources default to `MIT` via frontmatter metadata.  
If you need a repository-wide license, add a top-level `LICENSE` file.
