// ===========================================================================
// Tanda 3 — Phase 40 (Job Board / ATS) + Phase 38 (Event Ticketing). 34 resources.
// Collections: jobs | events. Each spec carries its own.
// ===========================================================================

export const meta = {
  name: 'tanda3-jobs-events-build',
  description: 'Build 34 resources across Job Board + Event Ticketing verticals',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const COMMON = `- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif (add a display/serif/mono accent if a variant calls for it).
- Define ALL colors as CSS variables in :root first. box-sizing border-box reset, antialiased, line-height 1.5.
- Accessible: semantic landmarks, aria where relevant, WCAG AA contrast, keyboard-usable interactive elements.
- Responsive: works at desktop AND down to ~360px (add @media (max-width:520px)).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional names/data. No lorem ipsum, no TODOs.`

const STYLES = {
  jobs: `DESIGN SYSTEM — Job Board / ATS (clean, professional, trustworthy, scannable):
- Palette in :root — --brand:#2563eb; --brand-d:#1d4ed8; --brand-50:#eaf1ff; --ink:#0f172a; --ink-2:#475569; --muted:#64748b; --bg:#f6f8fb; --surface:#ffffff; --line:rgba(15,23,42,0.1); --line-2:rgba(15,23,42,0.18); --ok:#16a34a; --warn:#d97706; --danger:#dc2626; --new:#2563eb; radii --r-sm:8px --r-md:14px --r-lg:20px; soft shadows.
- Conventions: scannable list density, clear status pills (applied/interview/offer/rejected), salary & location chips, company logos (text/SVG), remote badges, save/bookmark toggles.
${COMMON}`,
  events: `DESIGN SYSTEM — Event Ticketing (bold, high-contrast, photographic, energetic):
- Palette in :root — --brand:#7c3aed (override per landing); --brand-d:#6d28d9; --ink:#0e0e16; --ink-2:#3a3a4d; --muted:#6c6c80; --bg:#f5f4f9; --surface:#ffffff; --line:rgba(14,14,22,0.1); --ok:#16a34a; --warn:#d97706; --danger:#dc2626; --accent:#ff3d81; radii --r-sm:8px --r-md:14px --r-lg:20px; bold shadows.
- Conventions: photographic hero blocks (gradient placeholders), prominent price & date, QR/ticket motifs (dashed perforations), seat tier color legend, sold-out/low-stock badges, countdown to event.
${COMMON}`,
}

const DISCLAIMERS = {
  jobs: '> Illustrative UI only — fictional jobs & companies, not a real hiring platform.',
  events: '> Illustrative UI only — fictional events, not a real ticketing service.',
}

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${s.collection}${s.tags ? ', ' + s.tags : ''}]`
  const DISCLAIMER = DISCLAIMERS[s.collection]

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
collections: [${s.collection}]
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

  return `You are generating ONE production-quality static UI demo resource. Self-contained, polished, visually distinctive — not a generic placeholder.

