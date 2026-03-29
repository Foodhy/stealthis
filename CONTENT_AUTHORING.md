# Content Authoring Guide

This repo treats `packages/content/resources/<slug>/` as the canonical source of truth for every resource.

Use this guide when you add a new `index.mdx` bundle and its snippet files.

## 1. Start With The Right Folder Shape

Create a new folder using the resource slug in kebab-case:

```text
packages/content/resources/my-resource/
  index.mdx
  snippets/
```

Optional extras:

```text
packages/content/resources/my-resource/
  index.mdx
  snippets/
  assets/
```

`dist/` is generated output. Do not edit it directly.

## 2. Minimal Frontmatter

### Smallest schema-valid frontmatter

This is the minimum that passes the current schema in `packages/schema/src/schema.ts` and `apps/www/src/content/config.ts`:

```mdx
---
slug: my-resource
title: My Resource
description: One sentence explaining what the resource is.
category: ui-components
type: component
difficulty: med
createdAt: 2026-03-05
updatedAt: 2026-03-05
---
```

### Minimum useful frontmatter

This is the minimum you should usually ship, because it improves search, filters, badges, and Lab behavior:

```mdx
---
slug: my-resource
title: My Resource
description: One sentence explaining what the resource is.
category: ui-components
type: component
tags: [search, filter, input]
tech: [css, javascript, react]
difficulty: med
targets: [html, react]
collections: [dashboard]
labRoute: /ui-components/my-resource
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-03-05
updatedAt: 2026-03-05
---
```

## 3. What Each Field Actually Affects

These fields are not all equal. Some are required by schema, others drive discovery.

| Field | Used for |
| --- | --- |
| `slug` | Resource URL, file lookup, Lab lookup, MCP catalog entry |
| `title` | Card title, resource page title, search index, collection heuristics |
| `description` | Card description, resource page SEO, search index |
| `category` | Library grouping, category filter, labels, some collection heuristics |
| `type` | Content taxonomy only; keep it aligned with the category |
| `tags` | Search index and collection heuristics |
| `tech` | Search index, tech filter, tech chips on cards |
| `difficulty` | Difficulty filter and difficulty badge |
| `targets` | CodeTabs tabs, target badges, snippet expectations |
| `collections` | Collection Explorer membership |
| `author.name` | Author filter and author link on the resource page |
| `labRoute` | Enables the Lab button and Lab static route generation |
| `license` | Resource page metadata |
| `createdAt` | Latest-first ordering in the library |
| `updatedAt` | Resource page metadata and SEO structured data |

Important:

- Library search currently indexes `title`, `description`, `tags`, and `tech`.
- The MDX body is useful documentation, but it is not what the library search box indexes.
- `author` is optional, but if you include it, both `name` and `src` are required.
- `license`, `tags`, `tech`, `targets`, and `collections` have defaults or are optional, but leaving them empty reduces discoverability.

## 4. Category And Type Pairs

Do not invent new category or type values inside a resource. Use one of the existing schema values.

### Current categories

| Category | Matching type | Typical use | Example resource |
| --- | --- | --- | --- |
| `web-animations` | `animation` | Scroll, reveal, motion, canvas, WebGL | `Lenis+GSAP` |
| `web-pages` | `page` | Older full-page web templates | `ciber-portfolio` |
| `ui-components` | `component` | Buttons, forms, cards, tables, widgets | `alert-dialog` |
| `patterns` | `pattern` | Interaction patterns and UX behavior | `search-filter` |
| `components` | `component` | Reusable components, often React-oriented | `rc-04-animated-counter` |
| `pages` | `page` | Page-level layouts and showcase pages | `lgc-54-esports-tournament` |
| `prompts` | `prompt` | AI prompt templates | `prompt-code-review` |
| `skills` | `skill` | Skill definitions and automation helpers | `git-commit-skill` |
| `mcp-servers` | `mcp-server` | MCP server configs or references | `stealthis-mcp-config` |
| `architectures` | `architecture` | Architecture docs and stack blueprints | `nextjs-saas-architecture` |
| `boilerplates` | `boilerplate` | Starter templates | `astro-tailwind-starter` |
| `remotion` | `animation` | Remotion compositions | `remotion-intro` |
| `database-schemas` | `schema` | SQL schemas, ERDs, seed data, queries | `lms-education` |

### Current library groups

These are the current groupings on `/library`:

- Visual & Code: `web-animations`, `web-pages`, `pages`, `ui-components`, `patterns`, `components`, `remotion`
- AI & Dev: `prompts`, `skills`, `mcp-servers`, `architectures`, `boilerplates`
- Data & SQL: `database-schemas`

Rule of thumb:

- Use `ui-components` for general UI building blocks.
- Use `components` only when the closest existing examples also live there.
- Use `pages` for current page/showcase work.
- Use `web-pages` only when you are intentionally following older existing examples already in that bucket.

If you need a brand new category, type, target, or collection, update all of these in the same change:

- `packages/schema/src/schema.ts`
- `packages/schema/src/types.ts`
- `apps/www/src/content/config.ts`
- `apps/www/src/i18n/index.ts`
- Any library/filter UI that assumes the old list

## 5. Snippet Files By Target

Only declare targets that you actually provide files for.

