// ===========================================================================
// Phase 61 — Onboarding & Empty States  (collection: patterns, prefix: onb-)
// ===========================================================================
export const meta = {
  name: 'onb-phase61-finish',
  description: 'Generate Phase 61 — Onboarding & Empty States (14 resources, mdx + html/css/js)',
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
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background, centered max-width container.
- Accessible: aria where relevant (role=dialog/aria-modal for modals, aria-live for dynamic counts), WCAG AA contrast, keyboard-usable buttons, focus-visible rings, Esc closes overlays.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Use simple inline SVG icons/illustrations (no external assets, no <img>).
- Realistic but clearly fictional names/data.`

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
createdAt: 2026-06-09
updatedAt: 2026-06-09
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI, its variants, and its interactions.>${DISCLAIMER ? '\n\n' + DISCLAIMER + '\n\n(The body MUST end with that exact disclaimer line.)' : ''}`

  return `You are generating ONE production-quality static UI demo resource for a product-patterns library. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}
VARIANTS: ${s.variants}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling data, clear hierarchy, hover/active/focus states, badges, smooth micro-interactions, a genuinely interactive script. Where variants are listed, render a small variant switcher (buttons/segmented control) so the demo shows each one live. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 61.B Empty / zero-data / error states (built first, highest reuse) ──
  {
    slug: 'onb-empty-first-use', title: 'Empty States — First-use empty state', category: 'ui-components', difficulty: 'easy',
    tags: 'onboarding, empty-state',
    build: 'A first-use empty state for a "Projects" list: centered illustration (inline SVG), headline "No projects yet", supportive subtext, a primary CTA "Create your first project" and a secondary "Import" link. Clicking the CTA reveals a quick inline create form / faux-created card with a toast.',
    variants: 'illustration vs icon vs minimal; inline (card) vs full-page',
  },
  {
    slug: 'onb-empty-no-results', title: 'Empty States — No-search-results state', category: 'ui-components', difficulty: 'easy',
    tags: 'empty-state, search',
    build: 'A search results panel with a live search input. When the typed query matches nothing in a small in-memory dataset, show a no-results empty state: magnifier illustration, "No results for “<query>”", suggestions (check spelling, remove filters), a "Clear search" button and clickable suggested queries that refill the input.',
    variants: 'with suggested queries vs minimal; with active-filter chips to clear',
  },
  {
    slug: 'onb-empty-cleared', title: 'Empty States — All-done / inbox-zero state', category: 'ui-components', difficulty: 'easy',
    tags: 'empty-state, inbox-zero',
    build: 'A task/inbox list where checking off the last item triggers a celebratory inbox-zero empty state (checkmark illustration, "You’re all caught up", confetti micro-animation via CSS/JS, a subtle next-action link). Include an "Undo" that restores items.',
    variants: 'celebratory vs calm/minimal; with next-action CTA vs none',
  },
  {
    slug: 'onb-error-state', title: 'Empty States — Something-went-wrong state', category: 'ui-components', difficulty: 'easy',
    tags: 'error-state, retry',
    build: 'A generic error state card for a failed data load: warning illustration, "Something went wrong", error detail line + faux error code, a "Try again" button that shows a loading spinner then resolves to a success state, and a "Contact support" secondary link.',
    variants: 'inline card vs full-page; generic 500 vs network-offline vs not-found framing (switcher)',
  },
  {
    slug: 'onb-permission-state', title: 'Empty States — No-access / permission-required state', category: 'ui-components', difficulty: 'easy',
    tags: 'permission, access-control',
    build: 'A permission-required / access-denied state: lock illustration, "You don’t have access to this page", explanation, a primary "Request access" button (opens a small confirm + toast "Request sent"), and a "Switch account" secondary action. Show requester avatar + the owner who must approve.',
    variants: 'no-access vs upgrade-required vs request-pending (switcher)',
  },
  {
    slug: 'onb-loading-states', title: 'Empty States — Skeleton + spinner + progressive load set', category: 'ui-components', difficulty: 'med',
    tags: 'loading, skeleton',
    build: 'A gallery of loading-state primitives shown side by side: shimmering skeleton cards (list + profile + table-row), a spinner button, a determinate progress bar, and a progressive/staggered content reveal. A "Reload" button replays all states from loading → loaded content.',
    variants: 'skeleton vs spinner vs progress-bar vs progressive reveal (all shown, toggle replay)',
  },
  // ── 61.A Onboarding core ──
  {
    slug: 'onb-welcome-modal', title: 'Onboarding — Welcome / first-run modal', category: 'ui-components', difficulty: 'easy',
    tags: 'onboarding, modal',
    build: 'A first-run welcome modal (role=dialog, aria-modal, focus trap, Esc + backdrop close) with product logo, a warm headline, 2-3 highlight bullets with icons, a primary "Get started" and a "Skip for now" link. A button on the page re-opens it; remember dismissal in a JS flag for the session.',
    variants: 'single-screen vs 2-step carousel; illustration header vs compact',
  },
  {
    slug: 'onb-setup-wizard', title: 'Onboarding — Multi-step setup wizard', category: 'pages', difficulty: 'med',
    tags: 'onboarding, wizard',
    build: 'A full-page multi-step setup wizard (e.g. 4 steps: Account → Workspace → Invite team → Done) with a progress stepper, Back/Next navigation, per-step form fields with basic validation gating Next, a review/summary on the last step, and a completion screen with confetti. Steps persist entered values when navigating back.',
    variants: 'horizontal stepper vs vertical sidebar steps; with progress % vs step count',
  },
  {
    slug: 'onb-checklist', title: 'Onboarding — Getting-started checklist (progress)', category: 'ui-components', difficulty: 'med',
    tags: 'onboarding, checklist',
    build: 'A getting-started checklist widget: 5 setup tasks each with title, helper text and an action button; checking one updates an overall progress ring/bar and percentage. Completed items collapse with a strike; a dismiss "X" hides the whole widget. Includes an expand/collapse toggle.',
    variants: 'progress ring vs bar; expanded card vs collapsed floating pill',
  },
  {
    slug: 'onb-product-tour', title: 'Onboarding — Spotlight product tour (coachmarks)', category: 'ui-components', difficulty: 'hard',
    tags: 'onboarding, tour, coachmarks',
    build: 'A spotlight product tour over a faux app UI: a dimmed overlay with a cut-out highlight around the current target element, a tooltip/coachmark bubble (title, body, "2 of 4", Back/Next/Skip) that repositions to each target as the user advances. Final step ends the tour and clears the overlay. Recompute highlight rect on resize.',
    variants: 'spotlight cut-out vs simple bordered highlight; bottom vs auto-placed tooltip',
  },
  {
    slug: 'onb-tooltip-hints', title: 'Onboarding — Contextual hint tooltips / beacons', category: 'ui-components', difficulty: 'med',
    tags: 'onboarding, tooltip, beacon',
    build: 'Pulsing beacon dots anchored to several UI controls; clicking a beacon opens a contextual hint popover (title, short tip, "Got it" to dismiss that beacon). A "Reset hints" button restores all beacons. Track dismissed count. Popover positions itself relative to its anchor.',
    variants: 'pulsing beacon vs static "?" badge; hover-open vs click-open',
  },
  {
    slug: 'onb-progress-nudge', title: 'Onboarding — Profile/setup completion nudge bar', category: 'ui-components', difficulty: 'easy',
    tags: 'onboarding, nudge',
    build: 'A slim profile-completion nudge bar pinned near the top: "Your profile is 60% complete" with a progress bar and the next suggested action ("Add a photo"). Completing actions advances the percentage; at 100% the bar swaps to a success state then can be dismissed.',
    variants: 'top banner vs sidebar card; with avatar preview vs text-only; dismissible vs persistent',
  },
  {
    slug: 'onb-role-selector', title: 'Onboarding — Role / intent picker', category: 'ui-components', difficulty: 'easy',
    tags: 'onboarding, role-picker',
    build: 'A "What brings you here?" role/intent picker: a grid of selectable cards (e.g. Founder, Developer, Designer, Marketer) each with icon + label + one-line desc, single-select with clear selected state, and a "Continue" button that enables once a choice is made and shows a tailored confirmation toast/next-step hint.',
    variants: 'single-select vs multi-select; card grid vs compact list',
  },
  {
    slug: 'onb-sample-data', title: 'Onboarding — Sample-data / "try with demo" prompt', category: 'ui-components', difficulty: 'easy',
    tags: 'onboarding, sample-data',
    build: 'A "Start with sample data?" prompt shown on an empty workspace: two choice cards — "Load demo data" (populates a faux table/board with example rows + toast) and "Start from scratch" (keeps it empty). A "Clear demo data" button reverts. Loading demo data shows a brief skeleton then the populated state.',
    variants: 'modal prompt vs inline banner; preview thumbnail vs text-only',
  },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos de la colección "${COLLECTION}" (Phase 61)…`)

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
