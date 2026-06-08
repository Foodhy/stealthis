// ===========================================================================
// Phase 46 — Newspaper / Magazine / Editorial Theme 📰 — workflow (27 recursos)
// ===========================================================================
export const meta = {
  name: 'editorial-phase46',
  description: 'Generar los 27 recursos de la Phase 46 (Editorial): mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'un agente por recurso (27)' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'editorial'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Two Google Fonts via <link>: "Playfair Display" (weights 500;600;700;800;900) for serif display headlines/mastheads, and "Inter" (weights 400;500;600;700) for body/UI/meta. Optionally a grotesque feel by using Inter with tight tracking for kickers. font-family display: "Playfair Display", "Times New Roman", Georgia, serif; body/UI: "Inter", system-ui, sans-serif.
- Editorial newsprint palette in :root —
  --cream:#f4efe4; --paper:#faf7f0; --white:#ffffff; --newsprint:#efe9da;
  --ink:#16130f; --ink-2:#2b2620; --ink-3:#4a443b; --muted:#7a7164;
  --red:#b4291f; --red-d:#8f1f17; --red-50:#f3dcd9;
  --rule:rgba(22,19,15,0.16); --rule-2:rgba(22,19,15,0.30); --rule-hair:rgba(22,19,15,0.10);
  --ok:#2f7d4f; --warn:#b67a18; --danger:#b4291f;
  radii: --r-sm:4px --r-md:8px --r-lg:12px (editorial = mostly sharp, small radii). Subtle/flat shadows; lean on RULES not shadows.
- box-sizing border-box reset, antialiased, line-height 1.5, --cream page background, --ink text.
- EDITORIAL CRAFT (this is the whole point): strict column grids (use CSS columns or grid), thin top/bottom hairline RULES between sections, a single accent red used sparingly (kickers, breaking tags, links), drop caps on lead paragraphs (::first-letter), pull quotes with oversized serif, bylines + datelines + read-time meta, uppercase let-spaced kickers/section labels, small-caps where fitting. Justified body text with hyphens where it reads well.
- "Photography": no network — simulate press photos with rich CSS linear/radial gradients (muted, photographic, duotone-ink/red feel) inside aspect-ratio boxes; add a small italic caption + credit line under figures. Make them feel like real news/magazine imagery, NOT flat gray.
- Accessible: semantic <article>/<header>/<figure>/<figcaption>, aria where relevant, WCAG AA contrast, keyboard-usable controls.
- Responsive: multi-column collapses to single column under ~720px; works down to ~360px (add @media sections).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly FICTIONAL paper name, headlines, bylines, datelines, body copy (no lorem ipsum — write real-feeling editorial prose).`

const DISCLAIMER = '> Illustrative UI only — masthead, headlines, bylines, and articles are fictional; **not** a real news publication.'

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

  return `You are generating ONE production-quality static UI demo resource for a Newspaper/Magazine/EDITORIAL themed collection. It must be self-contained, polished, and visually distinctive — it should look like a real, well-art-directed publication, not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions, keep editorial craft — rules, drop caps, pull quotes, serif display — unless the mood explicitly says otherwise): ${s.palette}\n` : ''}
RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>s, <link rel="stylesheet" href="style.css">, semantic markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive, real editorial column grid.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling headlines/bylines/body copy, proper column grids, hairline rules, a drop cap on the lead, at least one pull quote where the layout allows, captioned figures, clear typographic hierarchy, hover/active states, and a genuinely interactive script. No TODOs, no lorem ipsum, no flat-gray boxes.

After writing the files, return your result.`
}

