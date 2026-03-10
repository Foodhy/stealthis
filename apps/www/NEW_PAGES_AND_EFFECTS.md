# New Pages, Effect References, and UHD Pages

Guide for creating **future** route pages, effect resources, and Ultra High Definition pages. **UHD and Effects have no dedicated routes** (`/uhd`, `/effects` were removed). They are reached only via **Library** (category “Ultra High Definition Pages” or collection “Effects”) and **Lab** (when opening a resource that has a `labRoute`).

---

## 1. Creating future route pages

New www routes (e.g. `/search`, or other curated hubs) should reuse existing components.

### Building blocks

| Component | Location | Use for |
|-----------|----------|---------|
| FilterBar | `src/components/FilterBar.astro` | Search input, category/tech/author filters, URL sync |
| library-index.json | `src/pages/library-index.json.ts` | Search index for resources |
| ResourceCard | `src/components/ResourceCard.astro` | Library-style card (title, meta, link to `/r/[slug]`) |
| ShowcaseCard | `src/components/ShowcaseCard.astro` | Card with iframe preview (needs `labRoute` + snippets) |
| Base | `src/layouts/Base.astro` | Layout, meta, i18n |

### Steps to add a new route page

1. Create `src/pages/<name>/index.astro` (e.g. `search`).
2. Use `getCollection("resources")`, filter by `category` or `collections` as needed.
3. Render a grid of `ResourceCard` or `ShowcaseCard`; reuse `Base`, `getLocaleFromUrl`, `useTranslations`, `getAlternateLinks`.
4. For each locale (es, fr, ja, …), add `src/pages/<locale>/<name>/index.astro` that imports and renders the default page (same pattern as `es/library/index.astro`).
5. Link to the page from Library/Showcase (e.g. category chips, collection explorer) — **not** from the top nav unless it’s a primary hub.

### No dedicated UHD or Effects routes

There are no `/uhd` or `/effects` pages. UHD and Effects resources are discovered only in **Library** (filter by category “Ultra High Definition Pages” or collection “Effects”) and in **Lab** (open a resource that has a `labRoute`).

---

## 2. Effect references and new effect resources

### ROADMAP components as effect references

Use these existing resources when building new effect snippets:

| Effect type | ROADMAP slugs | Notes |
|-------------|---------------|-------|
| Click / press | `like-button`, `copy-to-clipboard`, `follow-button`, `share-button` | Press feedback, success states |
| Slide / drawer | `bottom-sheet`, `sheet-drawer`, `swipe-action`, `hamburger-menu` | Slide-in/out, gesture-driven |
| View / modal | `modal-dialog`, `snackbar`, `action-sheet`, `popover` | Enter/exit, overlay transitions |
| Nav / tab | `tabs-vertical`, `breadcrumb-nav`, `anchor-nav` | Active states, underline animations |
| Add / optimistic | `optimistic-ui`, `notification-badge`, `shopping-cart` | Add-to-list feedback, badge bump |
| Loading / skeleton | `loading-skeleton`, `ai-thinking-loader`, `dot-loader` | Skeleton pulse, thinking state |
| Theme / toggle | `theme-toggle`, `high-contrast-toggle` | Smooth mode switch |
| Carousel / scroll | `gesture-carousel`, `infinite-scroll`, `virtual-list` | Snap, scroll feedback |

### How to create a new effect resource

1. **Create resource folder**  
   `packages/content/resources/<slug>/`  
   Use a slug like `effect-<name>` (e.g. `effect-drawer-slide`, `effect-add-to-cart`).

2. **Frontmatter** (in `index.mdx`)  
   - `category`: e.g. `patterns` or `ui-components`  
   - `type`: `pattern` or `component`  
   - `collections: ["effects"]` — **required** so it appears in Library when filtering by the **Effects** collection.  
   - `labRoute`: e.g. `/patterns/effect-drawer-slide` if you add snippets.  
   - `tags`: include `effect`, and the effect type (e.g. `slide`, `drawer`).  
   - `tech`: e.g. `[css, vanilla-js]`

