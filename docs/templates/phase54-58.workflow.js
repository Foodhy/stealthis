// ===========================================================================
// Phases 54–58 — Storybook · Travel · Portfolio · E-commerce · SaaS
// 109 resources (mdx + html/css/js), one agent per resource, grouped by phase.
// ===========================================================================
export const meta = {
  name: 'phase54-58-finish',
  description: 'Generate Phases 54-58 (storybook, travel, portfolio, ecommerce, saas) — 109 resources',
  phases: [
    { title: 'P54 storybook', detail: '18 kids-* resources' },
    { title: 'P55 travel', detail: '21 travel-* resources' },
    { title: 'P56 portfolio', detail: '19 port-* resources' },
    { title: 'P57 ecommerce', detail: '28 shop-* resources' },
    { title: 'P58 saas', detail: '23 saas-* resources' },
  ],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const COMMON = `GLOBAL RULES (all phases):
- Google Font via <link> in the html (pick a font matching the phase mood); font-family with system-ui fallback.
- box-sizing border-box reset, antialiased text, line-height ~1.5, palette in :root FIRST.
- NO external images or CDNs except the Google Fonts <link>. Represent photos / illustrations / maps with CSS gradients, inline SVG, or emoji — never <img src=http...> or background-image:url(http...).
- Vanilla JS only — no frameworks, no build, no external libs. A toast(msg) helper is fine. Every interaction must ACTUALLY work.
- Accessible: landmark roles, aria where relevant, WCAG AA contrast, keyboard-usable controls, :focus-visible rings.
- Responsive: graceful down to ~360px; add @media breakpoints. Realistic but clearly fictional data.
- No TODOs, no lorem ipsum, no placeholder gray boxes — ship a polished, distinctive demo.`

const STYLE = {
  storybook: `${COMMON}

STORYBOOK DESIGN SYSTEM:
- Soft bright palette + rounded EVERYTHING (--r: 16-28px, pill buttons). Friendly display font (e.g. "Baloo 2", "Fredoka") for headings + high-legibility body ("Nunito"/"Inter").
- :root example — --bg:#fff8ef; --ink:#2c2350; --primary:#ff8a3d; --secondary:#5ec5d6; --accent:#ffd23f; --pink:#ff6f9c; --green:#7bd389; soft shadows, thick playful borders ok.
- Large touch targets (min 48px), big readable type, generous whitespace + illustration space (inline SVG characters/scenes).
- Playful motion: gentle bounce/wiggle/pop on tap, reduced-motion respected. Optional dyslexia-friendly toggle (switches body font + spacing) where it fits.`,

  travel: `${COMMON}

TRAVEL / MAGAZINE DESIGN SYSTEM:
- Editorial + wanderlust. Warm neutrals + horizon accents. Serif display ("Playfair Display"/"Fraunces") for headlines + clean sans ("Inter"/"Work Sans") for body.
- :root example — --bg:#fbf7f1; --ink:#241f1a; --muted:#6b6259; --teal:#1f8a8a; --coral:#e8623f; --sand:#e7d8c3; --line:rgba(36,31,26,.12).
- Full-bleed "landscape photography" = rich CSS gradients / layered inline SVG scenes (mountains, coast, city skyline). Maps are first-class: build CSS/SVG map mockups with pins, routes, labels.
- Save / itinerary / wishlist affordances (heart, bookmark, "add to trip"). Ratings, price tiers, best-time badges.`,

  portfolio: `${COMMON}

PORTFOLIO DESIGN SYSTEM:
- Single-person site, fast to copy-paste. 56.A SECTION PRIMITIVES use a clean neutral base (white/ink + one accent, "Inter"); the 56.C STYLE one-pagers are deliberately DIVERGENT — follow the per-resource palette/type/mood EXACTLY (it overrides the neutral base, including the font).
- Each themed style ships a FULL one-page portfolio: hero/intro, work/projects, about, experience, skills, contact — composed from the same content, re-skinned.
- Fictional but believable person ("Maya Okafor", product designer) + 4-6 fictional projects. Strong typographic hierarchy.`,

  ecommerce: `${COMMON}

E-COMMERCE DESIGN SYSTEM:
- Clean white + ink + ONE brand accent. Clear sans ("Inter"). Large "product photography" = bold CSS gradients / inline SVG product silhouettes on soft tinted tiles.
- :root example — --bg:#ffffff; --ink:#16181d; --muted:#6b7280; --brand:#3457ff; --brand-d:#2742d6; --sale:#e0245e; --ok:#1f9d55; --line:rgba(16,18,29,.1).
- Prominent price + CTA (Add to cart / Buy). Trust signals: star ratings, review counts, secure-checkout badges, free-shipping notes, stock chips.
- Landings (57.E) follow their per-resource palette/type/mood. Money formatted ($1,299.00). Working cart/qty/filter state where relevant.`,

  saas: `${COMMON}

SAAS DESIGN SYSTEM:
- Modern + trustworthy. Neutral surfaces + ONE product accent. Clean sans ("Inter"). Subtle depth (1px lines + soft shadows), clear empty/loading states.
- :root example — --bg:#f7f8fb; --surface:#ffffff; --ink:#0f1222; --muted:#646b85; --brand:#6366f1; --brand-d:#4f46e5; --ok:#16a34a; --warn:#d97706; --danger:#dc2626; --line:rgba(15,18,34,.1).
- Charts as inline SVG / CSS only (no chart libs). Light + dark parity where natural (provide a working theme toggle on shells/dashboards).
- Landings (58.E) follow their per-resource palette/type/mood. Onboarding/empty/loading states must look intentional and polished.`,
}

const CFG = {
  storybook: { theme: 'Storybook', collection: 'storybook', library: "Children's / Storybook",
    disclaimer: "> Illustrative kids' UI only — fictional stories, characters, and audio.", phaseTag: 'P54 storybook' },
  travel: { theme: 'Travel', collection: 'travel', library: 'Travel Guide / Magazine',
    disclaimer: '> Illustrative travel UI only — fictional destinations, prices, and maps.', phaseTag: 'P55 travel' },
  portfolio: { theme: 'Portfolio', collection: 'portfolio', library: 'Portfolio / Résumé',
    disclaimer: '> Illustrative portfolio — fictional person and projects.', phaseTag: 'P56 portfolio' },
  ecommerce: { theme: 'Shop', collection: 'ecommerce', library: 'E-commerce / Retail',
    disclaimer: '> Illustrative storefront UI only — fictional products, prices, and reviews. No real checkout.', phaseTag: 'P57 ecommerce' },
  saas: { theme: 'SaaS', collection: 'saas', library: 'SaaS Product',
    disclaimer: '> Illustrative SaaS UI only — fictional product, metrics, and billing. No real backend.', phaseTag: 'P58 saas' },
}

function buildPrompt(s) {
  const cfg = s.cfg
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${cfg.collection}${s.tags ? ', ' + s.tags : ''}]`
  const title = `${cfg.theme} — ${s.t}`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (write the one-line description yourself), then a short prose body:

---
slug: ${s.slug}
title: "${title}"
description: "<ONE-LINE rich description, 55-90 words, no internal double-quotes>"
category: ${s.category}
type: ${type}
tags: ${tags}
tech: [html, css, vanilla-js]
difficulty: ${s.difficulty}
targets: [html]
collections: [${cfg.collection}]
labRoute: /${s.category}/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-13
updatedAt: 2026-06-13
---

## ${s.t}

<2-3 short paragraphs describing the UI and its interactions.>

${cfg.disclaimer}`

  return `You are generating ONE production-quality, self-contained static UI demo for a "${cfg.library}" library. It must be polished, distinctive, and fully working — not a generic placeholder.

${STYLE[s.style]}

RESOURCE: ${s.slug}
TITLE: ${title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Google Fonts <link>, <link rel="stylesheet" href="style.css">, the markup, then <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose exactly as specified below.

${mdxInstr}

QUALITY BAR: clear visual hierarchy, hover/active/focus states, at least one genuinely working interaction, responsive layout that collapses gracefully, and on-theme polish. No TODOs, no placeholder gray boxes, no lorem ipsum, no external images.

After writing the files, return your result.`
}