const SPECS = [
  // ── 46.A Reader-Facing Layouts ───────────────────────────────────────
  { slug: 'news-front-page', title: 'News — Front Page', category: 'pages', difficulty: 'hard', tags: 'front-page, masthead, grid',
    build: 'Newspaper front page: full masthead/nameplate (paper name in big Playfair, date, edition, weather/price strip with hairline rules above+below), then a multi-column lead grid — one dominant lead story (large headline + deck + drop-cap lead + captioned hero figure), 2-3 secondary stories in columns with rules between, a sidebar "More" list, and a bottom strip of brief items. JS: live clock in the dateline, a "text size" A-/A+ control that scales body type, and a section-jump nav.' },
  { slug: 'news-article', title: 'News — Standard Article', category: 'pages', difficulty: 'med', tags: 'article, byline, body',
    build: 'Standard article page: kicker + big headline + deck, byline row (author, dateline, read-time, share icons), a captioned hero figure, justified multi-paragraph body with a drop cap and an embedded pull quote, an inline "related coverage" box, and a "Related" cards row at the bottom. JS: reading-progress bar, share-button toast, and a font-size control.' },
  { slug: 'news-longform-feature', title: 'News — Long-form Feature', category: 'pages', difficulty: 'hard', tags: 'longform, scroll, parallax',
    build: 'Immersive long-form feature: full-bleed cinematic cover (gradient "photo", huge serif title, author + reading time), then chaptered scroll body with full-bleed pull-quote breaks, parallax-ish figure sections (background shifts on scroll), captioned images, and a chapter sidebar that highlights the active section. JS: scroll-driven parallax + active-chapter tracking via IntersectionObserver + progress bar.' },
  { slug: 'news-opinion-column', title: 'News — Opinion / Editorial Column', category: 'pages', difficulty: 'easy', tags: 'opinion, column',
    build: 'Opinion/editorial column: an "OPINION" red kicker, headline + deck, a prominent columnist byline card (portrait gradient, name, title, short bio), single elegant reading column with drop cap and pull quotes, an editor\'s note footer, and a "more from this columnist" list. JS: a small clap/recommend counter and share toast.' },
  { slug: 'news-photo-essay', title: 'News — Photo Essay / Visual Story', category: 'pages', difficulty: 'med', tags: 'photo-essay, gallery',
    build: 'Photo essay / visual story: a title spread, then a sequence of large full-width "photographs" (varied duotone/photographic gradients) each with an italic caption + credit, interspersed with short pull-text passages. A sticky frame counter (3/12) and keyboard/scroll navigation between plates, plus a lightbox-style zoom. JS: scroll-snap plates, caption fades, counter, and zoom toggle.' },
  { slug: 'news-section-index', title: 'News — Section Index', category: 'pages', difficulty: 'med', tags: 'section, index, listing',
    build: 'Section index page (e.g. World / Sports / Culture): section header with a red rule, a lead story block, then a dense grid of article teasers (kicker, headline, short dek, byline, small figure), a "most read" numbered sidebar, and section sub-nav tabs that filter the grid. JS: tab filtering between sub-sections and a "load more" reveal.' },
  { slug: 'news-live-blog', title: 'News — Live Blog / Breaking News', category: 'pages', difficulty: 'med', tags: 'live-blog, breaking, stream',
    build: 'Live blog / breaking-news stream: a pulsing red "LIVE" header with a headline + summary, a reverse-chronological timeline of timestamped updates (some with figures, key-update highlight, author tags), a "newest first" auto-prepend, and a key-points summary box. JS: a "new update" button that prepends a fresh entry with a live timestamp + flash animation, and relative-time ("2 min ago") updating.' },
  { slug: 'news-obituary', title: 'News — Obituary / In Memoriam', category: 'ui-components', difficulty: 'easy', tags: 'obituary, memoriam',
    build: 'Obituary / In Memoriam component: a bordered editorial card with a portrait gradient, full name, years (1940–2026), a serif tribute headline, dateline, a drop-cap remembrance passage, "survived by" + service details meta block, and a small condolences action. Show one primary card and a column of compact obituary list items. JS: a "light a candle"/condolence counter and a share toast.' },

  // ── 46.B Editorial Patterns (reusable primitives) ────────────────────
  { slug: 'news-masthead', title: 'News — Masthead / Nameplate Variants', category: 'ui-components', difficulty: 'easy', tags: 'masthead, nameplate',
    build: 'Masthead / nameplate variant gallery: show 4-5 distinct newspaper nameplates (classic broadsheet centered with Latin motto + flanking date/price, modern left-aligned, condensed tabloid, gothic blackletter-style via heavy serif, minimal magazine) each with date strip, edition line, and hairline rules. A variant switcher applies the chosen masthead to a live preview header. JS: switch variants and edit the paper name live.' },
  { slug: 'news-pull-quote', title: 'News — Pull Quote & Drop Cap Set', category: 'ui-components', difficulty: 'easy', tags: 'pull-quote, drop-cap, typography',
    build: 'Pull quote & drop cap typographic set: a column of real body text demonstrating several drop-cap styles (raised, dropped, decorative red), and 4-5 pull-quote treatments (centered rule-bracketed, left-border accent, oversized hanging-quote, full-width banner). A controls panel toggles drop-cap style and pull-quote variant on the live sample. JS: live style switching + copy-snippet toast.' },
  { slug: 'news-byline-meta', title: 'News — Byline · Dateline · Read-time Meta', category: 'ui-components', difficulty: 'easy', tags: 'byline, meta',
    build: 'Byline/dateline/read-time meta component set: several byline layouts (simple author + date, author with portrait + role, multi-author, agency credit), each with dateline, estimated read time, published/updated timestamps, and share/save icon row. A "reading time" calculator that estimates from a word-count input. JS: compute read time live, toggle save/bookmark state, share toast.' },
  { slug: 'news-column-grid', title: 'News — Multi-column Flow Grid', category: 'ui-components', difficulty: 'med', tags: 'columns, grid, layout',
    build: 'Multi-column flowing text grid demo (CSS columns): a block of real article copy flowing across 2/3/4 columns with column rules, a spanning headline + figure, balanced last line, and hyphenation. Controls to change column count, gap, and rule on/off, reflowing live. JS: update column-count/gap/rule CSS vars from controls; responsive collapse.' },
  { slug: 'news-article-toc', title: 'News — Sticky Article TOC + Progress', category: 'ui-components', difficulty: 'med', tags: 'toc, progress, navigation',
    build: 'Sticky article table-of-contents with reading progress: a long sample article with section headings on the left/main, and a sticky TOC rail listing sections with an active-section highlight that follows scroll, plus a thin progress bar and a "back to top" button. JS: IntersectionObserver active-section tracking, smooth-scroll on TOC click, progress bar.' },
  { slug: 'news-paywall-gate', title: 'News — Paywall / Subscribe Gate', category: 'ui-components', difficulty: 'med', tags: 'paywall, subscribe, overlay',
    build: 'Paywall / subscribe gate overlay: an article whose lower paragraphs fade into a gradient, then a gate card — "You\'ve read 1 of 3 free articles", subscription plan toggle (Monthly / Annual with savings badge), benefits list, sign-in link, and subscribe CTA. JS: a free-article counter (shows remaining), plan toggle updates price, and a "subscribe" toast that unlocks/expands the article.' },
  { slug: 'news-newsletter-signup', title: 'News — Inline Newsletter Signup', category: 'ui-components', difficulty: 'easy', tags: 'newsletter, signup, form',
    build: 'Inline newsletter signup module: an editorial-bordered block with a kicker ("THE MORNING BRIEF"), headline, one-line value prop, email field + subscribe button, frequency chips (Daily / Weekly), tiny privacy note, and a subscriber-count line. Show both an inline-in-article variant and a compact sidebar variant. JS: email validation, frequency select, success state with confetti-free toast + incrementing subscriber count.' },

  // ── 46.C Magazine-Specific ───────────────────────────────────────────
  { slug: 'news-mag-cover', title: 'News — Magazine Cover', category: 'pages', difficulty: 'med', tags: 'magazine, cover',
    build: 'Glossy magazine cover: full-bleed hero "photo" (rich photographic gradient) behind a big magazine logo at top, cover lines arranged left/right around the subject (main coverline in large display, several teasers with page numbers), issue/date/price flag, and a barcode strip. JS: an "issue switcher" that swaps cover art + coverlines between 2-3 issues, and a subtle gloss/parallax tilt on pointer move.' },
  { slug: 'news-mag-spread', title: 'News — Two-page Spread', category: 'pages', difficulty: 'hard', tags: 'magazine, spread, layout',
    build: 'Two-page magazine feature spread: a center gutter splitting left/right pages, a dramatic opening with oversized display headline crossing the gutter, a full-bleed image on one page, multi-column body with a drop cap and a pull quote on the other, a sidebar fact box, running folios (page numbers + section) and a kicker. JS: a "flip to next spread" control, and toggling a layout grid/guides overlay.' },
  { slug: 'news-mag-toc', title: 'News — Magazine Table of Contents', category: 'pages', difficulty: 'med', tags: 'magazine, toc',
    build: 'Magazine table of contents: issue header (logo, issue no., date), a featured-on-the-cover hero entry with thumbnail, then categorized listings (Features / Departments / Columns) each row = page number, title, short dek, contributor; a contributors strip at the bottom. JS: category filter tabs, hover preview that shows a small page thumbnail, and a search filter over titles.' },
  { slug: 'news-mag-interview', title: 'News — Q&A / Interview Layout', category: 'pages', difficulty: 'easy', tags: 'magazine, interview, qa',
    build: 'Q&A / interview layout: a feature opener with subject portrait, name, a one-line standfirst, and intro paragraph with drop cap, then the interview as styled Q/A pairs (bold red "Q." interviewer, serif "A." answers), with 1-2 pull quotes breaking the flow and a sidebar bio/fact box. JS: a "jump to question" mini-nav and a font-size control.' },

  // ── 46.D Newsroom CMS / Admin ────────────────────────────────────────
  { slug: 'news-cms-editor', title: 'News — Article Editor', category: 'pages', difficulty: 'hard', tags: 'cms, editor, form',
    build: 'Newsroom article editor: a two-pane layout — left an editing surface (headline, deck/standfirst, byline, a contenteditable-style body with a formatting toolbar: bold/italic/H2/quote/link, plus a figure-insert), right a meta/publish sidebar (section, tags, status Draft/Review/Scheduled/Published, SEO slug, word count + read time, cover image). A "preview" toggle renders the article in reader style. JS: live word-count/read-time, status changes, formatting buttons act on the body, preview toggle, save/publish toast.' },
  { slug: 'news-cms-dashboard', title: 'News — Newsroom Dashboard', category: 'pages', difficulty: 'med', tags: 'cms, dashboard, queue',
    build: 'Newsroom dashboard: top KPI strip (in draft, in review, scheduled, published today, page views), a publishing queue table (headline, author, section, status pill, scheduled time, actions), a "needs attention" column (awaiting review / breaking), and an activity feed. Sidebar nav. JS: filter the queue by status/section, advance an item\'s status, and animate the KPI counts.' },
  { slug: 'news-cms-front-builder', title: 'News — Front-page Layout Builder', category: 'pages', difficulty: 'hard', tags: 'cms, builder, drag',
    build: 'Front-page layout builder: a left palette of available stories (cards), and a right front-page canvas with slot zones (Lead, Secondary x2, Sidebar, Briefs strip). Drag stories from the palette into slots; each slot shows a live mini-preview of how it renders (headline size scales by slot). A device/width toggle and a "publish layout" button. JS: drag-and-drop assignment, slot swap/remove, live render, and a publish toast.' },

  // ── 46.E Themed Mastheads / Landings (palette overrides) ─────────────
  { slug: 'news-landing-broadsheet', title: 'News — Classic Broadsheet Landing', category: 'pages', difficulty: 'hard', tags: 'landing, broadsheet',
    palette: 'Classic Broadsheet — Ink #16130f + newsprint cream #f1ead9 + oxblood #6e1f1a accent. Times-like serif (Playfair Display + a Georgia/Times body feel). Mood: authoritative, dense, traditional, lots of hairline rules, small columns, Latin motto.',
    build: 'Classic broadsheet landing/home: a grand centered nameplate with motto + date/price flags, a dense multi-column front with a towering lead headline, several stacked stories separated by hairline rules, an opinion rail, a markets/weather strip, and a "today\'s sections" footer. Authoritative and text-dense. JS: live dateline clock, A-/A+ text size, and a section-jump nav.' },
  { slug: 'news-landing-tabloid', title: 'News — Tabloid / Popular Daily Landing', category: 'pages', difficulty: 'med', tags: 'landing, tabloid',
    palette: 'Tabloid / Popular Daily — Black #0d0d0d + white + BOLD red #e2231a and yellow #ffd400. Condensed heavy display (Inter Black / uppercase tight tracking; keep a serif only for body). Mood: LOUD, punchy, screaming headlines, big numbers, exclamation energy.',
    build: 'Tabloid front-page landing: a massive screaming all-caps headline taking half the screen over a dramatic image, a red "EXCLUSIVE"/"SHOCK" flash, a yellow strip of teasers with page numbers, a sensational secondary-story row, a celebrity/sport rail, and a bold "WIN!" promo box. Loud and high-contrast. JS: a rotating breaking-headline ticker, and a teaser carousel.' },
  { slug: 'news-landing-glossy-mag', title: 'News — Glossy Lifestyle Magazine Landing', category: 'pages', difficulty: 'med', tags: 'landing, magazine, glossy',
    palette: 'Glossy Lifestyle Magazine — White + black + a hot accent (magenta #e6007e or coral). Fashion serif display (Playfair Display, high contrast) + Inter body. Mood: airy, premium, lots of whitespace, large imagery, elegant.',
    build: 'Glossy lifestyle magazine landing: an airy hero with the magazine logo and a large fashion-editorial cover image + main coverline, a refined featured-stories grid (big imagery, minimal captions, hot-accent kickers), a "this issue" strip, a contributors row, and a premium subscribe block. Generous whitespace, elegant motion. JS: a featured-story switcher and a gentle image parallax on scroll.' },
  { slug: 'news-landing-fashion', title: 'News — High-Fashion Editorial Landing', category: 'pages', difficulty: 'hard', tags: 'landing, fashion, editorial',
    palette: 'High-Fashion Editorial — Monochrome (black/white/greys) + a single NEON accent (acid green #c6ff00 or electric blue). Thin couture sans (Inter at light weights, wide letter-spacing; minimal serif). Mood: avant-garde, sparse, oversized type, dramatic negative space, art-direction first.',
    build: 'High-fashion editorial landing: an avant-garde hero with oversized sparse type, a single neon accent line, and a striking off-grid image; an asymmetric editorial gallery (large duotone fashion "photos" with tiny captions), a manifesto/credits block in tiny tracked caps, and a minimal index nav. Dramatic negative space, slow elegant reveals. JS: a cursor-follow accent, scroll-reveal of plates, and an image index hover.' },
  { slug: 'news-landing-literary', title: 'News — Literary Journal / Review Landing', category: 'pages', difficulty: 'med', tags: 'landing, literary, journal',
    palette: 'Literary Journal / Review — Bone #efe7d6 + ink #1a1714 + muted teal #2f6f6a accent. Book serif (Playfair Display display + a readable serif body feel). Mood: contemplative, text-first, restrained, scholarly, minimal imagery.',
    build: 'Literary journal / review landing: a quiet text-first masthead (journal name + issue + tagline), a featured essay block with a long elegant excerpt and drop cap, a contents list of essays/poems/reviews (title, author, genre tag, page), a contributor spotlight, and a subscribe/submit footer. Restrained, scholarly, mostly type. JS: a genre filter for the contents, and an excerpt expand/collapse with smooth height.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos de la colección "${COLLECTION}" (Phase 46)…`)

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