${STYLES[s.collection]}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, badges, smooth micro-interactions, a genuinely interactive script. ${s.slug.includes('-landing-') ? 'FULL multi-section landing page (nav, hero, 4-5 sections, footer, mobile nav, scroll reveal).' : ''} No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ===== Phase 40 — Job Board / ATS (jobs) =====
  { collection: 'jobs', slug: 'job-listings', title: 'Job Board — Job Search', category: 'pages', difficulty: 'med', tags: 'listings, search',
    build: 'Job search page: filter rail (role, location, remote, salary range, type, experience), search bar, sortable list of job cards (logo, title, company, location, salary, tags, posted date, save), results count, pagination. Interactive: filters + search update list, save toggle, sort.' },
  { collection: 'jobs', slug: 'job-detail', title: 'Job Board — Job Detail', category: 'pages', difficulty: 'med', tags: 'job, detail',
    build: 'Job detail: header (title, company, location, salary, apply + save), description sections (about, responsibilities, requirements, benefits), company snapshot card, similar jobs. Interactive: sticky apply bar, save toggle, expand company, share.' },
  { collection: 'jobs', slug: 'job-apply', title: 'Job Board — Application Form', category: 'pages', difficulty: 'med', tags: 'apply, form',
    build: 'Application form: resume upload/select, autofilled contact fields, screening questions (radio/select/text), cover letter, work authorization, review + submit, success. Interactive: multi-section with validation, upload preview, submit success state.' },
  { collection: 'jobs', slug: 'job-seeker-dashboard', title: 'Job Board — Applications Tracker', category: 'pages', difficulty: 'med', tags: 'dashboard, tracker',
    build: 'Seeker dashboard: applications tracker with status columns/list (applied, in review, interview, offer, rejected), saved jobs, recommended jobs, profile-completeness nudge. Interactive: filter by status, withdraw, status badges, resume from saved.' },
  { collection: 'jobs', slug: 'job-profile', title: 'Job Board — Resume Builder', category: 'pages', difficulty: 'hard', tags: 'profile, resume',
    build: 'Candidate profile / resume builder: editable sections (summary, experience, education, skills, links), live resume preview pane, completeness meter, visibility toggle. Interactive: edit fields update preview live, add/remove entries, reorder, download.' },
  { collection: 'jobs', slug: 'job-listing-card', title: 'Job Board — Job Listing Card', category: 'ui-components', difficulty: 'easy', tags: 'pattern, card',
    build: 'Reusable job listing card: company logo, title, company, location + remote badge, salary chip, tags, posted date, save/bookmark, quick-apply. Show a list of ~8 variants (new, urgent, remote, saved). Interactive: save toggle, hover.' },
  { collection: 'jobs', slug: 'job-filter-rail', title: 'Job Board — Filter Rail', category: 'ui-components', difficulty: 'med', tags: 'pattern, filters',
    build: 'Faceted job filter sidebar: collapsible groups (role, type, experience, remote), salary range slider, location input with chips, active-filter chips + clear-all, results count. Interactive: all controls update a live count, chips remove, mobile drawer.' },
  { collection: 'jobs', slug: 'job-status-pill', title: 'Job Board — Application Status Pills', category: 'ui-components', difficulty: 'easy', tags: 'pattern, status',
    build: 'Application status pill set + stepper: pills for applied/screening/interview/offer/hired/rejected with semantic colors & icons, plus a horizontal status stepper showing progress. Interactive: buttons to transition state animate the stepper.' },
  { collection: 'jobs', slug: 'job-resume-upload', title: 'Job Board — Resume Upload', category: 'ui-components', difficulty: 'med', tags: 'pattern, upload',
    build: 'Resume upload + parse preview: drag-drop zone, file chip with progress, simulated parse that extracts name/email/skills/experience into editable preview fields. Interactive: drop/upload animation, parsing progress, populated preview, re-upload.' },
  { collection: 'jobs', slug: 'job-admin-pipeline', title: 'Job Board — Candidate Pipeline', category: 'pages', difficulty: 'hard', tags: 'admin, ats',
    build: 'Recruiter ATS pipeline: kanban columns (applied, screening, interview, offer, hired), candidate cards (name, role, rating, tags), drag/move between stages, column counts, filters. Interactive: move candidate, open quick-view, filter by role/rating.' },
  { collection: 'jobs', slug: 'job-admin-posting', title: 'Job Board — Job Posting Editor', category: 'pages', difficulty: 'med', tags: 'admin, editor',
    build: 'Job posting editor: form (title, dept, location, type, salary, description rich-text mock, screening questions builder), live preview, publish/draft. Interactive: add/remove screening questions, live preview updates, publish toast.' },
  { collection: 'jobs', slug: 'job-admin-candidate', title: 'Job Board — Candidate Detail', category: 'pages', difficulty: 'med', tags: 'admin, candidate',
    build: 'Recruiter candidate detail: profile header (name, role, stage, rating), tabs (resume, scorecard, activity, notes), interview scorecard with criteria sliders, action bar (advance, reject, schedule). Interactive: tabs, scorecard rating, stage actions with toasts.' },
  { collection: 'jobs', slug: 'job-landing-general', title: 'Job Board — General Board Landing', category: 'pages', difficulty: 'med', tags: 'landing, general',
    palette: 'General job board — White + trust blue #2563eb + slate · clean sans · broad, friendly, accessible',
    build: 'General job-board marketing landing: hero with search bar (role + location), trending categories, featured employers, value props (for seekers + employers), stats band, testimonials, dual CTA (find jobs / post a job), footer. Interactive search, reveal.' },
  { collection: 'jobs', slug: 'job-landing-tech', title: 'Job Board — Tech / Startup Landing', category: 'pages', difficulty: 'hard', tags: 'landing, tech',
    palette: 'Tech / startup jobs — Dark #0b0e14 + mono accent + electric blue · modern sans + mono · developer-cool, modern',
    build: 'Tech/startup job-board landing: dark hero with code/terminal motif, curated startup roles, salary-transparency feature, tech-stack filters preview, hiring-company logos, "why us" for engineers, CTA, footer. Animated, reveal.' },
  { collection: 'jobs', slug: 'job-landing-executive', title: 'Job Board — Executive Landing', category: 'pages', difficulty: 'med', tags: 'landing, executive',
    palette: 'Executive / senior — Charcoal #1a1a22 + gold #c8a24b + ivory · refined serif + sans · prestige, discreet',
    build: 'Executive search landing: elegant hero, confidential-search value prop, leadership roles, vetted-network section, discreet process steps, client logos, request-access CTA, footer. Refined hover, reveal.' },
  { collection: 'jobs', slug: 'job-landing-gig', title: 'Job Board — Gig / Shift Work Landing', category: 'pages', difficulty: 'med', tags: 'landing, gig',
    palette: 'Gig / shift work — Bright + bold (orange/teal) · chunky sans · fast, accessible, mobile-first',
    build: 'Gig/shift-work landing: energetic hero (find shifts near you), instant-pay feature, shift categories, how-it-works, worker app download, business hiring CTA, footer. Mobile-first, animated.' },
  { collection: 'jobs', slug: 'job-landing-internal', title: 'Job Board — Internal Mobility Landing', category: 'pages', difficulty: 'med', tags: 'landing, internal',
    palette: 'Internal mobility / careers site — Warm brand-flex (navy + warm accent) + clean · warm sans · belonging, growth',
    build: 'Internal careers / mobility landing: welcoming hero (grow your career here), open internal roles, employee-story highlights, learning & development, values/culture, apply CTA, footer. Warm, reveal.' },

  // ===== Phase 38 — Event Ticketing (events) =====
  { collection: 'events', slug: 'tix-discovery', title: 'Ticketing — Event Discovery', category: 'pages', difficulty: 'med', tags: 'discovery, browse',
    build: 'Event discovery: search + date + category + location filters, featured carousel, grid of event cards (image, date, venue, price-from, category), trending sidebar. Interactive: filters update grid, date chips, save event, sort by date/popularity.' },
  { collection: 'events', slug: 'tix-event-detail', title: 'Ticketing — Event Detail', category: 'pages', difficulty: 'med', tags: 'event, detail',
    build: 'Event detail: hero (image, title, date, venue, get-tickets), ticket-type selector with prices + quantity steppers, lineup/schedule, venue map + info, FAQ. Interactive: quantity steppers update running total, ticket tiers, sticky checkout bar.' },
  { collection: 'events', slug: 'tix-seat-map', title: 'Ticketing — Seat Selection Map', category: 'pages', difficulty: 'hard', tags: 'seatmap, selection',
    build: 'Interactive seat-selection map: SVG/grid venue with sections, zoomable seat blocks, price-tier color legend, seat states (available/selected/taken/accessible), selected-seats summary + total, continue. Interactive: zoom/pan, select/deselect seats, tier filter, max-seats guard, live total.' },
  { collection: 'events', slug: 'tix-checkout', title: 'Ticketing — Checkout', category: 'pages', difficulty: 'med', tags: 'checkout, payment',
    build: 'Ticket checkout: order summary (event, seats, qty), fees breakdown, attendee details, promo code, payment form, countdown hold timer, place order → success. Interactive: promo applies discount, hold countdown, validation, success.' },
  { collection: 'events', slug: 'tix-ticket', title: 'Ticketing — Digital Ticket', category: 'pages', difficulty: 'easy', tags: 'ticket, qr',
    build: 'Digital ticket: ticket card with perforated stub design, event info, seat/section, animated QR code (SVG/canvas pattern), add-to-wallet + transfer buttons, brightness-boost. Interactive: flip for details, transfer modal, wallet toast.' },
  { collection: 'events', slug: 'tix-event-card', title: 'Ticketing — Event Card', category: 'ui-components', difficulty: 'easy', tags: 'pattern, card',
    build: 'Reusable event card: image with date badge, title, venue, category tag, price-from, save heart, sold-out/low-stock states, hover lift. Show a responsive grid of ~6 variants. Interactive: save toggle, hover, sold-out disabled.' },
  { collection: 'events', slug: 'tix-seat-picker', title: 'Ticketing — Seat Picker Widget', category: 'ui-components', difficulty: 'hard', tags: 'pattern, seatmap',
    build: 'Standalone seat-map picker widget: zoomable seat grid with tier legend, hover tooltip (row/seat/price), select/deselect, selection summary chip bar, best-available button. Interactive: zoom, select with max guard, tooltips, best-available auto-pick.' },
  { collection: 'events', slug: 'tix-qr-ticket', title: 'Ticketing — QR Ticket Stub', category: 'ui-components', difficulty: 'easy', tags: 'pattern, qr',
    build: 'QR ticket stub component: perforated-edge card, event/seat info, QR pattern, validity status (valid/used/expired), scan-pulse animation. Show 3 states. Interactive: tap to enlarge QR, mark-as-used demo.' },
  { collection: 'events', slug: 'tix-date-filter', title: 'Ticketing — Date Filter Chips', category: 'ui-components', difficulty: 'easy', tags: 'pattern, filter',
    build: 'Date / when filter component: quick chips (today, this weekend, this week, this month), a mini calendar range picker, applied-range display + clear. Interactive: chips set range, calendar selects custom range, emits selection.' },
  { collection: 'events', slug: 'tix-admin-dashboard', title: 'Ticketing — Organizer Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, organizer',
    build: 'Organizer dashboard: KPIs (tickets sold, revenue, capacity %, scans), sales-over-time chart, per-tier sales breakdown, recent orders, check-in rate. Interactive: timeframe toggle redraws chart, tier breakdown, order drill.' },
  { collection: 'events', slug: 'tix-admin-event-setup', title: 'Ticketing — Event Setup', category: 'pages', difficulty: 'hard', tags: 'admin, setup',
    build: 'Event setup wizard: details (name, date, venue), ticket tiers builder (name, price, qty), seating mode (GA vs reserved with section setup), publish settings, preview. Interactive: add/remove tiers, toggle seating mode, validation, publish.' },
  { collection: 'events', slug: 'tix-admin-checkin', title: 'Ticketing — Door Check-in Scanner', category: 'ui-components', difficulty: 'med', tags: 'admin, checkin',
    build: 'Door check-in scanner view: camera/scan viewport mock with targeting frame, scan result card (valid green / invalid red / already-used), live check-in counter + rate, recent scans list, manual lookup. Interactive: simulate scan results, counter increments, manual search.' },
  { collection: 'events', slug: 'tix-landing-concert', title: 'Ticketing — Concert Landing', category: 'pages', difficulty: 'hard', tags: 'landing, concert',
    palette: 'Concert / music — Black + neon magenta #ff2d78 + violet · display sans · loud, hype, electric',
    build: 'Concert event landing: full-bleed artist hero with date + get-tickets, tour dates list with availability, lineup, venue info, ticket tiers, hype gallery, FAQ, CTA, footer. Countdown, mobile nav, reveal.' },
  { collection: 'events', slug: 'tix-landing-conference', title: 'Ticketing — Conference Landing', category: 'pages', difficulty: 'med', tags: 'landing, conference',
    palette: 'Conference / tech — White + indigo #4f46e5 + slate · clean sans · professional, modern',
    build: 'Conference landing: hero (name, date, location, register), speakers grid, agenda/track tabs, sponsors, pricing tiers (early-bird countdown), venue/travel, register CTA, footer. Agenda tabs, countdown, reveal.' },
  { collection: 'events', slug: 'tix-landing-sports', title: 'Ticketing — Sports Landing', category: 'pages', difficulty: 'med', tags: 'landing, sports',
    palette: 'Sports / stadium — Team colors (deep blue + red) + white · bold condensed sans · competitive, energetic',
    build: 'Sports event landing: stadium hero with fixture (teams, date, venue), buy-by-section, fixtures list, seating map teaser, hospitality packages, fan info, CTA, footer. Section pricing, reveal.' },
  { collection: 'events', slug: 'tix-landing-festival', title: 'Ticketing — Festival Landing', category: 'pages', difficulty: 'hard', tags: 'landing, festival',
    palette: 'Festival / multi-day — Warm gradient (sunset orange→pink→purple) + grain · funky display · immersive, vibrant',
    build: 'Festival landing: immersive gradient hero with dates + lineup poster, day-by-day lineup tabs, pass tiers (GA/VIP/camping), map, experiences, FAQ, CTA, footer. Lineup tabs, countdown, animated, reveal.' },
  { collection: 'events', slug: 'tix-landing-theater', title: 'Ticketing — Theater Landing', category: 'pages', difficulty: 'med', tags: 'landing, theater',
    palette: 'Theater / arts — Burgundy #6b1f2e + gold #c8a24b + cream · elegant serif · classic, refined',
    build: 'Theater/arts landing: elegant hero (show title, run dates, book), show synopsis, cast & creative, performance calendar, seating/pricing, reviews/quotes, book CTA, footer. Calendar picker, refined hover, reveal.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos (Job Board · Ticketing)…`)

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