// ---- Phase 54 — storybook ------------------------------------------------
const P54 = [
  { slug: 'kids-storybook-reader', t: 'Picture-Book Reader', category: 'pages', difficulty: 'med', tags: 'reader, page-turn',
    build: 'A picture-book reader showing illustrated two-page spreads (inline SVG scenes + a sentence of story text). Big prev/next page-turn buttons with a CSS page-curl/flip animation, a page indicator (3 of 12), and a bottom thumbnail strip. JS: arrow keys + buttons turn pages, progress updates, last page shows a "The End" celebration. Tap a scene element for a tiny wiggle.' },
  { slug: 'kids-read-along', t: 'Read-Along', category: 'pages', difficulty: 'med', tags: 'read-along, narration',
    build: 'A read-along page: a story paragraph where each word highlights in sequence as a simulated narrator "speaks" (timed via JS, no real audio file — use the Web Speech API if available else a timer). Play/Pause/Restart controls, a speed slider, and a karaoke-style highlight that auto-scrolls. Clicking any word jumps the narration there. Illustration panel above the text.' },
  { slug: 'kids-story-spread', t: 'Two-page Illustrated Spread', category: 'pages', difficulty: 'easy', tags: 'spread, layout',
    build: 'A single beautiful two-page storybook spread: left page a full inline-SVG illustration scene, right page a large decorative drop-cap paragraph of story text with a small spot illustration. Ornamental page frame, page numbers. JS: subtle parallax/float on scene elements, a "read it again" sparkle button. Stacks to one column on mobile.' },
  { slug: 'kids-interactive-scene', t: 'Tap-to-animate Scene', category: 'pages', difficulty: 'hard', tags: 'interactive, animation',
    build: 'An interactive storybook scene (inline SVG): tappable hotspots (sun, animals, door, clouds) that each trigger a delightful animation + sound-word bubble ("Woof!", "Tweet!") when clicked. A "find all 5 surprises" counter, sparkle particles on tap, and a reset. JS drives transforms/keyframes per hotspot, respects reduced-motion. Cheerful, exploratory.' },
  { slug: 'kids-alphabet-card', t: 'Alphabet Flashcard Set', category: 'ui-components', difficulty: 'easy', tags: 'alphabet, flashcards',
    build: 'A set of flip flashcards: front shows a big letter + inline-SVG object ("A 🍎 Apple"), back shows the word + a fun fact. Click flips with a 3D card flip. Prev/next to move through A-Z, a shuffle, and a "say it" button (Web Speech or animated mouth). Progress dots. Bright, rounded, tactile.' },
  { slug: 'kids-drag-match', t: 'Drag-to-match Activity', category: 'ui-components', difficulty: 'med', tags: 'drag, matching',
    build: 'A drag-to-match game: a column of items (inline-SVG animals) and a column of targets (their homes/names). Drag an item onto the correct target — correct snaps with a happy pop + star, wrong bounces back with a gentle shake. Pointer-events based DnD with a keyboard fallback (select + place). Score, "all matched!" celebration, reset.' },
  { slug: 'kids-coloring-page', t: 'Coloring / Paint Canvas', category: 'ui-components', difficulty: 'med', tags: 'coloring, canvas',
    build: 'A simple coloring activity: an inline-SVG line drawing whose regions fill with the selected color on click/drag (flood-fill by region, not freehand). A crayon palette, an undo, a clear, and a "rainbow" mode that cycles colors. JS sets fill on path/region elements; show the active crayon. Big chunky controls. Save-to-image optional via canvas.' },
  { slug: 'kids-quiz-stars', t: 'Star-reward Quiz', category: 'ui-components', difficulty: 'easy', tags: 'quiz, rewards',
    build: 'A kid quiz: one multiple-choice question at a time (picture answers, inline SVG), big tappable option cards. Correct → a star flies into a star meter + confetti; wrong → gentle "try again" wobble. Progress through 5 questions, final score screen with earned stars and a "play again". Encouraging, no harsh fail states.' },
  { slug: 'kids-progress-stickers', t: 'Sticker Reward Board', category: 'ui-components', difficulty: 'easy', tags: 'stickers, progress',
    build: 'A sticker reward board: a grid of empty slots that fill with collectible inline-SVG stickers as goals complete. A "tasks today" checklist where checking a task pops a sticker onto the board with a bounce. A progress bar to the next reward chest, and a celebratory unlock when full. Persist earned stickers to localStorage.' },
  { slug: 'kids-character-mascot', t: 'Animated Mascot Guide', category: 'ui-components', difficulty: 'med', tags: 'mascot, guide',
    build: 'A friendly animated mascot (inline SVG character) that idles (blink, gentle bob), reacts to clicks (wave, jump, giggle), and shows speech bubbles with tips. A mood/emotion selector (happy/curious/sleepy) swaps its expression + animation. A "guide me" button walks through a tiny tooltip tour. Reduced-motion friendly. Reusable as an onboarding helper.' },
  { slug: 'kids-library-shelf', t: 'Bookshelf Browse', category: 'pages', difficulty: 'easy', tags: 'library, shelf',
    build: 'A kid library: wooden-looking shelves (CSS) of book spines/covers (inline-SVG colorful covers with titles). Categories tabs (Animals, Bedtime, Adventure), a search, and hover that pulls a book forward. Click a cover to open a detail card (cover, blurb, age, "Read" button). Cozy, playful, large covers. Responsive shelf grid.' },
  { slug: 'kids-parent-dashboard', t: 'Parent Dashboard', category: 'pages', difficulty: 'med', tags: 'parent, controls',
    build: 'A parent dashboard (calmer, grown-up palette accents over the kids base): cards for reading time this week (inline-SVG bar chart), books finished, current streak, and a daily time-limit control (slider + toggle). A per-child switcher, recent activity list, and content-filter toggles (age range). JS: changing the time limit/filters updates summaries; switching child swaps the data. Clear, trustworthy.' },
  { slug: 'kids-profile-avatar', t: 'Kid Profile + Avatar Picker', category: 'ui-components', difficulty: 'easy', tags: 'profile, avatar',
    build: 'A kid profile setup: a live inline-SVG avatar you customize (skin, hair, eyes, accessory, background color) via chunky option swatches, a name input, and an age picker. The avatar updates instantly as options change. A "save" pops a confirmation with the finished avatar. Big friendly controls, randomize button. Persist to localStorage.' },
  { slug: 'kids-landing-fairytale', t: 'Classic Fairytale Landing', category: 'pages', difficulty: 'med', tags: 'landing, fairytale',
    build: 'A classic fairytale app/book landing. Palette: cream + gold + storybook red; ornate serif display; whimsical, timeless mood. Hero with an illustrated castle/forest SVG scene, a "Once upon a time…" headline, featured tales, a read-aloud feature strip, testimonials from parents, and a CTA. Ornamental dividers, gold flourishes, gentle float animations.' },
  { slug: 'kids-landing-modern-flat', t: 'Modern Flat Landing', category: 'pages', difficulty: 'med', tags: 'landing, flat',
    build: 'A modern flat-illustration kids app landing. Palette: bright flat colors; rounded sans; clean, contemporary. Bold flat SVG hero illustration, crisp feature cards with flat icons, a how-it-works 3-step, app-store-style CTAs, and a colorful footer. Snappy, geometric, lots of solid color blocks and rounded shapes.' },
  { slug: 'kids-landing-popup', t: 'Pop-Up Book Landing', category: 'pages', difficulty: 'hard', tags: 'landing, popup',
    build: 'A pop-up-book themed landing. Paper textures + layered drop-shadows; playful; tactile 3D feel. Sections "pop up" as you scroll (layered SVG/CSS with offset shadows, slight rotation, fold lines). A hero where a paper scene unfolds, feature pages that lift, and a CTA card that springs. Use IntersectionObserver to trigger the pop-up reveals. Rich, dimensional.' },
  { slug: 'kids-landing-educational', t: 'Educational / EdTech Landing', category: 'pages', difficulty: 'med', tags: 'landing, edtech',
    build: 'An educational/EdTech-for-kids landing. Palette: primary colors + white; chunky sans; cheerful, learning mood. Hero with a friendly mascot + value prop, subject tiles (Reading, Math, Science), a progress/curriculum strip, parent trust section (safe, ad-free), pricing for families, CTA. Energetic but clear and credible.' },
  { slug: 'kids-landing-nursery', t: 'Nursery / Baby Landing', category: 'pages', difficulty: 'easy', tags: 'landing, nursery',
    build: 'A nursery/baby brand landing. Palette: soft pastels + cream; rounded soft type; gentle, soothing mood. Airy hero with a soft SVG mobile/stars scene, lullaby/bedtime feature cards, ultra-rounded soft shadows, a calm testimonial, and a quiet CTA. Minimal motion (slow gentle drift), lots of whitespace, tender tone.' },
]

