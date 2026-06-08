// ===========================================================================
// Phase 32 — Real Estate Theme 🏡 — workflow multi-agente (25 recursos)
// ===========================================================================
export const meta = {
  name: 'realestate-phase32',
  description: 'Generar los 25 recursos de la Phase 32 (Real Estate): mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'un agente por recurso (25)' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'realestate'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Two Google Fonts via <link>: "Cormorant Garamond" (weights 500;600;700) for display headings, and "Inter" (weights 400;500;600;700) for body/UI. font-family body: "Inter", system-ui, sans-serif; headings: "Cormorant Garamond", Georgia, serif.
- Editorial real-estate palette in :root —
  --ivory:#f7f4ec; --paper:#fffdf8; --white:#ffffff;
  --green:#1f3d34; --green-d:#16302a; --green-700:#26493e; --green-50:#e8efea;
  --brass:#b08d57; --brass-d:#94733f; --brass-50:#f3ead9;
  --ink:#1c2a25; --ink-2:#33433d; --muted:#6b7a72;
  --line:rgba(31,61,52,0.12); --line-2:rgba(31,61,52,0.22);
  --ok:#2f9e6f; --warn:#c98a2b; --danger:#c4503e;
  radii: --r-sm:8px --r-md:14px --r-lg:22px; soft layered shadows.
- box-sizing border-box reset, antialiased, line-height 1.55, --ivory page background.
- Large "photography": since no network, simulate property photos with rich CSS linear/radial gradients (warm/architectural tones) and an aspect-ratio box; optionally a subtle label. Make them feel like real listing imagery, NOT flat gray.
- Editorial feel: generous whitespace, serif display headlines, brass hairline accents, refined cards.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable controls.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional listings, addresses, agent names, prices.`

const DISCLAIMER = '> Illustrative UI only — sample listings and data are fictional; **not** a real real-estate service.'

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

  return `You are generating ONE production-quality static UI demo resource for a Real Estate themed collection. It must be self-contained, polished, and visually distinctive — editorial and premium, not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions, keep Cormorant+Inter unless the mood says otherwise): ${s.palette}\n` : ''}
RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>s, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling listings/data, multiple cards/rows, clear hierarchy, hover/active states, badges (price, beds, status), smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 32.A Buyer / Public ──────────────────────────────────────────────
  { slug: 'realestate-search', title: 'Real Estate — Search Listings', category: 'pages', difficulty: 'hard', tags: 'search, listings, map',
    build: 'Listing search page: sticky filter bar (price range, beds, baths, home type, more-filters), a results grid of listing cards (gradient photo, price, beds/baths/sqft, address, status badge), and a simulated map panel on the right with clickable price pins that highlight the matching card. Sort dropdown, results count, save-search button. JS filters/sorts the in-memory listing set live and syncs pins↔cards.' },
  { slug: 'realestate-listing-card', title: 'Real Estate — Listing Card', category: 'ui-components', difficulty: 'easy', tags: 'card, listing',
    build: 'A reusable listing card: large gradient photo with a carousel dot row + favorite heart toggle, status ribbon (For Sale / New / Pending), price headline, beds·baths·sqft stat row, address line, agent/brokerage footer. Show a small grid of 3-4 cards. Hover lift, heart toggle persists in JS.' },
  { slug: 'realestate-listing-detail', title: 'Real Estate — Listing Detail', category: 'pages', difficulty: 'hard', tags: 'detail, gallery, map',
    build: 'Full property detail page: hero photo gallery (main + thumbnails, clickable to swap, lightbox), price + address header with key facts (beds/baths/sqft/lot/year), description, features grid, a simulated neighborhood map, nearby schools list with ratings, monthly payment estimate widget, and an agent contact card with a request-tour form. JS handles gallery swap, lightbox, and form toast.' },
  { slug: 'realestate-virtual-tour', title: 'Real Estate — Virtual Tour Viewer', category: 'ui-components', difficulty: 'med', tags: 'tour, viewer',
    build: 'A 360/virtual-tour style viewer: large stage with a simulated panoramic room (gradient + hotspot dots), a room thumbnail rail to jump between rooms (Living, Kitchen, Primary Bed, Bath), drag-to-pan affordance, fullscreen + play-autotour buttons, and a floorplan mini-map showing current room. JS switches rooms, animates a pan on drag, toggles autotour.' },
  { slug: 'realestate-mortgage-calc', title: 'Real Estate — Mortgage Calculator', category: 'ui-components', difficulty: 'med', tags: 'mortgage, calculator',
    build: 'Mortgage calculator: inputs for home price, down payment (amount + %), loan term, interest rate, property tax, HOA, insurance. Live monthly payment breakdown (principal+interest, tax, insurance, HOA) with an animated donut/segmented bar, and total interest over loan life. JS recomputes amortized payment on every input change.' },
  { slug: 'realestate-affordability', title: 'Real Estate — Affordability Estimator', category: 'ui-components', difficulty: 'med', tags: 'affordability, calculator',
    build: 'Affordability estimator: inputs for annual income, monthly debts, down payment, rate, and DTI target. Outputs a recommended home price range with a gauge, plus the resulting estimated monthly payment and required income breakdown. JS computes max affordable price from a DTI formula and updates the gauge live.' },
  { slug: 'realestate-saved-search', title: 'Real Estate — Saved Searches / Alerts', category: 'ui-components', difficulty: 'easy', tags: 'alerts, saved',
    build: 'Saved searches & alerts panel: list of saved search rows (name, criteria chips, frequency toggle Instant/Daily/Weekly, new-match count badge, mute + delete). A "create alert" form at top. JS adds/removes searches, toggles alert frequency, clears new-match badges, toast on save.' },
  { slug: 'realestate-tour-booking', title: 'Real Estate — Schedule Tour / Open House', category: 'ui-components', difficulty: 'easy', tags: 'booking, tour',
    build: 'Schedule-a-tour widget: tour type toggle (In-person / Video), a horizontal date strip (next 7 days), available time-slot chips that select, contact fields, and an open-house list to RSVP. JS handles date/slot selection, disables booked slots, confirms with a summary + toast.' },

  // ── 32.B Agent / CRM ─────────────────────────────────────────────────
  { slug: 'realestate-agent-dashboard', title: 'Real Estate — Agent Dashboard', category: 'pages', difficulty: 'hard', tags: 'dashboard, crm',
    build: 'Agent dashboard: top KPI cards (active listings, new leads, pending deals, GCI this month), a leads pipeline summary, a list of active listings with status + views, a tasks/follow-ups list, and a recent-activity feed. Sidebar nav. JS toggles task completion, filters listings by status, animates KPI counts.' },
  { slug: 'realestate-listing-editor', title: 'Real Estate — Listing Editor', category: 'pages', difficulty: 'med', tags: 'editor, form',
    build: 'Listing editor form: photo upload grid with drag-reorder + cover badge, fields for address, price, beds/baths/sqft, property type, description (with char count), features checklist, and a live preview card that updates as you type. Save / publish buttons. JS drives live preview, photo reorder, validation, publish toast.' },
  { slug: 'realestate-lead-card', title: 'Real Estate — Lead Card', category: 'ui-components', difficulty: 'easy', tags: 'lead, crm',
    build: 'Lead card component: avatar/initials, name, contact (phone/email icons), source tag, budget + desired area, lead-status pill (New / Contacted / Touring / Offer), star priority, last-activity timestamp, quick actions (call, email, add note). Show 3-4 cards in a column; JS cycles status, toggles star, adds a note inline.' },
  { slug: 'realestate-cma-report', title: 'Real Estate — CMA / Comp Report', category: 'pages', difficulty: 'med', tags: 'cma, comps, report',
    build: 'Comparative Market Analysis report: subject property header, a table of comparable sales (address, sold price, $/sqft, beds/baths, sold date, distance), adjustments, and a suggested price range with a price-distribution bar chart. Print-style editorial layout. JS recalculates suggested range when comps are toggled in/out.' },
  { slug: 'realestate-offer-tracker', title: 'Real Estate — Offer Tracker', category: 'ui-components', difficulty: 'med', tags: 'offers, negotiation',
    build: 'Offer tracker for one listing: list price header, then offer rows (buyer, amount, terms badges like cash/financed/contingencies, status: Submitted/Countered/Accepted/Rejected, timestamp). A counter-offer composer. Highlight the leading offer. JS adds counters, changes statuses, recomputes the highest/leading offer.' },
  { slug: 'realestate-transaction-pipeline', title: 'Real Estate — Transaction Pipeline', category: 'pages', difficulty: 'hard', tags: 'pipeline, kanban',
    build: 'Kanban transaction pipeline: columns (New Lead, Showing, Offer, Under Contract, Closing, Closed) each with deal cards (property thumb, address, price, client, days-in-stage, checklist progress). Drag cards between columns; column totals (count + $ volume) update. JS implements drag-drop and recomputes column sums.' },

  // ── 32.C Marketing Pages ─────────────────────────────────────────────
  { slug: 'realestate-page-brokerage', title: 'Real Estate — Brokerage Landing', category: 'pages', difficulty: 'med', tags: 'landing, marketing',
    build: 'Brokerage marketing landing: editorial hero (headline, search bar, hero photo), stats strip (homes sold, $ volume, agents), featured listings carousel, "why us" feature trio, agent spotlight grid, testimonials, and a CTA footer. JS drives the listings carousel and a contact CTA toast.' },
  { slug: 'realestate-page-agent', title: 'Real Estate — Agent Profile', category: 'pages', difficulty: 'easy', tags: 'profile, personal-brand',
    build: 'Agent personal-brand page: portrait hero with name, title, brokerage, and contact buttons, a short bio, stats (sales, avg days on market, areas served), active + sold listings grid, reviews carousel, and a contact form. JS handles listing tab switch (active/sold) and form toast.' },
  { slug: 'realestate-page-neighborhood', title: 'Real Estate — Neighborhood Guide', category: 'pages', difficulty: 'med', tags: 'neighborhood, guide',
    build: 'Neighborhood guide page: hero with neighborhood name + vibe, market snapshot stats (median price, $/sqft, days on market trend), a "lifestyle" section (walk/transit/bike scores as dials), local amenities list (schools, parks, dining) with category filter, and featured local listings. JS filters amenities by category and animates the score dials.' },

  // ── 32.D Brokerage Admin ─────────────────────────────────────────────
  { slug: 'realestate-admin-dashboard', title: 'Real Estate — Brokerage Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, analytics',
    build: 'Brokerage admin dashboard: KPI row (total volume, GCI, units closed, avg DOM), a sales-volume trend line/area chart (CSS/SVG), top-agents leaderboard table, listings-by-status donut, and a recent-closings feed. Date-range toggle. JS animates charts, switches the date range to re-render numbers.' },
  { slug: 'realestate-admin-team', title: 'Real Estate — Team / Agent Roster', category: 'pages', difficulty: 'med', tags: 'admin, roster',
    build: 'Agent roster admin: searchable/filterable table or card grid of agents (avatar, name, role, active listings, YTD volume, status active/inactive), team filter chips, an invite-agent button + modal, and per-row actions. JS filters by search/team/status and opens the invite modal.' },
  { slug: 'realestate-admin-compliance', title: 'Real Estate — Compliance / Document Tracker', category: 'ui-components', difficulty: 'med', tags: 'admin, compliance, documents',
    build: 'Compliance document tracker: per-transaction checklist of required docs (listing agreement, disclosures, inspection, appraisal, closing) each with status (Missing / Pending Review / Approved / Expired), due date, and upload/review actions. Progress ring per transaction + a filter for incomplete. JS changes doc statuses, recomputes the progress ring, filters incomplete.' },

  // ── 32.E Themed Landings (palette overrides) ─────────────────────────
  { slug: 'realestate-landing-luxury', title: 'Real Estate — Luxury Estates Landing', category: 'pages', difficulty: 'hard', tags: 'landing, luxury',
    palette: 'Luxury Estates — Ivory #f7f4ec + deep green #1f3d34 + brass #b08d57. Cormorant Garamond display + Inter body. Mood: editorial, refined, refined gold hairlines, slow elegant motion.',
    build: 'Luxury estates landing: cinematic full-bleed estate hero with serif headline and a refined inquiry bar, a curated collection of premium listings (large gradient photos, price on hover reveal), a private-services section, a bespoke advisor block, and an understated CTA. Smooth reveal-on-scroll and a featured-estate switcher in JS.' },
  { slug: 'realestate-landing-urban', title: 'Real Estate — Urban Condo Tower Landing', category: 'pages', difficulty: 'hard', tags: 'landing, urban, condo',
    palette: 'Urban Condo Tower — Charcoal #1a1d21 + glass blue #5a8fb0 + chrome #cfd6dd. Clean grotesque sans (use Inter tight/uppercase tracking for display instead of serif). Mood: modern, sleek, glassy, sharp.',
    build: 'Urban condo tower landing: sleek dark hero with the tower silhouette (gradient) and floor-availability ticker, residences grid (studio→penthouse with floorplans + price-from), an amenities strip (rooftop, gym, concierge) with icon tiles, a floor-selector that shows available units, and a register-interest CTA. JS drives the floor selector + availability.' },
  { slug: 'realestate-landing-suburban', title: 'Real Estate — Suburban Family Homes Landing', category: 'pages', difficulty: 'med', tags: 'landing, suburban, family',
    palette: 'Suburban Family Homes — Sage #7d9b80 + cream #f4efe3 + warm wood #b5804f. Friendly serif (Cormorant) display + Inter body. Mood: welcoming, warm, family-friendly, soft.',
    build: 'Suburban family-homes landing: warm welcoming hero (family-home photo gradient, friendly headline, neighborhood search), a "find your fit" home-style chooser (ranch, colonial, craftsman), featured family homes grid with school-rating badges, a community-life section, and a friendly CTA. JS filters homes by style and a school-rating slider.' },
  { slug: 'realestate-landing-commercial', title: 'Real Estate — Commercial / Industrial Landing', category: 'pages', difficulty: 'med', tags: 'landing, commercial, b2b',
    palette: 'Commercial / Industrial — Steel #3b454d + navy #1d2b3a + amber #e0a13c. Clean sans (Inter) for both display and body. Mood: authoritative, B2B, structured, no-nonsense.',
    build: 'Commercial real-estate landing: authoritative hero with asset-class tabs (Office, Retail, Industrial, Land), a property listings table/grid with cap rate, NOI, price/sqft, lease vs sale badges, an investment-highlights strip, a brokerage-services section, and a request-OM CTA. JS switches asset-class tabs and sorts the listings table.' },
  { slug: 'realestate-landing-vacation', title: 'Real Estate — Vacation / Short-term Rental Landing', category: 'pages', difficulty: 'med', tags: 'landing, vacation, rental',
    palette: 'Vacation / Short-term Rental — Sand #efe2cf + teal #2a9d9b + coral #f08a6c. Airy sans (Inter) display + body. Mood: escape, lifestyle, bright, breezy.',
    build: 'Vacation-rental landing: airy beach/escape hero with a destination + dates search, a getaways grid (gradient photos, nightly price, rating, guest count, sleeps badge), a destinations carousel, a "list your property" host CTA, and trust/host highlights. JS handles the destination filter, a guests stepper, and the destinations carousel.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos de la colección "${COLLECTION}" (Phase 32)…`)

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
