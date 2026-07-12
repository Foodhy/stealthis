// Workflow — build Phases 78-81 theme resources (photography, dental, wedding, podcast)
// One agent per resource, in parallel. Each writes its own dir → no file conflicts.
export const meta = {
  name: 'themes-78-81-build',
  description: 'Generate 80 theme resources (photography/dental/wedding/podcast): mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const BASE_STYLE = `DESIGN SYSTEM (match exactly unless a palette override is given):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif. Collections may add a display serif via Google Fonts for headings (see palette).
- box-sizing:border-box reset, antialiased, line-height 1.5.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons/controls, visible focus.
- Responsive: works down to ~360px (include a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional names/data. Use royalty-free style: for imagery use https://images.unsplash.com/... placeholder URLs OR CSS gradient blocks — never hotlink random sites.
- No TODOs, no lorem ipsum. Multiple cards/rows, clear hierarchy, hover/active states, badges, smooth micro-interactions, genuinely interactive script.`

const COLLECTIONS = {
  photography: {
    disclaimer: '',
    palette: `Photography — gallery-dark, image-first. :root — --ink:#0b0b0c; --bg:#101012; --surface:#17171b; --surface-2:#1e1e23; --paper:#f6f4ef; --sand:#c9b79c; --sand-d:#a8916f; --muted:#9a9aa2; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18); --white:#fff; radii --r-sm:6px --r-md:12px --r-lg:18px. Add display serif "Fraunces" (Google Fonts, wght 400;600) for headings. Dark UI, generous whitespace, full-bleed images, thin uppercase labels with letter-spacing.`,
  },
  dental: {
    disclaimer: '> Illustrative UI only — **not** intended for real medical use.',
    palette: `Dental — clean clinical light. :root — --blue:#2563eb; --blue-d:#1d4ed8; --blue-50:#eff5ff; --mint:#34d399; --mint-50:#e8fbf3; --ink:#0f2740; --ink-2:#3a5169; --muted:#6b7c90; --bg:#f3f8ff; --white:#fff; --line:rgba(15,39,64,0.10); --line-2:rgba(15,39,64,0.18); --ok:#22b07d; --warn:#d98a2b; --danger:#e05252; radii --r-sm:8px --r-md:14px --r-lg:22px, soft shadows. Trust-first, rounded, reassuring, lots of white.`,
  },
  wedding: {
    disclaimer: '',
    palette: `Wedding — blush + gold, editorial romantic. :root — --blush:#e8b7b0; --blush-50:#fbeeec; --rose:#c98a86; --gold:#c9a24b; --gold-d:#a8862f; --ink:#3a2b2b; --ink-2:#6b5555; --muted:#9a8585; --bg:#fbf7f4; --cream:#f4ece4; --white:#fff; --line:rgba(58,43,43,0.12); radii --r-sm:8px --r-md:16px --r-lg:26px. Add display serif "Cormorant Garamond" (Google Fonts, wght 400;500;600) for headings. Elegant, airy, thin gold rules, generous serifs.`,
  },
  podcast: {
    disclaimer: '',
    palette: `Podcast — bold dark, audio-first. :root — --bg:#0c0c10; --surface:#15151c; --surface-2:#1d1d27; --violet:#8b5cf6; --violet-d:#7c3aed; --cyan:#22d3ee; --pink:#f472b6; --ink:#f4f4f8; --muted:#9a9aab; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18); --white:#fff; radii --r-sm:8px --r-md:14px --r-lg:20px. Vibrant waveform accents (gradient violet→cyan), glowing play buttons, dark cards.`,
  },
}

