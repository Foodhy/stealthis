// ===========================================================================
// Workflow — Phase 53 (Wiki / Knowledge Base / Docs Theme) — 23 resources
// ===========================================================================
export const meta = {
  name: 'wiki-phase53-finish',
  description: 'Generate the 23 Phase 53 wiki/KB resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'wiki'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Google Font via <link>: "Inter" (UI/body, weights 400;500;600;700;800), "Lora" or "Source Serif 4"
  (article body serif — pick one and link it), and "JetBrains Mono" (code/mono). Use the serif for
  long-form article prose, Inter for UI/nav/chrome, mono for code and keyboard hints.
- Default palette in :root (clean white knowledge-base look) —
  --bg:#ffffff; --bg-2:#f7f8fa; --panel:#ffffff; --ink:#1a1a1f; --ink-2:#3a3a42;
  --muted:#6b7280; --line:rgba(20,20,30,0.10); --line-2:rgba(20,20,30,0.18);
  --link:#2563eb; --link-hover:#1d4ed8; --accent:#2563eb;
  --note:#2563eb; --tip:#16a34a; --warn:#d97706; --danger:#dc2626;
  --code-bg:#f4f4f6; --kbd-bg:#eceef2;
  radii: --r-sm:6px --r-md:10px --r-lg:14px; soft 1px borders (var(--line)), subtle shadows only.
- Wiki/docs core conventions: persistent left sidebar nav, readable centered body column
  (max-width ~720-760px for prose), right-rail TOC where relevant, high information density but
  clean — generous line-height (1.65 for prose), clear heading hierarchy, link-blue inline links,
  code blocks with mono + --code-bg, inline <code>, <kbd> keyboard hints, tables, blockquotes.
- box-sizing border-box reset, antialiased, --bg page background, --ink body text.
- Accessible: semantic landmarks (nav/main/aside), aria where relevant, WCAG AA contrast,
  keyboard-usable controls, visible focus rings.
- Responsive: works down to ~360px (sidebar collapses to a toggle/drawer; add @media (max-width:820px)
  and @media (max-width:520px) sections).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional article/product names (e.g. "Aurora DB", "the Verdant Empire",
  "Project Nimbus"). Real-feeling encyclopedic / technical content, no lorem ipsum.`

const DISCLAIMER = '> Illustrative UI only — fictional articles, products, and data.'

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (fill description yourself), then the prose body:

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
createdAt: 2026-06-08
updatedAt: 2026-06-08
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Wiki / Knowledge Base / Docs collection. It must be self-contained, polished, and visually distinctive — a clean, dense, readable knowledge-base aesthetic, not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling encyclopedic/technical content, multiple sections/rows/articles, clear typographic hierarchy, working links/anchors, hover/active/focus states, smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 53.B — Knowledge Patterns (primitives first)
  { slug: 'wiki-infobox', title: 'Wiki — Infobox / Fact Sidebar Card', category: 'ui-components', difficulty: 'easy', tags: 'infobox, sidebar',
    build: 'A Wikipedia-style infobox: a right-floated fact card for an article (e.g. a country, species, or software). Title header, a representative CSS-drawn thumbnail/emblem block, then label/value rows grouped by section (Overview, Details, Links) with subtle row dividers, small footnote superscripts, and an external-links row. JS: a collapse/expand toggle for each section, a "show more fields" expander, and copy-permalink on the title. Clean ink-on-white, link-blue values.' },
  { slug: 'wiki-toc-sidebar', title: 'Wiki — Sticky TOC + Scrollspy', category: 'ui-components', difficulty: 'med', tags: 'toc, scrollspy',
    build: 'A sticky right-rail table-of-contents with scrollspy. A column of long-form article sections (h2/h3) on the left; a sticky TOC on the right listing nested anchors. As the user scrolls, the active section highlights and the TOC auto-scrolls to keep it visible; a small progress indicator bar tracks reading position. Clicking a TOC item smooth-scrolls to the section. JS uses IntersectionObserver for scrollspy. Collapses above the article on narrow screens.' },
  { slug: 'wiki-doc-sidebar-nav', title: 'Wiki — Collapsible Doc Tree Nav', category: 'ui-components', difficulty: 'med', tags: 'nav, sidebar, tree',
    build: 'A collapsible documentation tree sidebar (dev-docs style): nested sections (Getting Started, Guides, API, Reference) with expand/collapse chevrons, indented child links, an active/current-page highlight, and a sticky search/filter box at top that live-filters the tree. JS: expand/collapse nodes (with chevron rotation), persist open state in memory, live filter that auto-expands matching branches and highlights matches, and keyboard arrow navigation. Mobile: becomes a slide-in drawer.' },
  { slug: 'wiki-callout-admonition', title: 'Wiki — Callout / Admonition Blocks', category: 'ui-components', difficulty: 'easy', tags: 'callout, admonition',
    build: 'A set of callout / admonition blocks: Note (blue), Tip (green), Warning (amber), Danger (red), and Info — each with a left accent border, a tinted background, an icon (CSS/inline-SVG), a bold title, and body content (text, inline code, a list). Include a collapsible "details" admonition. JS: collapsible toggle for foldable callouts, a "copy" button on a code-containing callout, and a small live builder where the user picks a type + types a title to preview a callout. Clean docs aesthetic.' },
  { slug: 'wiki-version-switcher', title: 'Wiki — Version / Language Switcher', category: 'ui-components', difficulty: 'med', tags: 'version, switcher, dropdown',
    build: 'A docs version + language switcher cluster: a version dropdown (v3.2 latest / v3.1 / v2.x — with "latest" and "EOL" badges and a "you are viewing an old version" banner when not latest) and a language dropdown (English, Español, 日本語, …). Both are accessible custom dropdowns. JS: open/close with click + keyboard (arrows/enter/esc), selecting a version toggles the outdated-version warning banner, selecting a language updates a small demo string, and focus management is correct. Includes a sample doc header that the switchers sit in.' },
  { slug: 'wiki-edit-history', title: 'Wiki — Revision History / Diff View', category: 'ui-components', difficulty: 'med', tags: 'history, diff, revisions',
    build: 'A wiki revision-history + diff view: a list of revisions (timestamp, editor name + avatar, edit summary, +/- byte change, tags like "minor"/"revert") with radio selectors to pick two revisions to compare. Below, a side-by-side or inline diff panel showing added (green) and removed (red) lines for the selected pair. JS: selecting two revisions renders a simple precomputed line diff, toggle between inline and side-by-side, and a "restore this version" button with a toast. Clean MediaWiki-history aesthetic.' },
  { slug: 'wiki-reference-footnotes', title: 'Wiki — Footnotes / Citations Block', category: 'ui-components', difficulty: 'easy', tags: 'footnotes, citations',
    build: 'An article body with inline citation superscripts [1][2][3] linking to a numbered References section at the bottom. Hovering or clicking a superscript shows a small popover preview of the citation (author, title, source, year, link); clicking jumps to the reference and highlights it, with a back-arrow to return to the citation. The References list has formatted entries with external-link icons. JS: citation popovers, smooth scroll + highlight on jump, back-references, and a "copy citation" action.' },

  // 53.A — Article & Doc Layouts
  { slug: 'wiki-article', title: 'Wiki — Wiki Article (sidebar · TOC · body)', category: 'pages', difficulty: 'med', tags: 'article, layout',
    build: 'A full encyclopedia-style wiki article page: left sidebar nav (logo, search, nav links, language list), a wide centered article body with title + "From the Free Encyclopedia" subtitle, a right-floated infobox, lead paragraph, multiple h2/h3 sections with inline links, an image/figure block (CSS-drawn), a references section, and category footer chips. A right-rail sticky TOC with scrollspy. JS: TOC scrollspy + smooth scroll, infobox section collapse, a [edit] link per section (decorative), search box filter, and sidebar drawer on mobile. Authoritative, dense, fictional encyclopedic content.' },
  { slug: 'wiki-doc-page', title: 'Wiki — Docs Page (dev-docs layout + code)', category: 'pages', difficulty: 'med', tags: 'docs, layout, code',
    build: 'A developer-docs page (Stripe/Tailwind docs vibe): three-column layout — collapsible doc tree nav (left), main content (center) with breadcrumbs, title, prose, callouts, and syntax-highlighted-looking code blocks with a copy button and a multi-language tab switcher (curl/JS/Python), and a right TOC (center-right). A light/dark theme toggle in the header. JS: code copy + toast, language tabs, theme toggle (persists), TOC scrollspy, and nav tree collapse. Clean, technical, mono accents.' },
  { slug: 'wiki-category-page', title: 'Wiki — Category / Portal Page', category: 'pages', difficulty: 'easy', tags: 'category, portal',
    build: 'A wiki category / portal page: a header with the category name + description and article count, an A–Z alphabetical jump bar, then articles grouped under letter headings in multi-column lists, plus a "subcategories" grid of linked category tiles and a "featured article" highlight card. JS: the A–Z bar smooth-scrolls/filters to a letter group, a search box live-filters the article lists, and a toggle between "list" and "grid" density. Clean, dense, library-catalog feel.' },
  { slug: 'wiki-api-reference', title: 'Wiki — API Reference (endpoints · params)', category: 'pages', difficulty: 'hard', tags: 'api, reference, code',
    build: 'A REST API reference page (like Stripe/Twilio docs): left nav of resources/endpoints; main column with an endpoint block — HTTP method badge (GET/POST/DELETE) + path, description, a parameters table (name, type, required, description), and a responses section with status badges. A sticky right "code panel" showing a request example with language tabs (curl/JS/Python) and a sample JSON response with collapsible nodes. JS: language tabs, copy buttons, collapsible JSON tree, param "required" filter toggle, and anchored deep-links per endpoint with TOC scrollspy.' },
  { slug: 'wiki-tutorial-page', title: 'Wiki — Tutorial / Guide (step sections)', category: 'pages', difficulty: 'med', tags: 'tutorial, guide, steps',
    build: 'A step-by-step tutorial/guide page: a header with title, est. time, difficulty, and a prerequisites callout; a vertical numbered step list where each step has a heading, prose, a code block with copy, and a "mark complete" checkbox; a sticky progress sidebar showing step completion (e.g. 3/7) with clickable step links and a progress ring. A "next guide" CTA at the end. JS: per-step complete toggles update the progress ring + sidebar, smooth-scroll to step on sidebar click, code copy, and a collapsible "show solution" per step.' },

  // 53.C — Search & Navigation
  { slug: 'wiki-search-results', title: 'Wiki — Search Results (faceted)', category: 'pages', difficulty: 'med', tags: 'search, results, faceted',
    build: 'A faceted knowledge-base search results page: a top search bar with the active query and result count, a left facet rail (filters by type: Article/Doc/API/Tutorial, by section, by date, with checkboxes + counts), and a results list of cards (title with highlighted query matches, breadcrumb path, snippet with bolded terms, type badge, last-updated). Sort dropdown (Relevance/Newest). JS: facet checkboxes filter the list live (updating counts), sort, query-term highlighting, an active-filters chip row with clear-all, and a no-results empty state.' },
  { slug: 'wiki-command-search', title: 'Wiki — Command-K Instant Search Overlay', category: 'ui-components', difficulty: 'med', tags: 'search, command-k, overlay',
    build: 'A Command-K / Ctrl-K instant-search command palette overlay: pressing ⌘K (or clicking a "Search docs… ⌘K" trigger) opens a centered modal with a search input, live-filtered grouped results (Pages, API, Recent, Actions) with icons, keyboard-highlighted active row, and a footer with kbd hints (↑↓ navigate, ↵ open, esc close). JS: open/close on ⌘K + esc + backdrop click, fully keyboard-navigable (arrows wrap, enter "opens" with a toast), live fuzzy-ish filtering, recent-searches memory, and a focus trap. Polished, fast-feeling.' },
  { slug: 'wiki-breadcrumb-trail', title: 'Wiki — Breadcrumb + Related Links', category: 'ui-components', difficulty: 'easy', tags: 'breadcrumb, related, nav',
    build: 'A breadcrumb trail + related-links cluster for a deep doc page: a breadcrumb (Home › Guides › Authentication › OAuth 2.0) where intermediate crumbs are links and the last is current, with a collapsing middle ("…") when too long, and a dropdown on a crumb to switch siblings. Below, a "Related articles" card list and prev/next pager (← previous page / next page →) with titles. JS: the collapsed-crumb expander, the sibling-switch dropdown (keyboard accessible), and hover states. Clean docs styling.' },
  { slug: 'wiki-home-portal', title: 'Wiki — Knowledge-Base Home / Portal', category: 'pages', difficulty: 'med', tags: 'home, portal, landing',
    build: 'A knowledge-base home/portal page: a hero with a big central search bar ("How can we help?") and popular-search chips, a grid of topic/category cards (icon, title, description, article count), a "popular articles" list, a "getting started" path strip, and a contact/support footer band. JS: the hero search live-filters/previews matching topics in a dropdown, category cards hover-lift, and chips run a demo search. Welcoming, clean, well-organized portal aesthetic.' },

  // 53.D — Editor / Admin
  { slug: 'wiki-editor', title: 'Wiki — Article Editor (markdown + preview)', category: 'pages', difficulty: 'hard', tags: 'editor, markdown, preview',
    build: 'A wiki/markdown article editor: a toolbar (bold, italic, heading, link, code, list, quote, image), a split-pane with a markdown textarea on the left and a live-rendered preview on the right, a metadata bar (title, edit summary, tags), and a footer with word count, "save draft" and "publish" buttons. JS: a real (small) markdown-to-HTML renderer updating the preview live as you type, toolbar buttons that insert/wrap markdown at the selection, synced scroll between panes, a toggle for split/write/preview modes, and unsaved-changes indicator. Genuinely functional editor.' },
  { slug: 'wiki-admin-dashboard', title: 'Wiki — KB Dashboard (top articles · stale flags)', category: 'pages', difficulty: 'med', tags: 'dashboard, admin, analytics',
    build: 'A knowledge-base admin dashboard: KPI stat cards (total articles, monthly views, avg helpfulness %, stale articles) with trend deltas, a CSS/SVG chart of views/searches over time with a 7d/30d/90d range toggle, a "top articles" table (title, views, helpful %, last updated), a "needs attention" panel flagging stale/low-rated/broken-link articles, and a recent-edits activity feed. JS: range toggle re-renders the chart, sortable tables, animated count-up KPIs, and dismiss/resolve on attention items. Clean admin docs aesthetic.' },

  // 53.E — Themed KB Landings (5 variants)
  { slug: 'wiki-landing-encyclopedia', title: 'Wiki — Encyclopedia Landing (Wikipedia-style)', category: 'pages', difficulty: 'med', tags: 'landing, encyclopedia',
    palette: 'Encyclopedia — white + ink + link blue, neutral serif body ("Source Serif 4" or "Lora") for the authoritative dense feel, Inter for chrome. --link:#3366cc (classic wiki blue). Dense, scholarly, restrained.',
    build: 'An encyclopedia home landing (Wikipedia main-page vibe): a welcome banner with article-count stat, a central search bar, a two-column "Featured article" + "Did you know / In the news" layout, a "Today\'s featured picture" card (CSS-drawn), a portals grid (Science, History, Geography, Arts…), and a languages footer band. JS: search preview dropdown, a rotating "featured article" / "did you know" fact, portal hover, and a date-stamped header. Dense, serif, authoritative, fictional encyclopedic content.' },
  { slug: 'wiki-landing-dev-docs', title: 'Wiki — Developer Docs Landing', category: 'pages', difficulty: 'med', tags: 'landing, dev-docs',
    palette: 'Developer docs — white/dark toggle, Inter + JetBrains Mono, a single product accent (--accent:#7c3aed violet or #2563eb). Clean, technical, code-forward. Support a real light/dark theme toggle.',
    build: 'A developer documentation landing/home (Stripe/Tailwind/Vercel docs vibe): hero with product name, tagline, a big "Search docs ⌘K" bar, and quick-start install code block with copy; a grid of "popular guides" and "by topic" cards with icons; a "languages/SDKs" strip of logos (CSS-drawn marks); a code sample showcase with language tabs; and a footer. A header light/dark theme toggle that actually switches the page theme. JS: theme toggle (persist), code copy + tabs, ⌘K demo overlay trigger, and card hover. Sharp, technical, mono accents.' },
  { slug: 'wiki-landing-fandom', title: 'Wiki — Fandom / Game Wiki Landing', category: 'pages', difficulty: 'med', tags: 'landing, fandom, gaming',
    palette: 'Fandom / game wiki — themed dark (--bg:#0f1014, --panel:#1a1c22, --ink:#e8e8ee) with a vivid accent (--accent:#f43f5e or #22d3ee), a display font ("Cinzel" or "Orbitron" for headings via link) + Inter body. Immersive, fan-driven, lore-rich.',
    build: 'An immersive fandom / game-wiki landing (Fandom.com vibe) for a fictional game universe ("Verdant Empire"): a dramatic dark hero with a CSS-drawn key-art scene + game title and a search bar, a "wiki stats" bar (pages, edits, active users), featured-lore cards (Characters, Factions, Locations, Items) with thumbnail panels, a "trending pages" list, a recent-activity feed, and a community/Discord band. JS: hero parallax/entrance, card hover-glow, a featured-character rotator, and the search preview. Dark, vivid, lore-immersive.' },
  { slug: 'wiki-landing-handbook', title: 'Wiki — Internal Company Handbook Landing', category: 'pages', difficulty: 'easy', tags: 'landing, handbook, internal',
    palette: 'Internal handbook — brand-neutral light (--bg-2:#f6f7f9) with one friendly brand accent (--accent:#0ea5e9 or a warm #f97316), friendly Inter sans throughout, rounded cards. Approachable, on-brand, calm.',
    build: 'An internal company-handbook home (Notion/GitLab-handbook vibe): a friendly welcome hero ("Welcome to the Acme Handbook") with a search bar and a personalized greeting, quick-link cards (Onboarding, Policies, Benefits, Engineering, People Ops), a "new this week" updates list, a "most viewed" pages list, and a "who to ask" contacts strip with CSS-drawn avatars. JS: search preview, collapsible quick-link sections, a greeting that changes by simulated time of day, and card hover. Warm, approachable, well-organized.' },
  { slug: 'wiki-landing-support', title: 'Wiki — Support / Help Center Landing', category: 'pages', difficulty: 'med', tags: 'landing, support, help-center',
    palette: 'Support / help center — white + a calm accent (--accent:#0d9488 teal or #2563eb), rounded sans (Inter), soft shadows, generous spacing. Reassuring, searchable, friendly.',
    build: 'A support / help-center landing (Zendesk/Intercom help-center vibe): a reassuring hero with a large "How can we help?" search bar and trending-question chips, a category grid (Getting Started, Billing, Account, Troubleshooting…) with icons + article counts, a "popular articles" / "FAQ accordion" section, a "still need help?" contact card row (chat, email, status page), and a footer. JS: hero search live-filters an article preview dropdown, the FAQ accordion expand/collapse, chip-driven demo searches, and a "was this helpful?" widget. Calm, friendly, easy to scan.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos de la colección "${COLLECTION}"…`)

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