3. **Snippets**  
   Add `snippets/html.html`, `snippets/style.css`, `snippets/script.js` (and optionally React etc.). Keep the demo minimal and focused on the effect.

4. **Regenerate catalog**  
   Run `bun run --filter @stealthis/mcp catalog` after adding or changing resources.

### Effect types to implement (backlog)

- **Button / control**: Press (scale, shadow), click (ripple/highlight), loading transition.
- **Navigation**: Nav hover/active, smooth scroll, view transitions (View Transitions API), slide-between-pages.
- **Slide**: Panel slide-in/out, drawer, carousel step.
- **View**: Enter/exit for modals, toasts, cards.
- **Add**: “Add to cart” / “Add to list” feedback (badge bump, checkmark).

### Suggested effect slugs (from plan)

| Slug | Effect type | Reference ROADMAP |
|------|-------------|-------------------|
| `effect-button-press` | Click / press | `like-button`, `copy-to-clipboard` |
| `effect-nav-underline` | Nav / tab | `tabs-vertical`, `breadcrumb-nav` |
| `effect-modal-enter` | View / modal | `modal-dialog`, `snackbar` |
| `effect-drawer-slide` | Slide / drawer | `bottom-sheet`, `sheet-drawer` |
| `effect-add-to-cart` | Add / optimistic | `optimistic-ui`, `shopping-cart` |
| `effect-skeleton-load` | Loading | `loading-skeleton`, `ai-thinking-loader` |

### Site effects (global)

For site-wide feel (smooth nav, click feedback), add CSS/JS or View Transitions in `Nav.astro` or `Base.astro`. Treat these as “site effects” separate from copy-paste effect resources.

---

## 3. UHD pages (Ultra High Definition)

### Category

- **Schema ID**: `ultra-high-definition-pages`
- **Intent**: Pages with ultra-defined visuals and interactions (Apple, Vercel, Nintendo, high-end brand sites): strong typography, motion, depth, and polish.
- **Discovery**: Via **categories** — Library (filter by “Ultra High Definition Pages”), Showcase (category chip). Not in the top nav.

### How to create a new UHD page (resource)

1. **Create resource folder**  
   `packages/content/resources/<slug>/`  
   Use a slug that fits the series (e.g. `lgc-80-uhd-<theme>` or your own convention).

2. **Frontmatter** (in `index.mdx`)  
   - `category: ultra-high-definition-pages` — **required** for UHD.  
   - `type: page`  
   - `collections`: optional, e.g. `["hero", "motion"]` if it fits.  
   - `labRoute`: e.g. `/web-pages/lgc-80-uhd-commerce` so it appears in Showcase with live preview.  
   - `difficulty`: typically `hard` for full UHD pages.  
   - `targets`: e.g. `[html, react]`

3. **Content and snippets**  
   - Write the MDX body (overview, features, notes).  
   - Add high-quality snippets: `snippets/html.html`, `snippets/style.css`, `snippets/script.js` (and React/Vue etc. if needed).  
   - Aim for “Apple/Vercel/Nintendo” level: clear typography, smooth motion, depth, and polished interactions.

4. **Regenerate catalog**  
   Run `bun run --filter @stealthis/mcp catalog`.

The resource will appear in Library under the “Ultra High Definition Pages” category, in Showcase (category chip) if `labRoute` and snippets exist, and in Lab when opened via its `labRoute`.

---

## 4. Summary

| Goal | Where to link | Key frontmatter |
|------|----------------|------------------|
| New **route** page | Library / Showcase / internal links (not top nav unless primary) | N/A (route only) |
| New **effect** resource | **Library** (filter by collection “Effects”); **Lab** (if `labRoute` set) | `collections: ["effects"]` |
| New **UHD** resource | **Library** (filter by category “Ultra High Definition Pages”); **Showcase** / **Lab** if `labRoute` set | `category: ultra-high-definition-pages` |

After content or schema changes, run:

- `bun run --filter @stealthis/mcp catalog`
- `bun run build:www` (and `bun run build:mcp` if you use the catalog)
