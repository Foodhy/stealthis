// ===========================================================================
// Workflow — Phase 30 (Gym / Fitness Studio) — genera los 29 recursos faltantes
// ===========================================================================
export const meta = {
  name: 'gym-phase30-finish',
  description: 'Generar los 29 recursos de la Phase 30 (Gym) — mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'un agente por recurso (29)' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'gym'

// ── Sistema de diseño compartido de la colección ───────────────────────────
const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Google Font Inter via <link> (weights 400;500;600;700;800;900), plus you MAY add a bold display feel via heavy Inter weights. font-family: "Inter", system-ui, -apple-system, sans-serif.
- Default high-energy performance-gym palette in :root —
  --bg:#0d0f12; --surface:#15181d; --surface-2:#1d2127; --elevated:#23282f;
  --ink:#f4f6f8; --ink-2:#c2c8d0; --muted:#8b929c;
  --neon:#c6ff3a; --neon-d:#a6e016; --neon-50:rgba(198,255,58,0.12);
  --orange:#ff6a2b; --orange-soft:rgba(255,106,43,0.14);
  --line:rgba(255,255,255,0.08); --line-2:rgba(255,255,255,0.16);
  --ok:#34d399; --warn:#fbbf24; --danger:#f87171;
  radii: --r-sm:8px --r-md:14px --r-lg:20px; layered shadows on dark.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background, --ink text.
- Bold, energetic, athletic feel: strong type hierarchy, uppercase eyebrows/labels, large tap-friendly action buttons in --neon (dark text on neon) or --orange.
- Accessible: aria where relevant, WCAG AA contrast on the dark theme, keyboard-usable buttons, visible focus rings.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional names/data (classes, trainers, members).`

const DISCLAIMER = '' // Gym has no medical/legal disclaimer requirement.

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

<2-3 short paragraphs describing the UI and its interactions.>${DISCLAIMER ? '\n\n' + DISCLAIMER + '\n\n(The body MUST end with that exact disclaimer line.)' : ''}`

  return `You are generating ONE production-quality static UI demo resource. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions/structure): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, badges, smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

// ── Lista de recursos de la Phase 30 (del ROADMAP.md) ──────────────────────
const SPECS = [
  // 30.A — Member / Customer Side
  {
    slug: 'gym-class-schedule', title: 'Gym — Class Schedule', category: 'pages', difficulty: 'med',
    tags: 'schedule, classes, booking',
    build: 'A weekly class-schedule grid: day columns (Mon–Sun) with time rows, each class block showing class name (e.g. HIIT Burn, Vinyasa Flow, Spin45), trainer, time, room, intensity tag and spots-left. Sticky day/time headers. Filter chips by class type (Strength, Cardio, Yoga, Cycle). Clicking a block opens a side detail panel with a Book button that decrements spots and toggles to Booked. Show a "today" column highlight and a week navigator (prev/next week). Color-code intensity.',
  },
  {
    slug: 'gym-class-detail', title: 'Gym — Class Detail', category: 'ui-components', difficulty: 'easy',
    tags: 'classes, booking, card',
    build: 'A rich class detail card/panel for a single class (e.g. "HIIT Burn 45"): hero strip with class name + intensity badge, trainer avatar + name, schedule (day/time/duration), studio/room, what-to-bring list, difficulty meter, calories estimate, spots progress bar (e.g. 14/20 booked) and a prominent Book CTA. Include a waitlist state when full, and a small roster preview of who is going (avatars). Book button updates the progress bar and switches to a Cancel/Booked state.',
  },
  {
    slug: 'gym-member-dashboard', title: 'Gym — Member Dashboard', category: 'pages', difficulty: 'med',
    tags: 'dashboard, member, stats, streak',
    build: 'A member home dashboard: greeting header with avatar, a "Next class" card with countdown + check-in CTA, a streak widget (e.g. 12-day streak with a 7-day dots row), weekly activity stats (workouts, minutes, calories) as stat cards, a mini goals/progress ring, recent achievements/badges row, and an upcoming bookings list. Include a quick-action bar (Book class, Log workout, Scan in). Interactive: toggling a goal updates the ring; check-in button animates.',
  },
  {
    slug: 'gym-workout-tracker', title: 'Gym — Workout Tracker', category: 'pages', difficulty: 'med',
    tags: 'workout, tracker, timer, sets',
    build: 'An active workout tracker: ordered exercise list (e.g. Back Squat, Bench Press, Deadlift) each with set rows (weight × reps) and a check-off per set, an add-set button, and per-exercise rest. A prominent rest timer (start/pause/reset, counts down) with a beep-free visual flash at zero. Running totals: total volume, sets done, elapsed workout time. A "Finish workout" button shows a summary toast. All state in vanilla JS; sets persist within the session.',
  },
  {
    slug: 'gym-membership-card', title: 'Gym — Digital Membership Card', category: 'ui-components', difficulty: 'easy',
    tags: 'membership, card, qr',
    build: 'A digital membership card with a flip interaction: front shows gym brand, member name, tier (e.g. Unlimited / Black), member ID, join date and a status pill (Active). Back shows a QR code (draw with canvas or inline SVG modules — a fake but realistic QR matrix) for door check-in, plus barcode-style ID. A "Show at front desk" pulse animation and a brightness/boost button that maximizes contrast. Tap/click flips the card with a 3D transform.',
  },
  {
    slug: 'gym-progress-stats', title: 'Gym — Progress Stats', category: 'ui-components', difficulty: 'med',
    tags: 'stats, charts, progress, PR',
    build: 'A progress panel with self-drawn SVG charts (no libs): a bodyweight line chart over weeks, a volume bar chart, and a personal-records (PR) list (Squat, Bench, Deadlift, 5k time) with little up/down trend deltas and dates. Tab switcher between metrics (Strength / Cardio / Body). Hover tooltips on chart points. A time-range toggle (4w / 12w / 1y) that re-renders the chart data. Clean athletic styling on the dark theme.',
  },
  {
    slug: 'gym-nutrition-log', title: 'Gym — Nutrition / Macro Log', category: 'ui-components', difficulty: 'med',
    tags: 'nutrition, macros, log',
    build: 'A daily nutrition/macro log: top macro rings or bars for Protein / Carbs / Fat against goals plus a calories total ring. Meal sections (Breakfast, Lunch, Dinner, Snacks) each listing food entries with calories + macros and a remove button. An "Add food" inline form (name, calories, P/C/F) that appends an entry and live-updates the rings and remaining-calories number. A water tracker row of glasses you can tap to fill. Vanilla JS, smooth updates.',
  },
  {
    slug: 'gym-booking-flow', title: 'Gym — Class Booking Flow', category: 'pages', difficulty: 'med',
    tags: 'booking, flow, steps, payment',
    build: 'A multi-step class booking flow with a step indicator: 1) pick a date (horizontal date strip), 2) pick a class + time slot (cards with spots-left), 3) pick a spot/bike position from a small grid map, 4) confirm + payment (use credits or card, show price). A persistent summary rail updates as you go. Next/Back navigation with validation (cannot proceed without a selection). Final step shows a success confirmation with booking code. All vanilla JS.',
  },

  // 30.B — Trainer / Staff Side
  {
    slug: 'gym-trainer-dashboard', title: 'Gym — Trainer Dashboard', category: 'pages', difficulty: 'med',
    tags: 'trainer, dashboard, clients',
    build: "A trainer's daily dashboard: today's class/session timeline (back-to-back sessions with client names and types — PT, group, assessment), a clients sidebar with avatars + next-session and adherence %, KPI cards (sessions today, active clients, attendance rate, revenue this week), and an action list (programs to send, check-ins due). Clicking a session expands details; a check-in toggle marks a client done. Vanilla JS interactions.",
  },
  {
    slug: 'gym-class-roster', title: 'Gym — Class Roster', category: 'ui-components', difficulty: 'easy',
    tags: 'roster, attendance, check-in',
    build: 'A class roster with attendance check-in: header shows class name, time, trainer and capacity (e.g. 18/20). A member list with avatar, name, membership tier, and a check-in toggle (Present / No-show / Waitlist-promoted). Live counters for present / expected / no-show update as you toggle. A search/filter box, a "check in all" action, and a walk-in add row. Toggling animates a row state change. Vanilla JS.',
  },
  {
    slug: 'gym-workout-builder', title: 'Gym — Workout Plan Builder', category: 'pages', difficulty: 'hard',
    tags: 'builder, drag-drop, workout, program',
    build: 'A drag-and-drop workout plan builder: a left library of exercises (grouped by muscle/category, searchable) you drag into a center program made of day blocks (Day 1 Push, Day 2 Pull...). Each placed exercise row has editable sets/reps/rest inputs and a remove button. Reorder exercises within a day by dragging. Add/remove day blocks. A summary shows total exercises and estimated duration per day. Implement drag with native HTML5 drag events. Vanilla JS, no libs.',
  },
  {
    slug: 'gym-client-progress', title: 'Gym — Client Progress View', category: 'ui-components', difficulty: 'med',
    tags: 'client, progress, charts',
    build: "A trainer's view of one client's progress: client header (avatar, name, goal, since-date, adherence ring), self-drawn SVG charts for weight and strength over time, a measurements table (chest/waist/arms with deltas), session-attendance heat strip, and recent notes timeline. A metric tab switcher re-renders the chart. A Send-program / Add-note action with an inline note composer that appends to the timeline. Vanilla JS.",
  },
  {
    slug: 'gym-check-in-kiosk', title: 'Gym — Member Check-in Kiosk', category: 'pages', difficulty: 'med',
    tags: 'kiosk, check-in, qr',
    build: 'A full-screen front-desk check-in kiosk: big welcome state with a pulsing "Scan your QR or tap to check in" zone and a numeric member-ID keypad. On a simulated scan/enter, show a success state with the member photo, name, membership status (Active / Expiring soon / Frozen), today\'s booked class, and an auto-reset countdown back to idle. A live "checked in today" ticker/count and recent check-ins list. Large, high-contrast, kiosk-scale typography. Vanilla JS.',
  },

  // 30.C — Equipment & Floor
  {
    slug: 'gym-floor-map', title: 'Gym — Gym Floor Map', category: 'pages', difficulty: 'med',
    tags: 'floor-map, equipment, zones',
    build: 'An interactive gym floor map: a top-down SVG/CSS-grid layout with labeled zones (Free Weights, Machines, Cardio, Functional/Rig, Studio A, Locker Rooms). Each zone is clickable and shows occupancy (busy/moderate/quiet) via color, plus equipment count. Clicking a zone opens a panel listing its equipment with status. A legend, a live "current capacity" gauge, and hover highlights. Vanilla JS toggles a busy-time simulation. Works on the dark theme.',
  },
  {
    slug: 'gym-equipment-status', title: 'Gym — Equipment Status', category: 'ui-components', difficulty: 'med',
    tags: 'equipment, status, availability',
    build: 'An equipment status board: cards/rows grouped by category (Treadmills, Squat Racks, Benches, Rowers, Cable Machines) each item showing a status pill — In use / Free / Out of order — with how long in use and, for in-use, an ETA bar. Summary counts per status at top. Filter by status and a search. A "report issue" button flips an item to Out of order with a reason. Live-ish updates via a small interval that shuffles a couple statuses. Vanilla JS.',
  },
  {
    slug: 'gym-leaderboard', title: 'Gym — Class Leaderboard', category: 'ui-components', difficulty: 'med',
    tags: 'leaderboard, heart-rate, calories',
    build: 'A live class leaderboard (spin/HIIT style): ranked rows with position, member avatar + name, a metric bar (calories or output/points), current heart-rate zone pill (color-coded Z1–Z5) and effort %. Top 3 get podium styling. A toggle switches the ranking metric (Calories / Output / HR zone time). A simulated live tick nudges values and re-sorts rows with a smooth FLIP-style reorder animation. Energetic, club-screen aesthetic. Vanilla JS.',
  },

  // 30.D — Marketing Pages
  {
    slug: 'gym-page-landing', title: 'Gym — Landing Page', category: 'pages', difficulty: 'med',
    tags: 'landing, marketing, hero',
    build: 'A high-energy gym landing page: bold full-bleed hero with headline, subcopy and a "Start free trial" CTA + secondary "View classes", a stats strip (members, classes/week, trainers, locations), a featured-classes grid, a trainers preview row, a membership-tier teaser, testimonials, and a final trial CTA band + footer. Sticky header with nav + CTA. Scroll-reveal animations and hover states. Vanilla JS for nav toggle, reveal-on-scroll and a testimonial rotator.',
  },
  {
    slug: 'gym-page-classes', title: 'Gym — Classes Overview', category: 'pages', difficulty: 'easy',
    tags: 'classes, marketing, grid',
    build: 'A classes overview marketing page: hero intro, filter tabs by category (Strength, Cardio, Cycle, Yoga, HIIT, Mobility), and a responsive grid of class cards (image/gradient header, name, short blurb, duration, intensity meter, trainer, a "See schedule" link). A spotlight/featured class banner. Filtering shows/hides cards with a smooth fade. Footer CTA to book a trial. Vanilla JS for the filter and reveal animations.',
  },
  {
    slug: 'gym-page-trainers', title: 'Gym — Trainers Page', category: 'pages', difficulty: 'easy',
    tags: 'trainers, coaches, team',
    build: 'A trainers/coaches marketing page: hero, filter chips by specialty (Strength, Mobility, Boxing, Yoga, Nutrition), and a grid of trainer cards (photo/avatar, name, specialties as tags, short bio, certifications, a "Book session" button). Clicking a card opens a detail modal with full bio, achievements and available slots. Filtering animates the grid. Vanilla JS for filter + modal.',
  },
  {
    slug: 'gym-page-pricing', title: 'Gym — Membership Pricing', category: 'pages', difficulty: 'easy',
    tags: 'pricing, membership, plans',
    build: 'A membership pricing page: a monthly/annual billing toggle that updates all prices (annual shows savings), three or four tier cards (Basic, Plus, Unlimited/Black) with feature lists, a highlighted "Most popular" tier, and a class-pack add-on row. A comparison feature table below. FAQ accordion at the bottom. Each tier has a clear CTA. Vanilla JS for the billing toggle, FAQ accordion and CTA toasts.',
  },
  {
    slug: 'gym-page-schedule', title: 'Gym — Public Schedule Page', category: 'pages', difficulty: 'easy',
    tags: 'schedule, public, classes',
    build: 'A public-facing weekly schedule page (marketing, read-first): day tabs or a week grid of classes with time, name, trainer, room and intensity tag, plus a filter by class type and by trainer. Each class row has a "Reserve" button that prompts a trial/sign-up. A location selector at top (e.g. Downtown / Riverside). A "today" highlight and a print-friendly layout. Vanilla JS for tabs, filters and reserve CTA.',
  },

  // 30.E — Admin (Manager)
  {
    slug: 'gym-admin-members', title: 'Gym — Members Admin', category: 'pages', difficulty: 'hard',
    tags: 'admin, members, churn, mrr',
    build: 'A members admin console: KPI header (active members, new this month, churn %, MRR) with mini sparklines, a searchable + filterable members data table (name, tier, status, join date, last visit, lifetime value) with sortable columns, status pills, row actions (freeze, message, view), bulk-select with a bulk action bar, and pagination. A right detail drawer opens on a row showing the member profile. Vanilla JS: sort, filter, search, select, drawer.',
  },
  {
    slug: 'gym-admin-classes', title: 'Gym — Class Management', category: 'pages', difficulty: 'med',
    tags: 'admin, classes, crud',
    build: 'A class management CRUD admin: a table/list of classes (name, type, trainer, day/time, room, capacity, status) with add/edit/delete. An "Add class" button opens a modal form (name, type select, trainer select, day, start time, duration, room, capacity) with validation; saving prepends the row. Inline edit via the same modal pre-filled. Delete asks inline confirm. Filter by type/trainer and a search. Vanilla JS, in-memory store.',
  },
  {
    slug: 'gym-admin-revenue', title: 'Gym — Revenue & Retention Dashboard', category: 'pages', difficulty: 'hard',
    tags: 'admin, revenue, retention, charts',
    build: 'A revenue & retention analytics dashboard: KPI cards (MRR, ARPU, churn, LTV) with trend deltas, a self-drawn SVG revenue-over-time area/line chart, a membership-mix donut, a cohort-retention heat grid (months × cohorts, color intensity), and a top-classes-by-revenue bar list. A date-range toggle (30d / 90d / 12m) re-renders charts. Hover tooltips. All charts hand-drawn in SVG/canvas, no libs. Vanilla JS.',
  },

  // 30.F — Themed Studio Landings (palette overrides)
  {
    slug: 'gym-landing-yoga', title: 'Gym — Yoga / Pilates Studio Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, yoga, pilates, studio',
    build: 'A serene yoga/pilates studio landing: calm hero with soft imagery/gradient and a "Book a class" CTA, a class-styles section (Vinyasa, Yin, Pilates, Restorative) as elegant cards, an instructors row, a schedule teaser, a membership/class-pack section, a testimonial, and a newsletter/CTA footer. Gentle scroll reveals, soft transitions. Vanilla JS for nav, reveal and a quote rotator.',
    palette: 'Yoga/Pilates wellness theme — light, serene, grounded. :root --bg:#f6f3ec (bone) --surface:#ffffff --ink:#2e2a24 --ink-2:#5b554b --muted:#8c8579 --sage:#8a9a7b --sage-d:#6f8061 --rose:#c98b86 (dusty rose) --rose-soft:#f0dedb --line:rgba(46,42,36,0.1). Use a modern serif (e.g. "Playfair Display" or "Cormorant" via Google Fonts) for headings paired with Inter for body. Airy whitespace, soft shadows, rounded organic feel.',
  },
  {
    slug: 'gym-landing-crossfit', title: 'Gym — CrossFit Box Landing', category: 'pages', difficulty: 'hard',
    tags: 'landing, crossfit, box',
    build: 'A raw, intense CrossFit box landing: bold industrial hero with a "Book your intro WOD" CTA, a "WOD of the day" board block (workout written out, scaling options), a programs section (CrossFit, Olympic Lifting, Gymnastics, Conditioning), a coaches row, a community/results section with stats, a class schedule teaser, and a strong CTA band. Gritty, high-contrast, concrete-and-caution-tape aesthetic. Vanilla JS for nav, a WOD timer demo and reveals.',
    palette: 'CrossFit industrial theme — raw, intense. :root --bg:#101113 (near-black) --surface:#191b1e --ink:#f2f3f4 --ink-2:#b7bbc0 --muted:#7d8288 --yellow:#ffd21f (safety yellow) --yellow-d:#e6bd00 --concrete:#3a3d42 --line:rgba(255,255,255,0.1). Industrial condensed/heavy sans for display (e.g. "Oswald" or "Archivo" via Google Fonts) + Inter body. Caution-stripe accents, hard edges, uppercase, stencil energy.',
  },
  {
    slug: 'gym-landing-boutique', title: 'Gym — Boutique Cycling / HIIT Landing', category: 'pages', difficulty: 'hard',
    tags: 'landing, cycling, hiit, boutique',
    build: 'A high-energy boutique cycling/HIIT studio landing (club-like): immersive dark hero with neon glow and a "Claim first ride free" CTA, a signature-classes section (Ride45, Rhythm, HIIT Sculpt) with vivid cards, an instructors/DJ-energy row, a "the experience" section (lighting, sound, metrics), a packs/pricing teaser, testimonials, and a bold CTA. Glowy gradients, motion. Vanilla JS for nav, reveals and a class-time rotator.',
    palette: 'Boutique cycling/HIIT club theme — high-energy, club-like. :root --bg:#140a24 (deep purple/black) --surface:#1e1036 --ink:#fdf7ff --ink-2:#d3c4e8 --muted:#9a8bb5 --pink:#ff2fb0 (neon pink) --pink-d:#e0179a --violet:#8b5cf6 --glow:rgba(255,47,176,0.4) --line:rgba(255,255,255,0.12). Bold display font (e.g. "Anton" or heavy "Sora"/Inter 900) for headings. Neon glows, gradient text, club lighting vibe.',
  },
  {
    slug: 'gym-landing-big-box', title: 'Gym — Big-Box Chain Gym Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, big-box, chain',
    build: 'An accessible, mass-market big-box chain gym landing: friendly hero with a clear "Join for $X/mo" CTA and "Find a club near you" search, an amenities grid (cardio, free weights, classes, pool, sauna, 24/7 access), a simple 3-tier membership row, a locations strip, member testimonials, and an FAQ accordion + join CTA. Clean, bright, trustworthy, broad appeal. Vanilla JS for nav, location search filter, FAQ accordion.',
    palette: 'Big-box chain theme — accessible, mass-market, bright. :root --bg:#ffffff --surface:#f4f5f7 --ink:#15181d --ink-2:#444a52 --muted:#6b727b --red:#e11d2a --red-d:#bf1623 --steel:#2b3340 --steel-2:#3f4a5a --line:rgba(20,24,29,0.1). Chunky friendly sans — Inter 700/800 headings. Big buttons, energetic red accents on a light, clean layout. Approachable, not edgy.',
  },
  {
    slug: 'gym-landing-martial-arts', title: 'Gym — Martial Arts / Boxing Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, martial-arts, boxing',
    build: 'A disciplined martial arts / boxing gym landing: strong hero with a "Start your free trial class" CTA, a disciplines section (Boxing, Muay Thai, BJJ, Kickboxing) as cards, a coaches/sensei row with credentials, a program/belt-or-levels path section, a schedule teaser, testimonials, and a CTA band. Traditional yet modern, gritty discipline. Vanilla JS for nav, reveals and a discipline tab/filter.',
    palette: 'Martial arts / boxing theme — disciplined, traditional. :root --bg:#16161a (charcoal) --surface:#1f1f24 --ink:#f3efe7 (cream) --ink-2:#c4bdb0 --muted:#8a8479 --crimson:#b3122b --crimson-d:#8e0e22 --cream:#efe7d6 --line:rgba(255,255,255,0.1). Slab serif for headings (e.g. "Roboto Slab" or "Bitter" via Google Fonts) + Inter body. Crimson accents on charcoal, cream highlights, strong disciplined feel.',
  },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos de la colección "${COLLECTION}" (Phase 30)…`)

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