// Landing slugs get the collection palette emphasized as a themed hero.
const SPECS = [
  // ── Photography (20) ──
  { slug: 'photography-hero-landing', c: 'photography', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Full-bleed studio hero: giant fullscreen photo (unsplash gradient/photo), studio name in Fraunces, nav (Work/About/Services/Contact), scroll-cue, and a strip of 3-4 recent shots below with hover zoom. Sticky transparent→solid nav on scroll.' },
  { slug: 'photography-portfolio-gallery', c: 'photography', cat: 'pages', d: 'med', tags: 'gallery, portfolio', build: 'Filterable masonry portfolio: category chips (Weddings/Portraits/Products/Travel), CSS columns masonry of 15+ images, click opens a lightbox. Filter animates items in/out.' },
  { slug: 'photography-gallery-lightbox', c: 'photography', cat: 'ui-components', d: 'med', tags: 'lightbox, gallery', build: 'Reusable lightbox component: thumbnail grid, click opens fullscreen overlay with prev/next, keyboard arrows + Esc, caption, counter (3/12), backdrop blur.' },
  { slug: 'photography-pricing-packages', c: 'photography', cat: 'pages', d: 'easy', tags: 'pricing, packages', build: 'Session package pricing: 3 tiers (Mini/Standard/Premium) with deliverables list, hours, retouched count, popular badge, book button.' },
  { slug: 'photography-booking-flow', c: 'photography', cat: 'pages', d: 'hard', tags: 'booking, form', build: 'Multi-step booking: step1 session type, step2 date+time slots, step3 details form, step4 review+confirm. Progress bar, validation, back/next, confirmation screen.' },
  { slug: 'photography-client-proofing', c: 'photography', cat: 'pages', d: 'hard', tags: 'proofing, gallery', build: 'Client proofing gallery: grid of proofs, hover shows heart(favorite) + select checkbox, running "X selected" bar, filter Favorites/All, download-selection button (toast).' },
  { slug: 'photography-print-store', c: 'photography', cat: 'pages', d: 'med', tags: 'store, cart', build: 'Print shop: product grid (prints, sizes, framing), size selector changes price, add-to-cart with slide-in cart drawer + subtotal + qty steppers.' },
  { slug: 'photography-about-bio', c: 'photography', cat: 'pages', d: 'easy', tags: 'about, bio', build: 'Photographer about page: portrait, bio prose, gear list, awards timeline, "as seen in" logos, CTA.' },
  { slug: 'photography-testimonials', c: 'photography', cat: 'ui-components', d: 'easy', tags: 'testimonials', build: 'Testimonials section: quote cards with client photo, star rating, and an auto-advancing carousel with dots.' },
  { slug: 'photography-session-types', c: 'photography', cat: 'ui-components', d: 'easy', tags: 'services, cards', build: 'Session type cards: 6 cards (Wedding/Portrait/Family/Product/Event/Real-estate) with icon, blurb, "from $X", hover lift + image reveal.' },
  { slug: 'photography-contact-inquiry', c: 'photography', cat: 'pages', d: 'med', tags: 'contact, form', build: 'Inquiry form: session type, date, budget range slider, message; inline validation; success state. Side panel with studio contact + map placeholder.' },
  { slug: 'photography-before-after', c: 'photography', cat: 'ui-components', d: 'med', tags: 'before-after, slider', build: 'Retouch before/after: draggable divider slider comparing two images (raw vs edited), touch + mouse, label chips.' },
  { slug: 'photography-instagram-feed', c: 'photography', cat: 'ui-components', d: 'easy', tags: 'social, grid', build: 'Instagram-style feed grid: 3-col square grid, hover overlay with heart/comment counts, @handle header with follow button.' },
  { slug: 'photography-fullscreen-slideshow', c: 'photography', cat: 'ui-components', d: 'med', tags: 'slideshow', build: 'Auto fullscreen slideshow: crossfade between images, play/pause, progress dots, Ken-Burns zoom, caption per slide.' },
  { slug: 'photography-image-grid-hover', c: 'photography', cat: 'ui-components', d: 'easy', tags: 'grid, hover', build: 'Hover-reveal caption grid: images with title/category revealed on hover via clip-path/scale, staggered.' },
  { slug: 'photography-landing-wedding', c: 'photography', cat: 'pages', d: 'med', tags: 'landing, wedding', build: 'Wedding photographer landing: romantic hero, gallery, packages teaser, testimonial, inquiry CTA.' },
  { slug: 'photography-landing-portrait', c: 'photography', cat: 'pages', d: 'med', tags: 'landing, portrait', build: 'Portrait photographer landing: bold portrait hero, studio vs on-location, pricing teaser, booking CTA.' },
  { slug: 'photography-landing-product', c: 'photography', cat: 'pages', d: 'med', tags: 'landing, product', build: 'Product/commercial photographer landing: clean grid of product shots, services (e-com/lifestyle/360), client logos, quote CTA.' },
  { slug: 'photography-landing-realestate', c: 'photography', cat: 'pages', d: 'med', tags: 'landing, realestate', build: 'Real-estate photographer landing: wide property shots, packages (photo/drone/twilight/floorplan), turnaround promise, order CTA.' },
  { slug: 'photography-landing-editorial', c: 'photography', cat: 'pages', d: 'med', tags: 'landing, editorial', build: 'Editorial/fashion photographer landing: magazine-style layout, tearsheets, big typography, contact.' },

  // ── Dental (20) ──
  { slug: 'dental-hero-landing', c: 'dental', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Dental practice hero: friendly headline, smiling patient image, "Book appointment" + phone CTA, trust badges (years/patients/rating), services strip.' },
  { slug: 'dental-appointment-booking', c: 'dental', cat: 'pages', d: 'hard', tags: 'booking, form', build: 'Appointment booking: choose treatment, pick dentist, calendar with available slots, patient info, confirm. Progress steps, slot availability states, confirmation.' },
  { slug: 'dental-services-list', c: 'dental', cat: 'pages', d: 'easy', tags: 'services', build: 'Treatments/services grid: General/Cosmetic/Ortho/Surgery categories, cards with icon, description, "learn more".' },
  { slug: 'dental-dentist-profiles', c: 'dental', cat: 'pages', d: 'easy', tags: 'team, profiles', build: 'Dentist team: profile cards with photo, specialty, credentials, bio expand, book-with-them button.' },
  { slug: 'dental-patient-portal', c: 'dental', cat: 'pages', d: 'hard', tags: 'portal, dashboard', build: 'Patient portal dashboard: next appointment card, treatment history timeline, outstanding balance, documents, quick actions (reschedule/message).' },
  { slug: 'dental-insurance-financing', c: 'dental', cat: 'pages', d: 'med', tags: 'insurance, financing', build: 'Insurance & financing: accepted insurers logos, financing plans (0% APR tiers), monthly payment calculator (treatment cost + months → monthly).' },
  { slug: 'dental-smile-gallery', c: 'dental', cat: 'ui-components', d: 'med', tags: 'before-after, gallery', build: 'Before/after smile gallery: case cards with before/after slider, treatment tag, filter by treatment.' },
  { slug: 'dental-new-patient-intake', c: 'dental', cat: 'pages', d: 'med', tags: 'intake, form', build: 'New-patient intake form: personal info, medical history checkboxes, insurance, consent; sectioned, validation, progress.' },
  { slug: 'dental-treatment-detail', c: 'dental', cat: 'pages', d: 'med', tags: 'treatment, detail', build: 'Single treatment detail (e.g. Invisalign): hero, what-it-is, steps timeline, cost range, FAQ, book CTA.' },
  { slug: 'dental-emergency-info', c: 'dental', cat: 'ui-components', d: 'easy', tags: 'emergency', build: 'Emergency info card/banner: urgent phone, hours, "what to do" quick tips accordion, map placeholder.' },
  { slug: 'dental-reviews-testimonials', c: 'dental', cat: 'ui-components', d: 'easy', tags: 'reviews', build: 'Patient reviews: star-rating summary, review cards with source badge (Google/Yelp), carousel.' },
  { slug: 'dental-appointment-card', c: 'dental', cat: 'ui-components', d: 'easy', tags: 'card, appointment', build: 'Appointment card component: date/time, dentist, treatment, status badge (confirmed/pending), reschedule + cancel buttons with confirm.' },
  { slug: 'dental-cost-estimator', c: 'dental', cat: 'ui-components', d: 'med', tags: 'estimator, calculator', build: 'Treatment cost estimator: pick treatments (checkboxes with prices), insurance coverage % slider, live total + out-of-pocket.' },
  { slug: 'dental-office-tour', c: 'dental', cat: 'ui-components', d: 'easy', tags: 'gallery, tour', build: 'Office photo tour: labeled gallery (reception/operatory/lab), lightbox, amenities list.' },
  { slug: 'dental-faq-accordion', c: 'dental', cat: 'ui-components', d: 'easy', tags: 'faq', build: 'FAQ accordion: categorized questions, smooth expand, search filter input.' },
  { slug: 'dental-tooth-chart', c: 'dental', cat: 'ui-components', d: 'hard', tags: 'chart, interactive', build: 'Interactive tooth chart: SVG adult dental arch (32 teeth numbered), click a tooth to select, mark condition (healthy/filling/crown/missing) with color, legend + notes panel.' },
  { slug: 'dental-landing-family', c: 'dental', cat: 'pages', d: 'med', tags: 'landing, family', build: 'Family dentistry landing: warm hero, all-ages services, kids-friendly note, insurance, book CTA.' },
  { slug: 'dental-landing-cosmetic', c: 'dental', cat: 'pages', d: 'med', tags: 'landing, cosmetic', build: 'Cosmetic dentistry landing: sleek hero, veneers/whitening/smile-makeover, before/after teaser, consult CTA.' },
  { slug: 'dental-landing-orthodontics', c: 'dental', cat: 'pages', d: 'med', tags: 'landing, ortho', build: 'Orthodontics landing: braces vs clear aligners comparison, process timeline, financing, free-consult CTA.' },
  { slug: 'dental-landing-pediatric', c: 'dental', cat: 'pages', d: 'med', tags: 'landing, pediatric', build: 'Pediatric dentistry landing: playful palette accents, kid-friendly copy, first-visit guide, parent FAQ, book CTA.' },

  // ── Wedding (20) ──
  { slug: 'wedding-hero-landing', c: 'wedding', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Wedding planner hero: elegant serif headline, couple image, "Plan your day" CTA, services teaser, featured real-wedding strip.' },
  { slug: 'wedding-services-packages', c: 'wedding', cat: 'pages', d: 'easy', tags: 'services, packages', build: 'Services/packages: Full Planning/Partial/Day-of tiers with inclusions, elegant cards, enquire button.' },
  { slug: 'wedding-real-gallery', c: 'wedding', cat: 'pages', d: 'med', tags: 'gallery, real-weddings', build: 'Real-weddings gallery: featured couples grid, each opens a lightbox story with multiple images + venue/date caption.' },
  { slug: 'wedding-planning-timeline', c: 'wedding', cat: 'ui-components', d: 'med', tags: 'timeline, countdown', build: 'Planning timeline: live countdown to wedding date, then a checklist timeline (12mo/6mo/1mo tasks) with check-off + progress %.' },
  { slug: 'wedding-vendor-directory', c: 'wedding', cat: 'pages', d: 'med', tags: 'vendors, directory', build: 'Vendor directory: filterable list (florist/caterer/band/venue), vendor cards with rating, price tier, save-heart, book.' },
  { slug: 'wedding-rsvp-form', c: 'wedding', cat: 'pages', d: 'med', tags: 'rsvp, form', build: 'RSVP form: name lookup, attending yes/no, plus-ones, meal choice, song request, dietary; elegant confirmation.' },
  { slug: 'wedding-guest-list', c: 'wedding', cat: 'ui-components', d: 'med', tags: 'guests, management', build: 'Guest list manager: table of guests with RSVP status chips, add guest, filter by status, counts (confirmed/pending/declined).' },
  { slug: 'wedding-budget-tracker', c: 'wedding', cat: 'ui-components', d: 'med', tags: 'budget, tracker', build: 'Budget tracker: category rows (venue/catering/etc) with estimated vs actual, add expense, total spent vs budget bar, over-budget warning.' },
  { slug: 'wedding-seating-chart', c: 'wedding', cat: 'ui-components', d: 'hard', tags: 'seating, drag', build: 'Seating chart: round tables with seats, drag guest chips from an unassigned pool onto seats, capacity per table, remove back to pool.' },
  { slug: 'wedding-registry', c: 'wedding', cat: 'pages', d: 'med', tags: 'registry, gifts', build: 'Gift registry: product grid with price, "reserve" toggles item to claimed (greyed), progress of items claimed, filter available.' },
  { slug: 'wedding-story-about', c: 'wedding', cat: 'pages', d: 'easy', tags: 'story, about', build: 'Couple story/about: how-we-met timeline, photos, quotes, wedding-party cards.' },
  { slug: 'wedding-testimonials', c: 'wedding', cat: 'ui-components', d: 'easy', tags: 'testimonials', build: 'Couple testimonials: elegant quote cards with couple photo + wedding date, carousel.' },
  { slug: 'wedding-countdown-hero', c: 'wedding', cat: 'ui-components', d: 'easy', tags: 'countdown, save-the-date', build: 'Save-the-date countdown hero: names, date, live D/H/M/S countdown, add-to-calendar button.' },
  { slug: 'wedding-schedule-day', c: 'wedding', cat: 'ui-components', d: 'easy', tags: 'schedule, timeline', build: 'Day-of schedule: vertical timeline of events (ceremony/cocktail/dinner/dancing) with times, icons, location.' },
  { slug: 'wedding-photo-gallery-lightbox', c: 'wedding', cat: 'ui-components', d: 'med', tags: 'gallery, lightbox', build: 'Photo gallery + lightbox: elegant grid, click to fullscreen with prev/next + captions + keyboard.' },
  { slug: 'wedding-invitation-card', c: 'wedding', cat: 'ui-components', d: 'med', tags: 'invitation, card', build: 'Animated invitation: envelope that opens on click revealing the invite card with names/date/venue, gold flourish animation, RSVP button.' },
  { slug: 'wedding-landing-elegant', c: 'wedding', cat: 'pages', d: 'med', tags: 'landing, elegant', build: 'Elegant celebration landing: classic serif, gold accents, story/gallery/RSVP sections.' },
  { slug: 'wedding-landing-rustic', c: 'wedding', cat: 'pages', d: 'med', tags: 'landing, rustic', build: 'Rustic celebration landing: warm earthy accents over the wedding palette, barn/outdoor vibe, details + RSVP.' },
  { slug: 'wedding-landing-modern', c: 'wedding', cat: 'pages', d: 'med', tags: 'landing, modern', build: 'Modern minimalist celebration landing: clean big type, monochrome + single accent, sparse elegant sections.' },
  { slug: 'wedding-landing-destination', c: 'wedding', cat: 'pages', d: 'med', tags: 'landing, destination', build: 'Destination wedding landing: travel info, venue map, itinerary, accommodation blocks, RSVP with travel details.' },

  // ── Podcast (20) ──
  { slug: 'podcast-hero-landing', c: 'podcast', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Podcast network hero: bold headline, animated waveform accent, "Listen now" + platform buttons, featured show cards.' },
  { slug: 'podcast-show-hub', c: 'podcast', cat: 'pages', d: 'med', tags: 'shows, hub', build: 'Multi-show hub: grid of show cards (cover, title, host, category, episode count), category filter, search.' },
  { slug: 'podcast-episode-grid', c: 'podcast', cat: 'pages', d: 'easy', tags: 'episodes, grid', build: 'Episode grid: episode cards with thumbnail, title, duration, date, mini play button, sort newest/popular.' },
  { slug: 'podcast-audio-player', c: 'podcast', cat: 'ui-components', d: 'hard', tags: 'player, audio', build: 'Full audio player: real <audio>, animated waveform/progress seek, play/pause, skip 15s, speed (1x/1.5x/2x), volume, current time/duration, episode art.' },
  { slug: 'podcast-episode-detail', c: 'podcast', cat: 'pages', d: 'med', tags: 'episode, transcript', build: 'Episode detail: big player, show notes, chapter markers (clickable), transcript preview, share, related episodes.' },
  { slug: 'podcast-show-detail', c: 'podcast', cat: 'pages', d: 'med', tags: 'show, detail', build: 'Show detail page: show header (art/host/subscribe), about, episode list with play, platform links.' },
  { slug: 'podcast-host-bios', c: 'podcast', cat: 'ui-components', d: 'easy', tags: 'hosts, bios', build: 'Host bios section: host cards with photo, name, role, social links, bio, hover glow.' },
  { slug: 'podcast-subscribe-cta', c: 'podcast', cat: 'ui-components', d: 'easy', tags: 'subscribe, cta', build: 'Platform subscribe buttons: Apple/Spotify/YouTube/RSS buttons with brand-ish icons, copy-RSS button (toast).' },
  { slug: 'podcast-latest-feed', c: 'podcast', cat: 'ui-components', d: 'easy', tags: 'feed, episodes', build: 'Latest episodes feed: list rows with art, title, show, duration, play button, "new" badge.' },
  { slug: 'podcast-newsletter-signup', c: 'podcast', cat: 'ui-components', d: 'easy', tags: 'newsletter, signup', build: 'Newsletter signup: bold section, email input + subscribe, subscriber count, success state.' },
  { slug: 'podcast-transcript-viewer', c: 'podcast', cat: 'ui-components', d: 'med', tags: 'transcript, viewer', build: 'Synced transcript viewer: timestamped lines, click line to "seek" (highlights + scrolls), active line auto-highlight on a simulated play tick, search within transcript.' },
  { slug: 'podcast-mini-player', c: 'podcast', cat: 'ui-components', d: 'med', tags: 'mini-player, sticky', build: 'Sticky mini player: bottom bar with art, title, play/pause, progress, expand toggle; appears when you hit play on any episode in a small list.' },
  { slug: 'podcast-guest-spotlight', c: 'podcast', cat: 'ui-components', d: 'easy', tags: 'guest, spotlight', build: 'Guest spotlight card: featured guest photo, name, bio, the episode they appeared on with play, social links.' },
  { slug: 'podcast-stats-dashboard', c: 'podcast', cat: 'pages', d: 'hard', tags: 'analytics, dashboard', build: 'Creator analytics dashboard: KPI cards (downloads/subscribers/avg listen), a bar chart of downloads per episode (inline SVG, animated), top episodes table, platform breakdown donut.' },
  { slug: 'podcast-clip-share', c: 'podcast', cat: 'ui-components', d: 'med', tags: 'clip, audiogram', build: 'Audiogram clip share: pick a start/end on a waveform, preview an animated audiogram card (waveform bars + caption), share buttons.' },
  { slug: 'podcast-search-episodes', c: 'podcast', cat: 'ui-components', d: 'med', tags: 'search, filter', build: 'Search + filter episodes: search input, filters (show/duration/date), live-filtering results list, result count, empty state.' },
  { slug: 'podcast-landing-interview', c: 'podcast', cat: 'pages', d: 'med', tags: 'landing, interview', build: 'Interview show landing: host+guest theme, notable-guests grid, latest episodes, subscribe.' },
  { slug: 'podcast-landing-comedy', c: 'podcast', cat: 'pages', d: 'med', tags: 'landing, comedy', build: 'Comedy show landing: playful energetic accents, funny copy, clip reels, live-show dates, subscribe.' },
  { slug: 'podcast-landing-truecrime', c: 'podcast', cat: 'pages', d: 'med', tags: 'landing, truecrime', build: 'True-crime show landing: moody dark theme, case teasers, season list, content warning, subscribe.' },
  { slug: 'podcast-landing-business', c: 'podcast', cat: 'pages', d: 'med', tags: 'landing, business', build: 'Business/startup show landing: clean professional, notable-guest logos, key takeaways, newsletter + subscribe.' },
]

function buildPrompt(s) {
  const col = COLLECTIONS[s.c]
  const type = s.cat === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const title = `${cap(s.c)} — ${titleize(s.slug, s.c)}`
  const tagList = `[${s.c}, ${s.tags}]`
  const disclaimer = col.disclaimer ? `\n\n${col.disclaimer}\n\n(The body MUST end with that exact disclaimer line.)` : ''

  return `You are generating ONE production-quality static UI demo resource. Self-contained, polished, visually distinctive — not a placeholder.

${BASE_STYLE}

PALETTE / THEME for this collection (use it): ${col.palette}

RESOURCE: ${s.slug}
COLLECTION: ${s.c}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/index.mdx — EXACTLY this frontmatter (write a rich 55-90 word description yourself, no internal double-quotes), then a short prose body (2-3 paragraphs describing the UI + interactions)${col.disclaimer ? ', ending with the disclaimer line below' : ''}:

---
slug: ${s.slug}
title: "${title}"
description: "<one-line rich description>"
category: ${s.cat}
type: ${type}
tags: ${tagList}
tech: [html, css, vanilla-js]
difficulty: ${s.d}
targets: [html]
collections: [${s.c}]
labRoute: /${s.cat}/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-07-01
updatedAt: 2026-07-01
---
${disclaimer}

2. ${dir}/snippets/html.html — full <!doctype html>, all Google Font <link>s, <link rel="stylesheet" href="style.css">, semantic markup, <script src="script.js"></script> before </body>.
3. ${dir}/snippets/style.css — all styles, :root palette first, substantial + responsive (@media max-width:520px).
4. ${dir}/snippets/script.js — working vanilla JS interactions, no external libs.

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active/focus states, badges, smooth micro-interactions, genuinely interactive script. No TODOs or lorem ipsum.

After writing all files, return your result.`
}

function cap(x) { return x.charAt(0).toUpperCase() + x.slice(1) }
function titleize(slug, c) {
  return slug.replace(new RegExp('^' + c + '-'), '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

phase('Generate')
log(`Generando ${SPECS.length} recursos de temas (photography/dental/wedding/podcast)…`)

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
    agent(buildPrompt(s), { label: s.slug, phase: 'Generate', agentType: 'general-purpose', schema: RESULT })
  )
)

const ok = results.filter(Boolean)
return {
  requested: SPECS.length,
  completed: ok.length,
  missing: SPECS.filter((s) => !ok.find((r) => r.slug === s.slug)).map((s) => s.slug),
}
