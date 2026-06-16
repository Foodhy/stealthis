---
name: create-site-pages
description: Add new Astro pages to apps/www with i18n, SEO, sitemap, and optional nav links. Use when creating site routes like /changelog, /showcase, or any new top-level page on stealthis.dev.
metadata:
  tags: astro, www, i18n, routing, pages, seo
---

# Create Site Pages (apps/www)

Use this skill when adding a **new route to the main showcase site** (`apps/www`), not when adding a Library resource. For copy-paste page templates in the Library, use [`page-resources`](../page-resources/SKILL.md).

## When to use

- New top-level page on stealthis.dev (e.g. `/pricing`, `/about`, `/tools`)
- New localized variant of an existing site page
- Page needs nav entry, sitemap inclusion, or OG image

## Architecture

```
apps/www/src/
  pages/                    # English (default locale, no prefix)
    my-page.astro
    es/
      my-page.astro          # Thin re-export → ../my-page.astro
    fr/
      my-page.astro
  layouts/Base.astro         # Shared shell (nav, footer, SEO)
  i18n/index.ts              # All translation strings
  components/Nav.astro       # Main navigation
```

**Routing rules:**

- English (`en`) lives at the root: `/my-page`
- Other locales use a prefix: `/es/my-page`, `/fr/my-page`, …
- Locale list: `LOCALES` in `apps/www/src/i18n/index.ts` and `astro.config.mjs` → `i18n.locales`

## Workflow

### 1. Create the English page

Add `apps/www/src/pages/<slug>.astro`:

```astro
---
import Base from "@layouts/Base.astro";
import { getAlternateLinks, getLocaleFromUrl, useTranslations } from "@i18n/index";

const locale = getLocaleFromUrl(Astro.url);
const t = useTranslations(locale);
const alternateLinks = getAlternateLinks("/my-page");
---

<Base
  title={t("myPage.title")}
  description={t("myPage.description")}
  canonicalPath="/my-page"
  alternateLinks={alternateLinks}
>
  <main class="mx-auto max-w-3xl px-6 py-16">
    <h1>{t("myPage.title")}</h1>
    <p>{t("myPage.intro")}</p>
  </main>
</Base>
```

**Base props worth setting:**

| Prop | Purpose |
| --- | --- |
| `title` | `<title>` and OG title |
| `description` | Meta description |
| `canonicalPath` | Canonical URL path without locale prefix |
| `alternateLinks` | `hreflang` alternates for all locales |
| `image` | OG image path (e.g. `/og/my-page.webp`) |
| `keywords` | Extra SEO keywords merged with defaults |
| `noindex` | Set `true` for draft/internal pages |

### 2. Add locale re-exports

For every non-English locale in `LOCALES`, create a thin wrapper:

`apps/www/src/pages/es/my-page.astro`:

```astro
---
import MyPage from "../my-page.astro";
---

<MyPage />
```

Repeat for `fr/`, `ja/`, `de/`, etc. Match the folder names already used under `apps/www/src/pages/`.

### 3. Add i18n strings

In `apps/www/src/i18n/index.ts`, add keys for **each locale block** (at minimum `en` and `es`):

```ts
"myPage.title": "My Page",
"myPage.description": "Short meta description for SEO.",
"myPage.intro": "Body copy for the page.",
```

Pattern: use a dotted prefix (`myPage.*`) grouped with related keys. Search for an existing page (e.g. `changelog.`) to copy the locale-block structure.

### 4. Register in sitemap (if public)

Edit `apps/www/src/pages/sitemap.xml.ts` — add the path to `LOCALIZED_BASE_PATHS`:

```ts
const LOCALIZED_BASE_PATHS = ["/", "/library/", "/showcase/", "/changelog", "/my-page"];
```

Paths here are **without** locale prefix; the sitemap generator expands them across all `LOCALES`.

### 5. Add nav link (optional)

If the page should appear in the header, edit `apps/www/src/components/Nav.astro`:

1. Add a `nav.myPage` key in i18n.
2. Append to `navLinks` (or the applications dropdown if it is a tool link).

Follow existing entries (`library`, `showcase`, `changelog`) for `prefix`, `external`, and `badge` patterns.

### 6. OG image (optional)

Dynamic OG images live under `apps/www/src/pages/og/`. Static images go in `apps/www/public/og/`. Reference via `image="/og/my-page.webp"` on `<Base>`.

## Patterns from existing pages

| Page | File | Notes |
| --- | --- | --- |
| Changelog | `pages/changelog.astro` | Inline data array, bilingual bullets per release |
| Showcase | `pages/showcase/index.astro` | Reads content collection + snippets at build time |
| Home | `pages/index.astro` | Large marketing page with marquees and sections |
| Library | `pages/library/index.astro` | Filterable resource grid |

**Changelog-style bilingual content:** keep `en` and `es` arrays in the page frontmatter when translations are page-specific (see `changelog.astro`). For reusable UI chrome, prefer i18n keys.

## Checklist before handoff

- [ ] English page at `apps/www/src/pages/<slug>.astro`
- [ ] Locale wrappers for all locales under `apps/www/src/pages/<locale>/`
- [ ] i18n keys added for every supported locale block
- [ ] `getAlternateLinks("/<slug>")` passed to `<Base>`
- [ ] Path added to `LOCALIZED_BASE_PATHS` in `sitemap.xml.ts` (if indexable)
- [ ] Nav link added if user-facing (optional)
- [ ] `bun run lint`
- [ ] `bun run build:www`
- [ ] Smoke test: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/<slug>`

## Related files

- Layout: `apps/www/src/layouts/Base.astro`
- i18n helpers: `apps/www/src/i18n/index.ts` (`getLocaleFromUrl`, `useTranslations`, `getAlternateLinks`, `getLocalizedPath`)
- Astro i18n config: `apps/www/astro.config.mjs`
- Sitemap: `apps/www/src/pages/sitemap.xml.ts`
- Navigation: `apps/www/src/components/Nav.astro`

## Do not

- Edit files under `dist/` (generated output)
- Hardcode English strings when the page is user-facing — use `t()` keys
- Forget locale wrappers (broken `/es/...` routes)
- Add a locale to `astro.config.mjs` without updating `LOCALES` in i18n (they must stay aligned)