// ---- Phase 55 — travel ---------------------------------------------------
const P55 = [
  { slug: 'travel-destination-guide', t: 'Destination Guide', category: 'pages', difficulty: 'hard', tags: 'guide, destination',
    build: 'A full destination guide for a fictional place (e.g. "Isla Verde"): full-bleed gradient hero with title + key facts (best time, currency, language), a sticky section nav (Overview, See, Eat, Stay, Tips), rich content sections with POI cards, a CSS/SVG map with pins, a photo gallery band, and a "save guide" action. JS: scrollspy highlights the active section, smooth-scroll nav, save toggle. Editorial, magazine-grade.' },
  { slug: 'travel-city-guide', t: 'City Guide', category: 'pages', difficulty: 'med', tags: 'guide, city',
    build: 'A city guide organized by neighborhoods: hero, a neighborhood selector (chips) that filters the top-spots list + repositions the SVG city map pins, POI cards (photo gradient, rating, category, map link), and a "top 5" rail. JS: selecting a neighborhood filters content and highlights its map pins; category filter too. Warm, walkable, practical.' },
  { slug: 'travel-story-feature', t: 'Travel Story / Photo Essay', category: 'pages', difficulty: 'med', tags: 'story, photo-essay',
    build: 'A long-form travel photo essay: a cinematic full-bleed gradient cover with title + byline + read time, then alternating large "photo" panels (gradient/SVG scenes) and serif prose, pull-quotes, a parallax band, and a caption style. JS: scroll-reveal of panels, a reading-progress bar, parallax on cover. Immersive, editorial, lots of air.' },
  { slug: 'travel-itinerary', t: 'Day-by-day Itinerary', category: 'pages', difficulty: 'med', tags: 'itinerary, planner',
    build: 'A day-by-day trip itinerary: a day tab/selector (Day 1-5), each day a vertical timeline of stops (time, POI card, travel time between, notes), a day summary (distance, cost, highlights), and a mini map of the day route (SVG). JS: switching days swaps the timeline + map route; check off completed stops; collapse/expand a stop. Clear, organized, save/print friendly.' },
  { slug: 'travel-listicle', t: '"Top 10 Places" Listicle', category: 'pages', difficulty: 'easy', tags: 'listicle, ranking',
    build: 'A "Top 10 Beaches" listicle: a sticky ranked nav (1-10), numbered entries each with a big gradient/SVG hero, a rank badge, blurb, quick facts (best for, when, cost), and a map link. JS: clicking a rank scroll-jumps to it and updates the active state; a "surprise me" jumps to a random pick. Bold numbers, scannable, shareable.' },
  { slug: 'travel-poi-card', t: 'Point-of-interest Card', category: 'ui-components', difficulty: 'easy', tags: 'poi, card',
    build: 'A reusable point-of-interest card: gradient/SVG photo, category chip, title, star rating + review count, a one-line description, price/entry tier, distance, a "view on map" link and a save (heart) toggle. Show 3-4 variants (hotel, restaurant, landmark, beach) in a responsive grid. JS: heart toggles saved (persist), hover lift, keyboard accessible. The building block for the guides.' },
  { slug: 'travel-map-content', t: 'Map + Content Split', category: 'ui-components', difficulty: 'hard', tags: 'map, split',
    build: 'A map + scrollable content split layout (Airbnb-style): left a scrollable list of POI cards, right a sticky SVG map with numbered pins. Hovering/selecting a card highlights its pin (and vice-versa), the map can "fly" (pan/zoom via transform) to the selection, and a filter bar narrows both. JS keeps list↔map in sync. On mobile, a toggle swaps between list and full map. The hardest, showcase-grade primitive.' },
  { slug: 'travel-itinerary-timeline', t: 'Itinerary Timeline', category: 'ui-components', difficulty: 'med', tags: 'timeline, itinerary',
    build: 'An itinerary timeline primitive for one day: a vertical time-anchored list of stops (icon, time, title, duration, travel-time connectors between stops) with type colors (sightseeing/food/transport/hotel). JS: drag to reorder stops (times recompute), add/remove a stop, collapse details. Clean connectors and a running total (stops, hours). Reusable inside the planner.' },
  { slug: 'travel-photo-gallery', t: 'Destination Photo Gallery', category: 'ui-components', difficulty: 'med', tags: 'gallery, lightbox',
    build: 'A destination photo gallery: a masonry/justified grid of gradient/SVG "photos" with caption + location overlays on hover, category filter chips, and a lightbox (click to open full, prev/next, keyboard, caption, counter). JS: filtering reflows the grid, lightbox with focus trap and arrow-key nav, Esc closes. Smooth, magazine-quality.' },
  { slug: 'travel-weather-widget', t: 'Best-time / Weather Widget', category: 'ui-components', difficulty: 'easy', tags: 'weather, best-time',
    build: 'A best-time-to-visit / weather widget: a 12-month strip with a temperature curve (inline SVG) + rainfall bars and a "best months" highlighted band, plus a current-conditions card (icon, temp, hi/lo, feels-like) and a 5-day mini forecast. JS: clicking a month updates the conditions card + explains why it is/ isn’t ideal; unit toggle °C/°F. Friendly, informative.' },
  { slug: 'travel-budget-bar', t: 'Trip Budget Indicator', category: 'ui-components', difficulty: 'easy', tags: 'budget, cost',
    build: 'A trip budget / cost indicator: a total budget input, category sliders/rows (flights, stay, food, activities, transport) each with an amount and a colored segment in a single stacked budget bar, plus a remaining/over indicator and a per-day figure. JS: editing a category updates the stacked bar, totals, remaining, and warns (red) when over budget. Currency formatted. Clear money UI.' },
  { slug: 'travel-explore', t: 'Explore Destinations', category: 'pages', difficulty: 'med', tags: 'explore, browse',
    build: 'An explore/browse destinations page: a hero search, filter chips (region, vibe: beach/city/nature, budget, month), and a responsive grid of destination cards (gradient hero, name, country, rating, from-price, save). JS: filters + search narrow the grid live with a result count and empty state; sort (popular/price/rating); save toggles. Inviting, discovery-focused.' },
  { slug: 'travel-trip-planner', t: 'Trip Planner', category: 'pages', difficulty: 'hard', tags: 'planner, build-trip',
    build: 'A trip planner: a searchable list of POIs/destinations you "add to trip", which populate a day-by-day itinerary panel (drag between days, reorder), a running budget + total days, and a mini SVG route map. JS: add/remove spots, drag across days, auto totals, save trip to localStorage, clear. The flagship interactive page — make add→itinerary→map feel cohesive and real.' },
  { slug: 'travel-saved-trips', t: 'Saved Trips / Wishlist', category: 'ui-components', difficulty: 'easy', tags: 'saved, wishlist',
    build: 'A saved trips / wishlist view: cards for saved destinations & draft trips (gradient cover, name, dates or "no dates", saved count, progress), a filter (All / Trips / Places), and quick actions (open, duplicate, remove). JS: remove with undo toast, filter, an empty state inviting exploration. Reads/writes the same localStorage the explore/planner use. Tidy and personal.' },
  { slug: 'travel-guide-editor', t: 'Guide Editor', category: 'pages', difficulty: 'med', tags: 'editor, cms',
    build: 'A travel guide editor (CMS-lite): a left outline of sections (drag to reorder, add/remove), a center editable canvas (title, body, POI blocks you can add, a map block), and a right inspector (section settings, publish toggle, SEO). JS: selecting a section loads it into the canvas/inspector, edits update a live preview feel, reorder updates the outline, add POI inserts a card. Productive, content-tool aesthetic.' },
  { slug: 'travel-admin-dashboard', t: 'Travel Site Dashboard', category: 'pages', difficulty: 'med', tags: 'dashboard, admin',
    build: 'A travel-site admin dashboard: KPI cards (visitors, top destinations, guide views, avg. read time with deltas + sparklines), a seasonality SVG line/area chart of bookings/interest by month, a top-guides table (views, saves, trend), and a destinations-by-region bar. JS: a date-range/period switch recomputes KPIs and redraws charts; table sort. Inline SVG charts only.' },
  { slug: 'travel-landing-guidebook', t: 'Classic Guidebook Landing', category: 'pages', difficulty: 'med', tags: 'landing, guidebook',
    build: 'A classic guidebook (Lonely-Planet-style) landing. Palette: cream + teal + coral; friendly serif + sans; practical, trustworthy mood. Hero with a stamped/badge motif, "guides for N countries" stats, featured guide cards, a community/expert section, newsletter CTA. Stamp/ticket/passport decorative accents, warm and credible.' },
  { slug: 'travel-landing-luxury', t: 'Luxury / Bespoke Travel Landing', category: 'pages', difficulty: 'hard', tags: 'landing, luxury',
    build: 'A luxury bespoke-travel landing. Palette: ivory + bronze + deep green; elegant serif; refined, aspirational mood. Full-bleed cinematic gradient hero, generous whitespace, thin gold rules, signature destinations with elegant hover, a concierge/bespoke section, discreet CTA. Slow, sophisticated reveals. Understated opulence.' },
  { slug: 'travel-landing-backpacker', t: 'Backpacker / Budget Landing', category: 'pages', difficulty: 'med', tags: 'landing, backpacker',
    build: 'A backpacker/budget travel landing. Palette: bright sunset + denim + white; chunky sans; adventurous, youthful mood. High-energy hero with a route/dotted-line motif, "trips from $X", hostel/route cards, a community photo wall, deals strip, bold CTA. Sticker/tape accents, playful tilt, lively. Fun and affordable vibe.' },
  { slug: 'travel-landing-natgeo', t: 'National-Geographic-style Landing', category: 'pages', difficulty: 'hard', tags: 'landing, documentary',
    build: 'A National-Geographic-style landing. Palette: black + signature yellow + white; bold serif; documentary, epic mood. The iconic yellow-border framing motif, a powerful full-bleed gradient hero, feature stories with strong captions, a stat/expedition band, and an austere bold CTA. High contrast, photographic gravitas, restrained but striking.' },
  { slug: 'travel-landing-agency', t: 'Travel Agency Landing', category: 'pages', difficulty: 'med', tags: 'landing, agency',
    build: 'A travel agency / tour operator landing, conversion-focused. Palette: sky blue + sand + orange; clean sans; inviting mood. Hero with a search/booking widget (destination, dates, travelers), popular packages with prices, why-book-with-us trust badges, testimonials, and a strong CTA. JS: the search widget validates and shows a friendly "searching…" → results teaser. Bright, trustworthy, sales-driven.' },
]

