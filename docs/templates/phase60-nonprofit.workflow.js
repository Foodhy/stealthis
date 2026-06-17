// ===========================================================================
// Phase 60 — Nonprofit / Charity Theme. Collection: nonprofit. 23 resources (A–E).
// ===========================================================================

export const meta = {
  name: 'phase60-nonprofit-build',
  description: 'Build 23 Nonprofit/Charity resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'nonprofit'

const STYLE = `DESIGN SYSTEM (Nonprofit / Charity — warm, human, hopeful; match exactly unless a palette override is given):
- Google Fonts via <link>: a warm humane serif for headings (e.g. "Fraunces" or "Bitter") + "Inter" for body. font-family fallbacks: system-ui, -apple-system, sans-serif.
- Default palette in :root —
  --brand:#1f7a6d (mission teal-green); --brand-d:#155e54; --accent:#e8743b (warm donate orange); --accent-d:#cc5d28;
  --ink:#2a2722; --ink-2:#524d44; --muted:#7a7368; --bg:#faf6f0 (warm sand); --surface:#ffffff;
  --line:rgba(42,39,34,0.1); --line-2:rgba(42,39,34,0.18); --ok:#2f9e6f; --warn:#d98a2b; --danger:#d4503e;
  radii --r-sm:8px --r-md:14px --r-lg:22px; soft warm shadows.
- box-sizing border-box reset, antialiased, line-height 1.6, --bg page background.
- Conventions: prominent DONATE CTA (accent), transparency via impact numbers ("X meals served"), real-photography placeholders (warm gradient blocks with people/impact captions), progress thermometers, donor recognition, trust badges (registered charity, tax-deductible).
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons & inputs.
- Responsive: works down to ~360px (add @media (max-width:520px)).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional org names, campaigns, donor names, amounts.`

const DISCLAIMER = '> Illustrative UI only — fictional organization, not a real charity or donation system.'

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
createdAt: 2026-06-17
updatedAt: 2026-06-17
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Nonprofit/Charity theme. Self-contained, polished, visually distinctive — not a generic placeholder.

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

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, impact numbers, smooth micro-interactions, a genuinely interactive script. ${s.slug.includes('-landing-') ? 'FULL multi-section landing page (nav, hero, 4-5 sections, footer, mobile nav, scroll reveal).' : ''} No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 60.A Supporter / Public ─────────────────────────────────────────────
  { slug: 'ngo-home', title: 'Nonprofit — Home', category: 'pages', difficulty: 'med', tags: 'home, mission',
    build: 'Nonprofit home page: mission hero with donate CTA + impact stat band, what-we-do cards, featured campaign with progress thermometer, impact stories, ways-to-help, newsletter, footer with trust badges. Interactive: animated impact counters, donate-amount quick picker, story carousel.' },
  { slug: 'ngo-donate-flow', title: 'Nonprofit — Donation Flow', category: 'pages', difficulty: 'hard', tags: 'donate, payment',
    build: 'Donation flow: amount presets + custom, one-time/monthly toggle, designation (where it goes), cover-fees checkbox, donor details, payment, review → thank-you with impact equivalence. Interactive: amount selection updates impact text, frequency toggle, multi-step with validation, success.' },
  { slug: 'ngo-campaign-page', title: 'Nonprofit — Campaign / Fundraiser', category: 'pages', difficulty: 'med', tags: 'campaign, fundraiser',
    build: 'Campaign/fundraiser page: hero with goal thermometer (raised vs goal, donors, days left), story, donation tiers with perks, recent donors feed, updates timeline, share. Interactive: animated progress, tier select, share buttons, live donor feed.' },
  { slug: 'ngo-impact-report', title: 'Nonprofit — Impact Report', category: 'pages', difficulty: 'med', tags: 'impact, report',
    build: 'Annual impact report page: headline impact stats grid, where-money-goes breakdown (donut), program outcomes sections with photos, beneficiary quotes, financial transparency, download report. Interactive: animated stats, donut hover, section reveal.' },
  { slug: 'ngo-story-feature', title: 'Nonprofit — Story Spotlight', category: 'pages', difficulty: 'easy', tags: 'story, beneficiary',
    build: 'Beneficiary story / spotlight feature: large photo hero, long-form narrative with pull quotes, before/after, related stories, donate-to-help CTA. Interactive: reading progress, image gallery, share.' },
  { slug: 'ngo-events-page', title: 'Nonprofit — Events Calendar', category: 'pages', difficulty: 'easy', tags: 'events, calendar',
    build: 'Events / fundraiser calendar: filterable list/grid of events (galas, runs, drives) with date, location, RSVP, plus a month calendar view toggle. Interactive: list/calendar toggle, filter by type, RSVP toast.' },

  // ── 60.B Patterns ───────────────────────────────────────────────────────
  { slug: 'ngo-donation-widget', title: 'Nonprofit — Donation Widget', category: 'ui-components', difficulty: 'med', tags: 'pattern, donate',
    build: 'Reusable donation amount widget: preset amount chips + custom input, one-time/monthly toggle, impact equivalence text per amount, donate button. Interactive: select preset/custom updates impact line + button label, frequency toggle.' },
  { slug: 'ngo-progress-thermometer', title: 'Nonprofit — Fundraising Thermometer', category: 'ui-components', difficulty: 'easy', tags: 'pattern, progress',
    build: 'Fundraising goal thermometer / progress: vertical thermometer + horizontal bar variants, raised/goal/percent, donor count, milestone markers, animated fill. Interactive: buttons add donations animating the fill + milestones.' },
  { slug: 'ngo-impact-stat', title: 'Nonprofit — Impact Stat Counter', category: 'ui-components', difficulty: 'easy', tags: 'pattern, stats',
    build: 'Impact stat counter component: grid of big animated count-up stats with icon + label ("12,480 meals served"), trigger on scroll into view. Interactive: count-up animation, replay button, several stat cards.' },
  { slug: 'ngo-donor-wall', title: 'Nonprofit — Donor Wall', category: 'ui-components', difficulty: 'easy', tags: 'pattern, recognition',
    build: 'Donor wall / recognition list: tiered donor recognition (platinum/gold/silver), avatars/initials, amounts optionally hidden, search/filter by tier, "add your name" CTA. Interactive: tier filter, search, hover highlight.' },
  { slug: 'ngo-recurring-toggle', title: 'Nonprofit — Giving Toggle', category: 'ui-components', difficulty: 'easy', tags: 'pattern, recurring',
    build: 'One-time / monthly giving toggle component: segmented control with "most impact" badge on monthly, dynamic copy + annual-total preview, amount sync. Interactive: toggle updates copy, annual projection, recommended highlight.' },
  { slug: 'ngo-pledge-card', title: 'Nonprofit — Pledge / Sponsorship Card', category: 'ui-components', difficulty: 'easy', tags: 'pattern, sponsorship',
    build: 'Pledge / sponsorship card set: sponsor-a-child/cause cards with photo, name, story snippet, monthly amount, progress, sponsor button. Show ~4 variants. Interactive: sponsor toggle, hover, flip for details.' },

  // ── 60.C Volunteer & Community ──────────────────────────────────────────
  { slug: 'ngo-volunteer-signup', title: 'Nonprofit — Volunteer Signup', category: 'pages', difficulty: 'med', tags: 'volunteer, signup',
    build: 'Volunteer signup / opportunities: filterable opportunity cards (cause, skills, time, location, remote), detail + apply form (availability, interests). Interactive: filters, opportunity detail drawer, signup form with validation.' },
  { slug: 'ngo-volunteer-portal', title: 'Nonprofit — Volunteer Portal', category: 'pages', difficulty: 'med', tags: 'volunteer, portal',
    build: 'Volunteer portal: dashboard with logged hours, upcoming shifts, available shifts to claim, impact/badges, schedule calendar. Interactive: claim/cancel shift, hours total updates, tabs, log-hours modal.' },
  { slug: 'ngo-petition', title: 'Nonprofit — Petition / Pledge', category: 'ui-components', difficulty: 'easy', tags: 'petition, pledge',
    build: 'Petition / pledge page component: cause statement, signature goal progress, sign form (name, email, optional comment), recent signatures feed, share. Interactive: sign increments counter + adds to feed, progress animates, share.' },

  // ── 60.D Admin ──────────────────────────────────────────────────────────
  { slug: 'ngo-admin-donations', title: 'Nonprofit — Donations Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, donations',
    build: 'Donations dashboard: KPIs (total raised, recurring revenue, avg gift, new donors), donations-over-time chart, recurring vs one-time split, top campaigns, recent donations table. Interactive: timeframe toggle redraws chart, campaign drill, export.' },
  { slug: 'ngo-admin-campaigns', title: 'Nonprofit — Campaign Manager', category: 'pages', difficulty: 'med', tags: 'admin, campaigns',
    build: 'Campaign manager: campaigns table/cards (name, goal, raised, status, dates), create/edit campaign form (goal, dates, tiers, story), status filters. Interactive: create/edit drawer, status toggle, progress per campaign, filter.' },
  { slug: 'ngo-admin-volunteers', title: 'Nonprofit — Volunteer Manager', category: 'pages', difficulty: 'med', tags: 'admin, volunteers',
    build: 'Volunteer / roster manager: volunteers table (name, role, hours, status), shift roster grid, approve/assign actions, hours summary. Interactive: assign to shift, approve volunteer, filter, hours rollup.' },

  // ── 60.E Themed Landings (5) ────────────────────────────────────────────
  { slug: 'ngo-landing-humanitarian', title: 'Nonprofit — Humanitarian Landing', category: 'pages', difficulty: 'med', tags: 'landing, humanitarian',
    palette: 'Humanitarian / relief NGO — Warm sand + deep blue #1d4e89 + urgent red · humane serif + sans · urgent, hopeful, dignified',
    build: 'Humanitarian/relief NGO landing: urgent crisis hero with donate CTA + live raised thermometer, where-we-work, impact stats, emergency-appeal section, ways to help, trust/transparency, footer. Animated counters, mobile nav, reveal.' },
  { slug: 'ngo-landing-animal', title: 'Nonprofit — Animal Welfare Landing', category: 'pages', difficulty: 'med', tags: 'landing, animal',
    palette: 'Animal welfare — Soft green + cream + warm orange · rounded friendly sans · caring, friendly, warm',
    build: 'Animal-welfare landing: heart-warming hero with rescue photos + adopt/donate CTAs, adoptable animals grid, impact (animals saved), sponsor-a-pet, success stories, volunteer CTA, footer. Adopt cards, reveal.' },
  { slug: 'ngo-landing-environmental', title: 'Nonprofit — Environmental Landing', category: 'pages', difficulty: 'med', tags: 'landing, environmental',
    palette: 'Environmental / climate — Forest green + ocean blue + earth tones · clean modern sans · natural, activist, urgent',
    build: 'Environmental/climate NGO landing: nature hero with cause stat (e.g. trees planted), programs, interactive impact map teaser, pledge/petition CTA, transparency, partners, donate CTA, footer. Animated stats, reveal.' },
  { slug: 'ngo-landing-education', title: 'Nonprofit — Education / Youth Landing', category: 'pages', difficulty: 'med', tags: 'landing, education',
    palette: 'Education / youth — Bright optimistic (sunny yellow + sky blue) + white · friendly sans · uplifting, future-focused',
    build: 'Education/youth NGO landing: hopeful hero with students, programs (scholarships, mentoring), impact (kids reached, grad rate), sponsor-a-student, success stories, donate/volunteer CTAs, footer. Reveal, counters.' },
  { slug: 'ngo-landing-community', title: 'Nonprofit — Religious / Community Landing', category: 'pages', difficulty: 'easy', tags: 'landing, community',
    palette: 'Religious / community center — Warm neutrals + gold + accent · classic serif · welcoming, rooted, traditional',
    build: 'Religious/community-center landing: welcoming hero with service/gathering times, programs & ministries, events, give/tithe CTA, community stories, get-involved, footer. Calm, refined hover, reveal.' },
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
