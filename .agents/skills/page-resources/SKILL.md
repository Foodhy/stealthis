---
name: page-resources
description: Create full-page Library templates (category pages, type page) with HTML/CSS/JS snippets and Lab demos. Use when adding copy-paste page layouts like about-page, landing-page, or portfolio templates.
metadata:
  tags: content, pages, lab, html, library, templates
---

# Page Resources (Library templates)

Use this skill when adding a **copy-paste full-page template** to the StealThis Library — resources with `category: pages` and `type: page`. For Astro routes on stealthis.dev itself, use [`create-site-pages`](../create-site-pages/SKILL.md).

## When to use

- Landing pages, about pages, pricing pages, portfolios, dashboards
- Full HTML page layouts developers can steal into their projects
- Runnable Lab preview of the page design

## Folder shape

```
packages/content/resources/my-landing-page/
  index.mdx
  snippets/
    html.html       # required for Lab
    style.css       # recommended
    script.js       # if interactive
    react.tsx       # optional second target
```

## Minimal frontmatter

```mdx
---
slug: my-landing-page
title: My Landing Page
description: One sentence describing the page layout and use case.
category: pages
type: page
tags: [landing, hero, cta, pricing]
tech: [css, javascript]
difficulty: med
targets: [html]
labRoute: /pages/my-landing-page
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-12
updatedAt: 2026-06-12
---
```

### Field notes for page resources

| Field | Value |
| --- | --- |
| `category` | `pages` (current page/showcase work) or `web-pages` (legacy bucket — follow existing neighbors) |
| `type` | `page` |
| `labRoute` | `/<category>/<slug>` — enables Lab button and static route |
| `targets` | Only list targets with actual snippet files |
| `difficulty` | `easy` / `med` / `hard` — affects homepage marquee tiers |

## Snippet conventions

### HTML shell (Lab-compatible)

Lab inlines CSS/JS only when `html.html` references sibling files:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <title>My Landing Page</title>
  </head>
  <body>
    <main class="demo-root">
      <!-- page sections -->
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

- `<link rel="stylesheet" href="style.css" />` → Lab inlines `style.css`
- `<script src="script.js">` → Lab inlines `script.js`
- Missing `html.html` → Lab shows fallback message

### Page structure tips

Typical sections for page templates:

1. **Header** — logo + nav
2. **Hero** — headline, subcopy, primary CTA
3. **Features / values** — grid of cards
4. **Social proof** — logos, testimonials, stats
5. **CTA band** — conversion block
6. **Footer** — links, copyright

Keep CSS self-contained in `style.css`. Prefer semantic HTML and responsive layout without external frameworks unless the page topic requires it.

## After creating the resource

```bash
bun run --filter @stealthis/mcp catalog   # regenerate MCP catalog
bun run lint
bun run build:www
bun run build:lab
```

### Verify routes

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/r/my-landing-page
curl -s -o /dev/null -w "%{http_code}" http://localhost:4323/pages/my-landing-page
```

## Examples in the repo

| Slug | What it demonstrates |
| --- | --- |
| `about-page` | Team page with flip cards and timeline |
| `changelog-page` | Release history layout |
| `blog-listing-page` | Post grid with filters |
| `analytics-page` | Dashboard-style page shell |

Browse `packages/content/resources/*/index.mdx` where `type: page` for more patterns.

## Checklist

- [ ] `packages/content/resources/<slug>/index.mdx` with valid frontmatter
- [ ] `snippets/html.html` (+ `style.css`, `script.js` as needed)
- [ ] `labRoute` matches `/<category>/<slug>`
- [ ] `targets` matches files present
- [ ] Prose README in MDX body (sections, when to use)
- [ ] MCP catalog regenerated
- [ ] `bun run lint` + build www + lab

## Related

- General resource rules: [`content-authoring`](../content-authoring/SKILL.md)
- Full field reference: `CONTENT_AUTHORING.md` at repo root
- Lab route handler: `apps/lab/src/pages/[category]/[slug].astro`