// ---- Phase 56 — portfolio ------------------------------------------------
const P56 = [
  { slug: 'port-hero-intro', t: 'Hero / Intro Header Variants', category: 'ui-components', difficulty: 'easy', tags: 'hero, intro',
    build: 'A set of 3 portfolio hero/intro variants shown stacked: (1) centered name + role + one-line + CTA, (2) split left text / right avatar-shape, (3) big kinetic name with a typed role rotator. Neutral base palette. JS: the role rotator cycles titles, a subtle gradient/cursor follow on one variant, copy-email button. Each is a clean, drop-in header.' },
  { slug: 'port-project-card', t: 'Project / Case-study Card', category: 'ui-components', difficulty: 'easy', tags: 'project, card',
    build: 'A reusable project/case-study card: gradient/SVG thumbnail, title, role, year, tag chips (e.g. UX, Branding), a one-line outcome, and hover that reveals a "View case study →". Show 3 variants (default, wide/featured, compact). JS: hover/focus lift + reveal, click opens a lightweight detail modal (overview, role, impact). Crisp and portfolio-ready.' },
  { slug: 'port-work-grid', t: 'Work Grid + Filter', category: 'ui-components', difficulty: 'med', tags: 'work, grid, filter',
    build: 'A filterable work/projects grid: category filter chips (All, Product, Web, Branding, Motion), a responsive grid of project tiles (gradient thumb, title, tags), and a sort (Recent/A-Z). JS: filtering animates tiles in/out with a FLIP-like reflow, active chip state, result count, empty state. Clicking a tile opens a quick-look. Smooth and tidy.' },
  { slug: 'port-about-bio', t: 'About / Bio Block', category: 'ui-components', difficulty: 'easy', tags: 'about, bio',
    build: 'An about/bio block: an avatar-shape (gradient/SVG), a short narrative bio, a row of quick facts (location, focus, availability badge), a values/now list, and inline social links. A "currently" line and a downloadable-CV button (triggers a toast). Warm, personable, two-column on desktop, stacked on mobile. Neutral base.' },
  { slug: 'port-experience-timeline', t: 'Experience / Résumé Timeline', category: 'ui-components', difficulty: 'easy', tags: 'experience, timeline',
    build: 'An experience/résumé timeline: a vertical line with role entries (company, title, dates, 2-3 bullet achievements, stack chips), a toggle between Work and Education, and a "expand all/collapse" control. JS: entries expand/collapse, the toggle swaps datasets, current role marked. Clean connectors, scannable. Reusable in résumé pages.' },
  { slug: 'port-skills-cloud', t: 'Skills / Tools Display', category: 'ui-components', difficulty: 'easy', tags: 'skills, tools',
    build: 'A skills/tools display: grouped skill chips (Design, Code, Tools) each with a proficiency dot/bar, plus an optional animated "cloud" arrangement and a category filter. JS: hovering a skill shows years/level, filter highlights a group, a view toggle (bars ↔ cloud). Tidy, honest, no fake 100%s. Neutral base.' },
  { slug: 'port-contact-cta', t: 'Contact / Hire-me CTA + Form', category: 'ui-components', difficulty: 'easy', tags: 'contact, form',
    build: 'A contact / hire-me block: a bold "Let’s work together" CTA, an availability badge, a compact form (name, email, project type select, message) with inline validation, and a copy-email + social row. JS: validates on blur/submit, shows a success state ("Thanks — I’ll reply within 24h"), copy-email toast. Friendly and conversion-minded.' },
  { slug: 'port-testimonial', t: 'Testimonial / Recommendation Block', category: 'ui-components', difficulty: 'easy', tags: 'testimonial, quote',
    build: 'A testimonial/recommendation block: a featured quote with avatar, name, role/company, and a small logo, plus a carousel of 3-4 recommendations with dots/arrows and an optional star rating. JS: carousel auto-advances (pausable), arrow/dot/keyboard nav, smooth slide. Credible and elegant. Neutral base.' },
  { slug: 'port-resume-classic', t: 'Classic One-column CV', category: 'pages', difficulty: 'easy', tags: 'resume, print',
    build: 'A classic single-column CV, print-ready: header (name, title, contact row), summary, experience (timeline-style entries), education, skills, and a clean typographic rhythm. A "download / print" button using print CSS (@media print: hide chrome, A4 margins). JS: print trigger, optional accent-color picker. Restrained, professional, ATS-friendly feel.' },
  { slug: 'port-resume-two-column', t: 'Two-column CV', category: 'pages', difficulty: 'med', tags: 'resume, two-column',
    build: 'A two-column CV: a left sidebar (avatar, contact, skills bars, languages, links) and a right main column (summary, experience, education, projects). Print CSS keeps the two-column on paper. JS: an accent theme switcher, print button, and a density toggle (comfortable/compact). Balanced, modern, recruiter-friendly.' },
  { slug: 'port-resume-creative', t: 'Creative / Visual CV', category: 'pages', difficulty: 'med', tags: 'resume, creative',
    build: 'A creative/visual CV: a bold header, a skills "constellation" or rated bars, an experience timeline with icons, a stats band (years, projects, clients), and tasteful color — still readable & printable. JS: animated stat counters on load, a print-friendly mode toggle, accent picker. Expressive but hireable, not gimmicky.' },
  { slug: 'port-style-minimal', t: 'Minimal / Swiss Portfolio', category: 'pages', difficulty: 'easy', tags: 'style, minimal',
    build: 'A FULL one-page portfolio in Minimal/Swiss style. White + ink + ONE accent; grotesque sans (e.g. "Inter"/"Space Grotesk"); restrained, confident, grid-driven. Hero (name/role), selected work grid, about, experience, contact — all on a strict baseline grid with generous whitespace and precise type. Subtle hover only. Compose the 56.A sections, restyled.' },
  { slug: 'port-style-editorial', t: 'Editorial / Typographic Portfolio', category: 'pages', difficulty: 'med', tags: 'style, editorial',
    build: 'A FULL one-page portfolio in Editorial/Typographic style. Cream + black; large serif ("Fraunces"/"Playfair"); magazine-like, text-forward. Oversized headlines, drop caps, multi-column prose, rule lines, footnote-style captions, numbered projects. Minimal imagery, maximal typography. Compose the 56.A sections, restyled.' },
  { slug: 'port-style-brutalist', t: 'Brutalist Portfolio', category: 'pages', difficulty: 'med', tags: 'style, brutalist',
    build: 'A FULL one-page portfolio in Brutalist style. Raw white + harsh black borders + one clashing accent; mono/sans mix; bold, anti-design. Hard 2-3px borders, visible grid, no rounded corners, raw underlined links, marquee or blunt blocks, intentional asymmetry. Snappy, loud hovers. Compose the 56.A sections, restyled.' },
  { slug: 'port-style-terminal', t: 'Terminal / Dev Portfolio', category: 'pages', difficulty: 'easy', tags: 'style, terminal',
    build: 'A FULL one-page portfolio in Terminal/Dev style. Black + green/amber; monospace; hacker CLI aesthetic. A prompt-driven layout: typed boot intro, sections as commands ($ whoami, $ ls projects, $ cat about), blinking caret, ASCII dividers. JS: a working mini command input that "runs" a few commands to reveal sections. Compose the 56.A content as CLI output.' },
  { slug: 'port-style-motion', t: 'Motion-Heavy Portfolio', category: 'pages', difficulty: 'hard', tags: 'style, motion',
    build: 'A FULL one-page portfolio in Motion-Heavy style. Dark + gradient; display type; animation-first, kinetic. Scroll-reveal everything (IntersectionObserver), parallax layers, a magnetic/cursor-follow accent, staggered project reveals, animated counters, smooth section transitions. Respect reduced-motion. Compose the 56.A sections with rich motion.' },
  { slug: 'port-style-3d-interactive', t: '3D / Interactive Portfolio', category: 'pages', difficulty: 'hard', tags: 'style, 3d',
    build: 'A FULL one-page portfolio in 3D/Interactive style (CSS 3D, no WebGL libs). Dark + neon; display type; immersive. Tilt-on-hover project cards (perspective + rotateX/Y from pointer), a 3D-rotating hero element, layered depth/parallax, glowing edges. JS computes tilt from mouse, gyro-friendly. Compose the 56.A sections as interactive 3D cards.' },
  { slug: 'port-style-glass', t: 'Glassmorphism Portfolio', category: 'pages', difficulty: 'med', tags: 'style, glass',
    build: 'A FULL one-page portfolio in Glassmorphism style. Colorful gradient background + frosted glass cards (backdrop-filter blur, translucent borders, soft glow); clean sans; modern, layered. Floating blurred orbs behind glass panels for hero, work, about, contact. Subtle hover depth. Compose the 56.A sections as glass cards.' },
  { slug: 'port-style-playful', t: 'Playful / Illustrated Portfolio', category: 'pages', difficulty: 'med', tags: 'style, playful',
    build: 'A FULL one-page portfolio in Playful/Illustrated style. Bright palette + hand-drawn SVG accents (squiggles, blobs, stars); rounded display type; friendly, characterful. Sticker-like project cards, wobbly underlines, a waving avatar, bouncy hovers, doodle dividers. Compose the 56.A sections with illustrated personality.' },
]

