// ===========================================================================
// Workflow — Phase 50 (Comics / Manga / Webtoon Theme) — 21 resources
// ===========================================================================
export const meta = {
  name: 'comics-phase50-finish',
  description: 'Generate the 21 Phase 50 comics resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'comics'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Google Font via <link>: "Bangers" (display/lettering) + "Inter" (body) — weights Inter 400;500;600;700;800.
  Use Bangers for big headings / SFX, Inter for body/UI.
- Default palette in :root —
  --ink:#0e0e12; --ink-2:#23232b; --paper:#fdfcf7; --panel:#ffffff;
  --accent:#ff2e4d; --accent-2:#ffd23f; --accent-blue:#2e6bff;
  --muted:#6b6b78; --line:rgba(14,14,18,0.14); --line-2:rgba(14,14,18,0.28);
  --halftone: radial-gradient(circle, rgba(14,14,18,0.18) 1px, transparent 1.6px);
  radii: --r-sm:6px --r-md:12px --r-lg:18px; hard ink borders (2-3px solid var(--ink)), bold drop-shadows.
- Comic core primitives: thick ink panel borders, gutters between panels, halftone/Ben-Day dot
  textures (use the --halftone background-image with background-size ~6px), speech balloons with
  tails, bold uppercase SFX lettering, high-contrast ink + bold accent.
- box-sizing border-box reset, antialiased, line-height 1.5, --paper page background.
- Accessible: aria where relevant, WCAG AA contrast for body text, keyboard-usable buttons.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional series/character names (e.g. "Neon Ronin", "Iron Vanguard").`

const DISCLAIMER = '> Illustrative UI only — fictional series, characters, and data.'

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

  return `You are generating ONE production-quality static UI demo resource for a Comics/Manga/Webtoon collection. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

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

QUALITY BAR: real-feeling content, multiple panels/cards/rows, clear hierarchy, hover/active states, comic-style ink borders + halftone texture, smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 50.B — Patterns first
  { slug: 'comic-speech-balloon', title: 'Comics — Speech / Thought / Shout Balloon Set', category: 'ui-components', difficulty: 'easy', tags: 'balloon, lettering',
    build: 'A showcase of comic speech balloons: normal speech (with pointed tail), rounded thought bubble (with bubble-trail dots), jagged shout/burst balloon, whisper (dashed outline), and narration whisper. Each on a sample panel background. CSS-drawn tails via clip-path or pseudo-elements. JS lets user click a balloon to cycle tail direction (left/right/down) and toggle balloon type via buttons. Bangers font for shout, Inter for speech.' },
  { slug: 'comic-panel-frame', title: 'Comics — Panel Frame + Gutter System', category: 'ui-components', difficulty: 'med', tags: 'panel, layout',
    build: 'A reusable comic panel/gutter grid system. Show several page layouts (2x2 grid, splash + strip, diagonal/skewed panels, inset panel) built with CSS grid + thick ink borders and white gutters. Each panel holds a halftone background and a caption. JS: a layout switcher (buttons) that swaps between 4 preset panel arrangements with a smooth transition, plus a gutter-width slider that updates a CSS variable live.' },
  { slug: 'comic-sfx-text', title: 'Comics — Sound-Effect (SFX) Lettering', category: 'ui-components', difficulty: 'easy', tags: 'sfx, typography',
    build: 'Bold animated comic sound-effect lettering: BOOM, POW, ZAP, CRASH, WHOOSH styled with Bangers, outlined/3D layered text-shadow, skew, and accent fills. Each SFX sits over a halftone burst. JS: click a word to replay its pop-in animation (scale + rotate + settle); a text input + "make SFX" button renders any typed word in the SFX style with a random burst color.' },
  { slug: 'comic-halftone-bg', title: 'Comics — Halftone / Ben-Day Dot Backgrounds', category: 'ui-components', difficulty: 'easy', tags: 'halftone, texture',
    build: 'A halftone / Ben-Day dot background toolkit. Several swatches showing dot patterns: flat dots, gradient dots (size ramp), radial burst, diagonal speed-lines, and a duotone halftone. Built with CSS radial-gradient background-image. JS controls: sliders for dot size, spacing, and angle that update CSS variables live across a large preview panel, plus a color picker for dot + paper color and a "copy CSS" button (toast confirms).' },
  { slug: 'comic-caption-box', title: 'Comics — Narration Caption Box', category: 'ui-components', difficulty: 'easy', tags: 'caption, narration',
    build: 'Comic narration caption boxes: the classic yellow "Meanwhile..." rectangular caption, a location/time stamp box, a first-person narration box, and a chapter-title caption. Each pinned to a corner of a sample panel with ink border and slight tilt. JS: a small editor where the user types caption text and picks a style (yellow box / location / narration) and corner position, updating a live preview caption on the panel.' },

  // 50.A — Readers
  { slug: 'comic-page-reader', title: 'Comics — Paged Comic Reader (page flip · zoom)', category: 'pages', difficulty: 'hard', tags: 'reader, viewer',
    build: 'A full paged comic reader. Large centered page (CSS-drawn comic page with panels + balloons), prev/next arrows, page-flip transition (3D rotateY or slide), page counter (e.g. 7 / 24), thumbnail strip / page-jump dropdown, fit-width vs fit-height toggle, and pinch/zoom via a zoom slider + double-click to zoom into a point. Keyboard arrows turn pages. Dark immersive reader chrome. JS manages page state, zoom transform, and keyboard nav.' },
  { slug: 'comic-webtoon-reader', title: 'Comics — Vertical-Scroll Webtoon Reader', category: 'pages', difficulty: 'med', tags: 'webtoon, scroll, reader',
    build: 'A mobile-first vertical-scroll webtoon reader: long continuous strip of stacked tall panels (CSS-drawn scenes) with no gutters, a thin top progress bar that fills as you scroll, a floating episode header that auto-hides on scroll-down and reappears on scroll-up, a "next episode" CTA card at the bottom, and a like/comment floating action button. JS: scroll progress, header hide/show, like toggle with count, and a scroll-to-top button that appears past 50%.' },
  { slug: 'comic-panel-grid', title: 'Comics — Classic Panel Grid Page', category: 'pages', difficulty: 'med', tags: 'panel, page',
    build: 'A classic single comic page built as a panel grid (mix of full-width splash, half panels, and a 3-up strip) with thick ink borders, gutters, halftone fills, speech balloons and an SFX. Above it: a layout preset switcher and a "reading order" toggle that numbers panels and animates a guided highlight 1→N through the page. Polished print-like page on a textured backdrop.' },
  { slug: 'comic-guided-view', title: 'Comics — Guided View (panel-by-panel transitions)', category: 'pages', difficulty: 'hard', tags: 'guided, reader',
    build: 'Marvel-style "guided view" reader: shows one comic panel at a time full-bleed; next/prev advances panel-by-panel within a page, smoothly panning/zooming the virtual page camera from one panel rect to the next (CSS transform on a large page canvas). Progress dots for panels in the current page, page label, autoplay toggle that auto-advances every few seconds, and keyboard arrows. JS computes transform per panel and animates between them.' },
  { slug: 'comic-cover-page', title: 'Comics — Issue Cover Page', category: 'ui-components', difficulty: 'easy', tags: 'cover, hero',
    build: 'A bold comic issue cover: big title in Bangers with outlined/3D treatment, series logo, issue number badge ("#42"), price + barcode strip, a "cover artist" credit, and a dramatic CSS-drawn hero scene with halftone sky and speed lines. JS: a variant-cover switcher that swaps accent color + tagline + cover art treatment between 3 editions, with a flip-in animation, plus a "save to collection" toggle.' },

  // 50.C — Series & Discovery
  { slug: 'comic-series-page', title: 'Comics — Series Page (synopsis · chapters list)', category: 'pages', difficulty: 'med', tags: 'series, detail',
    build: 'A series detail page: hero banner with cover art, title, author, genre tags, status (Ongoing) and rating; synopsis with read-more expand; stats row (chapters, views, likes); a "Start reading" + "Add to library" CTA; and a chapters/episodes list with thumbnails, titles, dates and a read/unread state. JS: read-more toggle, library toggle, sort chapters newest/oldest, and mark-as-read on chapter click (persists in memory + updates progress).' },
  { slug: 'comic-chapter-index', title: 'Comics — Chapter / Episode Index', category: 'ui-components', difficulty: 'easy', tags: 'chapters, list',
    build: 'A chapter/episode index component: scrollable list of chapters with number, thumbnail, title, release date, duration/page count, free vs locked (lock icon) badge, and read-state dot. Header with search/filter input and a newest/oldest sort toggle. JS: live filter by title/number, sort toggle, and clicking a chapter marks it read + highlights it. Comic ink styling with halftone accents.' },
  { slug: 'comic-library-browse', title: 'Comics — Browse / Discover (genre grid)', category: 'pages', difficulty: 'med', tags: 'browse, discover, grid',
    build: 'A discover/browse page for a comics platform: genre filter chips (Action, Romance, Horror, Sci-Fi, Slice of Life…), a sort dropdown (Trending / New / Top rated), and a responsive grid of series cards (cover art, title, author, genre tag, rating, "NEW"/"HOT" badges). A featured carousel banner at top. JS: chip filtering (multi-select), sort, a working carousel (auto + manual), and hover lift on cards.' },
  { slug: 'comic-character-bio', title: 'Comics — Character Bio / Cast Page', category: 'ui-components', difficulty: 'easy', tags: 'character, cast',
    build: 'A character bio / cast component: a featured character profile card (CSS-drawn portrait panel, name, alias, role hero/villain, affiliation, first-appearance issue, power/stat bars) plus a cast strip of selectable character avatars. JS: clicking a cast avatar swaps the featured profile (animated), and stat bars animate to their values on selection. Comic panel framing with halftone.' },

  // 50.D — Creator / Admin
  { slug: 'comic-creator-upload', title: 'Comics — Episode Upload / Panel Sequencer', category: 'pages', difficulty: 'hard', tags: 'creator, upload, editor',
    build: 'A creator episode-upload / panel-sequencer tool: a drop-zone "upload panels" area (simulated — clicking adds placeholder panels), a reorderable vertical list of panel thumbnails (drag to reorder, with up/down buttons as fallback), per-panel caption + alt-text fields, episode title/number/visibility fields, and a live "reading preview" pane that reflects the current order. JS: add/remove/reorder panels, update preview live, and a "publish" button with validation + toast.' },
  { slug: 'comic-creator-dashboard', title: 'Comics — Creator Dashboard (views · subs · revenue)', category: 'pages', difficulty: 'med', tags: 'creator, dashboard, analytics',
    build: 'A webcomic creator dashboard: KPI stat cards (total views, subscribers, this-month revenue, avg rating) with trend deltas, a CSS/SVG line or bar chart of views over time with a range toggle (7d/30d/90d), a top-episodes table (title, views, likes, revenue), and a recent-activity feed. JS: range toggle re-renders the chart, sortable table, and animated count-up on the KPI cards. Comic ink-accent styling kept clean for an admin context.' },

  // 50.E — Themed landings
  { slug: 'comic-landing-western', title: 'Comics — Western Superhero Comic Landing', category: 'pages', difficulty: 'hard', tags: 'landing, superhero',
    palette: 'Western superhero — bold primaries: --accent:#e62329 (hero red), --accent-2:#ffd23f (gold), --accent-blue:#1b3fa0, ink black + white halftone. Blocky display lettering (Bangers), dynamic and heroic.',
    build: 'A landing page for a western superhero comic universe: explosive hero section with a big Bangers title, dynamic CSS-drawn hero pose / city skyline with speed lines + halftone sky, a "Read Issue #1" CTA, a featured-heroes panel strip, an issues/series grid, a creators band, and a newsletter/subscribe footer. JS: animated hero entrance, hero-card hover, a simple issue carousel, and a sticky comic-styled nav.' },
  { slug: 'comic-landing-manga', title: 'Comics — Manga Landing', category: 'pages', difficulty: 'med', tags: 'landing, manga',
    palette: 'Manga — black & white + screentone, single red accent (--accent:#e2001a). White paper, ink black, screentone (halftone) shading, vertical-friendly. Kinetic, expressive.',
    build: 'A manga series landing in B/W + screentone with one red accent: dramatic right-to-left feeling hero with a CSS-drawn manga character + screentone background and speed lines, a vertical Japanese-style title accent, volume grid, a "latest chapter" strip, a synopsis section, and a read-now CTA. JS: hero parallax/entrance, chapter list reveal, and a hover screentone-intensify effect on volume covers.' },
  { slug: 'comic-landing-webtoon', title: 'Comics — Webtoon Platform Landing', category: 'pages', difficulty: 'med', tags: 'landing, webtoon, platform',
    palette: 'Webtoon platform — bright flat colors on white, rounded sans (Inter, skip Bangers for body but a friendly bold display is fine), playful green/lime + coral accents (--accent:#00d564, --accent-2:#ff5e6c). Modern, mobile-first, app-store vibe.',
    build: 'A modern mobile-first webtoon platform landing: bright flat hero with a phone mockup showing a vertical-scroll comic, app-store style download CTAs, a trending-titles horizontal scroller of cover cards with ratings, a "why creators love us" feature trio, genre chips, and a footer. JS: animated phone-screen scroll loop, trending scroller drag/auto, and chip hover. Rounded, friendly, flat-design comic vibe.' },
  { slug: 'comic-landing-graphic-novel', title: 'Comics — Graphic Novel Landing', category: 'pages', difficulty: 'hard', tags: 'landing, graphic-novel',
    palette: 'Graphic novel — muted painterly palette + cream paper, literary serif headings (use "Playfair Display" or similar serif via link for headings, Inter body — skip Bangers). Mature, cinematic, restrained. --accent:#7a5c3e (sepia/umber), --ink:#1c1a17, --paper:#efe7d8.',
    build: 'A mature, cinematic graphic-novel landing: full-bleed atmospheric hero (CSS-drawn moody scene with grain/duotone overlay), literary serif title + pull-quote review blurb, a refined synopsis section, an "inside the book" page-spread preview with subtle parallax, awards/press band, author note, and a "buy the hardcover" CTA. JS: gentle scroll-reveal, spread preview crossfade, and a quote rotator. Understated, premium — minimal halftone, more painterly.' },
  { slug: 'comic-landing-indie-zine', title: 'Comics — Indie Zine / Webcomic Landing', category: 'pages', difficulty: 'med', tags: 'landing, zine, indie',
    palette: 'Indie zine / webcomic — limited photocopy palette (1-2 spot inks on off-white): --paper:#f4f1e8, --ink:#1a1a1a, --accent:#ff4d00 (riso orange), --accent-2:#1356ff (riso blue). Handwritten + monospace type, visible photocopy/riso texture, taped/cut-paper collage. Raw, DIY.',
    build: 'A raw DIY indie zine / webcomic landing: collage-style hero with taped/cut-paper elements, photocopy/riso texture, handwritten + monospace type, a misregistered duotone print look. Sections: latest strips grid (scrappy panels), "support me" / tip-jar + merch band, a hand-drawn about blurb, and an email-list cut-out form. JS: slight random rotation/jitter on cards, a "new strip" toggle, and a tape-peel hover effect. Intentionally imperfect, charming.' },
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
