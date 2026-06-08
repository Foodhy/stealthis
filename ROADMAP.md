# Stealthis — Roadmap

> Last updated: 2026-02-28

---

## Phase 1 — Author + Library UX ✅ DONE

### Author field

| Layer | File | Status |
|---|---|---|
| Schema | `packages/schema/src/schema.ts` | ✅ `author: { repo }` optional Zod object |
| Types | `packages/schema/src/types.ts` | ✅ `ResourceAuthor` interface + `author?` on `ResourceMeta` |
| Content | `packages/content/resources/*/index.mdx` | ✅ 112 files — `repo: "https://github.com/Foodhy/stealthis"` |
| Astro schema | `apps/www/src/content/config.ts` | ✅ mirrors schema |
| Card | `apps/www/src/components/ResourceCard.astro` | ✅ `data-author` derived from repo URL |
| Filter | `apps/www/src/components/FilterBar.astro` | ✅ Author section — `<a>` links, URL is source of truth |
| Detail | `apps/www/src/pages/r/[slug].astro` | ✅ `@username` → `/library?author=X` (new tab) + GitHub icon → repo (new tab) |
| i18n | `apps/www/src/i18n/index.ts` | ✅ `library.filter.author`, `resource.author` EN + ES |

**Final frontmatter format:**
```yaml
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
```
`name` es el nombre visible. Username (`Foodhy`) se extrae del `src` en runtime.

### Card UX fixes

| Fix | File | Status |
|---|---|---|
| Icons unclickable (overlay bug) | `ResourceCard.astro` | ✅ `relative z-10` on actions row lifts icons above `::after` overlay |
| Favorites filter in sidebar | `FilterBar.astro` | ✅ Heart toggle button — reads localStorage, re-filters on card heart toggle |
| i18n `library.filter.favorites` | `i18n/index.ts` | ✅ EN + ES |

---

## Phase 2 — UI Components ✅ DONE

Quick standalone components, no series numbering.

| Slug | Title | Tech | Difficulty | Status |
|---|---|---|---|---|
| `command-palette` | Command Palette (⌘K) | vanilla-js, css | med | ✅ |
| `toast-system` | Toast Notification Stack | vanilla-js, css | easy | ✅ |
| `animated-tabs` | Animated Tab Bar | css, vanilla-js | easy | ✅ |
| `skeleton-loader` | Skeleton Loader | css | easy | ✅ |
| `toggle-switch` | iOS-style Toggle | css | easy | ✅ |
| `drag-to-reorder` | Drag & Drop List | vanilla-js | med | ✅ |
| `accordion-spring` | Spring Accordion | css, vanilla-js | med | ✅ |
| `tooltip-variants` | Tooltip with Arrow Variants | css | easy | ✅ |
| `infinite-marquee` | Infinite Marquee / Ticker | css, vanilla-js | easy | ✅ |
| `flip-card-3d` | Flip Card 3D | css | easy | ✅ |

---

## Phase 3 — Web Animations `lg-32` → `lg-40` ✅ DONE

Continue the `lg-XX` series from `lg-31`.

| Slug | Title | Tech | Difficulty | Status |
|---|---|---|---|---|
| `lg-32-css-typewriter` | CSS-only Typewriter | css | easy | ✅ |
| `lg-33-number-counter` | Smooth Number Counter | gsap, scrolltrigger | easy | ✅ |
| `lg-34-svg-path-draw` | SVG Path Drawing | gsap, svg | med | ✅ |
| `lg-35-stagger-fade-scroll` | Stagger Fade-in on Scroll | gsap, scrolltrigger | easy | ✅ |
| `lg-36-mouse-trail-particles` | Mouse Trail Particles | canvas, vanilla-js | med | ✅ |
| `lg-37-text-scramble` | Text Scramble / Matrix Decode | vanilla-js | med | ✅ |
| `lg-38-infinite-marquee-gsap` | Infinite Marquee (GSAP) | gsap | easy | ✅ |
| `lg-39-clip-path-reveal` | Clip-path Reveal on Scroll | gsap, scrolltrigger | med | ✅ |
| `lg-40-gradient-mesh-bg` | Animated Gradient Mesh BG | canvas, vanilla-js | hard | ✅ |

---

## Phase 4 — Concept Pages `lgc-59` → `lgc-68` ✅ DONE

Continue the `lgc-XX` series from `lgc-58`.

| Slug | Title | Concept | Difficulty | Status |
|---|---|---|---|---|
| `lgc-59-startup-pitch` | Startup Pitch Deck | Slides-style scrolljack narrative | hard | ✅ |
| `lgc-60-event-conference` | Event / Conference Landing | Date countdown, speaker grid | med | ✅ |
| `lgc-61-coming-soon` | Coming Soon + Waitlist | Email capture, animated countdown | easy | ✅ |
| `lgc-62-podcast-platform` | Podcast Platform | Audio player UI, episode grid | med | ✅ |
| `lgc-63-architecture-firm` | Architecture Firm | Full-bleed image, editorial layout | hard | ✅ |
| `lgc-64-typographic-portfolio` | Minimal Typographic Portfolio | Text-only, kinetic type | med | ✅ |
| `lgc-65-nft-marketplace` | NFT / Digital Art Marketplace | Dark, grid, hover glow | hard | ✅ |
| `lgc-66-health-app-landing` | Health & Wellness App | Soft palette, feature scroll | med | ✅ |
| `lgc-67-law-firm` | Legal / Law Firm | Professional, serif, trust signals | easy | ✅ |
| `lgc-68-dark-saas-dashboard` | Dark SaaS Dashboard Preview | Data viz, sidebar, charts | hard | ✅ |

---

## Phase 5 — React Components ✅ DONE

| Slug | Title | Tech | Status |
|---|---|---|---|
| `rc-01-use-magnetic` | useMagnetic Hook | react, typescript | ✅ |
| `rc-02-use-parallax` | useParallax Hook | react, typescript | ✅ |
| `rc-03-cursor-follower` | Cursor Follower Component | react, typescript, raf | ✅ |
| `rc-04-animated-counter` | Animated Counter Hook | react, typescript | ✅ |

---

## Phase 6 — UI Components Extended (shadcn gap fill) ✅ DONE

Components present in shadcn/ui that don't yet exist in the library.
Grouped by complexity. All are vanilla HTML/CSS/JS unless noted.

> **Coverage reference:** shadcn has ~65 components. After Phase 2 we cover:
> Accordion ✅ · Command ✅ · Toast ✅ · Tabs ✅ · Skeleton ✅ · Switch ✅ · Tooltip ✅ · Spinner ✅ (dot-loader)

### Easy — CSS-first

| Slug | shadcn equiv | Tech | Status |
|---|---|---|---|
| `alert-banner` | Alert | css | ✅ |
| `badge` | Badge | css | ✅ |
| `avatar-group` | Avatar | css | ✅ |
| `breadcrumb` | Breadcrumb | css, vanilla-js | ✅ |
| `progress-bar` | Progress | css, vanilla-js | ✅ |
| `checkbox-group` | Checkbox | css | ✅ |
| `radio-group` | Radio Group | css | ✅ |
| `hover-card` | Hover Card | css | ✅ |
| `input-variants` | Input / Input Group | css | ✅ |
| `separator` | Separator | css | ✅ |

### Medium — JS required

| Slug | shadcn equiv | Tech | Status |
|---|---|---|---|
| `modal-dialog` | Dialog / Alert Dialog | vanilla-js, css | ✅ |
| `dropdown-menu` | Dropdown Menu | vanilla-js, css | ✅ |
| `popover` | Popover | vanilla-js, css | ✅ |
| `custom-select` | Select / Combobox | vanilla-js, css | ✅ |
| `range-slider` | Slider | vanilla-js, css | ✅ |
| `pagination` | Pagination | vanilla-js, css | ✅ |
| `sheet-drawer` | Sheet / Drawer | vanilla-js, css | ✅ |
| `carousel` | Carousel | vanilla-js, css | ✅ |
| `context-menu` | Context Menu | vanilla-js, css | ✅ |
| `navigation-menu` | Navigation Menu | vanilla-js, css | ✅ |
| `otp-input` | Input OTP | vanilla-js, css | ✅ |
| `scroll-area` | Scroll Area | css | ✅ |

### Hard — complex state / layout

| Slug | shadcn equiv | Tech | Status |
|---|---|---|---|
| `resizable-panels` | Resizable | vanilla-js, css | ✅ |
| `date-picker` | Date Picker / Calendar | vanilla-js, css | ✅ |
| `data-table` | Data Table | vanilla-js, css | ✅ |

---

## Phase 7 — UI Components Deep Cut ✅ DONE

Components found across DaisyUI · Flowbite · Ant Design · Radix UI · Headless UI
that don't appear in Phase 2 or Phase 6. Organized by category.

> **Sources checked:** DaisyUI (~65) · Flowbite (~44) · Ant Design (~80) · Radix UI (~34) · Headless UI (~16)

### Form & Input

| Slug | Found in | Tech | Difficulty | Status |
|---|---|---|---|---|
| `number-input` | DaisyUI, Ant Design | css, vanilla-js | easy | ✅ |
| `password-field` | Radix UI, Headless UI | css, vanilla-js | easy | ✅ |
| `tag-input` | Ant Design | vanilla-js, css | med | ✅ |
| `autocomplete` | Ant Design, Headless UI | vanilla-js, css | med | ✅ |
| `file-upload-dropzone` | DaisyUI, Flowbite, Ant Design | vanilla-js, css | med | ✅ |
| `rating-stars` | DaisyUI, Flowbite, Ant Design | css, vanilla-js | easy | ✅ |
| `color-picker` | Ant Design | canvas, vanilla-js | hard | ✅ |

### Feedback & Status

| Slug | Found in | Tech | Difficulty | Status |
|---|---|---|---|---|
| `alert-dialog` | Radix UI, shadcn | vanilla-js, css | med | ✅ |
| `empty-state` | Ant Design, DaisyUI | css | easy | ✅ |
| `result-page` | Ant Design | css | easy | ✅ |
| `stat-card` | DaisyUI, Ant Design | css | easy | ✅ |
| `status-indicator` | DaisyUI | css | easy | ✅ |
| `loading-variants` | DaisyUI, Flowbite | css | easy | ✅ |

### Navigation & Wayfinding

| Slug | Found in | Tech | Difficulty | Status |
|---|---|---|---|---|
| `bottom-nav` | DaisyUI, Flowbite | css, vanilla-js | easy | ✅ |
| `steps-progress` | DaisyUI, Flowbite, Ant Design | css, vanilla-js | easy | ✅ |
| `mega-menu` | Flowbite | vanilla-js, css | med | ✅ |
| `anchor-nav` | Ant Design, Flowbite | vanilla-js, css | med | ✅ |
| `back-to-top` | Ant Design | vanilla-js, css | easy | ✅ |

### Layout & Display

| Slug | Found in | Tech | Difficulty | Status |
|---|---|---|---|---|
| `timeline` | DaisyUI, Flowbite, Ant Design | css | easy | ✅ |
| `chat-bubble` | DaisyUI, Flowbite | css | easy | ✅ |
| `diff-slider` | DaisyUI | vanilla-js, css | med | ✅ |
| `masonry-grid` | Ant Design | css (columns) | easy | ✅ |
| `mockup-browser` | DaisyUI, Flowbite | css | easy | ✅ |
| `mockup-phone` | DaisyUI, Flowbite | css | easy | ✅ |
| `segmented-control` | Ant Design, DaisyUI | css, vanilla-js | easy | ✅ |
| `image-lightbox` | Flowbite, Ant Design | vanilla-js, css | med | ✅ |
| `watermark` | Ant Design | canvas | med | ✅ |

### Actions & Interactions

| Slug | Found in | Tech | Difficulty | Status |
|---|---|---|---|---|
| `fab-speed-dial` | DaisyUI, Flowbite | css, vanilla-js | med | ✅ |
| `clipboard-copy` | Flowbite | vanilla-js, css | easy | ✅ |
| `swap` | DaisyUI | css | easy | ✅ |
| `tour-spotlight` | Ant Design | vanilla-js, css | hard | ✅ |
| `toggle-group` | Radix UI, DaisyUI | css, vanilla-js | easy | ✅ |

### Typography & Visual

| Slug | Found in | Tech | Difficulty | Status |
|---|---|---|---|---|
| `kbd-display` | DaisyUI, Flowbite | css | easy | ✅ |
| `divider-label` | DaisyUI, Ant Design | css | easy | ✅ |
| `indicator` | DaisyUI | css | easy | ✅ |
| `text-rotate` | DaisyUI | css, vanilla-js | easy | ✅ |
| `stack-cards` | DaisyUI | css | easy | ✅ |
| `qr-code` | Flowbite, Ant Design | canvas/svg | med | ✅ |

---

## Phase 8 — SaaS / Enterprise Components ✅ DONE

Componentes enfocados en aplicaciones SaaS, dashboards, gestión de empleados y scheduling.

> Ideal para paneles de admin, CRMs, sistemas de gestión de personal, etc.

### Dashboard & Layout

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `admin-layout` | Layout / Sidebar | vanilla-js, css | med | ✅ |
| `stats-card` | Card (metrics) | css | easy | ✅ |
| `dashboard-widget` | - | vanilla-js, css | med | ✅ |
| `user-profile-card` | Avatar / Card | css | easy | ✅ |
| `settings-panel` | Sheet / Dialog | vanilla-js, css | med | ✅ |

### Calendar & Scheduling

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `calendar-view` | Calendar | vanilla-js, css | hard | ✅ |
| `scheduler-timeline` | - | vanilla-js, css | hard | ✅ |
| `time-range-picker` | - | vanilla-js, css | med | ✅ |
| `date-range-picker` | Date Range Picker | vanilla-js, css | hard | ✅ |

### Data & Forms

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `advanced-filters` | Filter | vanilla-js, css | med | ✅ |
| `search-autocomplete` | Combobox | vanilla-js, css | med | ✅ |
| `multi-step-form` | - | vanilla-js, css | med | ✅ |

### Content Management

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `kanban-board` | - | vanilla-js, css | hard | ✅ |
| `data-list` | - | vanilla-js, css | med | ✅ |

### Employee Management

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `employee-schedule` | - | vanilla-js, css | hard | ✅ |
| `shift-grid` | - | vanilla-js, css | med | ✅ |
| `time-off-request` | - | vanilla-js, css | easy | ✅ |
| `availability-calendar` | - | vanilla-js, css | hard | ✅ |

---

## Phase 9 — App Shell & Navigation Systems ✅ DONE

Componentes para construir el "esqueleto" de aplicaciones web modernas — lo que todo app necesita para funcionar.

### Navigation & Shell

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `sidebar-admin` | Sidebar (collapsible) | vanilla-js, css | med | ✅ |
| `breadcrumb-nav` | Breadcrumb | vanilla-js, css | easy | ✅ |
| `tabs-vertical` | Tabs (vertical/horizontal) | vanilla-js, css | easy | ✅ |
| `menubar-app` | Menubar | vanilla-js, css | easy | ✅ |
| `footer-links` | Footer | css | easy | ✅ |

### Auth Pages

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `login-page` | - | vanilla-js, css | easy | ✅ |
| `register-page` | - | vanilla-js, css | easy | ✅ |
| `forgot-password` | - | vanilla-js, css | easy | ✅ |
| `verify-email` | - | vanilla-js, css | easy | ✅ |

### Communication

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `notification-bell` | - | vanilla-js, css | med | ✅ |
| `chat-widget` | - | vanilla-js, css | hard | ✅ |
| `comment-thread` | - | vanilla-js, css | med | ✅ |

### Pricing & E-commerce

| Slug | shadcn equiv | Tech | Difficulty | Status |
|---|---|---|---|---|
| `pricing-table` | - | css | easy | ✅ |
| `product-card` | - | css | easy | ✅ |
| `shopping-cart` | - | vanilla-js, css | med | ✅ |

---

## Notes

- Author tiene `name` (visible) + `src` (URL del repo) — el username se extrae del `src` en runtime.
- Community contributors use the same format with their own repo URL.
- `rc-XX` React components use the existing `components` category (no new category needed).
- New `lg-XX` examples are hand-coded (not from `libs-gen`).
- Phase 6 slugs follow the same flat naming as Phase 2 (no series prefix).

---

## Phase 10 — Data Visualization  ✅ DONE

Componentes para mostrar datos visualmente: gráficos, métricas, indicadores.

### Charts

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `chart-line` | Line chart with tooltips | vanilla-js, svg | med | ✅ |
| `chart-bar` | Bar chart (vertical/horizontal) | vanilla-js, svg | med | ✅ |
| `chart-pie` | Pie/Donut chart | vanilla-js, svg | easy | ✅ |
| `chart-area` | Area chart with gradient fill | vanilla-js, svg | med | ✅ |
| `chart-radar` | Radar / spider chart | vanilla-js, svg | med | ✅ |
| `chart-scatter` | Scatter plot with hover labels | vanilla-js, svg | med | ✅ |
| `chart-heatmap` | Calendar heatmap (GitHub-style) | vanilla-js, svg | hard | ✅ |
| `chart-funnel` | Funnel / conversion chart | vanilla-js, svg | med | ✅ |
| `chart-treemap` | Treemap proportional blocks | vanilla-js, css | hard | ✅ |
| `chart-sankey` | Sankey flow diagram (D3.js) | d3, svg | hard | ✅ |
| `chart-stacked-bar` | Stacked bar chart (year-over-year) | vanilla-js, svg | med | ✅ |
| `chart-geo-dist` | Geographic distribution with map + bars | vanilla-js, svg | hard | ✅ |
| `chart-donut-products` | Donut chart — product categories | vanilla-js, svg | easy | ✅ |

### Metrics & Indicators

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `progress-ring` | Circular progress indicator | svg, css | easy | ✅ |
| `sparkline` | Mini inline chart | svg | easy | ✅ |
| `gauge-meter` | Gauge/meter display | svg | med | ✅ |
| `kpi-card` | KPI card with trend arrow | css | easy | ✅ |
| `metric-comparison` | Before/after metric diff | css | easy | ✅ |
| `leaderboard` | Ranked items with score bars | vanilla-js, css | easy | ✅ |

---

## Phase 11 — Mobile-First / Touch ✅ DONE

Componentes optimizados para experiencias mobile y gestos táctiles.

### Mobile Navigation

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `mobile-nav` | Bottom navigation bar | vanilla-js, css | easy | ✅ |
| `bottom-sheet` | Bottom sheet modal with drag | vanilla-js, css | med | ✅ |
| `swipe-tabs` | Swipeable tab panels | vanilla-js, css | med | ✅ |
| `hamburger-menu` | Animated hamburger → fullscreen nav | vanilla-js, css | easy | ✅ |

### Touch Interactions

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `swipe-action` | Swipe to reveal actions (iOS-style) | vanilla-js | med | ✅ |
| `pull-to-refresh` | Pull down to refresh indicator | vanilla-js | med | ✅ |
| `gesture-carousel` | Touch-enabled carousel with snap | vanilla-js | hard | ✅ |
| `pinch-zoom` | Pinch-to-zoom image viewer | vanilla-js | hard | ✅ |
| `long-press-menu` | Long-press context menu | vanilla-js | med | ✅ |

### Mobile Components

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `action-sheet` | iOS-style action sheet | vanilla-js, css | easy | ✅ |
| `mobile-stepper` | Dot/step indicator for onboarding | css | easy | ✅ |
| `floating-action-button` | FAB with expand animation | css, vanilla-js | easy | ✅ |

---

## Phase 12 — Full Page Templates ✅ DONE

Templates de páginas completas para distintos casos de uso.

### Error & Utility Pages

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `404-page` | 404 Not Found — animated | vanilla-js, css | easy | ✅ |
| `500-page` | 500 Server Error page | css | easy | ✅ |
| `maintenance-page` | Maintenance / offline page | vanilla-js, css | easy | ✅ |
| `offline-page` | PWA offline fallback page | css | easy | ✅ |

### Product & Commerce Pages

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `product-detail-page` | Product page with gallery + reviews | vanilla-js, css | hard | ✅ |
| `checkout-page` | Multi-step checkout flow | vanilla-js, css | hard | ✅ |
| `order-confirmation` | Order success page | css | easy | ✅ |
| `pricing-page` | Full pricing page with toggle | vanilla-js, css | med | ✅ |

### Content Pages

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `blog-post-page` | Article page with TOC sidebar | vanilla-js, css | med | ✅ |
| `portfolio-page` | Single project case study | css | med | ✅ |
| `about-page` | Team / about section | css | easy | ✅ |
| `contact-page` | Contact page with form + map embed | vanilla-js, css | easy | ✅ |

---

## Phase 13 — Email & Notifications ✅ DONE

Templates y componentes para emails y notificaciones.

### Email Templates (table-based, email-safe HTML)

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `email-welcome` | Welcome / onboarding email | html, css | easy | ✅ |
| `email-reset-password` | Password reset email | html, css | easy | ✅ |
| `email-invoice` | Invoice / receipt email | html, css | med | ✅ |
| `email-newsletter` | Newsletter with header + articles | html, css | med | ✅ |
| `email-order-confirmation` | E-commerce order confirmation | html, css | med | ✅ |
| `email-verification` | Email verification / OTP code | html, css | easy | ✅ |
| `email-team-invite` | Team invite with CTA button | html, css | easy | ✅ |

### In-App Notification Components

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `notification-center` | Dropdown notification panel | vanilla-js, css | med | ✅ |
| `notification-badge` | Badge counter on icon | css | easy | ✅ |
| `snackbar` | Bottom snackbar message | vanilla-js, css | easy | ✅ |
| `alert-inline` | Inline alert (info/warn/error) | css | easy | ✅ |
| `banner-announcement` | Full-width dismissable banner | vanilla-js, css | easy | ✅ |

---

## Phase 14 — Integration Patterns ✅ DONE

Patrones comunes que combinan múltiples componentes para casos de uso frecuentes.

### Data Patterns

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `crud-table` | Full CRUD table with sort + actions | vanilla-js | hard | ✅ |
| `search-filter` | Search with filters sidebar | vanilla-js | med | ✅ |
| `infinite-scroll` | Infinite scroll list with loader | vanilla-js | med | ✅ |
| `virtual-list` | Virtualized large list | vanilla-js | hard | ✅ |
| `sortable-table` | Table with column sort + resize | vanilla-js | med | ✅ |
| `bulk-actions` | Checkbox select + bulk action bar | vanilla-js | med | ✅ |

### UX Patterns

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `lazy-load` | Lazy load images with IntersectionObserver | vanilla-js | easy | ✅ |
| `theme-toggle` | Dark/Light mode toggle | vanilla-js, css | easy | ✅ |
| `loading-skeleton` | Page-level loading skeleton | css | easy | ✅ |
| `optimistic-ui` | Optimistic update pattern (list add/remove) | vanilla-js | med | ✅ |
| `debounced-search` | Search input with debounce + results | vanilla-js | easy | ✅ |
| `copy-to-clipboard` | Copy button with success feedback | vanilla-js, css | easy | ✅ |

