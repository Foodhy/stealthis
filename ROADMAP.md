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
