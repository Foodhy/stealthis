// ===========================================================================
// Phase 34 — Coworking / Studio Rental Theme. Collection: cowork. 20 resources.
// ===========================================================================

export const meta = {
  name: 'phase34-cowork-build',
  description: 'Build 20 Coworking/Studio resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'cowork'

const STYLE = `DESIGN SYSTEM (Coworking / Studio — warm industrial, modern, community; match exactly unless a palette override is given):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif.
- Default palette in :root —
  --concrete:#efeae3 (warm concrete); --concrete-d:#e2dcd2; --amber:#e8902b (amber accent); --amber-d:#cc7918; --amber-50:#fdf1e2;
  --char:#1c1b19 (matte black); --ink:#26241f; --ink-2:#4a463e; --muted:#7b766c; --bg:#f6f3ee; --surface:#ffffff;
  --plant:#5f7a52 (plant green accent); --line:rgba(28,27,25,0.1); --line-2:rgba(28,27,25,0.18);
  --ok:#2f9e6f; --warn:#d98a2b; --danger:#d4503e; --occupied:#d4503e; --free:#2f9e6f;
  radii --r-sm:8px --r-md:14px --r-lg:20px; soft shadows.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- Coworking conventions: floor-plan grids with occupancy color (free/occupied/reserved), desk/room availability slots, credits/hours meters, member avatars, QR access, plant accents, industrial photography placeholders (warm gradient blocks).
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons & inputs.
- Responsive: works down to ~360px (add @media (max-width:520px)).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional space names, member names, bookings.`

const DISCLAIMER = '> Illustrative UI only — fictional coworking space, not a real booking system.'

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

  return `You are generating ONE production-quality static UI demo resource for a Coworking/Studio theme. Self-contained, polished, visually distinctive — not a generic placeholder.

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

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, status indicators, smooth micro-interactions, a genuinely interactive script. ${s.slug.includes('-landing') ? 'FULL multi-section landing page (nav, hero, 4-5 sections, footer, mobile nav, scroll reveal).' : ''} No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 34.A Member ─────────────────────────────────────────────────────────
  { slug: 'cowork-desk-booking', title: 'Coworking — Desk Booking', category: 'pages', difficulty: 'hard', tags: 'booking, desk',
    build: 'Desk booking: interactive floor plan with desks (free/occupied/reserved colors), date + time-slot picker, desk detail popover (type, amenities, price/credits), booking summary, confirm. Interactive: pick desk on plan, slot select, live availability, confirm booking.' },
  { slug: 'cowork-room-booking', title: 'Coworking — Meeting Room Booking', category: 'pages', difficulty: 'med', tags: 'booking, room',
    build: 'Meeting room booking: room cards (capacity, AV, price), day timeline with available/booked slots, duration picker, attendees, confirm. Interactive: room select, drag/select time range, conflict check, confirm.' },
  { slug: 'cowork-member-dashboard', title: 'Coworking — Member Dashboard', category: 'pages', difficulty: 'med', tags: 'dashboard, member',
    build: "Member dashboard: today's bookings, credits/hours meter, quick book buttons, upcoming events, community shoutouts, access status. Interactive: cancel booking, quick-book, credits animation, tabs." },
  { slug: 'cowork-access-card', title: 'Coworking — Mobile Access Card', category: 'ui-components', difficulty: 'easy', tags: 'access, qr',
    build: 'Mobile access card / QR: member card with photo, tier, animated QR/NFC, door-unlock button with success pulse, recent access log. Interactive: tap to unlock animation, QR refresh, flip for details.' },
  { slug: 'cowork-credits-balance', title: 'Coworking — Credits Balance', category: 'ui-components', difficulty: 'easy', tags: 'credits, balance',
    build: 'Credits / hours balance widget: circular meter of remaining vs plan, breakdown (meeting credits, print, guest passes), usage history, top-up button. Interactive: animated meter, usage list, top-up modal.' },
  { slug: 'cowork-community-feed', title: 'Coworking — Community Feed', category: 'pages', difficulty: 'med', tags: 'community, feed',
    build: 'Community feed: posts (events, member intros, marketplace, announcements), filters, RSVP to events, member directory sidebar, new-post composer. Interactive: filter, RSVP toggle, like, compose post.' },

  // ── 34.B Operations ─────────────────────────────────────────────────────
  { slug: 'cowork-floor-plan', title: 'Coworking — Live Floor Plan', category: 'pages', difficulty: 'hard', tags: 'ops, floorplan',
    build: 'Live floor plan with occupancy: zoomable plan, desks/rooms colored by status, real-time occupancy %, zone occupancy bars, hover for who/until, capacity header. Interactive: zoom, hover details, filter by zone/status, live occupancy animation.' },
  { slug: 'cowork-checkin-kiosk', title: 'Coworking — Visitor Check-in Kiosk', category: 'pages', difficulty: 'med', tags: 'ops, kiosk',
    build: 'Visitor check-in kiosk (touch, large targets): purpose select, host lookup, visitor details, photo/badge mock, NDA toggle, print badge + notify host. Interactive: big touch flow, host search, badge print success, host-notified toast.' },
  { slug: 'cowork-printer-status', title: 'Coworking — Equipment Status', category: 'ui-components', difficulty: 'easy', tags: 'ops, equipment',
    build: 'Printer / equipment status board: device cards (printer, scanner, coffee, AV) with status (online/busy/error/low-supply), queue, report-issue. Interactive: status states, print-queue, report issue, refresh.' },

  // ── 34.C Marketing ──────────────────────────────────────────────────────
  { slug: 'cowork-page-landing', title: 'Coworking — Coworking Landing', category: 'pages', difficulty: 'med', tags: 'marketing, landing',
    build: 'Coworking marketing landing: hero with book-a-tour CTA + space photos, membership benefits, spaces preview, community/events, pricing teaser, testimonials, footer. Interactive: tour form, gallery, mobile nav, reveal.' },
  { slug: 'cowork-page-spaces', title: 'Coworking — Spaces / Tour', category: 'pages', difficulty: 'med', tags: 'marketing, spaces',
    build: 'Spaces / tour page: space-type cards (hot desk, dedicated, private office, meeting room), photo galleries, amenities, virtual-tour teaser, book CTA. Interactive: space filter, gallery lightbox, amenity tooltips, reveal.' },
  { slug: 'cowork-page-pricing', title: 'Coworking — Membership Pricing', category: 'pages', difficulty: 'easy', tags: 'marketing, pricing',
    build: 'Membership pricing page: plan cards (day pass, flex, dedicated, team), feature comparison, monthly/annual toggle, FAQ, CTA. Interactive: billing toggle updates prices, compare highlight, FAQ accordion.' },
  { slug: 'cowork-page-events', title: 'Coworking — Events Calendar', category: 'pages', difficulty: 'easy', tags: 'marketing, events',
    build: 'Events calendar page: upcoming events list + month calendar toggle, event cards (workshop, networking, talk), RSVP, filter by type. Interactive: list/calendar toggle, filter, RSVP toast, event detail.' },

  // ── 34.D Admin ──────────────────────────────────────────────────────────
  { slug: 'cowork-admin-occupancy', title: 'Coworking — Occupancy Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, occupancy',
    build: 'Occupancy & utilization dashboard: KPIs (occupancy %, desk utilization, peak hours, member count), occupancy-over-day chart, heatmap by zone/hour, underused resources. Interactive: timeframe toggle, heatmap hover, zone drill.' },
  { slug: 'cowork-admin-billing', title: 'Coworking — Billing & Subscriptions', category: 'pages', difficulty: 'med', tags: 'admin, billing',
    build: 'Billing & subscriptions admin: members table (plan, status, MRR, next invoice), revenue summary, invoices list, plan changes, dunning flags. Interactive: filter by plan/status, invoice detail drawer, change plan, MRR rollup.' },

  // ── 34.E Themed Landings (5) ────────────────────────────────────────────
  { slug: 'cowork-landing-creative-loft', title: 'Coworking — Creative Loft Landing', category: 'pages', difficulty: 'med', tags: 'landing, creative',
    palette: 'Creative loft (designers/artists) — Warm concrete + amber #e8902b + matte black · industrial sans · raw, inspiring, artistic',
    build: 'Creative-loft coworking landing: raw industrial hero with loft photos, who-its-for (designers/artists), studio amenities, community of makers, pricing, book-a-tour, footer. Industrial, reveal.' },
  { slug: 'cowork-landing-corporate-flex', title: 'Coworking — Corporate Flex Landing', category: 'pages', difficulty: 'med', tags: 'landing, corporate',
    palette: 'Corporate flex (WeWork-style) — Navy #11233f + white + accent green · clean sans · professional, scalable, polished',
    build: 'Corporate-flex coworking landing: professional hero, enterprise solutions (private offices, teams, multi-location), trust logos, flexible terms, locations, pricing for teams, CTA, footer. Polished, reveal.' },
  { slug: 'cowork-landing-maker-space', title: 'Coworking — Maker Space Landing', category: 'pages', difficulty: 'hard', tags: 'landing, maker',
    palette: 'Maker / hardware lab — Slate #1f2530 + electric yellow #ffe000 + steel · monospace + sans · technical, hands-on, gritty',
    build: 'Maker-space landing: technical hero with equipment showcase (3D printers, CNC, electronics), workshops, membership tiers with machine access, safety/training, community projects, CTA, footer. Technical, reveal.' },
  { slug: 'cowork-landing-cafe-style', title: 'Coworking — Café-Style Landing', category: 'pages', difficulty: 'med', tags: 'landing, cafe',
    palette: 'Café-style workspace — Espresso #3b2a21 + cream + brass · warm serif · cozy, social, relaxed',
    build: 'Café-style workspace landing: cozy hero with warm interior, work-and-coffee vibe, amenities (great coffee, comfy seating, fast wifi), day-pass/membership, community, menu teaser, CTA, footer. Warm, reveal.' },
  { slug: 'cowork-landing-suburban', title: 'Coworking — Suburban Hub Landing', category: 'pages', difficulty: 'med', tags: 'landing, suburban',
    palette: 'Suburban / neighborhood hub — Sage #7c8a6a + clay #b8704f + ivory · friendly serif · community, local, welcoming',
    build: 'Suburban/neighborhood coworking landing: welcoming hero (work near home), local-community angle, family-friendly amenities, flexible plans, parking/commute perks, member stories, CTA, footer. Friendly, reveal.' },
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