---

## Phase 15 — Widgets, Media & Interactive ✅ DONE (+ React variants ✅)

Componentes para funcionalidades específicas: widgets utilitarios, media players, social y elementos interactivos.

### Widgets & Utilities

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `digital-clock` | Digital clock display | vanilla-js, css | easy | ✅ |
| `countdown-timer` | Countdown timer | vanilla-js | easy | ✅ |
| `stopwatch` | Stopwatch with lap times | vanilla-js | easy | ✅ |
| `calculator` | Simple calculator | vanilla-js | med | ✅ |
| `currency-converter` | Currency converter | vanilla-js | med | ✅ |
| `unit-converter` | Unit converter (length, weight, temp) | vanilla-js | med | ✅ |
| `word-counter` | Word / character counter | vanilla-js | easy | ✅ |

### Media Players

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `video-player` | Custom video player with controls | vanilla-js, html5 | med | ✅ |
| `audio-player` | Audio player with playlist | vanilla-js, html5 | med | ✅ |
| `podcast-player` | Podcast player with speed control | vanilla-js | med | ✅ |
| `image-comparison` | Before/after image slider | vanilla-js, css | med | ✅ |
| `zoom-image` | Hover zoom / magnifier lens | vanilla-js | med | ✅ |

### Social & Sharing

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `like-button` | Animated like/heart button | vanilla-js, css | easy | ✅ |
| `share-button` | Share button with options | vanilla-js | easy | ✅ |
| `follow-button` | Follow/Subscribe toggle | css | easy | ✅ |
| `social-feed` | Social media feed card | vanilla-js, css | med | ✅ |
| `comment-box` | Comment input with avatar | css | easy | ✅ |

### Real-time & Live

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `live-clock` | Real-time clock (analog + digital) | vanilla-js | easy | ✅ |
| `stock-ticker` | Scrolling stock/crypto ticker | vanilla-js | med | ✅ |
| `live-search` | Real-time search with debounce | vanilla-js | med | ✅ |
| `typing-indicator` | "User is typing…" animation | css | easy | ✅ |

### Interactive & Games

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `quiz-widget` | Simple multiple choice quiz | vanilla-js | med | ✅ |
| `poll-vote` | Voting poll with percentages | vanilla-js | med | ✅ |
| `simple-game` | Snake game (Canvas) | canvas-api | hard | ✅ |
| `memory-card-game` | Memory card match game | vanilla-js, css-3d | med | ✅ |

---

## Phase 16 — Developer Tools, AI UI & Advanced ✅ DONE

Categorías nuevas enfocadas en herramientas para devs, UI de IA y patrones avanzados.

### Developer Tools & Code Display

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `code-block` | Syntax-highlighted code block with copy | vanilla-js, css | easy | ✅ |
| `code-block-rc` | Syntax-highlighted code block with copy | tailwind, react | easy |  |
| `terminal-ui` | Terminal / CLI output display | css | easy | ✅ |
| `diff-viewer` | Side-by-side code diff viewer | vanilla-js, css | med | ✅ |
| `diff-viewer-rc` | Side-by-side code diff viewer | tailwind, react | med |  |
| `json-viewer` | Collapsible JSON tree viewer | vanilla-js, css | med | ✅ |
| `log-viewer` | Scrollable log output with filters | vanilla-js, css | med | ✅ |
| `keyboard-shortcut` | Keyboard shortcut cheat sheet | css | easy | ✅ |
| `api-status-board` | API / service status dashboard | vanilla-js, css | med | ✅ |
| `schema-diagram` | Simple ER / schema diagram | vanilla-js, svg | hard | ✅ |

### AI / LLM UI Patterns

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `chat-interface` | AI chat UI (bubble stream + input) | vanilla-js, css | med | ✅ |
| `streaming-text` | Streaming text typewriter effect | vanilla-js | easy | ✅ |
| `ai-response-card` | AI-generated result card with actions | css | easy | ✅ |
| `prompt-input` | Enhanced prompt textarea with tokens | vanilla-js, css | med | ✅ |
| `model-selector` | LLM model picker dropdown | vanilla-js, css | easy | ✅ |
| `token-counter` | Real-time token count indicator | vanilla-js | easy | ✅ |
| `ai-thinking-loader` | "Thinking…" animated loader | css | easy | ✅ |
| `citation-tooltip` | Inline citation with source preview | vanilla-js, css | med | ✅ |

### Maps & Location

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `map-embed` | Google/OSM map embed card | html, css | easy | ✅ |
| `location-pin-card` | Location card with pin + address | css | easy | ✅ |
| `directions-card` | Step-by-step directions list | css | easy | ✅ |
| `distance-badge` | Distance indicator badge | css | easy | ✅ |
| `store-locator` | Store list with map placeholder | vanilla-js, css | med | ✅ |

### File & Media Management

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `file-tree` | Collapsible file explorer tree | vanilla-js, css | med | ✅ |
| `image-gallery-grid` | Masonry photo gallery with lightbox | vanilla-js, css | med | ✅ |
| `video-grid` | Thumbnail grid with play overlay | css | easy | ✅ |
| `document-preview` | PDF/doc preview card | css | easy | ✅ |
| `attachment-list` | File attachment list with icons | css | easy | ✅ |
| `upload-progress` | Multi-file upload with progress bars | vanilla-js, css | med | ✅ |

### Accessibility & Inclusive Design

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `skip-navigation` | Skip-to-content accessible link | css | easy | ✅ |
| `focus-ring-custom` | Custom visible focus ring system | css | easy | ✅ |
| `screen-reader-announce` | Live region announcer component | vanilla-js | easy | ✅ |
| `high-contrast-toggle` | High contrast / dyslexia mode toggle | vanilla-js, css | med | ✅ |
| `font-size-control` | Accessible font size adjuster | vanilla-js, css | easy | ✅ |
| `reduced-motion-demo` | Reduced motion pattern showcase | css | easy | ✅ |

### Print & Document

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `print-invoice` | Print-ready invoice layout | css (print media) | med | ✅ |
| `print-resume` | Print-ready résumé/CV layout | css (print media) | med | ✅ |
| `certificate` | Award / completion certificate | css | easy | ✅ |
| `report-cover` | Document / report cover page | css | easy | ✅ |

---

## Phase 17 — AI Prompts ✅ DONE

System prompts, templates y patrones para optimizar interacciones con LLMs.

### Code & Development

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `prompt-code-review` | Code review prompt | markdown | easy | ✅ |
| `prompt-refactor` | Code refactoring prompt | markdown | easy | ✅ |
| `prompt-write-tests` | Write tests prompt | markdown | easy | ✅ |
| `prompt-bug-fix` | Bug analysis & fix prompt | markdown | easy | ✅ |
| `prompt-explain-code` | Explain code prompt | markdown | easy | ✅ |
| `prompt-optimize` | Performance optimization prompt | markdown | easy | ✅ |

### Documentation & Writing

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `prompt-docs-gen` | Generate documentation prompt | markdown | easy | ✅ |
| `prompt-readme` | README writer prompt | markdown | easy | ✅ |
| `prompt-changelog` | Changelog generator prompt | markdown | easy | ✅ |
| `prompt-comment` | Code commenting prompt | markdown | easy | ✅ |

### Architecture & Design

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `prompt-architecture` | System architecture design prompt | markdown | easy | ✅ |
| `prompt-database` | Database schema design prompt | markdown | easy | ✅ |
| `prompt-api-design` | REST API design prompt | markdown | easy | ✅ |
| `prompt-ui-component` | UI component design prompt | markdown | easy | ✅ |

### Debugging & DevOps

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `prompt-debug` | Debugging strategy prompt | markdown | easy | ✅ |
| `prompt-debug-log` | Log analysis prompt | markdown | easy | ✅ |
| `prompt-security` | Security audit prompt | markdown | med | ✅ |
| `prompt-deploy` | Deployment checklist prompt | markdown | easy | ✅ |

---

## Phase 18 — Developer Skills → **Merged into Phase 26 (Plugins)**

> Todos los items de skills, MCP servers y plugins se unificaron en Phase 26 bajo la categoría `plugins`.

---

## Phase 19 — Architectures ✅ DONE (2026-03-28)

Patrones arquitectónicos, estructuras de proyecto y diagramas. Cada recurso incluye: estructura de carpetas, archivos clave, diagrama visual y links a fuentes oficiales.

> **Formato:** frontmatter con `category: architectures`, `type: architecture`. Snippet HTML con diagrama visual de la arquitectura + estructura de carpetas interactiva.

### Implementación

**Estructura de cada recurso:**
```
packages/content/resources/<slug>/
├── index.mdx          # frontmatter + descripción detallada
└── snippets/
    └── html.html      # Diagrama visual + tree de carpetas + archivos clave
```

### Frontend Architectures

