// ===========================================================================
// Phase 35 — Auto Repair / Dealership Theme. Collection: auto. 23 resources (A–E).
// ===========================================================================

export const meta = {
  name: 'phase35-auto-build',
  description: 'Build 23 Auto Repair/Dealership resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'auto'

const STYLE = `DESIGN SYSTEM (Auto Repair / Dealership — industrial, technical, status-forward; match exactly unless a palette override is given):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif. Tabular figures for prices/odometer/VIN.
- Default palette in :root —
  --garage:#141518 (garage black); --garage-2:#1f2127; --steel:#5b6470 (steel); --steel-l:#8a929d;
  --orange:#ff6a13 (safety orange); --orange-d:#e2540a; --orange-50:#fff0e6;
  --ink:#16181c; --ink-2:#3b4049; --muted:#737a85; --bg:#f3f4f6; --surface:#ffffff;
  --line:rgba(20,21,24,0.1); --line-2:rgba(20,21,24,0.18); --ok:#2f9e6f; --warn:#e0962a; --danger:#d4493e;
  status: --waiting:#e0962a; --inprogress:#2b7fff; --done:#2f9e6f; --hold:#d4493e;
  radii --r-sm:8px --r-md:14px --r-lg:18px; soft shadows.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- Automotive conventions: large status panels (Waiting / In Progress / Done / On Hold), bay numbers, VIN/plate/odometer, work-order line items (labor + parts), diagnostic codes (P0301), money totals, vehicle photos (gradient placeholders), technical iconography.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons & inputs.
- Responsive: works down to ~360px (add @media (max-width:520px)). Tech/customer mobile views feel mobile-first.
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional shop names, customer names, vehicles, plates.`

const DISCLAIMER = '> Illustrative UI only — fictional shop/dealership, not a real service system.'

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

  return `You are generating ONE production-quality static UI demo resource for an Auto Repair/Dealership theme. Self-contained, polished, visually distinctive — not a generic placeholder.

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

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, status panels, smooth micro-interactions, a genuinely interactive script. ${s.slug.includes('-landing-') ? 'FULL multi-section landing page (nav, hero, 4-5 sections, footer, mobile nav, scroll reveal).' : ''} No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 35.A Service / Repair ───────────────────────────────────────────────
  { slug: 'auto-service-board', title: 'Auto — Service Bay Board', category: 'pages', difficulty: 'hard', tags: 'service, board',
    build: 'Service bay board: columns per bay (or kanban by status waiting/in-progress/done/hold), job cards (vehicle, customer, service, tech, ETA, progress), shop KPIs header. Interactive: move job between statuses, assign tech, filter, live progress.' },
  { slug: 'auto-work-order', title: 'Auto — Work Order', category: 'pages', difficulty: 'med', tags: 'work-order, service',
    build: 'Work order: vehicle + customer header (VIN, plate, odometer), tasks list (labor lines with hours), parts list, notes, totals, status. Interactive: add/remove labor & parts lines, edit qty/hours, live total, status change, save.' },
  { slug: 'auto-diagnostic-report', title: 'Auto — Diagnostic Report', category: 'ui-components', difficulty: 'med', tags: 'diagnostic, report',
    build: 'Diagnostic report: scanned trouble codes (P0301 etc.) with severity, system affected, recommended fixes + cost, vehicle health summary gauges. Interactive: expand code detail, severity filter, approve recommended fix, health gauges.' },
  { slug: 'auto-estimate', title: 'Auto — Repair Estimate', category: 'ui-components', difficulty: 'med', tags: 'estimate, quote',
    build: 'Repair estimate: line items (labor + parts), recommended vs optional toggles, subtotal/tax/total, approve/decline per item, customer-facing summary. Interactive: toggle optional items recompute total, approve/decline, sign-off.' },
  { slug: 'auto-parts-inventory', title: 'Auto — Parts Inventory', category: 'pages', difficulty: 'med', tags: 'parts, inventory',
    build: 'Parts inventory: SKU search, parts table (SKU, name, brand, qty, bin, price, low-stock flag), filters, reorder, part detail drawer. Interactive: search/filter, low-stock highlight, adjust qty, reorder toast.' },
  { slug: 'auto-tech-mobile', title: 'Auto — Technician Mobile Job View', category: 'pages', difficulty: 'med', tags: 'technician, mobile',
    build: 'Mobile technician job view: assigned job card, task checklist, clock-on/off timer, photo/note capture, parts request, mark complete. Interactive: check off tasks, start/stop timer, request part, complete job animation.' },

  // ── 35.B Customer ───────────────────────────────────────────────────────
  { slug: 'auto-customer-portal', title: 'Auto — Customer Service Portal', category: 'pages', difficulty: 'med', tags: 'customer, portal',
    build: 'Customer service portal: my vehicles, active service status, service history, upcoming maintenance reminders, book/approve actions, invoices. Interactive: vehicle switch, view status, book service, approve quote, download invoice.' },
  { slug: 'auto-service-booking', title: 'Auto — Book Service Appointment', category: 'pages', difficulty: 'med', tags: 'booking, appointment',
    build: 'Book service appointment: vehicle select, service type multi-select, date + time-slot picker, drop-off/wait/loaner option, estimate preview, confirm. Interactive: service select updates estimate, slot pick, confirm success.' },
  { slug: 'auto-repair-tracker', title: 'Auto — Repair Status Tracker', category: 'ui-components', difficulty: 'easy', tags: 'tracker, status',
    build: 'Repair status tracker (text-style updates): step tracker (checked in → diagnosing → awaiting approval → in repair → ready), live updates feed like text messages from the shop, ETA, approve button. Interactive: animated progress, new-update pulse, approve.' },
  { slug: 'auto-quote-approval', title: 'Auto — Quote Approval', category: 'ui-components', difficulty: 'easy', tags: 'quote, approval',
    build: 'Quote approval (digital sign-off): itemized quote, approve-all or per-line approve/decline, signature pad (canvas), authorized total, submit. Interactive: per-line toggles recompute authorized total, working signature canvas, submit success.' },

  // ── 35.C Sales / Showroom ───────────────────────────────────────────────
  { slug: 'auto-inventory-grid', title: 'Auto — Vehicle Inventory Grid', category: 'pages', difficulty: 'hard', tags: 'sales, inventory',
    build: 'Vehicle inventory grid: filter rail (make, model, year, price, mileage, body, fuel), search, vehicle cards (photo, year/make/model, price, mileage, badges), sort, compare. Interactive: filters + sort update grid, save/compare toggle, quick-view.' },
  { slug: 'auto-vehicle-detail', title: 'Auto — Vehicle Detail', category: 'pages', difficulty: 'hard', tags: 'sales, detail',
    build: 'Vehicle detail: photo gallery, price + finance-from, specs grid, features list, finance calculator teaser, trade-in, schedule test drive, dealer contact. Interactive: gallery, spec tabs, finance estimate, sticky CTA bar, test-drive modal.' },
  { slug: 'auto-finance-calc', title: 'Auto — Finance / Lease Calculator', category: 'ui-components', difficulty: 'med', tags: 'finance, calculator',
    build: 'Finance / lease calculator: vehicle price, down payment, term, APR, trade-in inputs; finance vs lease tabs; monthly payment output with breakdown chart. Interactive: sliders/inputs recompute payment live, finance/lease toggle, amortization summary.' },
  { slug: 'auto-trade-in', title: 'Auto — Trade-In Valuation', category: 'ui-components', difficulty: 'med', tags: 'trade-in, valuation',
    build: 'Trade-in valuation form: vehicle details (make/model/year/mileage/condition), condition selector, options, estimated value range result with gauge, apply-to-purchase. Interactive: condition affects estimate, multi-step, animated value result.' },
  { slug: 'auto-test-drive-booking', title: 'Auto — Test Drive Booking', category: 'ui-components', difficulty: 'easy', tags: 'test-drive, booking',
    build: 'Test drive booking: selected vehicle card, date + time-slot picker, contact details, license confirm, confirm. Interactive: slot select, validation, confirm success with calendar add.' },

  // ── 35.D Admin / Manager ────────────────────────────────────────────────
  { slug: 'auto-admin-dashboard', title: 'Auto — Shop Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, dashboard',
    build: 'Shop dashboard: KPIs (revenue, bay utilization, avg ticket, cars serviced), revenue chart, bay-utilization bars, service-type mix, pending approvals, top techs. Interactive: timeframe toggle redraws charts, bay drill, approvals action.' },
  { slug: 'auto-admin-tech-productivity', title: 'Auto — Technician Productivity', category: 'pages', difficulty: 'med', tags: 'admin, productivity',
    build: 'Technician productivity report: techs table (billed hours, efficiency %, jobs, revenue), efficiency leaderboard, hours billed vs available chart, per-tech detail. Interactive: sort, timeframe toggle, tech drill, efficiency bars.' },
  { slug: 'auto-admin-customer-db', title: 'Auto — Customer & Vehicle Database', category: 'pages', difficulty: 'med', tags: 'admin, crm',
    build: 'Customer & vehicle database: searchable customers table, customer detail (vehicles, service history, spend, notes), vehicle records with VIN. Interactive: search, open customer drawer, vehicle history, add note.' },

  // ── 35.E Themed Dealership Landings (5) ─────────────────────────────────
  { slug: 'auto-landing-luxury', title: 'Auto — Luxury Dealership Landing', category: 'pages', difficulty: 'hard', tags: 'landing, luxury',
    palette: 'Luxury dealership (BMW/Mercedes-style) — Charcoal #16181c + champagne #d9c7a3 + chrome · refined sans · prestige, precision, premium',
    build: 'Luxury-dealership landing: cinematic hero with featured model, current lineup/models grid, signature features, bespoke ownership/service, finance offers, book test-drive, footer. Refined, reveal.' },
  { slug: 'auto-landing-ev', title: 'Auto — EV Dealership Landing', category: 'pages', difficulty: 'hard', tags: 'landing, ev',
    palette: 'EV / Tesla-style — White + minimal + electric blue #2b7fff · ultra-clean sans · futuristic, minimal, clean',
    build: 'EV-dealership landing: ultra-clean hero with EV + range/charging stats, models, charging network, performance & autonomy features, order/configure CTA, footer. Minimal, animated stats, reveal.' },
  { slug: 'auto-landing-used', title: 'Auto — Used Car Lot Landing', category: 'pages', difficulty: 'med', tags: 'landing, used',
    palette: 'Used car lot — Red #d4262b + white + steel · chunky display · accessible, value-driven, friendly',
    build: 'Used-car-lot landing: value hero with inventory-search, featured deals grid, certified/warranty trust, financing for all credit, trade-in, locations, CTA, footer. Bold, deal badges, reveal.' },
  { slug: 'auto-landing-motorcycle', title: 'Auto — Motorcycle Dealership Landing', category: 'pages', difficulty: 'med', tags: 'landing, motorcycle',
    palette: 'Motorcycle / Harley-style — Black + chrome + oxblood #5c1a1a · slab serif · rebellious, heritage, rugged',
    build: 'Motorcycle-dealership landing: gritty hero with hero bike, model lineup, gear & apparel, rider community/events, service & customization, finance, CTA, footer. Heritage, rugged hover, reveal.' },
  { slug: 'auto-landing-performance', title: 'Auto — Performance / Tuning Landing', category: 'pages', difficulty: 'hard', tags: 'landing, performance',
    palette: 'Performance / tuning shop — Carbon #0e0f12 + neon green #b6ff2e + orange · technical sans · adrenaline, motorsport, aggressive',
    build: 'Performance/tuning-shop landing: high-octane hero, services (ECU tuning, exhaust, suspension, dyno), dyno-results/before-after, build gallery, packages, book-a-dyno CTA, footer. Aggressive, animated, reveal.' },
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
