// ===========================================================================
// Phase 33 — Travel / Airline Theme. Collection: airline. 26 resources (A–E).
// ===========================================================================

export const meta = {
  name: 'phase33-airline-build',
  description: 'Build 26 Travel/Airline resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'airline'

const STYLE = `DESIGN SYSTEM (Travel / Airline — precise, status-forward, clean aviation feel; match exactly unless a palette override is given):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif. Use tabular figures for times/flight numbers/prices.
- Default palette in :root —
  --sky:#0a66c2 (aviation blue); --sky-d:#084e95; --sky-50:#e9f2fb; --cloud:#f5f8fc (cloud white);
  --sunrise:#ff7a33 (sunrise orange accent); --sunrise-50:#fff0e7;
  --ink:#13233b; --ink-2:#3a4d68; --muted:#6b7c93; --bg:#f5f8fc; --surface:#ffffff;
  --line:rgba(19,35,59,0.1); --line-2:rgba(19,35,59,0.18); --ok:#1f9d62; --warn:#e0962a (delayed); --danger:#d4493e (cancelled); --boarding:#1f9d62;
  radii --r-sm:8px --r-md:14px --r-lg:20px; soft shadows.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- Aviation conventions: airport codes (JFK→LHR), 24h times, flight numbers, large status pills (On time / Delayed / Boarding / Cancelled / Departed), seat/gate/terminal labels, dashed boarding-pass perforations, precise iconography (plane, gate, bag).
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons & inputs.
- Responsive: works down to ~360px (add @media (max-width:520px)). Passenger screens feel mobile-first.
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional airline names, routes, flight numbers, passenger names.`

const DISCLAIMER = '> Illustrative UI only — fictional airline, not a real booking or flight system.'

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
createdAt: 2026-06-18
updatedAt: 2026-06-18
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Travel/Airline theme. Self-contained, polished, visually distinctive — not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, status pills, smooth micro-interactions, a genuinely interactive script. ${s.slug.includes('-landing-') ? 'FULL multi-section landing page (nav, hero, 4-5 sections, footer, mobile nav, scroll reveal).' : ''} No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 33.A Passenger ──────────────────────────────────────────────────────
  { slug: 'air-flight-search', title: 'Airline — Flight Search', category: 'pages', difficulty: 'med', tags: 'search, booking',
    build: 'Flight search: from/to airport inputs with swap, round-trip/one-way/multi-city tabs, date pickers, passengers + cabin selector, search button, recent searches + popular routes. Interactive: swap airports, trip-type tabs, passenger stepper, validation, search toast.' },
  { slug: 'air-flight-results', title: 'Airline — Results List', category: 'pages', difficulty: 'hard', tags: 'results, fares',
    build: 'Flight results: list of flight cards (airline, depart→arrive times, duration, stops, price), filter rail (stops, times, airlines, price), sort tabs (cheapest/fastest/best), fare-class expand. Interactive: filters + sort update list, expand fare options, select flight.' },
  { slug: 'air-seat-map', title: 'Airline — Seat Map Selector', category: 'ui-components', difficulty: 'hard', tags: 'seatmap, selection',
    build: 'Aircraft seat-map selector: cabin layout (first/business/economy) with seats, legend (available/selected/occupied/extra-legroom/exit), seat tooltip (number, price), selected summary + total, deck zoom. Interactive: select/deselect with price, max-per-pax guard, hover tooltip, live total.' },
  { slug: 'air-booking-flow', title: 'Airline — Booking Flow', category: 'pages', difficulty: 'hard', tags: 'booking, checkout',
    build: 'Booking flow: passenger details forms, extras (bags, seats, meals, insurance), fare summary sidebar, payment, review → confirmation. Interactive: multi-step with validation, extras update running total, fare breakdown, success.' },
  { slug: 'air-checkin-flow', title: 'Airline — Online Check-in', category: 'pages', difficulty: 'med', tags: 'checkin, wizard',
    build: 'Online check-in wizard: find booking (ref + name), passenger confirm, seat selection, bags, health/docs declaration, boarding-pass issue. Interactive: step navigation, seat pick, document toggles, issue boarding pass success.' },
  { slug: 'air-boarding-pass', title: 'Airline — Boarding Pass', category: 'ui-components', difficulty: 'easy', tags: 'boarding-pass, qr',
    build: 'Mobile boarding pass: perforated-edge card with passenger, flight, gate, seat, boarding time, zone, animated QR, add-to-wallet, flip for details. Show 2-3 passes. Interactive: flip, brightness boost, wallet toast, gate-change pulse.' },
  { slug: 'air-flight-status', title: 'Airline — Flight Status Board', category: 'ui-components', difficulty: 'med', tags: 'status, board',
    build: 'Flight status board widget: search a flight, big status card (route, times, gate, terminal, status pill, progress along route), plus a small departures list. Interactive: search flight, animated route progress, status states, auto-refresh pulse.' },
  { slug: 'air-trip-itinerary', title: 'Airline — Trip Itinerary', category: 'ui-components', difficulty: 'med', tags: 'itinerary, trip',
    build: 'Multi-leg trip itinerary: timeline of flight segments (with layovers), each leg card (airline, flight no, times, terminal, duration), connection times, manage actions (change/cancel/add bag). Interactive: expand leg details, layover warnings, manage menu.' },
  { slug: 'air-loyalty-card', title: 'Airline — Frequent Flyer Card', category: 'ui-components', difficulty: 'easy', tags: 'loyalty, status',
    build: 'Frequent-flyer status card: tier (Silver/Gold/Platinum), miles balance, progress to next tier, benefits list, digital membership QR, recent activity. Show 2 tiers. Interactive: flip card, progress animation, redeem toast.' },
  { slug: 'air-baggage-tracker', title: 'Airline — Baggage Tracker', category: 'ui-components', difficulty: 'easy', tags: 'baggage, tracking',
    build: 'Baggage tracker: bag tag id, status step tracker (checked → loaded → in transit → arrived → carousel), flight info, carousel number, report-issue. Interactive: animated status progress, multiple bags, report-issue modal.' },

  // ── 33.B Airport / Staff ────────────────────────────────────────────────
  { slug: 'air-gate-display', title: 'Airline — Gate Departure Display', category: 'pages', difficulty: 'med', tags: 'gate, display',
    build: 'Gate departure display (big-screen style): flight, destination, boarding time, gate, status, boarding-group progress, now-boarding zone, countdown. Interactive: boarding-group advance, status change, countdown timer.' },
  { slug: 'air-fids-board', title: 'Airline — Flight Information Display (FIDS)', category: 'pages', difficulty: 'med', tags: 'fids, board',
    build: 'Airport FIDS board: departures/arrivals tabs, table (time, flight, destination, gate, status with color), search/filter, split-flap or fade row animation, last-updated clock. Interactive: tab switch, search, animated status updates, live clock.' },
  { slug: 'air-gate-agent', title: 'Airline — Gate Agent Boarding UI', category: 'pages', difficulty: 'hard', tags: 'staff, boarding',
    build: 'Gate-agent boarding UI: flight header (load, boarded count, gate), scan-to-board panel with result (accepted/standby/seat-dupe), boarding-group control, passenger list with status, upgrade/standby queue. Interactive: simulate scans incrementing boarded, group control, standby clearing.' },
  { slug: 'air-checkin-kiosk', title: 'Airline — Self-Check-in Kiosk', category: 'pages', difficulty: 'med', tags: 'kiosk, checkin',
    build: 'Self-check-in kiosk UI (touch, large targets): retrieve booking (scan/ref/frequent-flyer), passenger select, seat, bags, print boarding pass + bag tags. Interactive: big touch buttons, step flow, seat pick, print success animation.' },

  // ── 33.C Marketing ──────────────────────────────────────────────────────
  { slug: 'air-page-landing', title: 'Airline — Airline Landing', category: 'pages', difficulty: 'med', tags: 'marketing, landing',
    build: 'Airline marketing landing: hero with integrated flight-search widget, deals/destinations grid, why-fly-us features, loyalty teaser, app download, footer. Interactive: search widget, deals carousel, mobile nav, reveal.' },
  { slug: 'air-page-destinations', title: 'Airline — Destinations Page', category: 'pages', difficulty: 'med', tags: 'marketing, destinations',
    build: 'Destinations page: searchable destination grid (city, country, from-price, image), region filter, featured destination spotlight, map teaser. Interactive: region filter, search, destination quick-view, sort by price.' },
  { slug: 'air-page-fleet', title: 'Airline — Our Fleet', category: 'pages', difficulty: 'easy', tags: 'marketing, fleet',
    build: 'Our Fleet page: aircraft cards (model, capacity, range, cabin classes), spec tabs, cabin gallery, interactive seat-config preview. Interactive: aircraft tabs, spec toggle, cabin gallery, reveal.' },
  { slug: 'air-page-loyalty', title: 'Airline — Loyalty Program', category: 'pages', difficulty: 'easy', tags: 'marketing, loyalty',
    build: 'Loyalty program page: tier benefits comparison table, how-to-earn/redeem, partners, join CTA, miles calculator teaser. Interactive: tier compare highlight, miles calculator, join form, reveal.' },

  // ── 33.D Ops / Admin ────────────────────────────────────────────────────
  { slug: 'air-ops-control-center', title: 'Airline — Ops Control Center', category: 'pages', difficulty: 'hard', tags: 'ops, admin',
    build: 'Ops control center: live flight board with disruptions, KPIs (on-time %, delays, cancellations, aircraft util), map/route status teaser, disruption alert feed, gantt-style aircraft rotation. Interactive: filter by status, acknowledge alerts, rotation drill, auto-refresh.' },
  { slug: 'air-crew-schedule', title: 'Airline — Crew Schedule', category: 'pages', difficulty: 'hard', tags: 'ops, crew',
    build: 'Crew schedule: crew roster grid (pilots + cabin) × flights/days, duty-time indicators, swap/assign, legality/rest warnings, crew detail drawer. Interactive: assign crew to flight, swap, rest-warning flags, filter by role.' },
  { slug: 'air-load-factor-report', title: 'Airline — Load Factor Report', category: 'pages', difficulty: 'med', tags: 'admin, report',
    build: 'Load factor & revenue report: KPIs (load factor, RASK, yield, revenue), load-factor-by-route chart, revenue trend, top/bottom routes table, cabin mix. Interactive: timeframe toggle redraws charts, route drill, export.' },

  // ── 33.E Themed Landings (5) ────────────────────────────────────────────
  { slug: 'air-landing-legacy', title: 'Airline — Legacy Flag Carrier Landing', category: 'pages', difficulty: 'hard', tags: 'landing, legacy',
    palette: 'Legacy flag carrier — Navy #0b2545 + gold #c8a24b + white · classic serif + sans · prestigious, established, national',
    build: 'Legacy flag-carrier landing: prestige hero with flight-search, network/destinations, cabin classes showcase, loyalty program, heritage section, app, footer. Search widget, mobile nav, reveal.' },
  { slug: 'air-landing-lowcost', title: 'Airline — Low-Cost Carrier Landing', category: 'pages', difficulty: 'med', tags: 'landing, lowcost',
    palette: 'Low-cost carrier — Yellow #ffd400 + black + magenta accent · loud bold sans · cheerful, value, energetic',
    build: 'Low-cost-carrier landing: punchy hero with cheap-fares search + price callouts, deals grid, add-ons explainer, route map, app download, footer. Bold, fare tickers, mobile nav, reveal.' },
  { slug: 'air-landing-premium', title: 'Airline — Premium Boutique Landing', category: 'pages', difficulty: 'hard', tags: 'landing, premium',
    palette: 'Premium boutique (Emirates-style) — Deep red #7a1f2b + cream + gold · refined serif · luxurious, hospitality, opulent',
    build: 'Premium-boutique airline landing: opulent hero, signature cabins (first/business suites), onboard experience, lounges, destinations, loyalty, footer. Cinematic, refined hover, reveal.' },
  { slug: 'air-landing-regional', title: 'Airline — Regional Landing', category: 'pages', difficulty: 'med', tags: 'landing, regional',
    palette: 'Regional / short-hop — Sky blue #2b9fe0 + white + green · friendly rounded sans · approachable, local, easy',
    build: 'Regional/short-hop airline landing: friendly hero with quick-search, local routes map, fast-turnaround perks, community feel, simple fares, app, footer. Approachable, reveal.' },
  { slug: 'air-landing-charter', title: 'Airline — Private Charter Landing', category: 'pages', difficulty: 'hard', tags: 'landing, charter',
    palette: 'Private charter / jet card — Black #0c0c0f + champagne #e6d2a8 + slate · elegant serif · exclusive, discreet, bespoke',
    build: 'Private-charter/jet-card landing: discreet luxury hero with request-a-quote, fleet (light/mid/heavy jets), membership/jet-card tiers, on-demand process, concierge, footer. Quote form, elegant, reveal.' },
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