| Slug | Description | Tech | Difficulty | Official Docs | Reference Repos | Status |
|---|---|---|---|---|---|---|
| `arch-nextjs-app` | Next.js App Router structure | nextjs | med | [nextjs.org/docs/app/getting-started/project-structure](https://nextjs.org/docs/app/getting-started/project-structure) | [nhanluongoe/nextjs-boilerplate](https://github.com/nhanluongoe/nextjs-boilerplate), [hiroppy/nextjs-app-router-training](https://github.com/hiroppy/nextjs-app-router-training) | ✅ |
| `arch-react-vite` | React + Vite structure | react, vite | easy | [vite.dev/guide/](https://vite.dev/guide/) | [vitejs/vite template-react-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts), [RicardoValdovinos/vite-react-boilerplate](https://github.com/RicardoValdovinos/vite-react-boilerplate) | ✅ |
| `arch-astro` | Astro project structure | astro | easy | [docs.astro.build/en/basics/project-structure/](https://docs.astro.build/en/basics/project-structure/) | [withastro/astro/examples](https://github.com/withastro/astro/tree/main/examples), [withastro/docs](https://github.com/withastro/docs) | ✅ |
| `arch-micro-frontend` | Micro-frontend (Module Federation) | webpack | hard | [module-federation.io](https://module-federation.io/), [webpack.js.org/concepts/module-federation/](https://webpack.js.org/concepts/module-federation/) | [module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples) | ✅ |

### Backend Architectures

| Slug | Description | Tech | Difficulty | Official Docs | Reference Repos | Status |
|---|---|---|---|---|---|---|
| `arch-rest-api` | REST API — Clean Architecture | nodejs | med | [mannhowie.com/clean-architecture-node](https://mannhowie.com/clean-architecture-node) | [panagiop/node.js-clean-architecture](https://github.com/panagiop/node.js-clean-architecture), [jbuget/nodejs-clean-architecture-app](https://github.com/jbuget/nodejs-clean-architecture-app) | ✅ |
| `arch-graphql` | GraphQL schema structure | graphql | med | [graphql.org/learn/schema/](https://graphql.org/learn/schema/), [apollographql.com/docs/apollo-server/schema](https://www.apollographql.com/docs/apollo-server/schema/schema) | [apollographql/apollo-server](https://github.com/apollographql/apollo-server), [betaflag/graphql-server-scaffolding](https://github.com/betaflag/graphql-server-scaffolding) | ✅ |
| `arch-t3-stack` | T3 Stack (Next.js + tRPC + Prisma) | nextjs, trpc | hard | [create.t3.gg/en/folder-structure-app](https://create.t3.gg/en/folder-structure-app) | [t3-oss/create-t3-app](https://github.com/t3-oss/create-t3-app) (28.7k⭐), [t3-oss/create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) | ✅ |

### Monorepo & Scale

| Slug | Description | Tech | Difficulty | Official Docs | Reference Repos | Status |
|---|---|---|---|---|---|---|
| `arch-monorepo-turborepo` | Turborepo monorepo | turborepo | hard | [turborepo.dev/docs](https://turborepo.dev/docs) | [vercel/turborepo examples/](https://github.com/vercel/turborepo), [Vercel Monorepo Template](https://vercel.com/templates/next.js/monorepo-turborepo) | ✅ |
| `arch-monorepo-nx` | Nx monorepo | nx | hard | [nx.dev/docs/concepts/decisions/folder-structure](https://nx.dev/docs/concepts/decisions/folder-structure) | [nrwl/nx](https://github.com/nrwl/nx), [nrwl/nx-examples](https://github.com/nrwl/nx-examples) | ✅ |
| `arch-cicd` | CI/CD pipeline (GitHub Actions) | github-actions | med | [docs.github.com/en/actions](https://docs.github.com/en/actions), [reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows) | [actions/reusable-workflows](https://github.com/actions/reusable-workflows) | ✅ |

### Database & Data

| Slug | Description | Tech | Difficulty | Official Docs | Reference Repos | Status |
|---|---|---|---|---|---|---|
| `arch-postgres-schema` | PostgreSQL schema patterns | sql | med | [postgresql.org/docs/current/ddl-schemas.html](https://www.postgresql.org/docs/current/ddl-schemas.html), [orm.drizzle.team/docs](https://orm.drizzle.team/docs/sql-schema-declaration) | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm), [prisma/database-schema-examples](https://github.com/prisma/database-schema-examples) | ✅ |
| `arch-prisma` | Prisma schema structure | prisma | easy | [prisma.io/docs/orm/prisma-schema/overview](https://www.prisma.io/docs/orm/prisma-schema/overview) | [prisma/prisma-examples](https://github.com/prisma/prisma-examples), [prisma/prisma-client-extensions](https://github.com/prisma/prisma-client-extensions) | ✅ |
| `arch-event-sourcing` | Event sourcing + CQRS | typescript | hard | [learn.microsoft.com/azure/architecture/patterns/event-sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [microservices.io/patterns/data/event-sourcing](https://microservices.io/patterns/data/event-sourcing.html) | [oskardudycz/EventSourcing.NodeJS](https://github.com/oskardudycz/EventSourcing.NodeJS), [eugene-khyst/postgresql-event-sourcing](https://github.com/eugene-khyst/postgresql-event-sourcing) | ✅ |

---

## Phase 20 — Boilerplates ✅ DONE (2026-03-28)

Plantillas starter para distintos stacks y casos de uso. Cada recurso documenta: CLI oficial, estructura de archivos generada, archivos clave y repos de referencia.

> **Formato:** frontmatter con `category: boilerplates`, `type: boilerplate`. Snippet HTML con comandos de instalación, tree de archivos y links.

### Implementación

**Estructura de cada recurso:**
```
packages/content/resources/<slug>/
├── index.mdx          # frontmatter + descripción + CLI command
└── snippets/
    └── html.html      # Estructura generada + archivos clave explicados
```

### Frontend Starters

| Slug | Description | CLI Command | Official Docs | Community Repo (⭐) | Status |
|---|---|---|---|---|---|
| `boiler-react-ts` | React + TypeScript + Vite | `npm create vite@latest -- --template react-ts` | [vite.dev/guide/](https://vite.dev/guide/) | [RicardoValdovinos/vite-react-boilerplate](https://github.com/RicardoValdovinos/vite-react-boilerplate) (1k⭐) | ✅ |
| `boiler-next-ts` | Next.js + TypeScript | `npx create-next-app@latest --ts` | [nextjs.org/docs/app/getting-started/installation](https://nextjs.org/docs/app/getting-started/installation) | [ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate) (12.8k⭐) | ✅ |
| `boiler-astro` | Astro + Tailwind | `npm create astro@latest` + `npx astro add tailwind` | [docs.astro.build](https://docs.astro.build/), [tailwindcss.com/docs/.../astro](https://tailwindcss.com/docs/installation/framework-guides/astro) | [arthelokyo/astrowind](https://github.com/arthelokyo/astrowind) (5.5k⭐) | ✅ |
| `boiler-vue` | Vue 3 + Vite | `npm create vue@latest` | [vuejs.org/guide/quick-start](https://vuejs.org/guide/quick-start), [github.com/vuejs/create-vue](https://github.com/vuejs/create-vue) | [antfu-collective/vitesse](https://github.com/antfu-collective/vitesse) (9.4k⭐) | ✅ |

### Full-stack Starters

| Slug | Description | CLI Command | Official Docs | Community Repo (⭐) | Status |
|---|---|---|---|---|---|
| `boiler-next-db` | Next.js + Prisma + PostgreSQL | Vercel template deploy | [prisma.io/docs/guides/frameworks/nextjs](https://www.prisma.io/docs/guides/frameworks/nextjs), [vercel.com/templates/.../postgres-prisma](https://vercel.com/templates/next.js/postgres-prisma) | [nemanjam/nextjs-prisma-boilerplate](https://github.com/nemanjam/nextjs-prisma-boilerplate) (711⭐) | ✅ |
| `boiler-t3` | T3 Stack (Next.js, tRPC, Prisma) | `npm create t3-app@latest` | [create.t3.gg](https://create.t3.gg/) | [t3-oss/create-t3-app](https://github.com/t3-oss/create-t3-app) (28.7k⭐) | ✅ |
| `boiler-bun` | Bun + Hono API | `bun create hono@latest -- --template bun` | [hono.dev/docs/getting-started/bun](https://hono.dev/docs/getting-started/bun), [bun.com/docs/quickstart](https://bun.com/docs/quickstart) | [w3cj/hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter) (981⭐) | ✅ |

### Admin & Dashboard

| Slug | Description | CLI Command | Official Docs | Community Repo (⭐) | Status |
|---|---|---|---|---|---|
| `boiler-admin-react` | React Admin Dashboard | `npm create react-admin@latest` | [marmelab.com/react-admin/](https://marmelab.com/react-admin/), [refine.dev](https://refine.dev/) (34k⭐) | [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) (11.6k⭐) | ✅ |
| `boiler-admin-next` | Next.js Admin Dashboard | Vercel template deploy | [vercel.com/templates/.../admin-dashboard](https://vercel.com/templates/next.js/admin-dashboard) | [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) (6.2k⭐) | ✅ |

### Mobile & PWA

| Slug | Description | CLI Command | Official Docs | Community Repo (⭐) | Status |
|---|---|---|---|---|---|
| `boiler-pwa` | PWA starter (Vite + Workbox) | `npm i -D vite-plugin-pwa` | [vite-pwa-org.netlify.app/guide/](https://vite-pwa-org.netlify.app/guide/), [developer.chrome.com/docs/workbox](https://developer.chrome.com/docs/workbox) | [pwa-builder/pwa-starter](https://github.com/pwa-builder/pwa-starter) (1.3k⭐), [vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) (4.1k⭐) | ✅ |
| `boiler-twa` | TWA (Trusted Web Activity) | `bubblewrap init --manifest <url>` | [developer.android.com/.../guide-trusted-web-activities](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2), [GoogleChromeLabs/bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (2.9k⭐) | [GoogleChromeLabs/svgomg-twa](https://github.com/GoogleChromeLabs/svgomg-twa) | ✅ |

---

## Phase 22 — Design Style Collections ✅ DONE

Una colección de componentes (cards, buttons, forms, etc.) implementados en distintos estilos de diseño — cada entrada muestra el mismo patrón visual reinterpretado en una estética diferente.

> **Concept:** Each slug is a self-contained style showcase — a UI "card" or mini-component set fully dressed in that aesthetic. Good for inspiration, learning, and copy-paste.

### Classic & Established Styles

| Slug | Title | Style | Difficulty | Status |
|---|---|---|---|---|
| `style-minimalist` | Minimalist UI | Whitespace, neutral palette, thin type | easy | ✅ |
| `style-flat-design` | Flat Design | No shadows, solid colors, icon-driven | easy | ✅ |
| `style-material` | Material Design | Elevation, ripple, MD color system | med | ✅ |
| `style-skeuomorphism` | Skeuomorphism | Textures, real-world metaphors, depth | med | ✅ |
| `style-neumorphism` | Neumorphism | Soft extruded shadows, monochromatic | med | ✅ |
| `style-glassmorphism` | Glassmorphism | Frosted glass, blur backdrop, transparency | easy | ✅ |
| `style-bauhaus` | Bauhaus | Primary colors, geometry, grid, typography | med | ✅ |
| `style-brutalism` | Brutalism | Raw borders, high contrast, broken grids | med | ✅ |

### Dark & Atmospheric

| Slug | Title | Style | Difficulty | Status |
|---|---|---|---|---|
| `style-dark-mode` | Dark Mode | Pure dark bg, subtle borders, muted accents | easy | ✅ |
| `style-dark-blue` | Dark Blue | Navy/midnight palette, cool tones | easy | ✅ |
| `style-netflix` | Netflix Cinematic | Dark, large imagery, bold red CTAs | med | ✅ |
| `style-purple-space` | Purple Space | Deep space BG, neon purple/violet accents | med | ✅ |

### Retro & Nostalgic

| Slug | Title | Style | Difficulty | Status |
|---|---|---|---|---|
| `style-nes-retro` | NES Retro / Pixel | Pixel fonts, 8-bit palette, scanlines | hard | ✅ |
| `style-vaporwave` | Vaporwave | Pink/cyan gradients, 80s grid, glitch | med | ✅ |
| `style-terminal` | Terminal / CLI | Monospace, green-on-black, ASCII art | easy | ✅ |
| `style-newspaper` | Newspaper / Editorial | Serif fonts, columns, ink texture | med | ✅ |

### Modern & Trendy

| Slug | Title | Style | Difficulty | Status |
|---|---|---|---|---|
| `style-isomorphic` | Isometric 3D | Isometric grid, flat 3D perspective | hard | ✅ |
| `style-motion` | Motion / Kinetic | Animation-first, transition-heavy | hard | ✅ |
| `style-illustration` | Illustration-First | Custom SVG illus, hand-drawn feel | hard | ✅ |
| `style-miro` | Miro / Whiteboard | Infinite canvas feel, sticky notes, markers | med | ✅ |
| `style-glassdark` | Glass Dark | Dark glassmorphism — frosted on dark BG | easy | ✅ |
| `style-clay` | Claymorphism | 3D puffy shapes, inflated feel, pastel | med | ✅ |
| `style-aurora` | Aurora / Gradient Mesh | Smooth color mesh, aurora borealis BG | med | ✅ |

---

## Phase 21 — Remotion Animations ✅ DONE

Composiciones de animación con Remotion para videos generativos.

### Video Generators

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `remotion-intro` | YouTube intro animation | remotion | med | ✅ |
| `remotion-outro` | YouTube outro animation | remotion | med | ✅ |
| `remotion-lower-third` | Lower third name bug | remotion | easy | ✅ |
| `remotion-logo-reveal` | Logo reveal animation | remotion | med | ✅ |

### Social Media

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `remotion-instagram` | Instagram story template | remotion | med | ✅ |
| `remotion-tiktok` | TikTok video template | remotion | med | ✅ |
| `remotion-linkedin` | LinkedIn post video | remotion | easy | ✅ |

### Content & Marketing

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `remotion-cta` | Call-to-action animation | remotion | easy | ✅ |
| `remotion-testimonial` | Testimonial video | remotion | med | ✅ |
| `remotion-sumbnail` | Video thumbnail generator | remotion | med | ✅ |

### Data Visualization

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `remotion-chart` | Animated chart video | remotion | hard | ✅ |
| `remotion-counter` | Animated number video | remotion | easy | ✅ |
| `remotion-timeline` | Animated timeline video | remotion | med | ✅ |

---

## Phase 23 — React Native / Expo ✅ DONE (2026-03-06)

Componentes nativos para React Native y Expo, más variantes RN de recursos existentes.

> **Snippet format:** `snippets/react-native.tsx` (plain RN) and `snippets/expo.tsx` (Expo-specific APIs). Uses existing `components` category with `react-native` / `expo` targets.

### Navigation & Shell

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `rn-stack-navigator` | Stack navigation with transitions | react-native, expo-router | med | ✅ |
| `rn-bottom-tabs` | Bottom tab navigator with icons | react-native, expo-router | easy | ✅ |
| `rn-drawer-nav` | Drawer navigation sidebar | react-native, expo-router | med | ✅ |
| `rn-top-tabs` | Swipeable top tab bar | react-native | med | ✅ |
| `rn-header-animated` | Collapsible/animated header on scroll | react-native, reanimated | hard | ✅ |

### Core Components

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `rn-button-variants` | Button styles (solid, outline, ghost, icon) | react-native | easy | ✅ |
| `rn-text-input` | Styled text input with validation | react-native | easy | ✅ |
| `rn-modal-sheet` | Bottom sheet modal (gesture dismiss) | react-native, reanimated | med | ✅ |
| `rn-toast` | Toast notification system | react-native, reanimated | med | ✅ |
| `rn-action-sheet` | Native-feel action sheet | react-native | easy | ✅ |
| `rn-card` | Card component with variants | react-native | easy | ✅ |
| `rn-avatar` | Avatar with fallback initials | react-native | easy | ✅ |
| `rn-badge` | Badge / chip component | react-native | easy | ✅ |
| `rn-accordion` | Animated accordion / collapsible | react-native, reanimated | med | ✅ |
| `rn-skeleton` | Skeleton loading placeholder | react-native, reanimated | easy | ✅ |

### Lists & Data

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `rn-flatlist-pull-refresh` | FlatList with pull-to-refresh | react-native | easy | ✅ |
| `rn-section-list` | Grouped section list with sticky headers | react-native | med | ✅ |
| `rn-swipe-actions` | Swipeable list item (delete, archive) | react-native, reanimated, gesture-handler | med | ✅ |
| `rn-infinite-scroll` | Infinite scroll with loading indicator | react-native | med | ✅ |
| `rn-search-filter` | Search bar with filtered list | react-native | med | ✅ |
| `rn-drag-reorder` | Drag-to-reorder list | react-native, reanimated, gesture-handler | hard | ✅ |

### Gestures & Animation

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `rn-gesture-swipe-card` | Tinder-style swipe cards | react-native, reanimated, gesture-handler | hard | ✅ |
| `rn-pinch-zoom` | Pinch-to-zoom image viewer | react-native, gesture-handler | hard | ✅ |
| `rn-shared-transition` | Shared element transition | react-native, reanimated | hard | ✅ |
| `rn-spring-animation` | Spring physics animations | react-native, reanimated | med | ✅ |
| `rn-parallax-scroll` | Parallax scroll effect | react-native, reanimated | med | ✅ |
| `rn-lottie-player` | Lottie animation player | react-native, lottie-react-native | easy | ✅ |

### Expo-specific

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `expo-camera` | Camera with photo capture | expo, expo-camera | med | ✅ |
| `expo-image-picker` | Image picker with preview | expo, expo-image-picker | easy | ✅ |
| `expo-notifications` | Push notification setup | expo, expo-notifications | med | ✅ |
| `expo-haptics` | Haptic feedback patterns | expo, expo-haptics | easy | ✅ |
| `expo-auth-biometric` | Biometric authentication | expo, expo-local-authentication | med | ✅ |
| `expo-file-system` | File download/upload with progress | expo, expo-file-system | med | ✅ |
| `expo-maps` | Map view with markers | expo, react-native-maps | hard | ✅ |
| `expo-barcode` | Barcode / QR scanner | expo, expo-camera | med | ✅ |

### RN Variants of Existing Resources

Existing library components re-implemented as React Native snippets (`react-native.tsx`).

| Existing Slug | RN Variant | Difficulty | Status |
|---|---|---|---|
| `toggle-switch` | iOS-style toggle (RN) | easy | ✅ |
| `toast-system` | Toast stack (RN) | med | ✅ |
| `skeleton-loader` | Skeleton loader (RN) | easy | ✅ |
| `modal-dialog` | Modal dialog (RN) | easy | ✅ |
| `bottom-sheet` | Bottom sheet (RN) | med | ✅ |
| `swipe-action` | Swipe actions (RN) | med | ✅ |
| `pull-to-refresh` | Pull to refresh (RN) | easy | ✅ |
| `carousel` | Gesture carousel (RN) | hard | ✅ |
| `accordion-spring` | Spring accordion (RN) | med | ✅ |
| `progress-bar` | Progress bar (RN) | easy | ✅ |
| `dropdown-menu` | Dropdown menu (RN) | med | ✅ |
| `otp-input` | OTP input (RN) | med | ✅ |
| `chat-interface` | AI chat UI (RN) | med | ✅ |
| `like-button` | Animated like button (RN) | easy | ✅ |
| `countdown-timer` | Countdown timer (RN) | easy | ✅ |

---

## Phase 24 — Full Page Templates (Extended) ✅ DONE (2026-03-20)

Páginas completas que aprovechan los 225+ componentes existentes. Cada página combina múltiples componentes en un layout cohesivo y funcional.

> **Concept:** Phase 12 cubrió páginas básicas (404, pricing, checkout, blog post). Esta fase agrega las páginas que faltan para cubrir los flujos más comunes de cualquier aplicación web.

### Dashboard & Admin

| Slug | Description | Componentes que usa | Difficulty | Status |
|---|---|---|---|---|
| `dashboard-page` | Admin dashboard con métricas, gráficos y tabla | `chart-line`, `chart-bar`, `chart-pie`, `kpi-card`, `stat-card`, `data-table`, `sparkline` | hard | ✅ |
| `analytics-page` | Analytics dashboard con date range y reportes | `chart-area`, `chart-funnel`, `chart-heatmap`, `date-range-picker`, `metric-comparison`, `data-table` | hard | ✅ |
| `settings-page` | Settings / profile page con tabs y formularios | `settings-panel`, `user-profile-card`, `avatar-group`, `toggle-group`, `tabs-vertical`, `input-variants` | med | ✅ |

### Content & Blog

| Slug | Description | Componentes que usa | Difficulty | Status |
|---|---|---|---|---|
| `blog-listing-page` | Blog index / archive con grid de posts | `pagination`, `search-autocomplete`, `badge`, `masonry-grid`, `empty-state` | med | ✅ |
| `changelog-page` | Changelog / release notes con timeline | `timeline`, `badge`, `code-block`, `diff-viewer`, `anchor-nav` | med | ✅ |
| `faq-page` | FAQ / Help center con buscador | `accordion-spring`, `search-autocomplete`, `breadcrumb-nav`, `empty-state`, `chat-widget` | easy | ✅ |

### Team & Social

| Slug | Description | Componentes que usa | Difficulty | Status |
|---|---|---|---|---|
| `team-page` | Team / people page con perfiles y roles | `user-profile-card`, `avatar-group`, `badge`, `social-feed`, `masonry-grid` | easy | ✅ |
| `notifications-page` | Centro de notificaciones full page | `notification-center`, `comment-thread`, `timeline`, `avatar-group`, `tabs-vertical`, `empty-state` | med | ✅ |

### Search & Discovery

| Slug | Description | Componentes que usa | Difficulty | Status |
|---|---|---|---|---|
| `search-results-page` | Página de resultados de búsqueda | `search-autocomplete`, `advanced-filters`, `data-list`, `pagination`, `badge`, `empty-state` | med | ✅ |
| `shop-category-page` | E-commerce category / shop listing | `product-card`, `advanced-filters`, `pagination`, `breadcrumb-nav`, `range-slider`, `image-gallery-grid` | hard | ✅ |
| `wishlist-page` | Wishlist / saved items | `product-card`, `like-button`, `shopping-cart`, `badge`, `pagination`, `empty-state` | easy | ✅ |

### Utility & Functional

| Slug | Description | Componentes que usa | Difficulty | Status |
|---|---|---|---|---|
| `invoice-page` | Invoice history con lista y detalle | `print-invoice`, `data-table`, `badge`, `alert-banner`, `pagination`, `modal-dialog` | med | ✅ |
| `status-page` | System / API status page | `api-status-board`, `status-indicator`, `timeline`, `badge`, `chart-line`, `alert-banner` | med | ✅ |
| `file-manager-page` | File browser / document manager | `file-tree`, `data-table`, `breadcrumb-nav`, `drag-to-reorder`, `upload-progress`, `modal-dialog`, `document-preview` | hard | ✅ |
| `onboarding-page` | Multi-step onboarding / welcome flow | `mobile-stepper`, `multi-step-form`, `progress-bar`, `steps-progress`, `alert-banner` | med | ✅ |

---

## Phase 25 — Accessibility, RTL & Inclusive Web

Fase dedicada a accesibilidad profunda, soporte RTL, contraste WCAG, lectores de pantalla, navegación por teclado y diseño inclusivo. Complementa los 6 componentes básicos de Phase 16 (Accessibility & Inclusive Design).

> **Referencia:** WCAG 2.1/2.2, ARIA Authoring Practices Guide (APG), CSS Logical Properties.

### RTL (Right-to-Left) Support

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `rtl-layout` | Layout completo RTL con sidebar, nav y contenido | css (logical properties) | med | [ ] |
| `rtl-form` | Formulario RTL con validación y labels | css, vanilla-js | med | [ ] |
| `rtl-card-grid` | Grid de cards con flip automático LTR↔RTL | css (logical properties) | easy | [ ] |
| `rtl-navigation` | Navbar + breadcrumb con soporte bidireccional | css, vanilla-js | med | [ ] |
| `rtl-data-table` | Tabla de datos con columnas RTL-aware | vanilla-js, css | med | [ ] |
| `rtl-text-mixed` | Manejo de texto bidi (árabe + inglés mezclado) | css, unicode-bidi | easy | [ ] |

### Color & Contrast (WCAG)

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `color-contrast-checker` | Herramienta que verifica ratio WCAG AA/AAA en tiempo real | vanilla-js, css | med | [ ] |
| `palette-accessible` | Generador de paletas que cumple WCAG 2.1 contrast ratios | vanilla-js | med | [ ] |
| `theme-high-contrast` | Theme system con modo alto contraste (Windows HC compatible) | css (forced-colors, prefers-contrast) | med | [ ] |
| `theme-color-blind` | Modos para protanopia, deuteranopia, tritanopia | css custom properties, vanilla-js | hard | [ ] |
| `dark-light-accessible` | Dark/light toggle que mantiene ratio AA en ambos modos | css, vanilla-js | med | [ ] |
| `color-token-system` | Sistema de design tokens con contraste garantizado | css custom properties | med | [ ] |

### Screen Readers & Semantic HTML

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `aria-live-regions` | Patrones de live regions (polite, assertive, status) | vanilla-js, aria | easy | [ ] |
| `aria-tabs-pattern` | Tabs con ARIA roles completos (tablist, tab, tabpanel) | vanilla-js, aria | med | [ ] |
| `aria-modal-pattern` | Modal con focus trap, escape, y anuncio a screen reader | vanilla-js, aria | med | [ ] |
| `aria-combobox` | Combobox/autocomplete accesible (ARIA 1.2 pattern) | vanilla-js, aria | hard | [ ] |
| `aria-tree-view` | Tree view con navegación por teclado y ARIA | vanilla-js, aria | hard | [ ] |
| `aria-carousel` | Carousel accesible con controles, pausa, y anuncio | vanilla-js, aria | med | [ ] |
| `semantic-landmarks` | Demo de landmarks semánticos (main, nav, aside, etc.) | html, css | easy | [ ] |
| `sr-only-utilities` | Clases .sr-only y patrones de texto solo para lectores | css | easy | [ ] |

### Keyboard Navigation

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `keyboard-nav-menu` | Menú navegable 100% por teclado (arrows, home, end) | vanilla-js | med | [ ] |
| `keyboard-roving-tabindex` | Roving tabindex pattern para listas y toolbars | vanilla-js | med | [ ] |
| `keyboard-shortcuts-overlay` | Overlay de atajos de teclado (estilo GitHub `?`) | vanilla-js, css | easy | [ ] |
| `focus-management` | Focus management en SPAs (route changes, dynamic content) | vanilla-js | med | [ ] |

### Inclusive Design Patterns

| Slug | Description | Tech | Difficulty | Status |
|---|---|---|---|---|
| `dyslexia-friendly` | Modo dyslexia (OpenDyslexic font, spacing, line height) | css, vanilla-js | easy | [ ] |
| `reading-guide` | Línea guía de lectura que sigue el cursor/scroll | vanilla-js, css | easy | [ ] |
| `text-spacing-control` | Control de letter-spacing, word-spacing, line-height | vanilla-js, css | easy | [ ] |
| `media-captions` | Video player con captions/subtítulos accesibles | vanilla-js, html5 | med | [ ] |
| `cognitive-load-reducer` | Modo simplificado que reduce animaciones, colores, elementos | vanilla-js, css | med | [ ] |
| `touch-target-demo` | Demo de touch targets mínimos 44x44px (WCAG 2.5.5) | css | easy | [ ] |

---

## Phase 26 — Plugins (AI Coding Tools)

Nueva categoría `plugins` — directorios, marketplaces y colecciones curadas de plugins, extensiones y MCP servers para herramientas de código con IA (Claude Code, OpenCode, Cursor, Copilot, etc.).

> **Nota:** Esta categoría NO es para plugins individuales (eso va en `mcp-servers` o `skills`), sino para **directorios y marketplaces** donde descubrir e instalar plugins.

### Implementación

**1. Schema** ✅
- `packages/schema/src/schema.ts` — `"plugins"` agregado a `ResourceCategorySchema`
- `packages/schema/src/types.ts` — `"plugins"` agregado a `ResourceCategoryPhase2`
- `apps/www/src/content/config.ts` — `"plugins"` agregado al enum

**2. Tipo de recurso:** `type: "component"` (es un directorio/herramienta, no un plugin individual)

**3. Estructura de cada recurso:**
```
packages/content/resources/<slug>/
├── index.mdx          # frontmatter + descripción del marketplace/directorio
└── snippets/
    └── html.html      # card informativa con: qué es, cómo instalar, stats, link
```

**4. Frontmatter modelo:**
```yaml
slug: plugin-smithery
title: "Smithery.ai — MCP Server Marketplace"
description: "Largest open marketplace of MCP servers. Discover, install, host, and manage MCP servers with one-click install."
category: plugins
type: component
tags: [mcp, marketplace, claude-code, cursor, plugins]
tech: [markdown]
difficulty: easy
targets: [html]
author:
  name: "Smithery"
  src: "https://smithery.ai/"
createdAt: "2026-03-28"
updatedAt: "2026-03-28"
```

**5. Snippet HTML modelo** — Card informativa con:
- Logo/nombre del directorio
- Descripción corta
- Cómo instalar/acceder (CLI commands, URLs)
- Stats (cantidad de plugins, estrellas GitHub)
- Links a fuente original
- Tags de herramientas compatibles (Claude Code, Cursor, etc.)

**6. Hero/www** ✅
- Categoría unificada — absorbe `skills` y `mcp-servers` (eliminados como categorías separadas)
- i18n en 15 idiomas

**7. Prioridad de implementación:**
- Batch 1: Directorios principales (Smithery, mcp.so, PulseMCP, Glama, Official MCP Registry)
- Batch 2: Claude Code community (awesome-claude-code, awesome-slash, claude-skills)
- Batch 3: Otros tools (Cursor, OpenCode, Copilot, Cline)
- Batch 4: Restantes (Devin, Kiro, Composio)

### Developer Skills (ex Phase 18)

| Slug | Title | Tech | Difficulty | Status |
|---|---|---|---|---|
| `skill-git-rebase` | Git rebase interactivo | bash | med | [ ] |
| `skill-git-cherry-pick` | Git cherry-pick | bash | easy | [ ] |
| `skill-git-bisect` | Git bisect (find bug) | bash | med | [ ] |
| `skill-git-worktree` | Git worktree (multi-branch) | bash | med | [ ] |
| `skill-git-stash` | Git stash patterns | bash | easy | [ ] |
| `skill-git-hooks` | Git hooks setup | bash | easy | [ ] |
| `skill-vim-basics` | Vim basics (navigation, edit) | vim | easy | [ ] |
| `skill-vim-advanced` | Vim macros & registers | vim | med | [ ] |
| `skill-tmux` | Tmux workflow (sessions, panes) | tmux | med | [ ] |
| `skill-fzf` | Fuzzy finder (fzf + rg) | bash | med | [ ] |
| `skill-aliases` | Useful shell aliases | bash | easy | [ ] |
| `skill-debug-console` | Browser console tricks | javascript | easy | [ ] |
| `skill-debug-network` | Network tab debugging | devtools | easy | [ ] |
| `skill-debug-react` | React DevTools debugging | react | med | [ ] |
| `skill-debug-performance` | Performance profiling | devtools | med | [ ] |
| `skill-review-pr` | PR review checklist | markdown | easy | [ ] |
| `skill-review-patterns` | Code review patterns | markdown | easy | [ ] |

### Existing Resources ✅

| Slug | Title | Type | Status |
|---|---|---|---|
| `git-commit-skill` | Git Commit Skill | skill | ✅ migrado a `plugins` |
| `stealthis-mcp-config` | StealThis MCP Server Config | mcp-server | ✅ migrado a `plugins` |

### Claude Code — Official

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-claude-official-plugins` | Claude Code Official Plugin Directory | [github.com/anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | [ ] |
| `plugin-claude-marketplace-docs` | Claude Code Plugin Marketplace Docs | [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) | [ ] |
| `plugin-claude-skills-docs` | Claude Code Skills (Slash Commands, Hooks, Agents) | [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) | [ ] |

### Claude Code — Community

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-awesome-claude-code` | awesome-claude-code — Skills, Hooks, Slash Commands | [github.com/hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | [ ] |
| `plugin-awesome-claude-plugins` | awesome-claude-code-plugins | [github.com/ccplugins/awesome-claude-code-plugins](https://github.com/ccplugins/awesome-claude-code-plugins) | [ ] |
| `plugin-awesome-slash` | awesome-slash — Plugins, Agents & Skills (Claude + OpenCode + Codex) | [github.com/avifenesh/awesome-slash](https://github.com/avifenesh/awesome-slash) | [ ] |
| `plugin-claude-skills-collection` | 192+ Claude Code Skills & Agent Plugins | [github.com/alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | [ ] |
| `plugin-claude-hooks-mastery` | Claude Code Hooks Mastery (Python) | [github.com/disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) | [ ] |
| `plugin-claude-marketplaces` | claudemarketplaces.com — Curated Directory | [claudemarketplaces.com](https://claudemarketplaces.com/) | [ ] |
| `plugin-claude-plugins-dev` | claude-plugins.dev — Agent Skills Directory | [claude-plugins.dev/skills](https://claude-plugins.dev/skills) | [ ] |

### OpenCode

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-opencode` | OpenCode — Open Source AI Coding Agent | [opencode.ai](https://opencode.ai/) | [ ] |
| `plugin-opencode-cafe` | opencode.cafe — Community Marketplace for OpenCode | [opencode.cafe](https://www.opencode.cafe/) | [ ] |
| `plugin-awesome-opencode` | awesome-opencode — Plugins, Themes, Agents | [github.com/awesome-opencode/awesome-opencode](https://github.com/awesome-opencode/awesome-opencode) | [ ] |

### Cursor

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-cursor-marketplace` | Cursor Official Plugin Marketplace | [cursor.com/marketplace](https://cursor.com/marketplace) | [ ] |
| `plugin-cursor-directory` | cursor.directory — Community Rules, MCP & Plugins | [cursor.directory](https://cursor.directory/) | [ ] |

### Windsurf

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-windsurf` | Windsurf Plugins | [windsurf.com/plugins](https://windsurf.com/plugins) | [ ] |

### Cline

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-cline-marketplace` | Cline MCP Marketplace — One-Click Install | [cline.bot/mcp-marketplace](https://cline.bot/mcp-marketplace) | [ ] |

### GitHub Copilot

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-copilot-extensions` | GitHub Copilot Extensions Marketplace | [github.com/marketplace?type=apps&copilot_app=true](https://github.com/marketplace?type=apps&copilot_app=true) | [ ] |
| `plugin-awesome-copilot` | Awesome GitHub Copilot — Plugins, Agents & Skills | [awesome-copilot.github.com/tools](https://awesome-copilot.github.com/tools/) | [ ] |

### Continue.dev

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-continue-dev` | Continue.dev — Open Source AI Assistant (VS Code + JetBrains) | [continue.dev](https://www.continue.dev/) | [ ] |

### MCP Directories (Model Context Protocol)

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-mcp-registry` | Official MCP Registry | [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/) | [ ] |
| `plugin-smithery` | Smithery.ai — Largest MCP Server Marketplace (2,880+) | [smithery.ai](https://smithery.ai/) | [ ] |
| `plugin-glama-mcp` | Glama.ai — MCP Server Registry with Security Scanning | [glama.ai/mcp/servers](https://glama.ai/mcp/servers) | [ ] |
| `plugin-pulsemcp` | PulseMCP — Daily-Updated Directory (12,870+ servers) | [pulsemcp.com/servers](https://www.pulsemcp.com/servers) | [ ] |
| `plugin-mcp-so` | mcp.so — Community Directory (19,000+ servers) | [mcp.so](https://mcp.so/) | [ ] |
| `plugin-mcp-run` | mcp.run — Portable & Secure MCP Server Hosting | [mcp.run](https://www.mcp.run/) | [ ] |
| `plugin-mcpmarket` | MCPMarket — MCP Servers & Clients Directory | [mcpmarket.com](https://mcpmarket.com/) | [ ] |
| `plugin-lobehub-mcp` | LobeHub MCP — Categorized Server Marketplace | [lobehub.com/mcp](https://lobehub.com/mcp) | [ ] |
| `plugin-awesome-mcp-servers` | awesome-mcp-servers (wong2) — Curated List | [github.com/wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers) | [ ] |
| `plugin-awesome-remote-mcp` | awesome-remote-mcp-servers — Remote/Cloud MCP Servers | [github.com/jaw9c/awesome-remote-mcp-servers](https://github.com/jaw9c/awesome-remote-mcp-servers) | [ ] |

### Other AI Coding Tools

| Slug | Title | Source | Status |
|---|---|---|---|
| `plugin-devin-mcp` | Devin MCP Marketplace | [app.devin.ai/settings/mcp-marketplace](https://app.devin.ai/settings/mcp-marketplace) | [ ] |
| `plugin-kiro` | Kiro IDE (AWS) — Agentic IDE with "Kiro Powers" | [kiro.dev](https://kiro.dev/) | [ ] |
| `plugin-composio` | Composio — 1000+ Toolkits for AI Agents | [composio.dev](https://composio.dev/) | [ ] |

---

## Phase 27 — Restaurant Theme (Vanilla HTML, CSS and JS) ✅ DONE (2026-05-22) · 41/41

> A coherent set of restaurant-themed resources covering both **staff/operations** (POS, KDS, floor plan, admin) and **customer-facing** (carta, ordering, reservations, kiosk). All built in vanilla `html/css/js` — no framework. Each resource ships with `snippets/html.html` + `style.css` + `script.js` and is runnable in Lab.
>
> Naming convention: `rest-<area>-<slug>`.
> Shared design language: warm palette (cream, terracotta, forest green), serif headings (Playfair Display) + clean sans body (Inter), high contrast for POS, generous touch targets on kiosk/tableside.
> Category mapping:
> - Full-screen apps & marketing pages → `pages` (with `labRoute`).
> - Standalone widgets/components → `ui-components`.
>
> The existing `lgc-44-restaurant-fine-dining` (marketing page) and `booking-reservations` (DB schema) are complementary and not duplicated here.

### 27.A — POS / Staff Operations

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `rest-pos-order-entry` | POS Order Entry (menu grid + ticket panel) | pages | hard | ✅ |
| 2 | `rest-pos-floor-plan` | Floor Plan / Table Map (status per table) | pages | hard | ✅ |
| 3 | `rest-pos-kitchen-display` | Kitchen Display System (KDS) — ticket stream | pages | hard | ✅ |
| 4 | `rest-pos-bar-display` | Bar Display — drink orders queue | pages | med | ✅ |
| 5 | `rest-pos-payment` | Payment Terminal (cash / card / split) | ui-components | med | ✅ |
| 6 | `rest-pos-receipt` | Printable Receipt / Ticket preview | ui-components | easy | ✅ |
| 7 | `rest-pos-quick-pad` | Quick Order Pad (categories + items grid) | ui-components | easy | ✅ |
| 8 | `rest-pos-tip-split` | Tip Calculator & Split Bill | ui-components | easy | ✅ |
| 9 | `rest-pos-shift-report` | End-of-Shift Sales Report | pages | med | ✅ |
| 10 | `rest-pos-modifier-sheet` | Item Modifier Sheet (extras, sizes, notes) | ui-components | med | ✅ |

### 27.B — Customer / Diner Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `rest-menu-carta` | Carta — full menu browse (categories + sections) | pages | med | ✅ |
| 12 | `rest-menu-item-detail` | Menu Item Detail (image, allergens, modifiers) | ui-components | easy | ✅ |
| 13 | `rest-menu-qr` | QR Mobile Menu (sticky cart) | pages | med | ✅ |
| 14 | `rest-cart-order` | Cart / Order Summary widget | ui-components | easy | ✅ |
| 15 | `rest-checkout` | Customer Checkout (tip, address, pay) | pages | med | ✅ |
| 16 | `rest-reservation-form` | Reservation Booking Form (date · guests · time) | ui-components | med | ✅ |
| 17 | `rest-order-tracking` | Order Status Tracker (sent → cooking → ready) | ui-components | easy | ✅ |
| 18 | `rest-loyalty-card` | Loyalty / Rewards Card | ui-components | easy | ✅ |
| 19 | `rest-reviews-feed` | Customer Reviews Feed + rating breakdown | ui-components | easy | ✅ |
| 20 | `rest-allergy-filter` | Allergy / Diet Filter (vegan, gluten-free, etc.) | ui-components | med | ✅ |

### 27.C — Restaurant Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 21 | `rest-page-landing` | Restaurant Landing (hero + reserve CTA) | pages | med | ✅ |
| 22 | `rest-page-about` | About / Our Story page (chef, history) | pages | easy | ✅ |
| 23 | `rest-page-menu` | Menu Page (printable carta layout) | pages | med | ✅ |
| 24 | `rest-page-location` | Location & Hours (map embed + contact) | pages | easy | ✅ |
| 25 | `rest-page-gallery` | Gallery / Chef's Specials | pages | easy | ✅ |
| 26 | `rest-page-events` | Private Events / Catering page | pages | easy | ✅ |

### 27.D — Kiosk · Tableside · Signage

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 27 | `rest-kiosk-self-order` | Self-Ordering Kiosk (large touch targets) | pages | hard | ✅ |
| 28 | `rest-tableside-tablet` | Tableside Tablet Ordering UI | pages | med | ✅ |
| 29 | `rest-digital-menu-board` | Digital Menu Board (TV signage) | pages | med | ✅ |
| 30 | `rest-waiter-call` | Call Waiter / Service Request panel | ui-components | easy | ✅ |
| 31 | `rest-wine-pairing` | Wine Pairing Recommender | ui-components | med | ✅ |

### 27.E — Manager / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 32 | `rest-admin-dashboard` | Sales & KPI Dashboard | pages | hard | ✅ |
| 33 | `rest-admin-inventory` | Inventory Tracker (low-stock alerts) | pages | med | ✅ |
| 34 | `rest-admin-menu-editor` | Menu CRUD Editor (categories + items) | pages | med | ✅ |
| 35 | `rest-admin-staff` | Staff & Shift Roster | pages | med | ✅ |
| 36 | `rest-admin-reservations` | Reservations Manager (calendar + list) | pages | med | ✅ |

### 27.F — Dinner-Type Landings (5 themed restaurant landings)

> Five full-page restaurant landings, each a distinct dinner concept with its own palette, type system, and hero mood. Independent from the generic `rest-page-landing` (21) so the set demonstrates visual range. All vanilla `html/css/js`, single-page, scrollable, with reservation CTA.

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 37 | `rest-landing-steakhouse` | Premium Steakhouse | Dark charcoal + leather + gold · serif display · bold meat photography, smoke textures | hard | ✅ |
| 38 | `rest-landing-sushi-omakase` | Sushi · Omakase | Off-white + ink black + vermillion accent · Noto Serif JP · zen minimalism, ink-wash dividers | med | ✅ |
| 39 | `rest-landing-italian-trattoria` | Italian Trattoria | Cream + tomato red + olive green · handwritten script + classic serif · rustic, checkered accents | med | ✅ |
| 40 | `rest-landing-mexican-cantina` | Mexican Cantina | Terracotta + cobalt + mustard · chunky display + warm body · festive, papel picado, agave motifs | med | ✅ |
| 41 | `rest-landing-farm-to-table` | Farm-to-Table / Vegan | Sage + bone + clay · modern serif + grotesque · earthy, organic textures, seasonal produce | med | ✅ |

Each landing ships with:
- Hero (concept-specific imagery placeholder + reservation CTA)
- Signature dishes section (3–6 items)
- Story / chef block (one paragraph + photo)
- Hours + location (map placeholder)
- Reservation form footer or sticky CTA

### Build order (proposed)

1. **Foundation pass** — items 11 (`rest-menu-carta`), 12 (`rest-menu-item-detail`), 14 (`rest-cart-order`), 7 (`rest-pos-quick-pad`). These establish the shared design tokens and reusable bits.
2. **POS core** — 1 (order entry), 3 (KDS), 2 (floor plan), 5 (payment), 6 (receipt).
3. **Customer flow** — 13 (QR menu), 15 (checkout), 16 (reservation), 17 (order tracking).
4. **Marketing pages** — 21 → 26.
5. **Dinner-type landings** — 37 → 41 (sections 27.F).
6. **Kiosk & signage** — 27, 28, 29.
7. **Admin** — 32 → 36.
8. **Polish** — 8 (tip split), 10 (modifier sheet), 18 (loyalty), 19 (reviews), 20 (allergy), 30 (waiter call), 31 (wine pairing), 9 (shift report).

### Decisions locked in (from planning round)

- **Prefix:** `rest-*` for every Phase 27 resource.
- **Interactivity:** mixed — POS interactive (running totals, ticket state), customer + marketing static-ish.
- **Theme tokens:** ops/customer surfaces share the warm palette block (cream/terracotta/forest/gold + Playfair + Inter); each of the 5 dinner-type landings (27.F) overrides with its own `:root`.
- **Language:** English on ops/customer; theme-appropriate language per dinner landing (Italian for trattoria, Spanish for cantina, some Japanese for sushi).
- **Schema:** added `"restaurant"` to `ResourceCollectionSchema` (`packages/schema/src/schema.ts`, `packages/schema/src/types.ts`, `apps/www/src/content/config.ts`).

---

## Vertical Theme Bundles (Phases 28–35) 🧭 PLAN

> Phase 27 (Restaurant) established a template for **vertical theme bundles**: a single industry covered end-to-end across staff/ops, customer-facing, marketing, kiosk/signage, admin, and themed landings — all in vanilla `html/css/js` so they run standalone in Lab.
>
> Phases 28–35 apply the same template to other high-fit verticals. Shared conventions across these phases:
> - Naming: `<prefix>-<area>-<slug>` (prefix per phase, see each section).
> - Categories: full-screen apps & marketing pages → `pages` (with `labRoute`); standalone widgets/components → `ui-components`.
> - Scope: interactive by default (running totals, timers, state changes via vanilla JS).
> - Theme tokens: ops/customer surfaces share a phase-wide palette block; each themed landing in `*.F` overrides with its own `:root`.
> - Copy: English by default on ops/customer; theme-appropriate language allowed per landing.
> - Each landing-set sub-section (`*.F`) ships 5 themed variants with distinct palette, type system, hero mood.
> - Schema: add the new collection slug to `ResourceCollectionSchema` (`packages/schema/src/schema.ts`, `types.ts`, `apps/www/src/content/config.ts`) before authoring resources.

---

## Phase 28 — Hotel / Hospitality Theme 🏨 PLAN

> Full hotel stack — front desk PMS, guest portal, booking flow, concierge, housekeeping, manager admin, plus themed landings (boutique, resort, hostel, business hotel, B&B).
>
> Naming convention: `hotel-<area>-<slug>`.
> Shared design language: deep navy + warm gold + cream · serif headings (Cormorant) + sans body (Inter) · generous whitespace · soft photography overlays.
> Collection: `hotel`.

### 28.A — Front Desk / PMS (Property Management System)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `hotel-pms-dashboard` | PMS Dashboard (arrivals · in-house · departures) | pages | hard | ✅ |
| 2 | `hotel-pms-room-rack` | Room Rack / Tape Chart (rooms × dates grid) | pages | hard | ✅ |
| 3 | `hotel-pms-checkin` | Check-in Flow (guest lookup → keys → folio) | pages | med | ✅ |
| 4 | `hotel-pms-checkout` | Check-out & Folio Settlement | pages | med | ✅ |
| 5 | `hotel-pms-reservation-edit` | Reservation Edit (dates · room · rate · guests) | ui-components | med | ✅ |
| 6 | `hotel-pms-walk-in` | Walk-in Booking Sheet | ui-components | easy | ✅ |
| 7 | `hotel-pms-night-audit` | Night Audit Report | pages | med | ✅ |
| 8 | `hotel-pms-folio` | Guest Folio / Itemized Bill | ui-components | easy | ✅ |

### 28.B — Guest / Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `hotel-booking-search` | Booking Search (dates · guests · rooms) | pages | med | ✅ |
| 10 | `hotel-room-results` | Room Results Grid (cards · filters · price) | pages | med | ✅ |
| 11 | `hotel-room-detail` | Room Detail (gallery · amenities · rate plans) | pages | med | ✅ |
| 12 | `hotel-booking-checkout` | Booking Checkout (guest info · pay · confirm) | pages | med | ✅ |
| 13 | `hotel-booking-confirmation` | Booking Confirmation Page | pages | easy | ✅ |
| 14 | `hotel-guest-portal` | Guest Portal (my stay · folio · requests) | pages | med | ✅ |
| 15 | `hotel-digital-key` | Digital Key Card (mobile) | ui-components | easy | ✅ |
| 16 | `hotel-in-room-tablet` | In-Room Tablet UI (services · TV · order) | pages | med | ✅ |
| 17 | `hotel-loyalty-card` | Loyalty Tier Card (points · status) | ui-components | easy | ✅ |

### 28.C — Concierge · Housekeeping · Ops

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 18 | `hotel-concierge-board` | Concierge Request Board | pages | med | ✅ |
| 19 | `hotel-housekeeping-grid` | Housekeeping Status Grid (clean/dirty/inspected) | pages | med | ✅ |
| 20 | `hotel-maintenance-tickets` | Maintenance Tickets Queue | ui-components | med | ✅ |
| 21 | `hotel-amenity-booking` | Spa / Gym / Restaurant Amenity Booking | ui-components | easy | ✅ |
| 22 | `hotel-shuttle-schedule` | Shuttle / Transfer Schedule | ui-components | easy | ✅ |

### 28.D — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 23 | `hotel-page-landing` | Hotel Landing (hero + book CTA) | pages | med | ✅ |
| 24 | `hotel-page-rooms` | Rooms / Suites Page | pages | med | ✅ |
| 25 | `hotel-page-amenities` | Amenities & Services Page | pages | easy | ✅ |
| 26 | `hotel-page-gallery` | Gallery / Virtual Tour | pages | easy | ✅ |
| 27 | `hotel-page-offers` | Special Offers & Packages | pages | easy | ✅ |
| 28 | `hotel-page-contact` | Contact & Location | pages | easy | ✅ |

### 28.E — Admin / Manager

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 29 | `hotel-admin-revenue` | Revenue / RevPAR Dashboard | pages | hard | ✅ |
| 30 | `hotel-admin-rate-mgmt` | Rate Management (per room · per date) | pages | hard | ✅ |
| 31 | `hotel-admin-channel-mgr` | Channel Manager (OTAs sync status) | pages | med | ✅ |
| 32 | `hotel-admin-inventory` | Inventory & Allotment | pages | med | ✅ |
| 33 | `hotel-admin-reports` | Reports & Forecasting | pages | med | ✅ |

### 28.F — Themed Hotel Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 34 | `hotel-landing-boutique` | Boutique City Hotel | Charcoal + brass + ivory · modern serif · curated, editorial | med | ✅ |
| 35 | `hotel-landing-resort` | Beach Resort | Teal + sand + coral · airy sans · panoramic, sun-soaked | med | ✅ |
| 36 | `hotel-landing-hostel` | Backpacker Hostel | Lime + slate + warm white · chunky display · playful, social | easy | ✅ |
| 37 | `hotel-landing-business` | Business / Conference Hotel | Navy + steel + white · clean grotesque · efficient, corporate | med | ✅ |
| 38 | `hotel-landing-bnb` | Bed & Breakfast / Inn | Cream + sage + terracotta · handwritten + serif · homey, rustic | med | ✅ |

### Build order (Phase 28)

1. **Foundation** — 9 (search), 10 (results), 11 (room detail), 12 (checkout).
2. **PMS core** — 1 (dashboard), 2 (room rack), 3 (check-in), 4 (check-out).
3. **Guest experience** — 13, 14, 15, 16, 17.
4. **Ops** — 18, 19, 20, 21, 22.
5. **Marketing** — 23 → 28.
6. **Landings** — 34 → 38.
7. **Admin** — 29 → 33.

---

## Phase 29 — Clinic / Healthcare Theme 🏥 ✅ DONE

> End-to-end clinic UI — patient portal, appointment booking, EHR-lite for clinicians, pharmacy, telemedicine, plus themed landings (general practice, dental, pediatric, mental health, specialist).
>
> Naming convention: `clinic-<area>-<slug>`.
> Shared design language: clinical white + calm teal + soft coral accent · sans-serif (Inter) · high readability · accessible contrast WCAG AA · empathetic copy.
> Collection: `clinic`.
> Note: All content is illustrative; **not** designed for actual medical use.

**Progress (2026-06-08):** ✅ **Complete — all 35 resources built.** Foundation batch (items 1–4, 9–12, 17–19) was hand-built; the remaining 24 (items 5–8, 13–16, 20–35) were generated via a 24-agent parallel workflow (see `PHASE-WORKFLOW.md`). The `clinic` collection is fully wired (`schema.ts` + Astro `config.ts` enums, `apps/www/src/lib/collections.ts` card, i18n EN+ES) and the MCP catalog is regenerated (798 resources, all frontmatter validated). Every resource has `index.mdx` + `snippets/{html,css,js}`.

### 29.A — Patient / Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `clinic-patient-portal` | Patient Portal Dashboard | pages | med | ✅ |
| 2 | `clinic-appointment-booking` | Appointment Booking (specialty · doctor · slot) | pages | med | ✅ |
| 3 | `clinic-appointment-list` | My Appointments (upcoming + past) | ui-components | easy | ✅ |
| 4 | `clinic-symptom-checker` | Symptom Checker Wizard | pages | med | ✅ |
| 5 | `clinic-prescription-list` | Prescriptions & Refills | ui-components | easy | ✅ |
| 6 | `clinic-lab-results` | Lab Results Viewer | ui-components | med | ✅ |
| 7 | `clinic-intake-form` | Patient Intake / Triage Form | pages | med | ✅ |
| 8 | `clinic-insurance-card` | Insurance Card & Coverage | ui-components | easy | ✅ |

### 29.B — Clinician / Staff Side (EHR-lite)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `clinic-ehr-dashboard` | Clinician Dashboard (today's panel) | pages | hard | ✅ |
| 10 | `clinic-patient-chart` | Patient Chart (history · meds · allergies) | pages | hard | ✅ |
| 11 | `clinic-visit-notes` | Visit Notes Editor (SOAP format) | pages | med | ✅ |
| 12 | `clinic-prescription-pad` | E-Prescription Pad | ui-components | med | ✅ |
| 13 | `clinic-lab-order` | Lab Order Sheet | ui-components | med | ✅ |
| 14 | `clinic-vitals-input` | Vitals Input Panel (BP · HR · temp) | ui-components | easy | ✅ |
| 15 | `clinic-queue-board` | Waiting Room Queue Board | pages | med | ✅ |
| 16 | `clinic-referral-form` | Referral / Consult Request | ui-components | easy | ✅ |

### 29.C — Telemedicine & Communication

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `clinic-video-consult` | Video Consult Room UI | pages | hard | ✅ |
| 18 | `clinic-chat-doctor` | Secure Chat with Doctor | ui-components | med | ✅ |
| 19 | `clinic-prescription-delivery` | Pharmacy Delivery Tracker | ui-components | easy | ✅ |

### 29.D — In-clinic Dispense

> Scope: in-clinic dispensing only (a doctor handing meds at the visit). Full retail pharmacy stack lives in **Phase 43**.

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 20 | `clinic-dispense-queue` | In-clinic Dispense Queue | pages | med | ✅ |
| 21 | `clinic-dispense-counter` | In-clinic Dispense Counter UI | pages | med | ✅ |
| 22 | `clinic-medication-info` | Medication Info Sheet | ui-components | easy | ✅ |

### 29.E — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 23 | `clinic-page-landing` | Clinic Landing (services + book CTA) | pages | med | ✅ |
| 24 | `clinic-page-services` | Services / Specialties | pages | easy | ✅ |
| 25 | `clinic-page-doctors` | Doctors / Team Page | pages | easy | ✅ |
| 26 | `clinic-page-insurance` | Insurance & Pricing | pages | easy | ✅ |
| 27 | `clinic-page-locations` | Locations & Hours | pages | easy | ✅ |

### 29.F — Admin (Manager)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 28 | `clinic-admin-schedule` | Doctor / Room Schedule Admin | pages | hard | ✅ |
| 29 | `clinic-admin-billing` | Billing & Claims Dashboard | pages | hard | ✅ |
| 30 | `clinic-admin-inventory` | Supplies Inventory | pages | med | ✅ |

### 29.G — Themed Clinic Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 31 | `clinic-landing-general` | General Practice / Family Clinic | Teal + white + warm coral · friendly sans · approachable, community | med | ✅ |
| 32 | `clinic-landing-dental` | Dental Clinic | Mint + white + soft blue · rounded sans · clean, smile-forward | med | ✅ |
| 33 | `clinic-landing-pediatric` | Pediatric Clinic | Pastel yellow + sky + bubblegum · playful sans · child-friendly, illustrated | med | ✅ |
| 34 | `clinic-landing-mental-health` | Mental Health / Therapy | Sage + cream + lavender · serif + sans · calm, safe, soft | med | ✅ |
| 35 | `clinic-landing-specialist` | Specialist / Surgery Center | Deep blue + silver + white · modern serif · authoritative, premium | hard | ✅ |

### Build order (Phase 29)

1. **Patient foundation** — 1, 2, 3, 4.
2. **EHR core** — 9, 10, 11, 12.
3. **Tele + comms** — 17, 18, 19.
4. **In-clinic dispense** — 20, 21, 22.
5. **Marketing** — 23 → 27.
6. **Admin** — 28 → 30.
7. **Landings** — 31 → 35.

---

## Phase 30 — Gym / Fitness Studio Theme 💪 ✅ DONE

> Fitness vertical — class booking, member portal, trainer dashboard, workout tracker, plus themed landings (yoga studio, crossfit box, boutique HIIT, big-box chain, martial arts).
>
> Naming convention: `gym-<area>-<slug>`.
> Shared design language: high-energy black + neon accent (electric green / orange) for performance gyms; soft sage + bone for wellness studios (varies per landing) · bold sans display · large action buttons.
> Collection: `gym`.

**Progress (2026-06-08):** ✅ **Complete — all 29 resources built** via a 29-agent parallel workflow (see `PHASE-WORKFLOW.md`; script at `docs/templates/gym-phase30.workflow.js`). The `gym` collection is fully wired (`schema.ts` + Astro `config.ts` enums, `apps/www/src/lib/collections.ts` card with `collection-gym` accent, i18n EN+ES) and the MCP catalog is regenerated (827 resources, all frontmatter validated). Every resource has `index.mdx` + `snippets/{html,css,js}`. Default performance-gym palette (black + neon green/orange); the 5 themed landings (25–29) use per-concept palette overrides.

### 30.A — Member / Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `gym-class-schedule` | Class Schedule (week grid) | pages | med | ✅ |
| 2 | `gym-class-detail` | Class Detail + Book CTA | ui-components | easy | ✅ |
| 3 | `gym-member-dashboard` | Member Dashboard (next class · streak · stats) | pages | med | ✅ |
| 4 | `gym-workout-tracker` | Workout Tracker (sets · reps · timer) | pages | med | ✅ |
| 5 | `gym-membership-card` | Digital Membership Card (QR) | ui-components | easy | ✅ |
| 6 | `gym-progress-stats` | Progress Stats (charts · PRs) | ui-components | med | ✅ |
| 7 | `gym-nutrition-log` | Nutrition / Macro Log | ui-components | med | ✅ |
| 8 | `gym-booking-flow` | Class Booking Flow (date · spot · pay) | pages | med | ✅ |

### 30.B — Trainer / Staff Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `gym-trainer-dashboard` | Trainer Dashboard (clients · today) | pages | med | ✅ |
| 10 | `gym-class-roster` | Class Roster (attendance check-in) | ui-components | easy | ✅ |
| 11 | `gym-workout-builder` | Workout Plan Builder (drag exercises) | pages | hard | ✅ |
| 12 | `gym-client-progress` | Client Progress View | ui-components | med | ✅ |
| 13 | `gym-check-in-kiosk` | Member Check-in Kiosk (QR scan) | pages | med | ✅ |

### 30.C — Equipment & Floor

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 14 | `gym-floor-map` | Gym Floor Map (equipment zones) | pages | med | ✅ |
| 15 | `gym-equipment-status` | Equipment Status (in use / free / repair) | ui-components | med | ✅ |
| 16 | `gym-leaderboard` | Class Leaderboard (heart rate · cal) | ui-components | med | ✅ |

### 30.D — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `gym-page-landing` | Gym Landing (hero + trial CTA) | pages | med | ✅ |
| 18 | `gym-page-classes` | Classes Overview Page | pages | easy | ✅ |
| 19 | `gym-page-trainers` | Trainers / Coaches Page | pages | easy | ✅ |
| 20 | `gym-page-pricing` | Membership Pricing | pages | easy | ✅ |
| 21 | `gym-page-schedule` | Public Schedule Page | pages | easy | ✅ |

### 30.E — Admin (Manager)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 22 | `gym-admin-members` | Members Admin (list · churn · MRR) | pages | hard | ✅ |
| 23 | `gym-admin-classes` | Class Management (CRUD) | pages | med | ✅ |
| 24 | `gym-admin-revenue` | Revenue & Retention Dashboard | pages | hard | ✅ |

### 30.F — Themed Studio Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 25 | `gym-landing-yoga` | Yoga / Pilates Studio | Sage + bone + dusty rose · modern serif · serene, grounded | med | ✅ |
| 26 | `gym-landing-crossfit` | CrossFit Box | Black + safety yellow + concrete · industrial sans · raw, intense | hard | ✅ |
| 27 | `gym-landing-boutique` | Boutique Cycling / HIIT | Deep purple + neon pink + white · bold display · high-energy, club-like | hard | ✅ |
| 28 | `gym-landing-big-box` | Big-Box Chain Gym | Red + black + steel · chunky sans · accessible, mass-market | med | ✅ |
| 29 | `gym-landing-martial-arts` | Martial Arts / Boxing | Charcoal + crimson + cream · slab serif · disciplined, traditional | med | ✅ |

### Build order (Phase 30)

1. **Member foundation** — 1, 2, 3, 8.
2. **Engagement** — 4, 5, 6.
3. **Trainer side** — 9, 10, 11, 13.
4. **Floor / equipment** — 14, 15, 16.
5. **Marketing** — 17 → 21.
6. **Admin** — 22 → 24.
7. **Landings** — 25 → 29.

---

## Phase 31 — Salon / Beauty / Barbershop Theme 💈 ✅ DONE

> Booking-heavy + visual-heavy vertical — stylist calendar, service catalog, client portal, POS, plus themed landings (hair salon, barbershop, nail bar, day spa, med-spa).
>
> Naming convention: `salon-<area>-<slug>`.
> Shared design language: rose-gold + cream + matte black · elegant serif (Cormorant) + clean sans · high-touch photography · subtle gold accents.
> Collection: `salon`.

**Progress (2026-06-08):** ✅ **Complete — all 23 resources built** via a 23-agent parallel workflow (see `PHASE-WORKFLOW.md`). The `salon` collection is fully wired (`schema.ts` + Astro `config.ts` enums, `apps/www/src/lib/collections.ts` card order 13, i18n EN+ES) and the MCP catalog is regenerated (875 resources, all frontmatter validated). Every resource has `index.mdx` + `snippets/{html,css,js}`; the 5 themed landings each use their own palette (rose-gold luxe, oxblood barbershop, blush nail-bar, sage spa, pearl med-spa).

### 31.A — Client / Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `salon-booking` | Service + Stylist + Time Booking | pages | med | ✅ |
| 2 | `salon-service-catalog` | Service Catalog (categories · price) | pages | easy | ✅ |
| 3 | `salon-stylist-profile` | Stylist Profile + portfolio | ui-components | easy | ✅ |
| 4 | `salon-client-portal` | Client Portal (past visits · rebook) | pages | med | ✅ |
| 5 | `salon-loyalty-rewards` | Loyalty & Referral Card | ui-components | easy | ✅ |
| 6 | `salon-gift-card` | Gift Card Purchase / Redeem | ui-components | easy | ✅ |

### 31.B — Staff / Stylist Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `salon-stylist-calendar` | Stylist Day Calendar | pages | med | ✅ |
| 8 | `salon-appointment-card` | Appointment Detail Card | ui-components | easy | ✅ |
| 9 | `salon-color-formula` | Color Formula Tracker (per client) | ui-components | med | ✅ |
| 10 | `salon-client-notes` | Client Notes (preferences · allergies) | ui-components | easy | ✅ |
| 11 | `salon-pos-checkout` | POS Checkout (services + retail) | pages | med | ✅ |
| 12 | `salon-tip-split` | Tip & Commission Split | ui-components | easy | ✅ |

### 31.C — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 13 | `salon-page-landing` | Salon Landing | pages | med | ✅ |
| 14 | `salon-page-services` | Services & Prices | pages | easy | ✅ |
| 15 | `salon-page-team` | Team / Stylists | pages | easy | ✅ |
| 16 | `salon-page-gallery` | Portfolio / Gallery | pages | easy | ✅ |

### 31.D — Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `salon-admin-dashboard` | Revenue per Stylist + Service Mix | pages | med | ✅ |
| 18 | `salon-admin-inventory` | Retail Inventory (products) | pages | med | ✅ |

### 31.E — Themed Salon Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 19 | `salon-landing-hair` | Modern Hair Salon | Rose gold + cream + black · elegant serif · luxe, editorial | med | ✅ |
| 20 | `salon-landing-barber` | Classic Barbershop | Oxblood + walnut + cream · slab serif · vintage, masculine | med | ✅ |
| 21 | `salon-landing-nail-bar` | Nail Bar / Studio | Blush + lavender + chrome · playful sans · trendy, Instagrammable | easy | ✅ |
| 22 | `salon-landing-spa` | Day Spa | Sage + sand + bronze · light serif · serene, wellness | med | ✅ |
| 23 | `salon-landing-medspa` | Med-Spa / Aesthetic | Pearl + champagne + soft pink · clinical serif · premium, medical-elegant | hard | ✅ |

### Build order (Phase 31)

1. **Client foundation** — 1, 2, 3.
2. **Staff core** — 7, 8, 11.
3. **Retention** — 4, 5, 6, 9, 10.
4. **POS / financial** — 11, 12.
5. **Marketing** — 13 → 16.
6. **Admin** — 17, 18.
7. **Landings** — 19 → 23.

---

## Phase 32 — Real Estate Theme 🏡 ✅ DONE

> Listings + agent CRM + buyer/seller flows + themed brokerage landings (luxury, urban condo, suburban, commercial, vacation rental).
>
> Naming convention: `realestate-<area>-<slug>`.
> Shared design language: editorial · ivory + deep green + brass · serif display + sans body · large photography · map integrations.
> Collection: `realestate`.

### 32.A — Buyer / Public Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `realestate-search` | Search Listings (filters + map) | pages | hard | ✅ |
| 2 | `realestate-listing-card` | Listing Card (price · beds · sqft) | ui-components | easy | ✅ |
| 3 | `realestate-listing-detail` | Listing Detail (gallery · map · schools) | pages | hard | ✅ |
| 4 | `realestate-virtual-tour` | Virtual Tour Viewer | ui-components | med | ✅ |
| 5 | `realestate-mortgage-calc` | Mortgage Calculator | ui-components | med | ✅ |
| 6 | `realestate-affordability` | Affordability Estimator | ui-components | med | ✅ |
| 7 | `realestate-saved-search` | Saved Searches / Alerts | ui-components | easy | ✅ |
| 8 | `realestate-tour-booking` | Schedule Tour / Open House | ui-components | easy | ✅ |

### 32.B — Agent / CRM Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `realestate-agent-dashboard` | Agent Dashboard (leads · listings · pipeline) | pages | hard | ✅ |
| 10 | `realestate-listing-editor` | Listing Editor (photos · description · price) | pages | med | ✅ |
| 11 | `realestate-lead-card` | Lead Card (contact · status · notes) | ui-components | easy | ✅ |
| 12 | `realestate-cma-report` | CMA / Comp Report | pages | med | ✅ |
| 13 | `realestate-offer-tracker` | Offer Tracker (offers · counters) | ui-components | med | ✅ |
| 14 | `realestate-transaction-pipeline` | Transaction Pipeline (Kanban) | pages | hard | ✅ |

### 32.C — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 15 | `realestate-page-brokerage` | Brokerage Landing | pages | med | ✅ |
| 16 | `realestate-page-agent` | Agent Profile / Personal Brand | pages | easy | ✅ |
| 17 | `realestate-page-neighborhood` | Neighborhood Guide | pages | med | ✅ |

### 32.D — Brokerage Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 18 | `realestate-admin-dashboard` | Brokerage Dashboard (volume · GCI) | pages | hard | ✅ |
| 19 | `realestate-admin-team` | Team / Agent Roster | pages | med | ✅ |
| 20 | `realestate-admin-compliance` | Compliance / Document Tracker | ui-components | med | ✅ |

### 32.E — Themed Real Estate Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 21 | `realestate-landing-luxury` | Luxury Estates | Ivory + deep green + brass · Cormorant + Inter · editorial, refined | hard | ✅ |
| 22 | `realestate-landing-urban` | Urban Condo Tower | Charcoal + glass blue + chrome · clean grotesque · modern, sleek | hard | ✅ |
| 23 | `realestate-landing-suburban` | Suburban Family Homes | Sage + cream + warm wood · friendly serif + sans · welcoming, family | med | ✅ |
| 24 | `realestate-landing-commercial` | Commercial / Industrial | Steel + navy + amber · clean sans · authoritative, B2B | med | ✅ |
| 25 | `realestate-landing-vacation` | Vacation / Short-term Rental | Sand + teal + coral · airy sans · escape, lifestyle | med | ✅ |

### Build order (Phase 32)

1. **Buyer foundation** — 1, 2, 3.
2. **Buyer tools** — 5, 6, 7, 8.
3. **Agent core** — 9, 10, 11, 14.
4. **Deal flow** — 12, 13.
5. **Marketing** — 15 → 17.
6. **Admin** — 18 → 20.
7. **Landings** — 21 → 25.

**Progress (2026-06-08):** ✅ DONE — all 25 resources built via multi-agent workflow
(`docs/templates/phase32-realestate.workflow.js`). Each has `index.mdx` + 3 snippets
(html/css/js). `realestate` collection wired in schema, www content config, `collections.ts`
(order 14), and i18n (`en` + `es`). MCP catalog regenerated (875 resources, 25 realestate).
Shared editorial design system: Cormorant Garamond + Inter, ivory/deep-green/brass; 5 themed
landings use per-variant palette overrides.

---

## Phase 33 — Travel / Airline Theme ✈️ PLAN

> Flight search, seat map, boarding pass, check-in, plus themed airline landings (legacy carrier, low-cost, premium boutique, regional, private charter).
>
> Naming convention: `air-<area>-<slug>`.
> Shared design language: aviation blue + cloud white + sunrise orange · clean grotesque · precise iconography · large status indicators.
> Collection: `airline`.

### 33.A — Passenger / Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `air-flight-search` | Flight Search (from · to · dates) | pages | med | [ ] |
| 2 | `air-flight-results` | Results List (price · duration · stops) | pages | hard | [ ] |
| 3 | `air-seat-map` | Seat Map Selector | ui-components | hard | [ ] |
| 4 | `air-booking-flow` | Booking (pax info · extras · pay) | pages | hard | [ ] |
| 5 | `air-checkin-flow` | Online Check-in Wizard | pages | med | [ ] |
| 6 | `air-boarding-pass` | Boarding Pass (mobile QR) | ui-components | easy | [ ] |
| 7 | `air-flight-status` | Flight Status Board | ui-components | med | [ ] |
| 8 | `air-trip-itinerary` | Trip Itinerary (multi-leg) | ui-components | med | [ ] |
| 9 | `air-loyalty-card` | Frequent Flyer Status Card | ui-components | easy | [ ] |
| 10 | `air-baggage-tracker` | Baggage Tracker | ui-components | easy | [ ] |

### 33.B — Airport / Gate / Staff

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `air-gate-display` | Gate Departure Display | pages | med | [ ] |
| 12 | `air-fids-board` | Flight Information Display (FIDS) | pages | med | [ ] |
| 13 | `air-gate-agent` | Gate Agent Boarding UI | pages | hard | [ ] |
| 14 | `air-checkin-kiosk` | Self-Check-in Kiosk | pages | med | [ ] |

### 33.C — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 15 | `air-page-landing` | Airline Landing | pages | med | [ ] |
| 16 | `air-page-destinations` | Destinations Page | pages | med | [ ] |
| 17 | `air-page-fleet` | Our Fleet | pages | easy | [ ] |
| 18 | `air-page-loyalty` | Loyalty Program | pages | easy | [ ] |

### 33.D — Ops / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 19 | `air-ops-control-center` | Ops Control Center (flights · disruptions) | pages | hard | [ ] |
| 20 | `air-crew-schedule` | Crew Schedule (pilots · cabin) | pages | hard | [ ] |
| 21 | `air-load-factor-report` | Load Factor & Revenue Report | pages | med | [ ] |

### 33.E — Themed Airline Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 22 | `air-landing-legacy` | Legacy Flag Carrier | Navy + gold + white · classic serif · prestigious, established | hard | [ ] |
| 23 | `air-landing-lowcost` | Low-Cost Carrier | Yellow + black + magenta · loud sans · cheerful, value | med | [ ] |
| 24 | `air-landing-premium` | Premium Boutique (Emirates-style) | Deep red + cream + gold · refined serif · luxurious, hospitality | hard | [ ] |
| 25 | `air-landing-regional` | Regional / Short-Hop | Sky blue + white + green · friendly sans · approachable, local | med | [ ] |
| 26 | `air-landing-charter` | Private Charter / Jet Card | Black + champagne + slate · elegant serif · exclusive, discreet | hard | [ ] |

### Build order (Phase 33)

1. **Passenger foundation** — 1, 2, 3, 4.
2. **Day-of travel** — 5, 6, 7, 8.
3. **Loyalty / bags** — 9, 10.
4. **Gate / staff** — 11, 12, 13, 14.
5. **Marketing** — 15 → 18.
6. **Ops / admin** — 19 → 21.
7. **Landings** — 22 → 26.

---

## Phase 34 — Coworking / Studio Rental Theme 🏢 PLAN

> Desk/room booking, member portal, access control, billing — plus themed coworking landings (creative loft, corporate flex, maker space, café-style, suburban hub).
>
> Naming convention: `cowork-<area>-<slug>`.
> Shared design language: warm concrete + amber + matte black · modern sans · industrial photography · plant accents.
> Collection: `cowork`.

### 34.A — Member Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `cowork-desk-booking` | Desk Booking (floor + slot) | pages | hard | [ ] |
| 2 | `cowork-room-booking` | Meeting Room Booking | pages | med | [ ] |
| 3 | `cowork-member-dashboard` | Member Dashboard (today's bookings) | pages | med | [ ] |
| 4 | `cowork-access-card` | Mobile Access Card / QR | ui-components | easy | [ ] |
| 5 | `cowork-credits-balance` | Credits / Hours Balance | ui-components | easy | [ ] |
| 6 | `cowork-community-feed` | Community Feed (events · members) | pages | med | [ ] |

### 34.B — Operations / Front Desk

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `cowork-floor-plan` | Live Floor Plan (occupancy) | pages | hard | [ ] |
| 8 | `cowork-checkin-kiosk` | Visitor Check-in Kiosk | pages | med | [ ] |
| 9 | `cowork-printer-status` | Printer / Equipment Status | ui-components | easy | [ ] |

### 34.C — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 10 | `cowork-page-landing` | Coworking Landing | pages | med | [ ] |
| 11 | `cowork-page-spaces` | Spaces / Tour | pages | med | [ ] |
| 12 | `cowork-page-pricing` | Membership Pricing | pages | easy | [ ] |
| 13 | `cowork-page-events` | Events Calendar | pages | easy | [ ] |

### 34.D — Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 14 | `cowork-admin-occupancy` | Occupancy & Utilization Dashboard | pages | hard | [ ] |
| 15 | `cowork-admin-billing` | Billing & Subscriptions | pages | med | [ ] |

### 34.E — Themed Coworking Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 16 | `cowork-landing-creative-loft` | Creative Loft (designers/artists) | Concrete + amber + black · industrial sans · raw, inspiring | med | [ ] |
| 17 | `cowork-landing-corporate-flex` | Corporate Flex (WeWork-style) | Navy + white + accent green · clean sans · professional, scalable | med | [ ] |
| 18 | `cowork-landing-maker-space` | Maker / Hardware Lab | Slate + electric yellow + steel · monospace + sans · technical, hands-on | hard | [ ] |
| 19 | `cowork-landing-cafe-style` | Café-Style Workspace | Espresso + cream + brass · warm serif · cozy, social | med | [ ] |
| 20 | `cowork-landing-suburban` | Suburban / Neighborhood Hub | Sage + clay + ivory · friendly serif · community, local | med | [ ] |

### Build order (Phase 34)

1. **Member foundation** — 1, 2, 3, 4.
2. **Engagement** — 5, 6.
3. **Ops** — 7, 8, 9.
4. **Marketing** — 10 → 13.
5. **Admin** — 14, 15.
6. **Landings** — 16 → 20.

---

## Phase 35 — Auto Repair / Dealership Theme 🚗 PLAN

> Service bay board, parts inventory, customer portal, sales floor + themed dealership landings (luxury, EV, used cars, motorcycle, performance/tuning).
>
> Naming convention: `auto-<area>-<slug>`.
> Shared design language: garage black + safety orange + steel · industrial display · technical iconography · large status panels.
> Collection: `auto`.

### 35.A — Service / Repair Shop

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `auto-service-board` | Service Bay Board (jobs in progress) | pages | hard | [ ] |
| 2 | `auto-work-order` | Work Order (vehicle + tasks + parts) | pages | med | [ ] |
| 3 | `auto-diagnostic-report` | Diagnostic Report (codes + recommendations) | ui-components | med | [ ] |
| 4 | `auto-estimate` | Repair Estimate (labor + parts) | ui-components | med | [ ] |
| 5 | `auto-parts-inventory` | Parts Inventory (SKU search) | pages | med | [ ] |
| 6 | `auto-tech-mobile` | Technician Mobile Job View | pages | med | [ ] |

### 35.B — Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `auto-customer-portal` | Customer Service Portal | pages | med | [ ] |
| 8 | `auto-service-booking` | Book Service Appointment | pages | med | [ ] |
| 9 | `auto-repair-tracker` | Repair Status Tracker (text-style updates) | ui-components | easy | [ ] |
| 10 | `auto-quote-approval` | Quote Approval (digital sign-off) | ui-components | easy | [ ] |

### 35.C — Sales / Showroom

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `auto-inventory-grid` | Vehicle Inventory Grid (search · filter) | pages | hard | [ ] |
| 12 | `auto-vehicle-detail` | Vehicle Detail (specs · gallery · finance) | pages | hard | [ ] |
| 13 | `auto-finance-calc` | Finance / Lease Calculator | ui-components | med | [ ] |
| 14 | `auto-trade-in` | Trade-In Valuation Form | ui-components | med | [ ] |
| 15 | `auto-test-drive-booking` | Test Drive Booking | ui-components | easy | [ ] |

### 35.D — Admin / Manager

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 16 | `auto-admin-dashboard` | Shop Dashboard (revenue · bay utilization) | pages | hard | [ ] |
| 17 | `auto-admin-tech-productivity` | Technician Productivity Report | pages | med | [ ] |
| 18 | `auto-admin-customer-db` | Customer & Vehicle Database | pages | med | [ ] |

### 35.E — Themed Dealership Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 19 | `auto-landing-luxury` | Luxury Dealership (BMW/Mercedes-style) | Charcoal + champagne + chrome · refined sans · prestige, precision | hard | [ ] |
| 20 | `auto-landing-ev` | EV / Tesla-style | White + minimal + electric blue · ultra-clean sans · futuristic, minimal | hard | [ ] |
| 21 | `auto-landing-used` | Used Car Lot | Red + white + steel · chunky display · accessible, value-driven | med | [ ] |
| 22 | `auto-landing-motorcycle` | Motorcycle / Harley-style | Black + chrome + oxblood · slab serif · rebellious, heritage | med | [ ] |
| 23 | `auto-landing-performance` | Performance / Tuning Shop | Carbon + neon green + orange · technical sans · adrenaline, motorsport | hard | [ ] |

### Build order (Phase 35)

1. **Service core** — 1, 2, 4.
2. **Customer flow** — 7, 8, 9, 10.
3. **Parts & tech** — 3, 5, 6.
4. **Sales** — 11, 12, 13, 14, 15.
5. **Admin** — 16 → 18.
6. **Landings** — 19 → 23.

> Note: Phase 35 has no separate marketing section — marketing surfaces are baked into the themed landings (35.E) since dealerships are landing-first by nature. Consider adding a generic `auto-page-services` if a non-themed marketing page is needed.

---

## Future verticals (backlog) 📋

> Additional themed bundles to consider after Phases 28–35 ship. Not yet scoped into sub-sections — recorded here so they're not lost.

### Mid-fit (rich UI surface, mostly single-sided)

| Phase ID | Theme | Notes |
|---|---|---|
| 36 | **Banking / Fintech App** 💳 | Accounts · transactions · cards · transfers · investments · KYC · onboarding · landings (neobank, traditional, crypto-bank, business banking, lending). |
| 37 | **E-learning / LMS** 🎓 | Course catalog · classroom player · quiz · gradebook · instructor dashboard · landings (university, bootcamp, kids, language, professional cert). |
| 38 | **Event Ticketing** 🎟️ | Discovery · seat selection · ticket QR · organizer dashboard · landings (concert, conference, sports, festival, theater). |
| 39 | **Streaming Platform** 🎬 | Browse · player · profile · episode picker · landings (general SVOD, kids, sports, niche, music). |
| 40 | **Job Board / ATS** 💼 | Listings · application form · recruiter pipeline · candidate portal · landings (general, tech, executive, gig, internal mobility). |
| 41 | **Delivery / Logistics** 📦 | Driver app · customer tracking · dispatch board · warehouse · landings (food delivery, parcels, freight, grocery, last-mile). |

### Specialized (themed landings only, no full vertical)

| Phase ID | Theme | Notes |
|---|---|---|
| 42 | **Agency Landings** 🎨 | 5 variants — design, dev, marketing, video, branding. Same shape as 27.F. |
| 43 | **Creator / Personal Brand Landings** 🎤 | 5 variants — musician, photographer, author, coach, streamer. |
| 44 | **D2C Brand Landings** 🛍️ | 5 variants — skincare, coffee, fashion, hardware, supplements. |
| 45 | **AI Product Landings** 🤖 | 5 variants — chatbot, image gen, code assistant, voice AI, search engine. |

### Other candidates to evaluate

- **Veterinary Clinic** 🐾 (variant of Phase 29 with pet-specific flows)
- **Auction / Marketplace** 🪙 (eBay-like — bids, watchlist, seller tools)
- **Insurance** 🛡️ (quotes, claims, policy management)
- **Religious / Community Center** ⛪ (service times, donations, member directory)
- **Government / Public Services** 🏛️ (forms, permits, appointments, status)
- **Legal Services** ⚖️ (case management, document portal, billing)

### Cross-phase shared assets (optional)

If themes start repeating UI primitives (booking widgets, calendars, payment forms, loyalty cards), consider extracting a `vertical-shared/` set of reusable building blocks. Default: keep each phase standalone (matches Phase 27 decision).

---

## Editorial & Content Theme Bundles (Phases 46–49) 🧭 PLAN

> A second family of theme bundles focused on **editorial, science, cultural and game content** rather than transactional verticals. Same conventions as Phases 28–35 (naming `<prefix>-<area>-<slug>`, vanilla `html/css/js`, `pages` for full-screen layouts + `ui-components` for widgets, `*.F`/`*.E` themed-landing sub-sections with 5 style variants each, add collection slug to schema before authoring).
>
> Emphasis here is on **styles** (distinct aesthetics for the same content type), **topics/sections** (the content surfaces a publication or studio needs), and **patterns** (reusable layout primitives — columns, pull quotes, figures, HUDs).

---

## Phase 46 — Newspaper / Magazine / Editorial Theme 📰 PLAN

> Editorial publishing stack — front pages, article layouts, long-form features, opinion, photo essays, plus a newsroom CMS and themed mastheads (broadsheet, tabloid, glossy magazine, fashion editorial, literary journal).
>
> Naming convention: `news-<area>-<slug>`.
> Shared design language: ink black + newsprint cream + one accent red · serif display (Playfair / Times-like) + grotesque body · strict column grids · rules, drop caps, pull quotes, bylines.
> Collection: `editorial`.
using the style of the news

### 46.A — Reader-Facing Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `news-front-page` | Front Page (masthead + multi-column lead grid) | pages | hard | [ ] |
| 2 | `news-article` | Standard Article (byline · body · related) | pages | med | [ ] |
| 3 | `news-longform-feature` | Long-form Feature (scroll, full-bleed, parallax) | pages | hard | [ ] |
| 4 | `news-opinion-column` | Opinion / Editorial Column | pages | easy | [ ] |
| 5 | `news-photo-essay` | Photo Essay / Visual Story | pages | med | [ ] |
| 6 | `news-section-index` | Section Index (World · Sports · Culture) | pages | med | [ ] |
| 7 | `news-live-blog` | Live Blog / Breaking News Stream | pages | med | [ ] |
| 8 | `news-obituary` | Obituary / In Memoriam layout | ui-components | easy | [ ] |

### 46.B — Editorial Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `news-masthead` | Masthead / Nameplate variants | ui-components | easy | [ ] |
| 10 | `news-pull-quote` | Pull Quote & Drop Cap set | ui-components | easy | [ ] |
| 11 | `news-byline-meta` | Byline · dateline · read-time meta | ui-components | easy | [ ] |
| 12 | `news-column-grid` | Multi-column flow grid (CSS columns) | ui-components | med | [ ] |
| 13 | `news-article-toc` | Sticky article TOC + progress | ui-components | med | [ ] |
| 14 | `news-paywall-gate` | Paywall / subscribe gate overlay | ui-components | med | [ ] |
| 15 | `news-newsletter-signup` | Inline newsletter signup | ui-components | easy | [ ] |

### 46.C — Magazine-Specific

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 16 | `news-mag-cover` | Magazine Cover (cover lines + hero) | pages | med | [ ] |
| 17 | `news-mag-spread` | Two-page Spread layout | pages | hard | [ ] |
| 18 | `news-mag-toc` | Magazine Table of Contents | pages | med | [ ] |
| 19 | `news-mag-interview` | Q&A / Interview layout | pages | easy | [ ] |

### 46.D — Newsroom CMS / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 20 | `news-cms-editor` | Article Editor (headline · deck · body) | pages | hard | [ ] |
| 21 | `news-cms-dashboard` | Newsroom Dashboard (queue · publish status) | pages | med | [ ] |
| 22 | `news-cms-front-builder` | Front-page Layout Builder (drag slots) | pages | hard | [ ] |

### 46.E — Themed Mastheads / Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 23 | `news-landing-broadsheet` | Classic Broadsheet | Ink + cream + oxblood · Times-like serif · authoritative, dense | hard | [ ] |
| 24 | `news-landing-tabloid` | Tabloid / Popular Daily | Black + white + bold red/yellow · condensed display · loud, punchy | med | [ ] |
| 25 | `news-landing-glossy-mag` | Glossy Lifestyle Magazine | White + black + hot accent · fashion serif · airy, premium | med | [ ] |
| 26 | `news-landing-fashion` | High-Fashion Editorial | Monochrome + single neon · thin couture sans · avant-garde, sparse | hard | [ ] |
| 27 | `news-landing-literary` | Literary Journal / Review | Bone + ink + muted teal · book serif · contemplative, text-first | med | [ ] |

### Build order (Phase 46)

1. **Patterns first** — 9, 10, 11, 12 (establish the editorial grid + type tokens).
2. **Reader core** — 1, 2, 3, 6.
3. **Magazine** — 16, 17, 18.
4. **Engagement** — 13, 14, 15, 7.
5. **CMS** — 20, 21, 22.
6. **Landings** — 23 → 27.

---

## Phase 47 — Science / Research Theme 🔬 PLAN

> Scientific publishing & data communication — academic paper layouts, dataset explorers, lab/research-group sites, figure & citation patterns, plus themed landings (academic journal, popular-science mag, research lab, dataset portal, scientific conference).
>
> Naming convention: `sci-<area>-<slug>`.
> Shared design language: clean white + ink + one institutional accent (deep blue / teal) · readable serif for prose + sans for UI + monospace for data · LaTeX-like equation styling · figure-caption discipline · WCAG AA.
> Collection: `science`.

### 47.A — Publication Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `sci-paper-layout` | Academic Paper (abstract · sections · refs) | pages | hard | [ ] |
| 2 | `sci-preprint-page` | Preprint / arXiv-style article page | pages | med | [ ] |
| 3 | `sci-review-article` | Review / Survey layout (figures + tables) | pages | med | [ ] |
| 4 | `sci-poster` | Conference Poster (single-sheet grid) | pages | med | [ ] |
| 5 | `sci-popsci-article` | Popular-Science Article (explainer style) | pages | med | [ ] |

### 47.B — Science Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `sci-figure-caption` | Figure + numbered caption block | ui-components | easy | [ ] |
| 7 | `sci-equation-block` | Equation block (KaTeX-style display) | ui-components | med | [ ] |
| 8 | `sci-citation-list` | References list + inline citation links | ui-components | med | [ ] |
| 9 | `sci-data-table` | Scientific data table (units · sig figs) | ui-components | med | [ ] |
| 10 | `sci-abstract-card` | Structured abstract card | ui-components | easy | [ ] |
| 11 | `sci-author-affiliations` | Author + affiliation + ORCID block | ui-components | easy | [ ] |
| 12 | `sci-peer-review-badge` | Peer-review / open-access status badges | ui-components | easy | [ ] |

### 47.C — Data & Interactive

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 13 | `sci-dataset-explorer` | Dataset Explorer (filter · download) | pages | hard | [ ] |
| 14 | `sci-interactive-chart` | Interactive figure (toggle series) | ui-components | med | [ ] |
| 15 | `sci-experiment-timeline` | Experiment / methods timeline | ui-components | med | [ ] |
| 16 | `sci-periodic-table` | Interactive Periodic Table | pages | hard | [ ] |
| 17 | `sci-molecule-viewer` | Molecule / structure viewer card | ui-components | hard | [ ] |

### 47.D — Lab / Group / Journal Sites

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 18 | `sci-lab-landing` | Research Lab / Group Landing | pages | med | [ ] |
| 19 | `sci-publications-index` | Publications List (filter by year · topic) | pages | med | [ ] |
| 20 | `sci-people-page` | Researchers / Team Page | pages | easy | [ ] |
| 21 | `sci-journal-issue` | Journal Issue Index (vol · issue · articles) | pages | med | [ ] |

### 47.E — Themed Science Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 22 | `sci-landing-journal` | Academic Journal (Nature/Science-style) | White + ink + signature red · classic serif · authoritative, scholarly | hard | [ ] |
| 23 | `sci-landing-popsci` | Popular-Science Magazine | Deep blue + white + vivid accent · friendly sans + serif · curious, accessible | med | [ ] |
| 24 | `sci-landing-lab` | University Research Lab | Institutional navy + grey + teal · clean grotesque · credible, modern | med | [ ] |
| 25 | `sci-landing-dataset` | Open Data / Dataset Portal | White + slate + green · mono + sans · technical, utilitarian | med | [ ] |
| 26 | `sci-landing-conference` | Scientific Conference | Charcoal + cyan + white · geometric sans · energetic, forward-looking | med | [ ] |

### Build order (Phase 47)

1. **Patterns first** — 6, 7, 8, 9, 10 (figure/equation/citation primitives).
2. **Publication core** — 1, 2, 5.
3. **Data / interactive** — 13, 14, 16.
4. **Sites** — 18, 19, 21.
5. **Landings** — 22 → 26.

---

## Phase 48 — Museum / Gallery / Exhibition Theme 🏛️ PLAN

> Cultural-institution stack — exhibition pages, collection browsing, artifact/artwork detail, virtual tours, ticketing & visit info, plus themed landings (art museum, natural history, science center, modern/contemporary art, history museum).
>
> Naming convention: `museum-<area>-<slug>`.
> Shared design language: gallery white + deep charcoal + one curatorial accent · refined serif display + quiet sans · generous whitespace ("wall space") · large imagery · subtle gold/stone textures.
> Collection: `museum`.

### 48.A — Visitor-Facing

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `museum-exhibition-page` | Exhibition Page (hero · dates · themes) | pages | med | [ ] |
| 2 | `museum-collection-browse` | Collection Browse (grid · filter by era/medium) | pages | hard | [ ] |
| 3 | `museum-artifact-detail` | Artifact / Artwork Detail (provenance · zoom) | pages | med | [ ] |
| 4 | `museum-virtual-tour` | Virtual Tour / Gallery Walk | pages | hard | [ ] |
| 5 | `museum-visit-info` | Plan Your Visit (hours · tickets · map) | pages | easy | [ ] |
| 6 | `museum-events-calendar` | Events & Programs Calendar | pages | med | [ ] |

### 48.B — Cultural Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `museum-artifact-card` | Artifact card (image · title · catalog no.) | ui-components | easy | [ ] |
| 8 | `museum-gallery-wall` | Gallery wall / salon hang layout | ui-components | med | [ ] |
| 9 | `museum-timeline` | Historical timeline (eras + milestones) | ui-components | med | [ ] |
| 10 | `museum-label-plaque` | Object label / wall plaque component | ui-components | easy | [ ] |
| 11 | `museum-audio-guide` | Audio-guide player (stop number + track) | ui-components | med | [ ] |
| 12 | `museum-zoom-deepview` | Deep-zoom image viewer (artwork detail) | ui-components | hard | [ ] |
| 13 | `museum-map-floor` | Floor map / gallery wayfinding | ui-components | med | [ ] |

### 48.C — Ticketing & Membership

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 14 | `museum-ticket-booking` | Ticket Booking (date · time slot · type) | pages | med | [ ] |
| 15 | `museum-membership` | Membership / Patron tiers | pages | easy | [ ] |
| 16 | `museum-donation` | Donation / Support panel | ui-components | easy | [ ] |
| 17 | `museum-shop-card` | Gift-shop product card | ui-components | easy | [ ] |

### 48.D — Curator / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 18 | `museum-admin-catalog` | Collection Catalog Manager (CRUD) | pages | hard | [ ] |
| 19 | `museum-admin-exhibition-builder` | Exhibition Builder (sequence objects) | pages | med | [ ] |
| 20 | `museum-admin-attendance` | Attendance & Ticketing Dashboard | pages | med | [ ] |

### 48.E — Themed Museum Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 21 | `museum-landing-art` | Fine Art Museum | Gallery white + charcoal + gold · classic serif · refined, timeless | med | [ ] |
| 22 | `museum-landing-natural-history` | Natural History Museum | Bone + forest + amber · slab serif · earthy, exploratory | med | [ ] |
| 23 | `museum-landing-science-center` | Science / Discovery Center | White + electric blue + lime · rounded sans · playful, hands-on | med | [ ] |
| 24 | `museum-landing-modern-art` | Modern / Contemporary Art | Stark white + black + single neon · grotesque · bold, minimal | hard | [ ] |
| 25 | `museum-landing-history` | History / Heritage Museum | Parchment + sepia + deep red · engraved serif · narrative, archival | med | [ ] |

### Build order (Phase 48)

1. **Patterns first** — 7, 8, 9, 10 (artifact card + gallery + timeline + label).
2. **Visitor core** — 1, 2, 3, 5.
3. **Immersive** — 4, 11, 12, 13.
4. **Ticketing** — 14, 15, 16.
5. **Admin** — 18, 19, 20.
6. **Landings** — 21 → 25.

---

## Phase 49 — Game Dev Pages, Styles & Patterns 🎮 PLAN

> Game-facing web surfaces plus in-game UI patterns — marketing/store pages, devlogs & press kits, character/world content, and reusable HUD/menu primitives. Plus themed game landings across genres (AAA cinematic, indie pixel, mobile casual, retro arcade, fantasy RPG).
>
> Naming convention: `game-<area>-<slug>`.
> Shared design language: dark UI by default · genre-driven accents (neon for arcade, gold for fantasy, clean white for casual) · display gaming type + readable sans · animated/glow states · large CTAs ("Wishlist", "Play Now").
> Collection: `gamedev`.

### 49.A — Game Marketing & Store Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `game-landing-hero` | Game Landing (trailer · wishlist CTA) | pages | hard | [ ] |
| 2 | `game-store-page` | Store Page (Steam-style: media · specs · buy) | pages | hard | [ ] |
| 3 | `game-features-page` | Features Showcase (mechanics scroll) | pages | med | [ ] |
| 4 | `game-editions-compare` | Editions / Bundle Compare table | ui-components | med | [ ] |
| 5 | `game-roadmap-page` | Game Roadmap / Early Access timeline | pages | med | [ ] |
| 6 | `game-newsletter-signup` | Wishlist / Beta signup gate | ui-components | easy | [ ] |

### 49.B — Content & Community Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `game-devlog` | Devlog / Update Post layout | pages | med | [ ] |
| 8 | `game-press-kit` | Press Kit (presskit() style) | pages | med | [ ] |
| 9 | `game-character-roster` | Character / Hero Roster (select grid) | pages | hard | [ ] |
| 10 | `game-character-detail` | Character Detail (stats · lore · abilities) | pages | med | [ ] |
| 11 | `game-world-map` | Interactive World / Level Map | pages | hard | [ ] |
| 12 | `game-patch-notes` | Patch Notes / Changelog layout | ui-components | easy | [ ] |
| 13 | `game-leaderboard-page` | Leaderboard / Rankings page | pages | med | [ ] |

### 49.C — In-Game UI Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 14 | `game-hud-overlay` | HUD overlay (health · ammo · minimap) | ui-components | hard | [ ] |
| 15 | `game-main-menu` | Main Menu (Play · Options · Quit) | ui-components | med | [ ] |
| 16 | `game-pause-menu` | Pause / Settings overlay | ui-components | med | [ ] |
| 17 | `game-inventory-grid` | Inventory grid (drag · tooltips) | ui-components | hard | [ ] |
| 18 | `game-dialogue-box` | Dialogue box (typewriter · choices) | ui-components | med | [ ] |
| 19 | `game-skill-tree` | Skill / Tech tree (nodes + links) | ui-components | hard | [ ] |
| 20 | `game-quest-log` | Quest log / objectives tracker | ui-components | med | [ ] |
| 21 | `game-achievement-toast` | Achievement / trophy unlock toast | ui-components | easy | [ ] |
| 22 | `game-health-bar` | Health / mana / XP bar variants | ui-components | easy | [ ] |
| 23 | `game-loading-screen` | Loading screen (tips + progress) | ui-components | easy | [ ] |
| 24 | `game-character-select` | Character / loadout select screen | ui-components | med | [ ] |

### 49.D — Themed Game Landings (5 variants by genre/style)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 25 | `game-landing-aaa-cinematic` | AAA Cinematic (Souls/God-of-War-style) | Black + ember orange + steel · epic display serif · dramatic, full-bleed | hard | [ ] |
| 26 | `game-landing-indie-pixel` | Indie Pixel-Art | Limited palette + scanlines · pixel font · charming, retro-modern | hard | [ ] |
| 27 | `game-landing-mobile-casual` | Mobile Casual / Puzzle | Bright candy palette · rounded chunky sans · friendly, bouncy | med | [ ] |
| 28 | `game-landing-retro-arcade` | Retro Arcade / Neon | Black + neon magenta/cyan · CRT glow display · 80s, high-energy | med | [ ] |
| 29 | `game-landing-fantasy-rpg` | Fantasy RPG | Parchment + gold + deep crimson · ornate serif · epic, lore-rich | hard | [ ] |

### Build order (Phase 49)

1. **UI patterns first** — 14, 15, 17, 18, 22 (HUD, menu, inventory, dialogue, bars — establish the in-game toolkit).
2. **Marketing core** — 1, 2, 3.
3. **Content** — 7, 8, 9, 10, 11.
4. **Engagement / live** — 12, 13, 19, 20, 21.
5. **Landings** — 25 → 29.

> Note: Phase 49 mixes **web pages** (`game-landing-*`, `game-store-page`, `game-devlog`) with **in-game UI** (`game-hud-*`, `game-inventory-*`). Both are CSS/JS-renderable in Lab; the in-game patterns are simulated screens, not engine integrations.

---

## Editorial & Content Theme Bundles — continued (Phases 50–56) 🧭 PLAN

> Extends the 46–49 editorial family with more **content/cultural style collections**. Same conventions: naming `<prefix>-<area>-<slug>`, vanilla `html/css/js`, `pages` for full layouts + `ui-components` for widgets, a `*.E`/`*.F` themed-landing sub-section with 5 style variants, add collection slug to schema before authoring. Emphasis on distinct **styles** for the same content type, the **topics/sections** each publication needs, and reusable **patterns**.

---

## Phase 50 — Comics / Manga / Webtoon Theme 📖 PLAN

> Sequential-art publishing — panel-based reader layouts, vertical-scroll webtoon, chapter/series indexes, creator portal, plus themed landings across comic traditions (western comic, manga, webtoon, graphic novel, indie zine).
>
> Naming convention: `comic-<area>-<slug>`.
> Shared design language: high-contrast ink + halftone textures + bold accent · display comic lettering + clean body sans · panel gutters and speech balloons as core primitives · immersive dark reader mode.
> Collection: `comics`.

### 50.A — Reader Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `comic-page-reader` | Paged Comic Reader (page flip · zoom) | pages | hard | [ ] |
| 2 | `comic-webtoon-reader` | Vertical-Scroll Webtoon Reader | pages | med | [ ] |
| 3 | `comic-panel-grid` | Classic Panel Grid Page | pages | med | [ ] |
| 4 | `comic-guided-view` | Guided View (panel-by-panel transitions) | pages | hard | [ ] |
| 5 | `comic-cover-page` | Issue Cover Page | ui-components | easy | [ ] |

### 50.B — Comic Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `comic-speech-balloon` | Speech / thought / shout balloon set | ui-components | easy | [ ] |
| 7 | `comic-panel-frame` | Panel frame + gutter system | ui-components | med | [ ] |
| 8 | `comic-sfx-text` | Sound-effect (SFX) lettering | ui-components | easy | [ ] |
| 9 | `comic-halftone-bg` | Halftone / Ben-Day dot backgrounds | ui-components | easy | [ ] |
| 10 | `comic-caption-box` | Narration caption box | ui-components | easy | [ ] |

### 50.C — Series & Discovery

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `comic-series-page` | Series Page (synopsis · chapters list) | pages | med | [ ] |
| 12 | `comic-chapter-index` | Chapter / Episode Index | ui-components | easy | [ ] |
| 13 | `comic-library-browse` | Browse / Discover (genre grid) | pages | med | [ ] |
| 14 | `comic-character-bio` | Character Bio / Cast page | ui-components | easy | [ ] |

### 50.D — Creator / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 15 | `comic-creator-upload` | Episode Upload / Panel Sequencer | pages | hard | [ ] |
| 16 | `comic-creator-dashboard` | Creator Dashboard (views · subs · revenue) | pages | med | [ ] |

### 50.E — Themed Comic Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `comic-landing-western` | Western Superhero Comic | Bold primary + ink + halftone · blocky display · dynamic, heroic | hard | [ ] |
| 18 | `comic-landing-manga` | Manga | B/W + screentone + red accent · vertical-friendly · kinetic, expressive | med | [ ] |
| 19 | `comic-landing-webtoon` | Webtoon Platform | Bright flat + white · rounded sans · modern, mobile-first | med | [ ] |
| 20 | `comic-landing-graphic-novel` | Graphic Novel | Muted painterly + cream · literary serif · mature, cinematic | hard | [ ] |
| 21 | `comic-landing-indie-zine` | Indie Zine / Webcomic | Limited photocopy palette · handwritten + mono · raw, DIY | med | [ ] |

### Build order (Phase 50)

1. **Patterns first** — 6, 7, 8, 9, 10 (balloons, frames, halftone toolkit).
2. **Readers** — 1, 2, 3.
3. **Discovery** — 11, 12, 13.
4. **Creator** — 15, 16.
5. **Landings** — 17 → 21.

---

## Phase 51 — Cookbook / Recipe Theme 🍳 PLAN

> Recipe publishing & food content — recipe pages, step-by-step cook mode, ingredient scaling, collections/meal plans, plus themed landings (rustic cookbook, food magazine, vintage, modern wellness, restaurant chef).
>
> Naming convention: `recipe-<area>-<slug>`.
> Shared design language: warm cream + charcoal + appetite accent (tomato/saffron) · editorial serif headings + readable sans · large food photography · generous whitespace · print-friendly recipe cards.
> Collection: `cookbook`.

### 51.A — Recipe Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `recipe-detail` | Recipe Page (ingredients · steps · notes) | pages | med | [ ] |
| 2 | `recipe-cook-mode` | Cook Mode (full-screen step-by-step + timers) | pages | med | [ ] |
| 3 | `recipe-card-print` | Printable Recipe Card | ui-components | easy | [ ] |
| 4 | `recipe-story-feature` | Recipe Feature / Food Story (long-form) | pages | med | [ ] |
| 5 | `recipe-video-recipe` | Video Recipe layout (steps synced) | pages | med | [ ] |

### 51.B — Recipe Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `recipe-ingredient-list` | Ingredient list + check-off | ui-components | easy | [ ] |
| 7 | `recipe-scaler` | Serving scaler (½× · 2× quantities) | ui-components | med | [ ] |
| 8 | `recipe-step-timeline` | Numbered step timeline w/ inline timers | ui-components | med | [ ] |
| 9 | `recipe-nutrition-facts` | Nutrition facts panel | ui-components | easy | [ ] |
| 10 | `recipe-meta-badges` | Prep/cook time · difficulty · diet badges | ui-components | easy | [ ] |
| 11 | `recipe-rating-reviews` | Recipe rating + reviews block | ui-components | easy | [ ] |

### 51.C — Collections & Planning

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 12 | `recipe-browse` | Browse / Search (cuisine · diet filters) | pages | med | [ ] |
| 13 | `recipe-collection` | Recipe Collection / Cookbook index | pages | easy | [ ] |
| 14 | `recipe-meal-planner` | Weekly Meal Planner (drag recipes) | pages | hard | [ ] |
| 15 | `recipe-shopping-list` | Auto Shopping List (from selected recipes) | ui-components | med | [ ] |

### 51.D — Creator / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 16 | `recipe-editor` | Recipe Editor (ingredients + steps builder) | pages | med | [ ] |
| 17 | `recipe-admin-dashboard` | Food Blog Dashboard (traffic · top recipes) | pages | med | [ ] |

### 51.E — Themed Cookbook Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 18 | `recipe-landing-rustic` | Rustic / Farmhouse Cookbook | Cream + sage + clay · warm serif · cozy, handmade | med | [ ] |
| 19 | `recipe-landing-food-mag` | Food Magazine (Bon Appétit-style) | White + black + bold accent · editorial serif · glossy, modern | med | [ ] |
| 20 | `recipe-landing-vintage` | Vintage / Retro Recipes | Mustard + avocado + cream · 70s display · nostalgic, playful | med | [ ] |
| 21 | `recipe-landing-wellness` | Modern Wellness / Clean Eating | Bone + matcha + terracotta · light sans · airy, healthy | med | [ ] |
| 22 | `recipe-landing-chef` | Restaurant Chef / Fine Dining | Charcoal + gold + ivory · couture serif · refined, premium | hard | [ ] |

### Build order (Phase 51)

1. **Patterns first** — 6, 7, 8, 10 (ingredients, scaler, steps, badges).
2. **Recipe core** — 1, 2, 3.
3. **Discovery / planning** — 12, 13, 14, 15.
4. **Creator** — 16, 17.
5. **Landings** — 18 → 22.

---

## Phase 52 — Music / Album / Artist Theme 🎵 PLAN

> Music presence & playback — artist pages, album/track views, lyrics, tour dates, custom player, plus themed landings (vinyl-retro, streaming-modern, festival, classical, hip-hop/club).
>
> Naming convention: `music-<area>-<slug>`.
> Shared design language: dark-first + album-art-driven accents · bold display + clean sans · large cover imagery · animated player states · waveform/equalizer motifs.
> Collection: `music`.

### 52.A — Listener-Facing

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `music-artist-page` | Artist Page (hero · top tracks · about) | pages | med | [ ] |
| 2 | `music-album-page` | Album Page (tracklist · credits) | pages | med | [ ] |
| 3 | `music-track-lyrics` | Track + Synced Lyrics view | pages | med | [ ] |
| 4 | `music-tour-dates` | Tour / Live Dates (list + tickets) | ui-components | easy | [ ] |
| 5 | `music-discography` | Discography Grid (albums · singles) | pages | easy | [ ] |
| 6 | `music-playlist-page` | Playlist Page (cover · tracks · share) | pages | med | [ ] |

### 52.B — Player Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `music-player-bar` | Sticky bottom player bar | ui-components | med | [ ] |
| 8 | `music-player-full` | Full-screen Now Playing (art + controls) | ui-components | hard | [ ] |
| 9 | `music-waveform` | Waveform / progress scrubber | ui-components | med | [ ] |
| 10 | `music-equalizer-anim` | Animated equalizer bars | ui-components | easy | [ ] |
| 11 | `music-track-row` | Track list row (play · duration · like) | ui-components | easy | [ ] |
| 12 | `music-queue-panel` | Up-next queue panel | ui-components | med | [ ] |

### 52.C — Discovery & Social

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 13 | `music-browse` | Browse / Genres / New Releases | pages | med | [ ] |
| 14 | `music-search` | Search (artists · albums · tracks) | ui-components | med | [ ] |
| 15 | `music-profile` | Listener Profile (top artists · stats) | pages | med | [ ] |

### 52.D — Artist / Label Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 16 | `music-artist-dashboard` | Artist Dashboard (streams · listeners · revenue) | pages | hard | [ ] |
| 17 | `music-release-upload` | Release Upload (tracks · art · metadata) | pages | med | [ ] |

### 52.E — Themed Music Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 18 | `music-landing-vinyl` | Vinyl / Analog Retro | Warm sepia + cream + oxblood · vintage serif · tactile, nostalgic | med | [ ] |
| 19 | `music-landing-streaming` | Streaming / Modern Pop | Black + neon gradient · bold sans · sleek, dynamic | med | [ ] |
| 20 | `music-landing-festival` | Music Festival | Sunset gradient + black · loud display · hype, energetic | hard | [ ] |
| 21 | `music-landing-classical` | Classical / Orchestra | Ivory + deep navy + gold · elegant serif · refined, timeless | med | [ ] |
| 22 | `music-landing-hiphop` | Hip-Hop / Club | Black + chrome + acid accent · graffiti/condensed · bold, street | hard | [ ] |

### Build order (Phase 52)

1. **Player patterns first** — 7, 8, 9, 11 (the playback toolkit).
2. **Listener core** — 1, 2, 3, 5.
3. **Discovery** — 13, 14, 6.
4. **Admin** — 16, 17.
5. **Landings** — 18 → 22.

---

## Phase 53 — Wiki / Knowledge Base / Docs Theme 📚 PLAN

> Structured reference content — wiki articles, doc pages, infoboxes, search, version switching, plus themed landings (encyclopedia, developer docs, fandom wiki, internal handbook, support center).
>
> Naming convention: `wiki-<area>-<slug>`.
> Shared design language: clean white + ink + one link accent · readable serif/sans hybrid · persistent sidebar nav + right-rail TOC · code-friendly mono · high information density without clutter.
> Collection: `wiki`.

### 53.A — Article & Doc Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `wiki-article` | Wiki Article (sidebar · TOC · body) | pages | med | [ ] |
| 2 | `wiki-doc-page` | Docs Page (dev-docs layout + code) | pages | med | [ ] |
| 3 | `wiki-category-page` | Category / Portal Page | pages | easy | [ ] |
| 4 | `wiki-api-reference` | API Reference (endpoints · params) | pages | hard | [ ] |
| 5 | `wiki-tutorial-page` | Tutorial / Guide (step sections) | pages | med | [ ] |

### 53.B — Knowledge Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `wiki-infobox` | Infobox / fact sidebar card | ui-components | easy | [ ] |
| 7 | `wiki-toc-sidebar` | Sticky TOC + scrollspy | ui-components | med | [ ] |
| 8 | `wiki-doc-sidebar-nav` | Collapsible doc tree nav | ui-components | med | [ ] |
| 9 | `wiki-callout-admonition` | Callout / admonition blocks (note · warn · tip) | ui-components | easy | [ ] |
| 10 | `wiki-version-switcher` | Version / language switcher | ui-components | med | [ ] |
| 11 | `wiki-edit-history` | Revision history / diff view | ui-components | med | [ ] |
| 12 | `wiki-reference-footnotes` | Footnotes / citations block | ui-components | easy | [ ] |

### 53.C — Search & Navigation

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 13 | `wiki-search-results` | Search Results (faceted) | pages | med | [ ] |
| 14 | `wiki-command-search` | Command-K instant search overlay | ui-components | med | [ ] |
| 15 | `wiki-breadcrumb-trail` | Breadcrumb + related links | ui-components | easy | [ ] |
| 16 | `wiki-home-portal` | Knowledge-base Home / Portal | pages | med | [ ] |

### 53.D — Editor / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `wiki-editor` | Article Editor (markdown + preview) | pages | hard | [ ] |
| 18 | `wiki-admin-dashboard` | KB Dashboard (top articles · stale flags) | pages | med | [ ] |

### 53.E — Themed KB Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 19 | `wiki-landing-encyclopedia` | Encyclopedia (Wikipedia-style) | White + ink + link blue · neutral serif · dense, authoritative | med | [ ] |
| 20 | `wiki-landing-dev-docs` | Developer Docs | White/dark toggle + accent · sans + mono · clean, technical | med | [ ] |
| 21 | `wiki-landing-fandom` | Fandom / Game Wiki | Themed dark + vivid accent · display + sans · immersive, fan-driven | med | [ ] |
| 22 | `wiki-landing-handbook` | Internal Company Handbook | Brand neutral + accent · friendly sans · approachable, on-brand | easy | [ ] |
| 23 | `wiki-landing-support` | Support / Help Center | White + calm accent · rounded sans · reassuring, searchable | med | [ ] |

### Build order (Phase 53)

1. **Patterns first** — 6, 7, 8, 9 (infobox, TOC, nav tree, callouts).
2. **Article core** — 1, 2, 4.
3. **Search / nav** — 13, 14, 16.
4. **Editor** — 17, 18.
5. **Landings** — 19 → 23.

---

## Phase 54 — Children's / Storybook Theme 🧸 PLAN

> Kids' & picture-book content — illustrated story spreads, read-along, interactive activity pages, plus themed landings (classic fairytale, modern flat, pop-up, educational, nursery/baby).
>
> Naming convention: `kids-<area>-<slug>`.
> Shared design language: soft bright palette + rounded everything · friendly display + high-legibility body · large touch targets · playful motion · generous illustration space · WCAG AA + dyslexia-friendly options.
> Collection: `storybook`.

### 54.A — Story Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `kids-storybook-reader` | Picture-Book Reader (page-turn spreads) | pages | med | [ ] |
| 2 | `kids-read-along` | Read-Along (highlighted text + audio) | pages | med | [ ] |
| 3 | `kids-story-spread` | Two-page Illustrated Spread | pages | easy | [ ] |
| 4 | `kids-interactive-scene` | Tap-to-animate interactive scene | pages | hard | [ ] |

### 54.B — Activity & Learning Patterns

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 5 | `kids-alphabet-card` | Alphabet / flashcard set | ui-components | easy | [ ] |
| 6 | `kids-drag-match` | Drag-to-match activity | ui-components | med | [ ] |
| 7 | `kids-coloring-page` | Simple coloring / paint canvas | ui-components | med | [ ] |
| 8 | `kids-quiz-stars` | Star-reward quiz | ui-components | easy | [ ] |
| 9 | `kids-progress-stickers` | Sticker / reward progress board | ui-components | easy | [ ] |
| 10 | `kids-character-mascot` | Animated mascot / guide | ui-components | med | [ ] |

### 54.C — Library & Parent Area

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `kids-library-shelf` | Bookshelf Browse (covers grid) | pages | easy | [ ] |
| 12 | `kids-parent-dashboard` | Parent Dashboard (progress · time limits) | pages | med | [ ] |
| 13 | `kids-profile-avatar` | Kid Profile + avatar picker | ui-components | easy | [ ] |

### 54.D — Themed Storybook Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 14 | `kids-landing-fairytale` | Classic Fairytale | Cream + gold + storybook red · ornate serif · whimsical, timeless | med | [ ] |
| 15 | `kids-landing-modern-flat` | Modern Flat Illustration | Bright flat palette · rounded sans · clean, contemporary | med | [ ] |
| 16 | `kids-landing-popup` | Pop-Up Book | Paper textures + layered shadows · playful · tactile, 3D feel | hard | [ ] |
| 17 | `kids-landing-educational` | Educational / EdTech for Kids | Primary colors + white · chunky sans · cheerful, learning | med | [ ] |
| 18 | `kids-landing-nursery` | Nursery / Baby | Soft pastels + cream · rounded soft · gentle, soothing | easy | [ ] |

### Build order (Phase 54)

1. **Patterns first** — 5, 6, 8, 9, 10 (activity + reward toolkit).
2. **Story core** — 1, 2, 3.
3. **Library / parent** — 11, 12, 13.
4. **Landings** — 14 → 18.

---

## Phase 55 — Travel Guide / Magazine Theme 🧳 PLAN

> Destination & travel content — city/destination guides, itineraries, photo-essay travel stories, map+content layouts, plus themed landings (Lonely-Planet guide, luxury travel, backpacker, National-Geographic, travel agency).
>
> Naming convention: `travel-<area>-<slug>`.
> Shared design language: editorial + wanderlust · warm neutrals + horizon accents · serif display + clean sans · full-bleed landscape photography · maps as first-class content · save/itinerary affordances.
> Collection: `travel`.

### 55.A — Guide & Story Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `travel-destination-guide` | Destination Guide (overview · sections) | pages | hard | [ ] |
| 2 | `travel-city-guide` | City Guide (neighborhoods · top spots) | pages | med | [ ] |
| 3 | `travel-story-feature` | Travel Story / Photo Essay (long-form) | pages | med | [ ] |
| 4 | `travel-itinerary` | Day-by-day Itinerary | pages | med | [ ] |
| 5 | `travel-listicle` | "Top 10 Places" listicle layout | pages | easy | [ ] |

### 55.B — Travel Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `travel-poi-card` | Point-of-interest card (photo · rating · map link) | ui-components | easy | [ ] |
| 7 | `travel-map-content` | Map + scrollable content split layout | ui-components | hard | [ ] |
| 8 | `travel-itinerary-timeline` | Itinerary timeline (per-day stops) | ui-components | med | [ ] |
| 9 | `travel-photo-gallery` | Destination photo gallery + lightbox | ui-components | med | [ ] |
| 10 | `travel-weather-widget` | Best-time / weather widget | ui-components | easy | [ ] |
| 11 | `travel-budget-bar` | Trip budget / cost indicator | ui-components | easy | [ ] |

### 55.C — Planning & Discovery

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 12 | `travel-explore` | Explore / Browse Destinations | pages | med | [ ] |
| 13 | `travel-trip-planner` | Trip Planner (save spots → itinerary) | pages | hard | [ ] |
| 14 | `travel-saved-trips` | Saved Trips / Wishlist | ui-components | easy | [ ] |

### 55.D — Editor / Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 15 | `travel-guide-editor` | Guide Editor (sections + POIs + map) | pages | med | [ ] |
| 16 | `travel-admin-dashboard` | Travel Site Dashboard (top guides · seasonality) | pages | med | [ ] |

### 55.E — Themed Travel Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `travel-landing-guidebook` | Classic Guidebook (Lonely-Planet) | Cream + teal + coral · friendly serif + sans · practical, trusty | med | [ ] |
| 18 | `travel-landing-luxury` | Luxury / Bespoke Travel | Ivory + bronze + deep green · elegant serif · refined, aspirational | hard | [ ] |
| 19 | `travel-landing-backpacker` | Backpacker / Budget | Bright sunset + denim + white · chunky sans · adventurous, youthful | med | [ ] |
| 20 | `travel-landing-natgeo` | National-Geographic-style | Black + signature yellow + white · bold serif · documentary, epic | hard | [ ] |
| 21 | `travel-landing-agency` | Travel Agency / Tour Operator | Sky blue + sand + orange · clean sans · inviting, conversion-focused | med | [ ] |

### Build order (Phase 55)

1. **Patterns first** — 6, 7, 8, 9 (POI card, map-content, itinerary, gallery).
2. **Guide core** — 1, 2, 4.
3. **Discovery / planning** — 12, 13, 5.
4. **Editor** — 15, 16.
5. **Landings** — 17 → 21.

---

## Phase 56 — Portfolio / Résumé Styles 🧑‍🎨 PLAN

> A **style collection** (like Phase 22) focused on personal sites — the same portfolio/résumé content reinterpreted across distinct aesthetics, plus the reusable building blocks every personal site needs.
>
> Naming convention: `port-<area>-<slug>`.
> Shared design language: per-style — these are deliberately divergent; the only shared rule is "single-person site, fast to copy-paste." Each style ships a full one-page portfolio.
> Collection: `portfolio`.

### 56.A — Portfolio Sections (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `port-hero-intro` | Hero / intro header variants | ui-components | easy | [ ] |
| 2 | `port-project-card` | Project / case-study card | ui-components | easy | [ ] |
| 3 | `port-work-grid` | Work / projects grid + filter | ui-components | med | [ ] |
| 4 | `port-about-bio` | About / bio block | ui-components | easy | [ ] |
| 5 | `port-experience-timeline` | Experience / résumé timeline | ui-components | easy | [ ] |
| 6 | `port-skills-cloud` | Skills / tools display | ui-components | easy | [ ] |
| 7 | `port-contact-cta` | Contact / hire-me CTA + form | ui-components | easy | [ ] |
| 8 | `port-testimonial` | Testimonial / recommendation block | ui-components | easy | [ ] |

### 56.B — Full Résumé / CV Layouts

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `port-resume-classic` | Classic one-column CV (print-ready) | pages | easy | [ ] |
| 10 | `port-resume-two-column` | Two-column CV (sidebar skills) | pages | med | [ ] |
| 11 | `port-resume-creative` | Creative / visual CV | pages | med | [ ] |

### 56.C — Themed Portfolio Styles (8 full one-pagers)

| # | Slug | Style | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 12 | `port-style-minimal` | Minimal / Swiss | White + ink + one accent · grotesque · restrained, confident | easy | [ ] |
| 13 | `port-style-editorial` | Editorial / Typographic | Cream + black · large serif · magazine-like, text-forward | med | [ ] |
| 14 | `port-style-brutalist` | Brutalist | Raw white + harsh borders + clashing accent · mono/sans · bold, anti-design | med | [ ] |
| 15 | `port-style-terminal` | Terminal / Dev | Black + green/amber · monospace · hacker, CLI aesthetic | easy | [ ] |
| 16 | `port-style-motion` | Motion-Heavy | Dark + gradient · display · animation-first, kinetic | hard | [ ] |
| 17 | `port-style-3d-interactive` | 3D / Interactive | Dark + neon · display · immersive, WebGL-feel (CSS 3D) | hard | [ ] |
| 18 | `port-style-glass` | Glassmorphism | Gradient bg + frosted cards · clean sans · modern, layered | med | [ ] |
| 19 | `port-style-playful` | Playful / Illustrated | Bright + hand-drawn accents · rounded display · friendly, characterful | med | [ ] |

### Build order (Phase 56)

1. **Sections first** — 1, 2, 3, 4, 5, 7 (the shared section toolkit).
2. **Résumés** — 9, 10, 11.
3. **Styles** — 12 → 19 (compose from 56.A sections, restyled per aesthetic).

> Note: Phase 56 is a **style collection** (Phase-22 model), not a vertical bundle — no ops/admin side. The 56.A sections are authored once and re-skinned across the 56.C styles.

---

## Vertical Theme Bundles — continued (Phases 57–60) 🧭 PLAN

> Extends the 28–35 vertical-bundle family. Same template: end-to-end coverage across customer-facing, ops/staff, marketing, and admin, with a `*.E`/`*.F` themed-landing sub-section of 5 variants. Conventions identical to the "Vertical Theme Bundles (Phases 28–35)" header above (naming, categories, schema slug, interactive-by-default).

---

## Phase 57 — E-commerce / Retail Theme 🛒 PLAN

> Full storefront stack — product discovery, PDP, cart/checkout, account, plus merchant/seller admin and themed store landings (fashion, electronics, grocery, marketplace, luxury boutique).
>
> Naming convention: `shop-<area>-<slug>`.
> Shared design language: clean white + ink + brand accent · clear sans · large product photography · prominent price/CTA · trust signals (reviews, badges, secure checkout).
> Collection: `ecommerce`.
> Note: Phase 12/24 shipped isolated commerce pages; Phase 57 unifies them into a coherent themed bundle with shared tokens + the missing seller/admin side.

### 57.A — Shopper / Customer Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `shop-home` | Storefront Home (hero · collections · deals) | pages | med | [ ] |
| 2 | `shop-category` | Category / PLP (filters · sort · grid) | pages | hard | [ ] |
| 3 | `shop-product-detail` | Product Detail (gallery · variants · reviews) | pages | hard | [ ] |
| 4 | `shop-cart` | Cart / Bag (qty · promo · summary) | pages | med | [ ] |
| 5 | `shop-checkout` | Checkout (shipping · pay · review) | pages | hard | [ ] |
| 6 | `shop-order-confirmation` | Order Confirmation / Thank-you | pages | easy | [ ] |
| 7 | `shop-account` | Account (orders · addresses · returns) | pages | med | [ ] |
| 8 | `shop-wishlist` | Wishlist / Saved items | ui-components | easy | [ ] |
| 9 | `shop-search-results` | Search Results (autocomplete · facets) | pages | med | [ ] |

### 57.B — Commerce Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 10 | `shop-product-card` | Product card (price · rating · quick-add) | ui-components | easy | [ ] |
| 11 | `shop-variant-picker` | Variant selector (size · color swatches) | ui-components | med | [ ] |
| 12 | `shop-mini-cart` | Mini-cart flyout / drawer | ui-components | med | [ ] |
| 13 | `shop-price-display` | Price + discount + installment display | ui-components | easy | [ ] |
| 14 | `shop-filter-rail` | Faceted filter sidebar | ui-components | med | [ ] |
| 15 | `shop-reviews-block` | Reviews + rating breakdown | ui-components | med | [ ] |
| 16 | `shop-promo-banner` | Promo / countdown sale banner | ui-components | easy | [ ] |

### 57.C — Marketing Pages

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `shop-page-collection` | Collection / Lookbook page | pages | med | [ ] |
| 18 | `shop-page-sale` | Sale / Deals landing | pages | easy | [ ] |
| 19 | `shop-page-brand-story` | Brand Story / About | pages | easy | [ ] |

### 57.D — Seller / Merchant Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 20 | `shop-admin-dashboard` | Store Dashboard (sales · AOV · conversion) | pages | hard | [ ] |
| 21 | `shop-admin-products` | Product Manager (CRUD · inventory) | pages | hard | [ ] |
| 22 | `shop-admin-orders` | Orders Manager (fulfill · refund) | pages | med | [ ] |
| 23 | `shop-admin-discounts` | Discounts / Promo Codes | ui-components | med | [ ] |

### 57.E — Themed Store Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 24 | `shop-landing-fashion` | Fashion / Apparel | White + black + editorial accent · couture serif + sans · aspirational | hard | [ ] |
| 25 | `shop-landing-electronics` | Electronics / Tech | Dark + electric blue · clean sans · spec-forward, modern | med | [ ] |
| 26 | `shop-landing-grocery` | Grocery / Essentials | White + fresh green + orange · friendly sans · fast, practical | med | [ ] |
| 27 | `shop-landing-marketplace` | Multi-vendor Marketplace | White + bold primary · dense sans · busy, deal-driven | hard | [ ] |
| 28 | `shop-landing-luxury` | Luxury Boutique | Black + champagne + ivory · refined serif · exclusive, minimal | hard | [ ] |

### Build order (Phase 57)

1. **Patterns first** — 10, 11, 12, 13, 14 (cards, variants, cart, price, filters).
2. **Funnel core** — 2, 3, 4, 5, 6.
3. **Account / search** — 7, 8, 9.
4. **Admin** — 20, 21, 22, 23.
5. **Landings** — 24 → 28.

---

## Phase 58 — SaaS Product Theme ☁️ PLAN

> Complete SaaS surface — marketing site, app shell, onboarding, billing/subscription, settings, plus an internal admin and themed product landings (dev tool, productivity, analytics, AI product, fintech SaaS).
>
> Naming convention: `saas-<area>-<slug>`.
> Shared design language: modern + trustworthy · neutral surfaces + one product accent · clean sans · subtle depth · clear empty/loading states · light + dark parity.
> Collection: `saas`.
> Note: Phase 8/9/24 shipped admin/app components; Phase 58 assembles them into a full themed product (marketing → onboarding → app → billing).

### 58.A — Marketing Site

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `saas-landing-home` | SaaS Landing (hero · features · social proof) | pages | med | [ ] |
| 2 | `saas-features-page` | Features / Product Tour | pages | med | [ ] |
| 3 | `saas-pricing-page` | Pricing (tiers · toggle · FAQ) | pages | med | [ ] |
| 4 | `saas-integrations-page` | Integrations Directory | pages | med | [ ] |
| 5 | `saas-changelog` | Changelog / What's New | pages | easy | [ ] |

### 58.B — App Shell & Onboarding

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `saas-app-shell` | App Shell (sidebar · topbar · content) | pages | hard | [ ] |
| 7 | `saas-onboarding-flow` | Onboarding Wizard (setup checklist) | pages | med | [ ] |
| 8 | `saas-empty-state` | First-run / empty workspace states | ui-components | easy | [ ] |
| 9 | `saas-dashboard-home` | App Dashboard / Home | pages | hard | [ ] |
| 10 | `saas-command-bar` | Global command bar (⌘K actions) | ui-components | med | [ ] |

### 58.C — Account, Billing & Settings

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `saas-settings-page` | Settings (profile · workspace · prefs) | pages | med | [ ] |
| 12 | `saas-billing-page` | Billing & Subscription (plan · invoices) | pages | med | [ ] |
| 13 | `saas-upgrade-modal` | Upgrade / plan-compare modal | ui-components | med | [ ] |
| 14 | `saas-team-members` | Team Members & Roles (invite · permissions) | pages | med | [ ] |
| 15 | `saas-api-keys` | API Keys & Webhooks | ui-components | med | [ ] |
| 16 | `saas-usage-meter` | Usage / quota meter | ui-components | easy | [ ] |

### 58.D — Internal Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `saas-admin-customers` | Customers / Accounts admin | pages | hard | [ ] |
| 18 | `saas-admin-metrics` | SaaS Metrics (MRR · churn · LTV) | pages | hard | [ ] |

### 58.E — Themed SaaS Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 19 | `saas-landing-devtool` | Developer Tool | Dark + terminal accent · sans + mono · technical, credible | med | [ ] |
| 20 | `saas-landing-productivity` | Productivity / Collaboration | White + friendly accent · clean sans · calm, organized | med | [ ] |
| 21 | `saas-landing-analytics` | Analytics / Data Platform | Dark + chart gradients · sans · insight-forward, dense | hard | [ ] |
| 22 | `saas-landing-ai` | AI Product | Black + iridescent gradient · modern sans · cutting-edge | hard | [ ] |
| 23 | `saas-landing-fintech` | Fintech SaaS | Navy + mint + white · precise sans · trustworthy, compliant | med | [ ] |

### Build order (Phase 58)

1. **Shell + patterns first** — 6, 8, 10, 16 (shell, empty states, command bar, usage).
2. **Acquisition** — 1, 2, 3.
3. **Activation** — 7, 9, 11.
4. **Monetization** — 12, 13, 14.
5. **Admin** — 17, 18.
6. **Landings** — 19 → 23.

---

## Phase 59 — Crypto / Web3 Theme 🪙 PLAN

> Web3 app surfaces — wallet, token swap, NFT marketplace, staking/DeFi, DAO governance, plus themed landings (exchange, DeFi protocol, NFT project, L1/L2 chain, wallet app).
>
> Naming convention: `web3-<area>-<slug>`.
> Shared design language: dark-first + neon/gradient accents · geometric sans + mono for addresses/numbers · glow + glass surfaces · real-time number animation · clear risk/confirm states.
> Collection: `web3`.
> Note: Builds on `lgc-65-nft-marketplace` (concept page) — Phase 59 is the full functional app bundle.

### 59.A — Wallet & Trading

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `web3-wallet-dashboard` | Wallet Dashboard (balances · tokens · NFTs) | pages | hard | [ ] |
| 2 | `web3-token-swap` | Token Swap (from/to · slippage · route) | pages | hard | [ ] |
| 3 | `web3-send-receive` | Send / Receive (address · QR · confirm) | ui-components | med | [ ] |
| 4 | `web3-tx-history` | Transaction History (status · explorer link) | ui-components | med | [ ] |
| 5 | `web3-portfolio-chart` | Portfolio value chart (PnL) | ui-components | med | [ ] |

### 59.B — Web3 Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `web3-connect-wallet` | Connect Wallet button + modal | ui-components | med | [ ] |
| 7 | `web3-address-chip` | Address chip (truncate · copy · ENS) | ui-components | easy | [ ] |
| 8 | `web3-tx-confirm` | Transaction confirm / signing sheet | ui-components | med | [ ] |
| 9 | `web3-gas-selector` | Gas / network fee selector | ui-components | med | [ ] |
| 10 | `web3-token-row` | Token balance row (price · 24h · value) | ui-components | easy | [ ] |
| 11 | `web3-network-switch` | Network / chain switcher | ui-components | easy | [ ] |

### 59.C — NFT · DeFi · DAO

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 12 | `web3-nft-marketplace` | NFT Marketplace (grid · filters · bid) | pages | hard | [ ] |
| 13 | `web3-nft-detail` | NFT Detail (traits · history · buy) | pages | med | [ ] |
| 14 | `web3-staking` | Staking / Yield (APR · stake · claim) | pages | hard | [ ] |
| 15 | `web3-liquidity-pool` | Liquidity Pool / Provide LP | ui-components | hard | [ ] |
| 16 | `web3-dao-governance` | DAO Governance (proposals · vote) | pages | med | [ ] |

### 59.D — Themed Web3 Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 17 | `web3-landing-exchange` | Crypto Exchange / CEX | Black + green/red · clean sans + mono · data-dense, trustworthy | hard | [ ] |
| 18 | `web3-landing-defi` | DeFi Protocol | Dark + neon gradient · geometric sans · futuristic, techy | hard | [ ] |
| 19 | `web3-landing-nft` | NFT Project / Collection | Bold themed + glow · display · hype, community | med | [ ] |
| 20 | `web3-landing-chain` | L1 / L2 Blockchain | Deep space + signature accent · modern sans · visionary, technical | hard | [ ] |
| 21 | `web3-landing-wallet` | Wallet App | Clean dark + friendly accent · rounded sans · approachable, secure | med | [ ] |

### Build order (Phase 59)

1. **Patterns first** — 6, 7, 8, 9, 10 (connect, address, confirm, gas, token row).
2. **Wallet core** — 1, 2, 3, 4.
3. **NFT / DeFi / DAO** — 12, 13, 14, 16.
4. **Landings** — 17 → 21.

> Note: All Phase 59 resources are **UI-only simulations** — no real wallet connection, RPC, or on-chain calls. Mock data + clear "demo" framing.

---

## Phase 60 — Nonprofit / Charity Theme ❤️ PLAN

> Mission-driven org stack — donation flows, campaign pages, volunteer portal, impact reporting, plus themed landings (humanitarian NGO, animal welfare, environmental, education, religious/community).
>
> Naming convention: `ngo-<area>-<slug>`.
> Shared design language: warm + human · earthy/hopeful palette + one mission accent · approachable serif + sans · real photography of people/impact · prominent donate CTA · transparency (impact numbers).
> Collection: `nonprofit`.

### 60.A — Supporter / Public Side

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `ngo-home` | Nonprofit Home (mission · impact · donate) | pages | med | [ ] |
| 2 | `ngo-donate-flow` | Donation Flow (amount · frequency · pay) | pages | hard | [ ] |
| 3 | `ngo-campaign-page` | Campaign / Fundraiser (goal · progress) | pages | med | [ ] |
| 4 | `ngo-impact-report` | Impact Report (stats · stories) | pages | med | [ ] |
| 5 | `ngo-story-feature` | Story / Beneficiary Spotlight | pages | easy | [ ] |
| 6 | `ngo-events-page` | Events / Fundraiser Calendar | pages | easy | [ ] |

### 60.B — Nonprofit Patterns (reusable primitives)

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `ngo-donation-widget` | Donation amount widget (presets + custom) | ui-components | med | [ ] |
| 8 | `ngo-progress-thermometer` | Fundraising goal thermometer / bar | ui-components | easy | [ ] |
| 9 | `ngo-impact-stat` | Impact stat counter ("X meals served") | ui-components | easy | [ ] |
| 10 | `ngo-donor-wall` | Donor wall / recognition list | ui-components | easy | [ ] |
| 11 | `ngo-recurring-toggle` | One-time / monthly giving toggle | ui-components | easy | [ ] |
| 12 | `ngo-pledge-card` | Pledge / sponsorship card | ui-components | easy | [ ] |

### 60.C — Volunteer & Community

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 13 | `ngo-volunteer-signup` | Volunteer Signup / Opportunities | pages | med | [ ] |
| 14 | `ngo-volunteer-portal` | Volunteer Portal (shifts · hours) | pages | med | [ ] |
| 15 | `ngo-petition` | Petition / Pledge page | ui-components | easy | [ ] |

### 60.D — Admin

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 16 | `ngo-admin-donations` | Donations Dashboard (totals · recurring · trends) | pages | hard | [ ] |
| 17 | `ngo-admin-campaigns` | Campaign Manager (CRUD · goals) | pages | med | [ ] |
| 18 | `ngo-admin-volunteers` | Volunteer / Roster Manager | pages | med | [ ] |

### 60.E — Themed Nonprofit Landings (5 variants)

| # | Slug | Concept | Palette · Type · Mood | Difficulty | Status |
|---|---|---|---|---|---|
| 19 | `ngo-landing-humanitarian` | Humanitarian / Relief NGO | Warm sand + deep blue + red · humane serif + sans · urgent, hopeful | med | [ ] |
| 20 | `ngo-landing-animal` | Animal Welfare | Soft green + cream + warm orange · rounded sans · caring, friendly | med | [ ] |
| 21 | `ngo-landing-environmental` | Environmental / Climate | Forest + ocean + earth · clean sans · natural, activist | med | [ ] |
| 22 | `ngo-landing-education` | Education / Youth | Bright optimistic + white · friendly sans · uplifting, future-focused | med | [ ] |
| 23 | `ngo-landing-community` | Religious / Community Center | Warm neutrals + gold + accent · classic serif · welcoming, rooted | easy | [ ] |

### Build order (Phase 60)

1. **Patterns first** — 7, 8, 9, 11 (donation widget, thermometer, impact stat, recurring).
2. **Public core** — 1, 2, 3, 4.
3. **Volunteer** — 13, 14, 15.
4. **Admin** — 16, 17, 18.
5. **Landings** — 19 → 23.

---

## Pattern & System Collections (Phases 61–64) 🧭 PLAN

> A new family: cross-cutting **UX pattern libraries** (in the spirit of Phases 14, 16, 25) rather than themed bundles. Each phase exhaustively covers one pattern domain with many variants of the same problem, so users can copy the exact flavor they need. Mostly `ui-components`; some full `pages` where a pattern is page-level.
>
> Conventions: naming `<prefix>-<slug>`, vanilla `html/css/js`, interactive by default. No themed-landing sub-section (these aren't aesthetic collections) — instead each ships a **variants matrix**. Add collection slug to schema before authoring.

---

## Phase 61 — Onboarding & Empty States 🚀 PLAN

> Every first-run, activation, and zero-data surface — the moments that decide whether a user sticks. Tours, checklists, wizards, and the full range of empty/error/loading states.
>
> Naming convention: `onb-<slug>`.
> Collection: `patterns` (shared with 62–64; differentiate via `tags`).

### 61.A — Onboarding Flows

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `onb-welcome-modal` | Welcome / first-run modal | ui-components | easy | [ ] |
| 2 | `onb-setup-wizard` | Multi-step setup wizard | pages | med | [ ] |
| 3 | `onb-checklist` | Getting-started checklist (progress) | ui-components | med | [ ] |
| 4 | `onb-product-tour` | Spotlight product tour (coachmarks) | ui-components | hard | [ ] |
| 5 | `onb-tooltip-hints` | Contextual hint tooltips / beacons | ui-components | med | [ ] |
| 6 | `onb-progress-nudge` | Profile/setup completion nudge bar | ui-components | easy | [ ] |
| 7 | `onb-role-selector` | "What brings you here?" role/intent picker | ui-components | easy | [ ] |
| 8 | `onb-sample-data` | Sample-data / "try with demo" prompt | ui-components | easy | [ ] |

### 61.B — Empty, Zero-Data & Error States

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 9 | `onb-empty-first-use` | First-use empty state (CTA to create) | ui-components | easy | [ ] |
| 10 | `onb-empty-no-results` | No-search-results empty state | ui-components | easy | [ ] |
| 11 | `onb-empty-cleared` | All-done / inbox-zero state | ui-components | easy | [ ] |
| 12 | `onb-error-state` | Error / something-went-wrong state | ui-components | easy | [ ] |
| 13 | `onb-permission-state` | No-access / permission-required state | ui-components | easy | [ ] |
| 14 | `onb-loading-states` | Skeleton + spinner + progressive load set | ui-components | med | [ ] |

### 61.C — Variants matrix

> Each pattern ships variants where relevant: **illustration vs icon vs minimal**, **light/dark**, **inline vs full-page**, **dismissible vs persistent**. Document which variants each slug includes.

### Build order (Phase 61)

1. **Empty states** — 9, 10, 11, 12, 14 (highest reuse).
2. **Onboarding core** — 1, 2, 3.
3. **Guidance** — 4, 5, 6.
4. **Variants pass** — fill matrix across 61.A/61.B.

---

## Phase 62 — Pricing & Paywall 💰 PLAN

> The complete monetization-surface toolkit — every pricing table, plan comparison, paywall, upsell, trial, and checkout-nudge variant.
>
> Naming convention: `pay-<slug>`.
> Collection: `patterns`.

### 62.A — Pricing Tables

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `pay-pricing-3tier` | Classic 3-tier pricing | ui-components | easy | [ ] |
| 2 | `pay-pricing-toggle` | Monthly/annual toggle pricing | ui-components | med | [ ] |
| 3 | `pay-pricing-slider` | Usage-slider pricing (price scales) | ui-components | hard | [ ] |
| 4 | `pay-pricing-compare` | Feature comparison matrix | ui-components | med | [ ] |
| 5 | `pay-pricing-single` | Single-plan / one-price layout | ui-components | easy | [ ] |
| 6 | `pay-pricing-enterprise` | Tiers + "Contact sales" enterprise card | ui-components | easy | [ ] |

### 62.B — Paywalls & Gates

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `pay-paywall-hard` | Hard paywall (full block) | ui-components | easy | [ ] |
| 8 | `pay-paywall-soft` | Soft / metered paywall (fade + count) | ui-components | med | [ ] |
| 9 | `pay-paywall-blur` | Blur-locked premium content | ui-components | easy | [ ] |
| 10 | `pay-feature-gate` | Inline feature-locked gate (pro badge) | ui-components | easy | [ ] |

### 62.C — Upsell, Trial & Nudges

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `pay-upgrade-modal` | Upgrade modal (plan compare) | ui-components | med | [ ] |
| 12 | `pay-trial-banner` | Trial countdown / "X days left" banner | ui-components | easy | [ ] |
| 13 | `pay-usage-limit` | Usage-limit reached prompt | ui-components | easy | [ ] |
| 14 | `pay-addon-upsell` | Add-on / cross-sell at checkout | ui-components | med | [ ] |
| 15 | `pay-discount-offer` | Win-back / discount offer modal | ui-components | easy | [ ] |
| 16 | `pay-cancel-flow` | Cancellation / downgrade retention flow | pages | med | [ ] |

### 62.D — Variants matrix

> Variants: **B2C vs B2B framing**, **light/dark**, **highlighted "most popular" tier**, **currency/locale**, **with/without testimonials & FAQ**.

### Build order (Phase 62)

1. **Pricing tables** — 1, 2, 4.
2. **Paywalls** — 7, 8, 9, 10.
3. **Upsell / lifecycle** — 11, 12, 13, 16.
4. **Variants pass** — fill matrix.

---

## Phase 63 — Form Patterns 📝 PLAN

> Beyond single inputs (covered in Phases 6/7) — the hard parts of forms: multi-step, conditional logic, validation, autosave, and complex composite inputs.
>
> Naming convention: `form-<slug>`.
> Collection: `patterns`.

### 63.A — Form Structures

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `form-multi-step` | Multi-step form (progress + back/next) | ui-components | med | [ ] |
| 2 | `form-wizard-branching` | Branching wizard (conditional steps) | ui-components | hard | [ ] |
| 3 | `form-sectioned-long` | Long sectioned form (sticky nav) | ui-components | med | [ ] |
| 4 | `form-inline-edit` | Inline edit / edit-in-place | ui-components | med | [ ] |
| 5 | `form-repeatable-rows` | Repeatable field rows (add/remove) | ui-components | med | [ ] |

### 63.B — Validation & Feedback

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 6 | `form-inline-validation` | Real-time inline validation | ui-components | med | [ ] |
| 7 | `form-error-summary` | Top error summary + jump-to-field | ui-components | med | [ ] |
| 8 | `form-password-strength` | Password strength + rules checklist | ui-components | easy | [ ] |
| 9 | `form-async-validation` | Async availability check (username/email) | ui-components | med | [ ] |
| 10 | `form-success-feedback` | Submit success / confirmation states | ui-components | easy | [ ] |

### 63.C — State & Complex Inputs

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 11 | `form-autosave-draft` | Autosave + "saved" indicator + restore | ui-components | med | [ ] |
| 12 | `form-conditional-fields` | Conditional show/hide fields | ui-components | med | [ ] |
| 13 | `form-dependent-selects` | Dependent / cascading selects | ui-components | med | [ ] |
| 14 | `form-address-input` | Smart address input (autocomplete) | ui-components | med | [ ] |
| 15 | `form-payment-input` | Card / payment input group | ui-components | med | [ ] |
| 16 | `form-unsaved-guard` | Unsaved-changes leave guard | ui-components | easy | [ ] |

### 63.D — Variants matrix

> Variants: **inline vs modal vs full-page**, **light/dark**, **optimistic vs blocking submit**, **mobile-stacked vs desktop-grid**.

### Build order (Phase 63)

1. **Validation core** — 6, 7, 8, 10.
2. **Structures** — 1, 3, 5.
3. **State / complex** — 11, 12, 16, 14, 15.
4. **Variants pass** — fill matrix.

---

## Phase 64 — Dashboard Layouts 📊 PLAN

> The shells and composition patterns for data-dense apps — bento grids, command centers, analytics layouts, and configurable widget systems. Composes the charts/metrics from Phase 10.
>
> Naming convention: `dash-<slug>`.
> Collection: `patterns`.

### 64.A — Layout Shells

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 1 | `dash-bento-grid` | Bento-grid dashboard | pages | med | [ ] |
| 2 | `dash-analytics-shell` | Analytics layout (filters + grid) | pages | hard | [ ] |
| 3 | `dash-command-center` | Ops command center (live tiles) | pages | hard | [ ] |
| 4 | `dash-single-metric` | Single-KPI focus dashboard | pages | easy | [ ] |
| 5 | `dash-multi-tab` | Tabbed / sectioned dashboard | pages | med | [ ] |
| 6 | `dash-sidebar-detail` | List + detail (master-detail) layout | pages | med | [ ] |

### 64.B — Widget & Composition Patterns

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 7 | `dash-widget-card` | Resizable widget card frame | ui-components | med | [ ] |
| 8 | `dash-draggable-grid` | Drag-rearrange widget grid | ui-components | hard | [ ] |
| 9 | `dash-stat-row` | KPI / stat row (with trends) | ui-components | easy | [ ] |
| 10 | `dash-filter-bar` | Global filter + date-range bar | ui-components | med | [ ] |
| 11 | `dash-widget-picker` | Add-widget / customize panel | ui-components | med | [ ] |
| 12 | `dash-empty-widget` | Empty / loading widget states | ui-components | easy | [ ] |

### 64.C — Specialized Dashboards

| # | Slug | Title | Category | Difficulty | Status |
|---|---|---|---|---|---|
| 13 | `dash-realtime-monitor` | Real-time monitoring (live updates) | pages | hard | [ ] |
| 14 | `dash-finance` | Finance dashboard (P&L · cashflow) | pages | hard | [ ] |
| 15 | `dash-marketing` | Marketing dashboard (funnels · channels) | pages | med | [ ] |
| 16 | `dash-mobile` | Mobile-first dashboard layout | pages | med | [ ] |

### 64.D — Variants matrix

> Variants: **light/dark**, **fixed vs customizable**, **density (comfortable/compact)**, **sidebar vs topbar nav**. Reuses Phase 10 charts (`chart-*`, `kpi-card`, `sparkline`, `gauge-meter`) as widget content.

### Build order (Phase 64)

1. **Widget patterns first** — 7, 9, 10, 12 (card, stat row, filter bar, empty).
2. **Shells** — 1, 2, 6.
3. **Specialized** — 13, 14, 16.
4. **Customization** — 8, 11.
5. **Variants pass** — fill matrix.

---

## Phase index (planned families) 🗂️

> Quick map of the planned/future phase families for navigation. ✅ = shipped phases tracked in their own sections above.

| Family | Phases | Theme |
|---|---|---|
| Vertical bundles (I) | 28–35 | Hotel · Clinic · Gym · Salon · Real Estate · Airline · Coworking · Auto |
| Backlog (unscoped) | 36–45 | Banking · LMS · Ticketing · Streaming · Job Board · Delivery · Agency · Creator · D2C · AI Product |
| Editorial & content (I) | 46–49 | Newspaper/Magazine · Science · Museum · Game Dev |
| Editorial & content (II) | 50–56 | Comics/Manga · Cookbook · Music · Wiki/Docs · Children's · Travel · Portfolio styles |
| Vertical bundles (II) | 57–60 | E-commerce · SaaS · Crypto/Web3 · Nonprofit |
| Pattern & system collections | 61–64 | Onboarding/Empty · Pricing/Paywall · Forms · Dashboards |

