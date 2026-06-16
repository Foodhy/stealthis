// Phase 48 — Museum / Gallery / Exhibition Theme. 25 resources, collection `museum`.
export const meta = {
  name: 'museum-phase48-finish',
  description: 'Generate the 25 Phase 48 museum resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'museum'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Fonts via Google <link>: a refined serif display ("Cormorant Garamond" weights 500;600;700 OR "Playfair Display") for headings, and a quiet sans ("Inter" weights 400;500;600) for body/UI. font-family fallbacks: serif → Georgia, serif; sans → system-ui, -apple-system, sans-serif.
- Default "gallery" palette in :root —
  --paper:#f6f4ef; --wall:#ffffff; --charcoal:#1c1b19; --ink:#2a2825; --ink-2:#4a4640; --muted:#8c857a;
  --gold:#a98140; --gold-d:#876631; --gold-50:#f3ecdd;
  --line:rgba(28,27,25,0.12); --line-2:rgba(28,27,25,0.2);
  --ok:#3f7d56; --warn:#b8842c; --danger:#b4493a;
  radii: --r-sm:6px --r-md:12px --r-lg:18px; subtle, soft shadows.
- Generous whitespace ("wall space"), large imagery, calm refined tone. Use real-feeling but fictional artifacts, artists, dates, catalog numbers.
- For images use solid color blocks / CSS gradients / inline SVG placeholders (no external image hosts), framed with thin borders or mats to evoke artwork.
- box-sizing border-box reset, antialiased, line-height 1.55, --paper page background.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons, visible focus.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.`

const DISCLAIMER = '> Illustrative UI only — demo data; not a real museum system.'

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
createdAt: 2026-06-15
updatedAt: 2026-06-15
---

## ${s.title.replace(/^.*— /, '').replace(/^.*\| /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a MUSEUM / GALLERY / EXHIBITION theme. It must be self-contained, polished, and visually distinctive — evoke a cultural institution (refined, curatorial, gallery-like), not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>s, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling artifacts/artworks with titles, artists, dates, mediums, catalog numbers; multiple cards/rows; clear hierarchy; hover/active states; badges; smooth micro-interactions; a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 48.A — Visitor-Facing
  { slug: 'museum-exhibition-page', title: 'Museum — Exhibition Page', category: 'pages', difficulty: 'med', tags: 'exhibition, hero', build: 'Single-exhibition page: full-bleed hero with exhibition title, subtitle, run dates and "On view" status badge; intro curatorial statement; themes/sections list; featured artworks grid; ticket CTA; related programs. Sticky mini-header on scroll, smooth anchor nav between sections.' },
  { slug: 'museum-collection-browse', title: 'Museum — Collection Browse', category: 'pages', difficulty: 'hard', tags: 'collection, filter, grid', build: 'Browse the permanent collection: masonry/grid of artifact cards (image, title, artist, date, medium, catalog no.). Left filter rail by era, medium, gallery, department; live filtering + sort (newest/oldest/A-Z); result count; quick-view overlay on click. All client-side over a seeded array of ~24 objects.' },
  { slug: 'museum-artifact-detail', title: 'Museum — Artifact / Artwork Detail', category: 'pages', difficulty: 'med', tags: 'artifact, provenance, zoom', build: 'Artwork detail page: large framed image with click-to-zoom (scale + pan), object metadata panel (artist, date, medium, dimensions, credit line, accession no.), provenance timeline, curatorial description, "more from this gallery" strip, add-to-tour button.' },
  { slug: 'museum-virtual-tour', title: 'Museum — Virtual Tour / Gallery Walk', category: 'pages', difficulty: 'hard', tags: 'tour, gallery-walk', build: 'Virtual gallery walk: full-viewport "room" view that steps between galleries with prev/next, a stop counter, hotspots on artworks that open info popovers, a thumbnail filmstrip to jump rooms, and an optional audio-guide track label per stop. Smooth crossfade transitions between rooms.' },
  { slug: 'museum-visit-info', title: 'Museum — Plan Your Visit', category: 'pages', difficulty: 'easy', tags: 'visit, hours, map', build: 'Plan-your-visit page: today hours + weekly hours table with open/closed badge computed in JS, admission prices table, getting-here (transit/parking), accessibility notes, an SVG site/location map, and a "before you go" checklist. Calm informational layout.' },
  { slug: 'museum-events-calendar', title: 'Museum — Events & Programs Calendar', category: 'pages', difficulty: 'med', tags: 'events, calendar', build: 'Events & programs calendar: month grid with event dots, category filter (talks, tours, workshops, family, members), clicking a day shows that day events in a side panel; list/calendar toggle; each event has time, location, capacity, RSVP button with seat counter.' },

  // 48.B — Cultural Patterns
  { slug: 'museum-artifact-card', title: 'Museum — Artifact Card', category: 'ui-components', difficulty: 'easy', tags: 'card, artifact', build: 'Reusable artifact card component shown in a small gallery of ~6 variants: framed image/mat, title (italic serif), artist & date, medium, catalog number chip, optional "On view"/"In storage" status, hover lift + quick actions (favorite, add to tour). Demonstrate a few sizes.' },
  { slug: 'museum-gallery-wall', title: 'Museum — Gallery Wall / Salon Hang', category: 'ui-components', difficulty: 'med', tags: 'layout, salon-hang', build: 'Salon-style gallery wall: a wall surface with framed artworks of varied sizes arranged in a balanced salon hang (CSS grid with spanning). Hover highlights a frame and dims others; clicking opens a label popover. Toggle between "salon hang" and "single-line eye-level" layouts.' },
  { slug: 'museum-timeline', title: 'Museum — Historical Timeline', category: 'ui-components', difficulty: 'med', tags: 'timeline, eras', build: 'Horizontal/vertical historical timeline of eras and milestones (e.g. art movements): era bands with date ranges, milestone markers with year + title, click to expand a detail card, scrubber/scroll navigation, responsive to vertical on mobile.' },
  { slug: 'museum-label-plaque', title: 'Museum — Object Label / Wall Plaque', category: 'ui-components', difficulty: 'easy', tags: 'label, plaque', build: 'Wall-plaque/object-label component gallery: the classic museum label (artist, life dates, title in italics, date, medium, dimensions, credit line, accession no.) in several styles (standard, extended interpretive, kids-friendly). A small "print label" affordance and a style switcher.' },
  { slug: 'museum-audio-guide', title: 'Museum — Audio-Guide Player', category: 'ui-components', difficulty: 'med', tags: 'audio, player', build: 'Audio-guide player: large stop number, artwork thumbnail, track title, simulated transport (play/pause, scrubber with elapsed/total, +15s), speed and "read transcript" toggle, up-next list of stops, and a numeric "enter stop #" keypad. Simulate playback progress with JS (no real audio file required).' },
  { slug: 'museum-zoom-deepview', title: 'Museum — Deep-Zoom Image Viewer', category: 'ui-components', difficulty: 'hard', tags: 'zoom, viewer', build: 'Deep-zoom artwork viewer: a high-detail image (use a richly patterned CSS/SVG composition) with zoom in/out buttons, mouse-wheel and pinch zoom, click-drag pan, zoom level indicator, reset, fullscreen toggle, and a navigator minimap showing the current viewport rectangle.' },
  { slug: 'museum-map-floor', title: 'Museum — Floor Map / Wayfinding', category: 'ui-components', difficulty: 'med', tags: 'map, wayfinding', build: 'Interactive floor map: an SVG floor plan with labeled galleries/amenities (restrooms, cafe, shop, entrance), floor selector tabs (Level 1/2/B), clicking a gallery highlights it and shows its current exhibition in a side panel, plus a "find" search that pans/highlights a room.' },

  // 48.C — Ticketing & Membership
  { slug: 'museum-ticket-booking', title: 'Museum — Ticket Booking', category: 'pages', difficulty: 'med', tags: 'tickets, booking', build: 'Ticket booking flow: pick a date (mini calendar), then an available time slot (with remaining capacity), then ticket types with quantity steppers (adult, senior, student, child, member free), live order summary with subtotal/fees/total, and a continue-to-checkout button. Validate selections.' },
  { slug: 'museum-membership', title: 'Museum — Membership / Patron Tiers', category: 'pages', difficulty: 'easy', tags: 'membership, tiers', build: 'Membership/patron tiers page: 3-4 tier cards (Individual, Dual, Patron, Benefactor) with price, benefits list, "most popular" highlight, monthly/annual toggle that updates prices, and a join CTA per tier. Refined, philanthropic tone.' },
  { slug: 'museum-donation', title: 'Museum — Donation / Support Panel', category: 'ui-components', difficulty: 'easy', tags: 'donation, support', build: 'Donation/support panel: preset amount chips + custom amount field, one-time vs monthly toggle, optional "cover processing fee" checkbox, designation dropdown (general, acquisitions, education, conservation), impact line that updates with the amount, and a donate button with running total.' },
  { slug: 'museum-shop-card', title: 'Museum — Gift-Shop Product Card', category: 'ui-components', difficulty: 'easy', tags: 'shop, product', build: 'Gift-shop product card gallery (~6 items: prints, books, totes): product image, title, price, member price badge, rating, color/variant swatches, quantity stepper, add-to-cart with a mini cart count that increments. Hover quick-view.' },

  // 48.D — Curator / Admin
  { slug: 'museum-admin-catalog', title: 'Museum — Collection Catalog Manager', category: 'pages', difficulty: 'hard', tags: 'admin, catalog, crud', build: 'Admin collection catalog manager: data table of objects (accession no., title, artist, date, medium, location, status) with search, filter, sort, pagination; add/edit object in a slide-over form with validation; delete with confirm; bulk select + status change; row count + summary stats. Full client-side CRUD over seeded data.' },
  { slug: 'museum-admin-exhibition-builder', title: 'Museum — Exhibition Builder', category: 'pages', difficulty: 'med', tags: 'admin, exhibition, sequence', build: 'Exhibition builder: a pool of available objects on the left and an ordered exhibition sequence on the right; add objects to the sequence, reorder by up/down buttons (or drag), group into sections/rooms, set wall text per section, and a live count + estimated wall-space meter. Save draft button.' },
  { slug: 'museum-admin-attendance', title: 'Museum — Attendance & Ticketing Dashboard', category: 'pages', difficulty: 'med', tags: 'admin, dashboard, attendance', build: 'Attendance & ticketing dashboard: KPI cards (today visitors, revenue, capacity %, members), a CSS bar chart of visitors by hour, a donut/legend of ticket-type mix, a table of upcoming timed-entry slots with sold/capacity, and a date-range selector that updates the figures.' },

  // 48.E — Themed Museum Landings
  { slug: 'museum-landing-art', title: 'Museum — Fine Art Museum Landing', category: 'pages', difficulty: 'med', tags: 'landing, fine-art', build: 'Marketing landing for a Fine Art Museum: stately hero with featured masterwork, current/upcoming exhibitions strip, collection highlights, membership & visit CTAs, refined timeless layout.', palette: 'Fine Art — Gallery white #ffffff + deep charcoal #1b1a18 + gold #a98140 accent. Classic serif display (Cormorant/Playfair). Refined, timeless, lots of wall space.' },
  { slug: 'museum-landing-natural-history', title: 'Museum — Natural History Museum Landing', category: 'pages', difficulty: 'med', tags: 'landing, natural-history', build: 'Marketing landing for a Natural History Museum: hero featuring a dinosaur/fossil or specimen, halls (dinosaurs, minerals, ocean, human origins), hands-on exhibits, family programs, earthy exploratory tone.', palette: 'Natural History — Bone #efe9dc + forest green #2f4a36 + amber #c8842a accent. Slab serif headings (e.g. "Bitter"/"Zilla Slab"). Earthy, exploratory, museum-of-nature feel.' },
  { slug: 'museum-landing-science-center', title: 'Museum — Science / Discovery Center Landing', category: 'pages', difficulty: 'med', tags: 'landing, science-center', build: 'Marketing landing for a Science / Discovery Center: bright energetic hero, interactive exhibit zones, planetarium/IMAX showtimes, school field-trip CTA, playful hands-on tone with bold cards.', palette: 'Science Center — White #ffffff + electric blue #1d6fff + lime #9bd62b accent. Rounded sans (e.g. "Baloo 2"/"Nunito"). Playful, hands-on, energetic.' },
  { slug: 'museum-landing-modern-art', title: 'Museum — Modern / Contemporary Art Landing', category: 'pages', difficulty: 'hard', tags: 'landing, modern-art', build: 'Marketing landing for a Modern / Contemporary Art Museum: stark editorial hero with huge type, asymmetric grid, current shows, bold minimal layout with a single neon accent, generous negative space.', palette: 'Modern Art — Stark white #ffffff + black #0a0a0a + one neon accent #e6ff00 (acid yellow). Grotesque sans display (e.g. "Archivo"/"Space Grotesk"). Bold, minimal, high-contrast.' },
  { slug: 'museum-landing-history', title: 'Museum — History / Heritage Museum Landing', category: 'pages', difficulty: 'med', tags: 'landing, history', build: 'Marketing landing for a History / Heritage Museum: narrative archival hero, era timeline teaser, permanent galleries, oral-history/archive feature, scholarly narrative tone.', palette: 'History — Parchment #efe6d3 + sepia #6b4f34 + deep red #8a2f28 accent. Engraved/old-style serif (e.g. "EB Garamond"/"Cormorant"). Narrative, archival, scholarly.' },
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