// ---- Phase 57 — ecommerce ------------------------------------------------
const P57 = [
  { slug: 'shop-home', t: 'Storefront Home', category: 'pages', difficulty: 'med', tags: 'home, storefront',
    build: 'A storefront home: header (logo, nav, search, cart count), a hero banner with CTA, featured collections tiles, a "trending" product carousel/grid (product cards), a deals strip with countdown, trust badges, and a footer. JS: add-to-cart updates the header count + a toast, carousel scroll, countdown ticks. Clean, conversion-oriented.' },
  { slug: 'shop-category', t: 'Category / PLP', category: 'pages', difficulty: 'hard', tags: 'plp, listing',
    build: 'A category / product-listing page: a faceted filter rail (category, price range, color swatches, size, rating, in-stock), a sort dropdown, an active-filter chip row, a results grid of product cards, and pagination/"load more". JS: applying any facet filters the grid live, updates count + chips (removable), sort reorders, clear-all resets. The flagship hard page — make filtering feel instant and real.' },
  { slug: 'shop-product-detail', t: 'Product Detail (PDP)', category: 'pages', difficulty: 'hard', tags: 'pdp, product',
    build: 'A product detail page: an image gallery (gradient/SVG main + thumbnails), title, price (with compare-at + discount), star rating + review count, variant pickers (color swatches, size chips), quantity stepper, add-to-cart + wishlist, shipping/returns accordions, a reviews block with rating breakdown, and a "you may also like" rail. JS: gallery switching, variant selection updates price/image/stock, qty, add-to-cart toast. Rich, complete PDP.' },
  { slug: 'shop-cart', t: 'Cart / Bag', category: 'pages', difficulty: 'med', tags: 'cart, bag',
    build: 'A cart/bag page: line items (thumb, title, variant, qty stepper, price, remove), a promo-code input, an order summary (subtotal, shipping, tax, total), free-shipping progress bar, and a checkout CTA. JS: qty changes recompute totals, remove with undo toast, valid promo applies a discount, empty-cart state. Clear money math.' },
  { slug: 'shop-checkout', t: 'Checkout', category: 'pages', difficulty: 'hard', tags: 'checkout, payment',
    build: 'A multi-step checkout: steps (Contact → Shipping → Payment → Review) with a progress indicator, address form with validation, shipping-method radios (price/eta), a card form (formatted number/expiry/cvc, never real), and an order-summary sidebar that stays in sync. JS: step navigation with per-step validation, summary updates, a final "place order" → success state. Trustworthy, secure-feeling.' },
  { slug: 'shop-order-confirmation', t: 'Order Confirmation', category: 'pages', difficulty: 'easy', tags: 'confirmation, thank-you',
    build: 'An order confirmation / thank-you page: a success header with order number, an estimated-delivery card with a step tracker (Confirmed → Packed → Shipped → Delivered), an itemized order summary, shipping address, and continue-shopping + track-order CTAs. JS: a subtle confetti/check animation on load, copy order number, expandable item list. Reassuring and clear.' },
  { slug: 'shop-account', t: 'Account', category: 'pages', difficulty: 'med', tags: 'account, orders',
    build: 'A customer account page: a sidebar (Orders, Addresses, Payment, Returns, Profile), an orders list with status badges + reorder/track actions, an order-detail drawer, an addresses manager (add/edit/default), and a profile form. JS: section switching, order detail open, add/edit address, set default, save profile toast. Organized self-service hub.' },
  { slug: 'shop-wishlist', t: 'Wishlist / Saved Items', category: 'ui-components', difficulty: 'easy', tags: 'wishlist, saved',
    build: 'A wishlist component: a grid of saved product cards (image, title, price, in-stock chip), with move-to-cart and remove per item, a select-all + bulk move/remove bar, and an empty state. JS: heart/remove with undo toast, move-to-cart updates a cart count, bulk actions, price-drop badge on a couple. Persist to localStorage.' },
  { slug: 'shop-search-results', t: 'Search Results', category: 'pages', difficulty: 'med', tags: 'search, results',
    build: 'A search results page: a search bar with autocomplete suggestions (recent + popular + matching products as you type), result count, facet chips, a results grid, and a "no results" state with suggestions. JS: typing shows a live autocomplete dropdown (keyboard navigable), selecting/submitting filters the grid, did-you-mean, clear. Fast-feeling search UX.' },
  { slug: 'shop-product-card', t: 'Product Card', category: 'ui-components', difficulty: 'easy', tags: 'product, card',
    build: 'A reusable product card: gradient/SVG image with a wishlist heart + badge (Sale/New), title, brand, star rating, price (+ compare-at strikethrough), color swatch dots, and a hover "Quick add" / size flyout. Show 4 variants in a grid. JS: swatch hover swaps the image tint, quick-add toast, heart toggle, sold-out state. The core commerce primitive.' },
  { slug: 'shop-variant-picker', t: 'Variant Selector', category: 'ui-components', difficulty: 'med', tags: 'variant, swatches',
    build: 'A variant selector primitive: color swatches (with names + out-of-stock crossed), size chips (with availability per color), and an optional style/material picker, plus a live "selected: Black / M" summary, price-by-variant, and a size guide link. JS: choosing a color filters available sizes, selection updates summary/price/stock, disabled combos clearly shown, validation before add. Robust and accessible.' },
  { slug: 'shop-mini-cart', t: 'Mini-cart Flyout', category: 'ui-components', difficulty: 'med', tags: 'mini-cart, drawer',
    build: 'A mini-cart flyout/drawer: a cart button (item count) that opens a right drawer with line items (thumb, title, qty stepper, price, remove), a free-shipping progress bar, subtotal, and view-cart/checkout CTAs. JS: open/close with focus trap + Esc + overlay, qty/remove recompute subtotal, add-to-cart from a demo product list slides items in, empty state. Smooth e-comm staple.' },
  { slug: 'shop-price-display', t: 'Price + Discount Display', category: 'ui-components', difficulty: 'easy', tags: 'price, discount',
    build: 'A price display primitive showing variants: current price, compare-at strikethrough + "% off" badge, per-unit price, installment ("4× $X"), member price, and a low-stock/price-drop note. Include currency formatting and a few states (regular, on-sale, sold-out, pre-order). JS: a currency switcher reformats all prices, a "toggle sale" demo. Tiny but precise money UI.' },
  { slug: 'shop-filter-rail', t: 'Faceted Filter Sidebar', category: 'ui-components', difficulty: 'med', tags: 'filters, facets',
    build: 'A faceted filter sidebar primitive: collapsible groups (Category checkboxes with counts, Price dual-range slider, Color swatch grid, Size chips, Rating, Brand search-list, In-stock toggle), a clear-all, and an applied-count. JS: each control updates a live "N results" + an active-filters chip row (removable), price slider with two handles, collapse/expand groups. The reusable PLP rail.' },
  { slug: 'shop-reviews-block', t: 'Reviews + Rating Breakdown', category: 'ui-components', difficulty: 'med', tags: 'reviews, ratings',
    build: 'A reviews block: an average-rating summary with a 5-star distribution breakdown (bars + %), filter-by-stars and sort (recent/helpful), individual review cards (avatar, name, verified badge, stars, date, body, helpful vote), and a "write a review" form (star input). JS: filtering/sorting reviews, helpful votes increment, star-rating input, load-more. Credible social proof.' },
  { slug: 'shop-promo-banner', t: 'Promo / Countdown Banner', category: 'ui-components', difficulty: 'easy', tags: 'promo, countdown',
    build: 'A promo / sale banner set: a top sticky announcement bar (dismissible, with a code copy), a hero sale banner with a live countdown timer (days/hrs/min/sec), and a compact flash-deal card with a stock-left progress bar. JS: countdown ticks to a target, copy-code toast, dismiss persists, stock bar animates. Bold but on-palette, urgency without being tacky.' },
  { slug: 'shop-page-collection', t: 'Collection / Lookbook', category: 'pages', difficulty: 'med', tags: 'collection, lookbook',
    build: 'A collection / lookbook page: an editorial hero, a curated story with large "photo" panels (gradient/SVG) and shoppable hotspots that reveal a product mini-card, a product grid for the collection, and a "shop the look" bundle. JS: hotspot tap opens a product popover with add-to-cart, gallery, smooth scroll. Magazine-meets-shop.' },
  { slug: 'shop-page-sale', t: 'Sale / Deals Landing', category: 'pages', difficulty: 'easy', tags: 'sale, deals',
    build: 'A sale/deals landing: a bold hero with a global sale countdown, deal categories, a grid of discounted product cards (showing % off + price), a "doorbusters" rail, and a coupon strip. JS: countdown ticks, a "sort by discount" toggle, copy-coupon, add-to-cart toast. High-energy, deal-driven, still clean.' },
  { slug: 'shop-page-brand-story', t: 'Brand Story / About', category: 'pages', difficulty: 'easy', tags: 'brand, about',
    build: 'A brand story / about page: a full-bleed hero with mission statement, a timeline of milestones, values cards, a sustainability/materials section with stats, founder note with signature, and a press/logos strip + CTA to shop. JS: scroll-reveal sections, animated stat counters, timeline progress. Warm, brand-building, premium feel.' },
  { slug: 'shop-admin-dashboard', t: 'Store Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, dashboard',
    build: 'A merchant store dashboard: KPI cards (Sales, Orders, AOV, Conversion with deltas + sparklines), a revenue SVG line/area chart, a top-products table, an orders-by-status donut, a low-stock alert list, and a recent-orders feed. JS: date-range/period switch recomputes KPIs + redraws charts, table sort. Inline SVG charts only. Sidebar admin chrome.' },
  { slug: 'shop-admin-products', t: 'Product Manager', category: 'pages', difficulty: 'hard', tags: 'admin, products',
    build: 'A product manager (admin): a products data-table (thumb, title, SKU, price, stock, status) with search, status filter, column sort, row select + bulk actions (publish/archive/delete), inline stock edit, and an add/edit product drawer (title, price, inventory, variants, status). JS: filter/search/sort, select + bulk bar, drawer create/edit updates the table, inline edits, pagination. Real CRUD feel.' },
  { slug: 'shop-admin-orders', t: 'Orders Manager', category: 'pages', difficulty: 'med', tags: 'admin, orders',
    build: 'An orders manager (admin): an orders table (id, customer, total, payment + fulfillment status badges, date), status filter tabs (All/Unfulfilled/Paid/Refunded), search, and an order-detail panel (items, customer, timeline) with fulfill / refund / print actions. JS: filter tabs + search, open detail, fulfill moves status with a toast, refund flow, bulk-fulfill. Operational and clear.' },
  { slug: 'shop-admin-discounts', t: 'Discounts / Promo Codes', category: 'ui-components', difficulty: 'med', tags: 'admin, discounts',
    build: 'A discounts / promo-codes manager: a list of codes (code, type %/fixed/free-ship, value, usage/limit, status, dates) with toggle active, and a create/edit form (code generator, type, value, min spend, usage limit, schedule). JS: create adds a row, toggle activate/deactivate, edit, copy code, usage progress bar, validation. Tidy admin component.' },
  { slug: 'shop-landing-fashion', t: 'Fashion / Apparel Store Landing', category: 'pages', difficulty: 'hard', tags: 'landing, fashion',
    build: 'A fashion/apparel store landing. Palette: white + black + one editorial accent; couture serif + sans; aspirational. Full-bleed lookbook hero, oversized type, a new-collection editorial band, shoppable category tiles, an Instagram-style grid, and a refined CTA. Elegant hovers, lots of whitespace, high-fashion gravitas.' },
  { slug: 'shop-landing-electronics', t: 'Electronics / Tech Store Landing', category: 'pages', difficulty: 'med', tags: 'landing, electronics',
    build: 'An electronics/tech store landing. Palette: dark + electric blue; clean sans; spec-forward, modern. A hero featuring a flagship gadget (SVG) with key specs, comparison cards, a deals row, spec-highlight tiles with animated counters, and a bold CTA. Techy glow accents, crisp grid, confident.' },
  { slug: 'shop-landing-grocery', t: 'Grocery / Essentials Landing', category: 'pages', difficulty: 'med', tags: 'landing, grocery',
    build: 'A grocery/essentials store landing. Palette: white + fresh green + orange; friendly sans; fast, practical. A hero with a delivery-time promise + zip-check, category tiles (Produce, Dairy, Bakery…), "deals today" cards, a how-delivery-works strip, and an app CTA. JS: a working zip/postcode check shows "we deliver!" Bright, fresh, efficient.' },
  { slug: 'shop-landing-marketplace', t: 'Multi-vendor Marketplace Landing', category: 'pages', difficulty: 'hard', tags: 'landing, marketplace',
    build: 'A multi-vendor marketplace landing. Palette: white + bold primary; dense sans; busy, deal-driven. A search-forward hero, dense category mega-grid, top-sellers rail, flash-deals with countdowns, vendor spotlights, and trust/returns strip. Lots of modules, energetic, Amazon-meets-Etsy density but still organized.' },
  { slug: 'shop-landing-luxury', t: 'Luxury Boutique Landing', category: 'pages', difficulty: 'hard', tags: 'landing, luxury',
    build: 'A luxury boutique store landing. Palette: black + champagne + ivory; refined serif; exclusive, minimal. A restrained cinematic hero, a single hero product with thin gold rules, a "the collection" editorial, an atelier/craft section, and a discreet CTA. Slow elegant reveals, immense whitespace, quiet opulence.' },
]

