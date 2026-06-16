// ===========================================================================
// Phase 64 — Dashboard Layouts  (collection: patterns, prefix: dash-)
// ===========================================================================
export const meta = {
  name: 'dash-phase64-finish',
  description: 'Generate Phase 64 — Dashboard Layouts (16 resources, mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'un agente por recurso' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'patterns'

const STYLE = `DESIGN SYSTEM (match exactly unless told otherwise):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif.
- Neutral product-UI palette in :root —
  --brand:#5b5bf0; --brand-d:#4646d6; --brand-700:#3a3ab8; --brand-50:#eef0ff;
  --accent:#00b4a6; --accent-soft:#d8f5f2;
  --ink:#101322; --ink-2:#3a4060; --muted:#6c7393;
  --bg:#f6f7fb; --white:#ffffff; --surface:#ffffff;
  --line:rgba(16,19,34,0.1); --line-2:rgba(16,19,34,0.16);
  --ok:#2f9e6f; --warn:#d98a2b; --danger:#d4503e;
  radii: --r-sm:8px --r-md:14px --r-lg:20px; soft shadows (0 1px 2px / 0 8px 24px rgba(16,19,34,.08)).
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- CHARTS/DATA: render charts as inline SVG (bars, lines, donuts, sparklines) or pure CSS — NO chart libraries, NO <img>, NO canvas libs. KPI cards show value + delta (up/down arrow, --ok/--danger) + tiny sparkline.
- Dashboard chrome: sidebar or topbar nav, page header with title + filters/date-range, responsive grid of widget cards with headers and optional menu (⋯).
- Accessible: landmark roles (nav/main/header), aria where relevant, WCAG AA contrast, keyboard-usable controls, focus-visible.
- Responsive: collapses to single column / off-canvas nav by ~720px; works down to ~360px (add @media sections).
- Vanilla JS only (no frameworks/build). toast(msg) helper ok. Interactions must actually work (filters update tiles, tabs switch, live values tick, drag rearranges).
- Realistic but clearly fictional data (fictional company/metrics).`

const DISCLAIMER = ''

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (write a rich one-line description yourself), then a short prose body:

---
slug: ${s.slug}
title: "${s.title}"
description: "<ONE-LINE rich description, 55-90 words, no internal double-quotes>"
category: ${s.category}
type: ${type}
tags: ${tags}
tech: [html, css, vanilla-js]
difficulty: ${s.difficulty}
targets: [html]
collections: [${COLLECTION}]
labRoute: /${s.category}/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-13
updatedAt: 2026-06-13
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>${DISCLAIMER ? '\n\n' + DISCLAIMER : ''}`

  return `You are generating ONE production-quality static UI demo resource for a "Dashboard Layouts" library. It must be self-contained, polished, data-dense, and visually distinctive — not a generic placeholder. Charts are inline SVG/CSS only (no libraries).

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive grid.
3. ${dir}/snippets/script.js  — working vanilla JS interactions (filters/tabs/live/drag), no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: realistic KPIs with deltas and sparklines, multiple widget cards, at least one inline-SVG chart (bar/line/donut), clear visual hierarchy and spacing, hover/active/focus states, a working interaction (filter/date-range/tab/live tick/drag), and a responsive grid that collapses gracefully. No TODOs, no placeholder gray boxes, no lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 64.A — Layout Shells
  { slug: 'dash-bento-grid', title: 'Dashboard — Bento-grid layout', category: 'pages', difficulty: 'med', tags: 'bento, layout',
    build: 'A bento-style dashboard: a CSS-grid of mixed-size tiles (a large hero chart spanning 2x2, several KPI tiles, a list tile, a donut tile, an activity tile). Topbar with brand + user. Each tile is a card with header + content. JS: a refresh button re-rolls the demo numbers with a subtle count animation; tiles have hover lift. Grid reflows to fewer columns on smaller screens.' },
  { slug: 'dash-analytics-shell', title: 'Dashboard — Analytics layout (filters + grid)', category: 'pages', difficulty: 'hard', tags: 'analytics, filters',
    build: 'A full analytics shell: left sidebar nav, header with a date-range selector + segment filters (channel, region), then a KPI stat row, a big SVG line/area chart of a primary metric, and a grid of secondary charts (bar, donut, table). JS: changing the date range or filters recomputes all KPIs and redraws the charts from a fictional dataset (with a brief loading shimmer). Sidebar collapses on mobile.' },
  { slug: 'dash-command-center', title: 'Dashboard — Ops command center (live tiles)', category: 'pages', difficulty: 'hard', tags: 'command-center, live',
    build: 'A dark-friendly ops command center: a wall of status tiles (services up/down with colored dots), live throughput counters, a real-time SVG line chart that scrolls, an incident/alert feed, and a region map-ish grid. JS: setInterval ticks live values, occasionally flips a service to "degraded" pushing an alert into the feed, animates the streaming chart. Pause/resume control. aria-live for alerts.' },
  { slug: 'dash-single-metric', title: 'Dashboard — Single-KPI focus', category: 'pages', difficulty: 'easy', tags: 'single-metric, focus',
    build: 'A focused single-KPI dashboard: one huge headline number (e.g. MRR) with delta vs last period, a large SVG trend chart beneath, a period selector (7d/30d/90d), and a row of small supporting stats. JS: period buttons swap the headline number, delta, and redraw the trend line; number animates on change. Clean, lots of whitespace, one dominant metric.' },
  { slug: 'dash-multi-tab', title: 'Dashboard — Tabbed / sectioned', category: 'pages', difficulty: 'med', tags: 'tabs, sections',
    build: 'A dashboard with a tab bar (Overview / Traffic / Revenue / Users), each tab showing a different widget set (KPIs + charts). JS: ARIA tabs pattern (role=tablist/tab/tabpanel, arrow-key nav, aria-selected), switching tabs swaps panels with a fade; remembers last tab; lazy "loads" a panel with a shimmer the first time. Header persists across tabs.' },
  { slug: 'dash-sidebar-detail', title: 'Dashboard — List + detail (master-detail)', category: 'pages', difficulty: 'med', tags: 'master-detail, list',
    build: 'A master-detail layout: a left scrollable list of items (customers/orders with avatar, name, status badge, mini metric) and a right detail pane showing the selected item (header, KPI tiles, an activity timeline, an SVG chart). JS: clicking a list row selects it (highlight, aria-current) and populates the detail pane; keyboard up/down navigates; search filters the list. On mobile, selecting pushes a full-screen detail with a back button.' },

  // 64.B — Widget & Composition Patterns
  { slug: 'dash-widget-card', title: 'Widget — Resizable widget card frame', category: 'ui-components', difficulty: 'med', tags: 'widget, card',
    build: 'A reusable dashboard widget card frame: header with title, optional subtitle, a ⋯ menu (popover: Refresh / Expand / Remove), a body slot (show with a sample SVG chart), and a footer. A size toggle (S/M/L) changes the card span/height with smooth transition. JS: menu open/close + actions (refresh shows a spinner then new data, expand toggles a larger view), focus management. Show 2-3 instances in a grid.' },
  { slug: 'dash-draggable-grid', title: 'Widget — Drag-rearrange widget grid', category: 'ui-components', difficulty: 'hard', tags: 'drag, reorder',
    build: 'A grid of widget cards the user can reorder via drag-and-drop (HTML5 draggable or pointer events). Show a drag handle, a drop-placeholder/insertion indicator, smooth reflow, and persist the order to localStorage. Keyboard alternative: focus a card and use arrow keys to move it (announce via aria-live). A "Reset layout" button restores defaults. Each card holds a small chart/KPI.' },
  { slug: 'dash-stat-row', title: 'Widget — KPI / stat row (with trends)', category: 'ui-components', difficulty: 'easy', tags: 'kpi, stats',
    build: 'A responsive row of 4-5 KPI stat cards: label, big value, delta with up/down arrow colored --ok/--danger, "vs last period" caption, and a tiny inline SVG sparkline trending with the delta. JS: a period toggle (Today/Week/Month) updates all values, deltas, and sparklines with a count-up animation. Cards wrap to grid on mobile. Clean, copy-paste-ready KPI strip.' },
  { slug: 'dash-filter-bar', title: 'Widget — Global filter + date-range bar', category: 'ui-components', difficulty: 'med', tags: 'filters, date-range',
    build: 'A dashboard filter bar: a date-range control (presets Today/7d/30d/Custom with two date inputs), multi-select filter chips (channel, region, status) with a clear-all, and a search box. Selected filters render as removable chips; an "active filters" count shows. JS: applying filters updates a small results summary + a demo chart/table below; chips removable; state reflected in the bar. Sticky on scroll. Keyboard accessible.' },
  { slug: 'dash-widget-picker', title: 'Widget — Add-widget / customize panel', category: 'ui-components', difficulty: 'med', tags: 'customize, widget-picker',
    build: 'An "Add widget" / customize flow: a button opens a side panel or modal listing available widgets (KPI, line chart, table, activity, donut) as cards with icon + description and an Add toggle. Added widgets appear in the dashboard grid; a remove (x) takes them out. A search/filter of the catalog. JS: panel open/close, add/remove updates the live grid, empty-state when no widgets. Focus trap in the panel.' },
  { slug: 'dash-empty-widget', title: 'Widget — Empty / loading widget states', category: 'ui-components', difficulty: 'easy', tags: 'empty-state, loading',
    build: 'A showcase of widget states for one card type: Loading (skeleton shimmer), Empty ("No data yet" illustration + CTA), Error (retry button), and Loaded (real SVG chart + KPI). JS: a state switcher (segmented control) cycles the same widget through all four states, plus a "simulate load" that goes loading→loaded with a shimmer. Polished skeleton and empty illustration (inline SVG).' },

  // 64.C — Specialized Dashboards
  { slug: 'dash-realtime-monitor', title: 'Dashboard — Real-time monitoring', category: 'pages', difficulty: 'hard', tags: 'realtime, monitoring',
    build: 'A real-time monitoring dashboard: streaming SVG line charts (CPU/RAM/requests) that scroll left as new points arrive, live gauges, a rolling log/event stream, and status KPIs that tick. JS: setInterval pushes new data points and re-renders the charts smoothly, a Pause/Resume + speed control, threshold lines that flash a tile red when exceeded (aria-live alert). Connection indicator (live/reconnecting).' },
  { slug: 'dash-finance', title: 'Dashboard — Finance (P&L · cashflow)', category: 'pages', difficulty: 'hard', tags: 'finance, pnl',
    build: 'A finance dashboard: KPI row (Revenue, Expenses, Net profit, Cash balance with deltas), a P&L bar/waterfall SVG chart, a cashflow area chart, a budget-vs-actual progress list, and a recent-transactions table with category badges and +/- amounts colored. A period selector (month/quarter/year). JS: period switch recomputes KPIs + redraws charts + filters the table. Currency formatting. Fictional company.' },
  { slug: 'dash-marketing', title: 'Dashboard — Marketing (funnels · channels)', category: 'pages', difficulty: 'med', tags: 'marketing, funnel',
    build: 'A marketing dashboard: a conversion funnel (Visitors→Leads→Trials→Paid) as an SVG funnel with step conversion %, a channel-performance table/bar chart (Organic, Paid, Social, Email with spend/CAC/ROAS), a campaign list with status, and KPI cards (Sessions, Conversion rate, CAC, ROAS). JS: a channel filter + date range updates the funnel and tables; hover tooltips on funnel steps. Clean, colorful but on-palette.' },
  { slug: 'dash-mobile', title: 'Dashboard — Mobile-first layout', category: 'pages', difficulty: 'med', tags: 'mobile, responsive',
    build: 'A mobile-first dashboard (frame to a phone width, max ~420px content): a sticky top bar, a hero KPI card, horizontally swipeable/scrollable KPI chips, stacked widget cards (mini line chart, list, donut), and a fixed bottom tab bar (Home/Stats/Activity/Profile). JS: bottom-tab switching swaps the scroll view, a pull-to-refresh-like button re-rolls data, swipe/scroll snap on the chip row. Touch-friendly targets (44px). Scales up gracefully on desktop (centered phone frame).' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos "${COLLECTION}" (Phase 64 — Dashboard Layouts)…`)

const RESULT = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['slug', 'files'],
}

const results = await parallel(
  SPECS.map((s) => () =>
    agent(buildPrompt(s), {
      label: s.slug,
      phase: 'Generate',
      agentType: 'general-purpose',
      schema: RESULT,
    })
  )
)

const ok = results.filter(Boolean)
return {
  requested: SPECS.length,
  completed: ok.length,
  resources: ok.map((r) => ({ slug: r.slug, fileCount: (r.files || []).length })),
}