| Target in frontmatter | Expected file(s) |
| --- | --- |
| `html` | `snippets/html.html` |
| `react` | `snippets/react.tsx` |
| `next` | `snippets/next.tsx` |
| `vue` | `snippets/vue.vue` |
| `svelte` | `snippets/svelte.svelte` |
| `astro` | `snippets/astro.astro` |
| `typescript` | `snippets/typescript.ts` |
| `python` | `snippets/python.py` |
| `markdown` | `snippets/markdown.md` |
| `yaml` | `snippets/yaml.yaml` |
| `json` | `snippets/json.json` |
| `sql` | one or more of `snippets/schema.sql`, `snippets/seed.sql`, `snippets/queries.sql` |
| `mermaid` | `snippets/diagram.mmd` |
| `dbml` | `snippets/schema.dbml` |

### Runnable HTML demos

If the resource should open in Lab as an interactive demo:

- set `labRoute: /<category>/<slug>`
- include `snippets/html.html`
- usually include `snippets/style.css`
- include `snippets/script.js` if behavior is needed

Important:

- The Lab page inlines CSS only if `html.html` contains a stylesheet link to `style.css`.
- The Lab page inlines JS only if `html.html` contains a script tag pointing to `script.js`.
- If `html.html` is missing, Lab falls back to `No HTML demo available for this resource.`

Recommended HTML shell:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <title>My Resource</title>
  </head>
  <body>
    <main class="demo-root"></main>
    <script src="script.js"></script>
  </body>
</html>
```

### Database schema bundles

If the resource is a schema reference, the common bundle is:

```text
packages/content/resources/my-schema/
  index.mdx
  snippets/
    schema.sql
    seed.sql
    queries.sql
    diagram.mmd
```

Notes:

- `diagram.mmd` gives the resource page a Mermaid preview.
- `schema.dbml` is also supported.
- Database schema resources can still have `labRoute`; the Lab app renders a database viewer instead of an iframe demo.

### Prompt, skill, MCP, architecture, and boilerplate bundles

These are usually content-first resources:

- `prompts`: usually `targets: [markdown]` with `snippets/markdown.md`
- `skills`: usually `targets: [yaml]` with `snippets/yaml.yaml`
- `mcp-servers`: usually `targets: [json]` with `snippets/json.json`
- `architectures`: often `targets: [markdown]` and sometimes Mermaid in the markdown body or as `diagram.mmd`
- `boilerplates`: usually `targets: [markdown]`

### Remotion bundles

Remotion resources usually look like this:

```text
packages/content/resources/my-remotion-scene/
  index.mdx
  snippets/
    react.tsx
```

Use:

- `category: remotion`
- `type: animation`
- `targets: [react]`
- `collections: [remotion]` when it fits

## 6. Search, Filter, And Collection Behavior

When you want the resource to be easy to find, fill the metadata intentionally.

### Search

The library search box indexes:

- `title`
- `description`
- `tags`
- `tech`

So:

- put primary nouns in the `title`
- write a plain-language `description`
- add tags for the problem being solved
- add tech names people will actually search for

### Filters

Current filters on the library page use:

- category filter: `category`
- difficulty filter: `difficulty`
- tech filter: `tech`
- author filter: `author.name`

If `tech` or `author` is empty, those filter paths cannot help users find the resource.

### Collections

Collection Explorer uses explicit `collections`, but the site also resolves some collections automatically:

- `saas` if tags include `saas`
- `motion` if category is `web-animations`
- `remotion` if category is `remotion`
- `hero` if tags include `hero` or the title contains `hero`
- `cards` if tags include `card` or `cards`, or the title contains `card`
- `dashboard` if tags include `dashboard`, `admin`, or `data-viz`, or the title contains `dashboard`

If you want predictable collection placement, set `collections` directly instead of relying only on heuristics.

## 7. Recommended Authoring Workflow

1. Pick the closest existing example in the same category.
2. Create `packages/content/resources/<slug>/index.mdx`.
3. Add the matching files under `snippets/`.
4. Keep `targets` aligned with the files you added.
5. Add `labRoute` only when the bundle is actually runnable in Lab.
6. Write enough `tags` and `tech` for search and filtering.
7. Add short MDX prose below the frontmatter to explain usage, constraints, and customization.

Good examples to review before authoring:

- Pattern with HTML + React: `packages/content/resources/search-filter/`
- Prompt bundle: `packages/content/resources/prompt-code-review/`
- Database schema bundle: `packages/content/resources/lms-education/`
- Remotion bundle: `packages/content/resources/remotion-intro/`
- MCP config bundle: `packages/content/resources/stealthis-mcp-config/`
- Boilerplate bundle: `packages/content/resources/astro-tailwind-starter/`

## 8. Validation Before Handoff

At minimum, after adding or changing content:

```bash
bun run lint
bun run --filter @stealthis/mcp catalog
bun run build:mcp
```

If the resource should appear on the main site:

```bash
bun run build:www
```

If the resource should run in Lab:

```bash
bun run build:lab
```

If you changed schema values, also verify every consumer that depends on them.

## 9. Common Mistakes

- Folder name and `slug` do not match
- `category` and `type` do not match the current schema
- `targets` lists files that do not exist
- `labRoute` is set, but `html.html` is missing for a regular demo resource
- `html.html` does not reference `style.css` or `script.js`, so Lab cannot inline them
- `tags` and `tech` are empty, making search weak
- A new category/type/target is added in content without updating schema and i18n