// ---- Phase 58 — saas -----------------------------------------------------
const P58 = [
  { slug: 'saas-landing-home', t: 'SaaS Landing', category: 'pages', difficulty: 'med', tags: 'landing, marketing',
    build: 'A SaaS marketing home: nav (logo, links, login, CTA), a hero (headline, subcopy, primary/secondary CTA, an SVG product preview), logo cloud (social proof), feature trio with icons, a metrics band, a testimonial, a pricing teaser, and a footer. JS: a light theme toggle, mobile nav, scroll-reveal, an interactive product-preview tab swap. Crisp and trustworthy.' },
  { slug: 'saas-features-page', t: 'Features / Product Tour', category: 'pages', difficulty: 'med', tags: 'features, tour',
    build: 'A features / product-tour page: alternating feature sections (copy + SVG product mockup), a sticky sub-nav that scrollspies the feature list, an interactive tab/accordion showcasing capabilities, a comparison-to-old-way band, and a CTA. JS: scrollspy, tab/accordion switching swaps the mockup, smooth-scroll nav. Benefit-led, clear.' },
  { slug: 'saas-pricing-page', t: 'Pricing Page', category: 'pages', difficulty: 'med', tags: 'pricing, plans',
    build: 'A pricing page: a monthly/annual toggle (annual shows savings), 3-4 plan cards (price, feature list, highlighted "Popular", CTA), a detailed feature-comparison table, an FAQ accordion, and a contact-sales band. JS: billing toggle updates all prices, a seat slider updates a plan price, FAQ expand, plan hover. Clear, confident, conversion-ready.' },
  { slug: 'saas-integrations-page', t: 'Integrations Directory', category: 'pages', difficulty: 'med', tags: 'integrations, directory',
    build: 'An integrations directory: a search + category filter chips (CRM, Comms, Dev, Analytics…), a grid of integration cards (SVG logo mark, name, blurb, "Connect" + connected badge), and a detail drawer (what it does, permissions, connect). JS: search/filter the grid live, connect toggles state with toast, category counts, empty state. Clean catalog UX.' },
  { slug: 'saas-changelog', t: 'Changelog / What\'s New', category: 'pages', difficulty: 'easy', tags: 'changelog, updates',
    build: 'A changelog / what\'s-new page: a vertical timeline of releases (version, date, type tags New/Improved/Fixed with colors, summary, details), a type filter, a search, and an RSS/subscribe CTA. JS: filter by type/search, expand a release for details, "new since your last visit" marker, copy-link per entry. Tidy product-update feed.' },
  { slug: 'saas-app-shell', t: 'App Shell', category: 'pages', difficulty: 'hard', tags: 'shell, layout',
    build: 'A SaaS app shell: a collapsible left sidebar (workspace switcher, nav sections, settings), a topbar (search, ⌘K hint, notifications, theme toggle, avatar menu), and a content area with a sample page (breadcrumb, page header, cards). JS: sidebar collapse (persisted), avatar/notification dropdowns, working light/dark toggle, mobile off-canvas nav, command-bar hint opens a stub. The structural backbone — polished and accessible.' },
  { slug: 'saas-onboarding-flow', t: 'Onboarding Wizard', category: 'pages', difficulty: 'med', tags: 'onboarding, wizard',
    build: 'An onboarding wizard: a setup checklist with progress (Create workspace → Invite team → Connect data → Customize), a stepper, per-step forms/choices, and a celebratory completion. JS: step navigation with validation, checklist items complete and update an overall % ring, skip-for-now, persist progress to localStorage, finish state. Welcoming and momentum-building.' },
  { slug: 'saas-empty-state', t: 'First-run / Empty States', category: 'ui-components', difficulty: 'easy', tags: 'empty-state, first-run',
    build: 'A set of polished empty/first-run states for one app area: No projects yet (illustration + "Create project" CTA + import option), No results (search), No data yet (connect source), and an Error/retry state. JS: a switcher cycles the states, the create CTA opens a tiny inline create form that then shows a populated state. Intentional inline-SVG illustrations — never blank.' },
  { slug: 'saas-dashboard-home', t: 'App Dashboard / Home', category: 'pages', difficulty: 'hard', tags: 'dashboard, home',
    build: 'An in-app dashboard home: a greeting + quick-actions row, KPI cards (with deltas + sparklines), a primary SVG trend chart, a recent-activity feed, a tasks/checklist widget, and an onboarding-progress nudge. JS: a date-range switch recomputes KPIs + redraws the chart, dismissable nudge, mark tasks done, widget menus. Inline SVG charts, light/dark aware.' },
  { slug: 'saas-command-bar', t: 'Global Command Bar (⌘K)', category: 'ui-components', difficulty: 'med', tags: 'command-bar, cmdk',
    build: 'A global command bar (⌘K / Ctrl-K): an overlay palette with a search input, grouped results (Navigation, Actions, Recent, Settings), fuzzy filtering, keyboard navigation (↑↓, Enter, Esc), highlighted match, and action icons + shortcuts. JS: keybinding to open, focus trap, fuzzy match, arrow nav + selection runs a demo action (toast), recent list. Fast, accessible, delightful.' },
  { slug: 'saas-settings-page', t: 'Settings Page', category: 'pages', difficulty: 'med', tags: 'settings, preferences',
    build: 'A settings page: a left settings nav (Profile, Workspace, Notifications, Appearance, Security), forms with grouped fields, toggles, a theme/appearance picker, notification preference switches, and a danger-zone section. JS: section switching, form dirty-state + save toast, toggles persist, appearance toggle actually changes theme, unsaved-changes guard. Clean and thorough.' },
  { slug: 'saas-billing-page', t: 'Billing & Subscription', category: 'pages', difficulty: 'med', tags: 'billing, subscription',
    build: 'A billing & subscription page: current-plan card (plan, seats, renewal, manage/upgrade), a usage summary, a payment-method card (brand + last4, update), and an invoices table (date, amount, status, download). JS: a plan-change opens the upgrade modal pattern, update-payment form, invoice download toast, usage bars. Clear, finance-grade trust.' },
  { slug: 'saas-upgrade-modal', t: 'Upgrade / Plan-compare Modal', category: 'ui-components', difficulty: 'med', tags: 'upgrade, modal',
    build: 'An upgrade / plan-compare modal: a centered dialog comparing current vs higher plans (feature deltas highlighted), a monthly/annual toggle, a seat selector, an order summary with proration note, and confirm/cancel. JS: open from a CTA with focus trap + Esc, billing/seat changes update the summary, confirm shows a success state, highlight "what you gain". Persuasive but honest.' },
  { slug: 'saas-team-members', t: 'Team Members & Roles', category: 'pages', difficulty: 'med', tags: 'team, roles',
    build: 'A team members & roles page: a members table (avatar, name, email, role select, status, last active), an invite-by-email form with role + a pending-invites list, role-permission summary, and remove/resend actions. JS: invite adds a pending row with toast, change role inline, remove with confirm, search/filter, seats-used indicator. Clear access management.' },
  { slug: 'saas-api-keys', t: 'API Keys & Webhooks', category: 'ui-components', difficulty: 'med', tags: 'api-keys, webhooks',
    build: 'An API keys & webhooks manager: a keys table (name, masked key with reveal/copy, scopes, created, last used) with create (names + scopes, shows the secret ONCE) and revoke, plus a webhooks section (endpoint URL, events, status, test-send). JS: create generates a fake key shown once, reveal/copy with toast, revoke confirm, add webhook, test-send shows a 200 result. Developer-grade UX.' },
  { slug: 'saas-usage-meter', t: 'Usage / Quota Meter', category: 'ui-components', difficulty: 'easy', tags: 'usage, quota',
    build: 'A usage / quota meter set: per-resource meters (API calls, storage, seats, builds) each with used/limit, a colored progress bar that turns warn/danger near the cap, a projected-overage note, and a period reset countdown. JS: a demo "simulate usage" ticks values, an upgrade prompt appears when over threshold, period toggle. Compact, scannable, honest.' },
  { slug: 'saas-admin-customers', t: 'Customers / Accounts Admin', category: 'pages', difficulty: 'hard', tags: 'admin, customers',
    build: 'An internal customers/accounts admin: an accounts data-table (company, plan, MRR, seats, status, health badge) with search, plan/status filters, sort, and a customer-detail drawer (overview, plan, usage, activity, billing). JS: filter/search/sort, open detail drawer, plan badges, health indicators, bulk export, pagination. Internal-tool density, still clean.' },
  { slug: 'saas-admin-metrics', t: 'SaaS Metrics (MRR · Churn · LTV)', category: 'pages', difficulty: 'hard', tags: 'admin, metrics',
    build: 'A SaaS metrics dashboard: headline cards (MRR, ARR, Churn %, LTV, Net revenue retention with deltas), an MRR-movement SVG bar chart (new/expansion/churned), a growth line/area chart, a cohort-retention heatmap (inline SVG/CSS grid), and a plan-mix donut. JS: period switch recomputes + redraws, hover tooltips on charts. Inline SVG charts only. Investor-grade.' },
  { slug: 'saas-landing-devtool', t: 'Developer Tool Landing', category: 'pages', difficulty: 'med', tags: 'landing, devtool',
    build: 'A developer-tool landing. Palette: dark + terminal accent; sans + mono; technical, credible. A hero with a copy-able install command + an animated terminal/code block, feature tiles for devs, a code-sample tab switcher (curl/JS/Python), GitHub-stars social proof, docs CTA. JS: copy-command toast, code tab switch, typed terminal. Crisp, credible to engineers.' },
  { slug: 'saas-landing-productivity', t: 'Productivity / Collaboration Landing', category: 'pages', difficulty: 'med', tags: 'landing, productivity',
    build: 'A productivity/collaboration tool landing. Palette: white + friendly accent; clean sans; calm, organized. A hero with a soft product mockup (board/list SVG), use-case tabs, a collaboration feature band, integrations strip, a delightful testimonial, and a free-to-start CTA. JS: use-case tab swaps the mockup, scroll-reveal. Calm, human, organized.' },
  { slug: 'saas-landing-analytics', t: 'Analytics / Data Platform Landing', category: 'pages', difficulty: 'hard', tags: 'landing, analytics',
    build: 'An analytics/data-platform landing. Palette: dark + chart gradients; sans; insight-forward, dense. A hero featuring a rich SVG dashboard mockup (charts, KPIs), feature sections about pipelines/queries/dashboards, a live-ish animated metric band, customer logos, and a demo CTA. JS: animated chart counters, a metric ticker, tab-swap of dashboard views. Data-rich, impressive.' },
  { slug: 'saas-landing-ai', t: 'AI Product Landing', category: 'pages', difficulty: 'hard', tags: 'landing, ai',
    build: 'An AI product landing. Palette: black + iridescent gradient; modern sans; cutting-edge. A glowing gradient hero with a prompt→result demo, capability tiles, an animated "thinking"/streaming text demo, a model/quality band, social proof, and a try-it CTA. JS: a working demo input that streams a canned response token-by-token, gradient motion, copy. Sleek, futuristic, respect reduced-motion.' },
  { slug: 'saas-landing-fintech', t: 'Fintech SaaS Landing', category: 'pages', difficulty: 'med', tags: 'landing, fintech',
    build: 'A fintech SaaS landing. Palette: navy + mint + white; precise sans; trustworthy, compliant. A hero with a clean finance dashboard/card mockup (SVG), security & compliance badges (SOC2/PCI-style, fictional), feature tiles (payments, reporting, controls), a stats band, and a "book a demo" CTA. JS: animated counters, a small interactive savings/fee calculator. Precise, secure, credible.' },
]

