---
name: content-authoring
description: Add or edit library resources in packages/content/resources with frontmatter, snippets, and MCP catalog regeneration. Use for any new resource type — components, patterns, prompts, animations, schemas, etc.
metadata:
  tags: content, mdx, snippets, schema, mcp, library
---

# Content Authoring

Canonical source of truth: `packages/content/resources/<slug>/`. Full reference: `CONTENT_AUTHORING.md`.

## When to use

- Any new Library resource (component, pattern, prompt, animation, schema, boilerplate, …)
- Editing frontmatter, snippets, or README prose for an existing resource
- After content changes that affect the MCP catalog

## Quick start

```
packages/content/resources/my-resource/
  index.mdx
  snippets/
    html.html          # if targets includes html
    style.css
    script.js
    react.tsx          # if targets includes react
```

### Minimum valid frontmatter

```mdx
---
slug: my-resource
title: My Resource
description: One sentence explaining what it is.
category: ui-components
type: component
difficulty: med
createdAt: 2026-06-12
updatedAt: 2026-06-12
---
```

### Recommended frontmatter

Add `tags`, `tech`, `targets`, `collections`, `labRoute`, `license`, and `author` for discoverability.

## Category ↔ type pairs

| Category | Type | Use for |
| --- | --- | --- |
| `ui-components` | `component` | Buttons, forms, cards, widgets |
| `components` | `component` | React-oriented reusable blocks |
| `pages` | `page` | Full page layouts → see [`page-resources`](../page-resources/SKILL.md) |
| `web-animations` | `animation` | Motion, scroll, canvas, WebGL |
| `patterns` | `pattern` | UX interaction patterns |
| `prompts` | `prompt` | AI prompt templates |
| `skills` | `skill` | Agent skill definitions |
| `database-schemas` | `schema` | SQL / ERD resources |
| `recommendations` | `recommendation` | Tool comparison topics (no code, no Lab) |

Do not invent new category/type values without updating the schema (see [`add-collection`](../add-collection/SKILL.md) for the wiring list).

## Snippet targets

| Target | File |
| --- | --- |
| `html` | `snippets/html.html` |
| `react` | `snippets/react.tsx` |
| `next` | `snippets/next.tsx` |
| `vue` | `snippets/vue.vue` |
| `svelte` | `snippets/svelte.svelte` |
| `astro` | `snippets/astro.astro` |
| `typescript` | `snippets/typescript.ts` |
| `sql` | `snippets/schema.sql`, `seed.sql`, `queries.sql` |
| `markdown` | `snippets/markdown.md` |

Only declare `targets` you actually ship.

## Lab demos

Set `labRoute: /<category>/<slug>` and provide `html.html` (+ linked `style.css` / `script.js`). Lab inlines assets at build time in `apps/lab`.

## Post-change commands

```bash
bun run --filter @stealthis/mcp catalog
bun run lint
bun run build:www
bun run build:lab    # if labRoute set
bun run build:mcp    # if metadata affects MCP tools
```

## Schema alignment

If you add fields or enum values, update in the same PR:

- `packages/schema/src/schema.ts`
- `packages/schema/src/types.ts`
- `apps/www/src/content/config.ts`
- `apps/www/src/i18n/index.ts` (labels/filters)

## Checklist

- [ ] Folder `packages/content/resources/<slug>/`
- [ ] Valid frontmatter (Zod schema passes)
- [ ] Snippet files match `targets`
- [ ] MDX body documents usage
- [ ] MCP catalog regenerated
- [ ] Lint + relevant builds pass