function tag(arr, style) {
  const cfg = CFG[style]
  return arr.map((s) => ({ ...s, style, cfg }))
}

const SPECS = [
  ...tag(P54, 'storybook'),
  ...tag(P55, 'travel'),
  ...tag(P56, 'portfolio'),
  ...tag(P57, 'ecommerce'),
  ...tag(P58, 'saas'),
]

const RESULT = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['slug', 'files'],
}

log(`Generando ${SPECS.length} recursos en 5 fases (54-58): storybook 18 · travel 21 · portfolio 19 · ecommerce 28 · saas 23…`)

const results = await parallel(
  SPECS.map((s) => () =>
    agent(buildPrompt(s), {
      label: s.slug,
      phase: s.cfg.phaseTag,
      agentType: 'general-purpose',
      schema: RESULT,
    })
  )
)

const ok = results.filter(Boolean)
const byPhase = {}
for (let i = 0; i < SPECS.length; i++) {
  const tagName = SPECS[i].cfg.phaseTag
  byPhase[tagName] = byPhase[tagName] || { requested: 0, completed: 0 }
  byPhase[tagName].requested++
  if (results[i]) byPhase[tagName].completed++
}

return {
  requested: SPECS.length,
  completed: ok.length,
  byPhase,
  resources: ok.map((r) => ({ slug: r.slug, fileCount: (r.files || []).length })),
}
