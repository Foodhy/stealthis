// ===========================================================================
// Phase 51 — Cookbook / Recipe Theme  (collection: cookbook, prefix: recipe-)
// ===========================================================================
export const meta = {
  name: 'recipe-phase51-finish',
  description: 'Generate Phase 51 — Cookbook / Recipe Theme (22 resources, mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'un agente por recurso' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'cookbook'

const STYLE = `DESIGN SYSTEM (match exactly unless the spec gives a themed palette):
- Google Fonts via <link>: an editorial serif for headings (e.g. "Fraunces" or "Playfair Display", weights 500;600;700) + a readable sans for body/UI ("Inter", weights 400;500;600;700). font-family fallbacks: serif → Georgia, serif; sans → system-ui, -apple-system, sans-serif.
- Warm cookbook palette in :root —
  --cream:#faf6ef; --paper:#fffdf8; --ink:#2b2622; --ink-2:#5c534a; --muted:#8a7f73;
  --tomato:#d6452b; --tomato-d:#b8351e; --saffron:#e8a33d; --sage:#7c8a6b; --clay:#c8775a;
  --line:rgba(43,38,34,0.12); --line-2:rgba(43,38,34,0.2);
  --ok:#3f8f5f; --warn:#d98a2b; --danger:#c8412b;
  radii: --r-sm:8px --r-md:14px --r-lg:22px; soft warm shadows (0 1px 2px / 0 10px 30px rgba(43,38,34,.1)).
- box-sizing border-box reset, antialiased, line-height 1.6, --cream page background, --paper surfaces.
- FOOD IMAGERY: NO <img>, NO external URLs, NO canvas libs. Evoke food photography with rich CSS gradients / radial blobs as "photo" placeholders, generous rounded frames, and tasteful food emoji (🍅🥕🧄🍋🌿) as accents. Make placeholders look intentional and appetizing, not gray boxes.
- Editorial feel: serif headings, generous whitespace, drop-cap or kicker labels where it fits, print-friendly recipe cards (clean borders, readable at small size, @media print friendly where relevant).
- Accessible: landmark roles (nav/main/header), aria where relevant, WCAG AA contrast, keyboard-usable controls, focus-visible, aria-live for dynamic updates (timers, scaler).
- Responsive: works ~360px → desktop; multi-column layouts collapse to single column by ~720px (add @media sections).
- Vanilla JS only (no frameworks/build). toast(msg) helper ok. Interactions must actually work (check-off, scaling math, timers count down, filters, drag).
- Realistic but fictional recipes/data (real-sounding dishes, plausible quantities & times).`

const DISCLAIMER = '> Illustrative UI only — recipes & nutrition data are fictional, not dietary advice.'

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`
  const paletteNote = s.palette ? `\nTHEMED PALETTE (override the default :root accents with this mood): ${s.palette}\n` : ''

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (write a rich one-line description yourself), then a short prose body:

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

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}`

  return `You are generating ONE production-quality static UI demo resource for a "Cookbook / Recipe" library. It must be self-contained, polished, editorial, and appetizing — not a generic placeholder. Food imagery is CSS gradients + emoji only (no images/libraries).

${STYLE}
${paletteNote}
RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>s, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: editorial serif/sans pairing, warm cream surfaces, appetizing CSS-gradient food "photos", clear hierarchy and spacing, hover/active/focus states, and a working interaction that matches the spec. No TODOs, no plain gray boxes, no lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 51.A — Recipe Layouts
  { slug: 'recipe-detail', title: 'Cookbook — Recipe Page (ingredients · steps · notes)', category: 'pages', difficulty: 'med', tags: 'recipe, layout',
    build: 'A full recipe detail page: hero with a gradient "food photo", dish title (serif), kicker (cuisine), short intro, meta badges row (prep/cook/total time, servings, difficulty, diet tags). Two-column body: left = ingredient list with check-off, right = numbered steps with optional inline tips/notes. A sticky "save / print / share" action bar. JS: ingredients check off (strike-through + count), a print button, a "jump to steps" anchor. Print-friendly.' },
  { slug: 'recipe-cook-mode', title: 'Cookbook — Cook Mode (full-screen step-by-step + timers)', category: 'pages', difficulty: 'med', tags: 'cook-mode, timers',
    build: 'A full-screen, distraction-free cook mode: one large step at a time (big serif text, step n of N, progress bar), Prev/Next controls, a wake-lock-style "screen stays on" note, and per-step inline timers (Start → counts down with mm:ss, beep/toast at zero). Keyboard arrows navigate steps. A drawer to peek at the ingredient list. JS: step navigation, multiple independent countdown timers, aria-live announcements. Large touch targets.' },
  { slug: 'recipe-card-print', title: 'Cookbook — Printable Recipe Card', category: 'ui-components', difficulty: 'easy', tags: 'print, card',
    build: 'A compact printable recipe card component: title, tiny meta row (time/servings), condensed ingredient column + steps column, a small gradient thumbnail, and a footer with source/yield. A "Print" button and an @media print stylesheet (hides chrome, black-on-white, fits one page). JS: print button + a size toggle (3x5 / 4x6 / full). Looks like a real index card.' },
  { slug: 'recipe-story-feature', title: 'Cookbook — Recipe Feature / Food Story (long-form)', category: 'pages', difficulty: 'med', tags: 'editorial, long-form',
    build: 'A long-form food-story / editorial feature: magazine-style hero (full-bleed gradient photo, overline, big serif headline, byline + read time), drop-cap intro, pull-quotes, inline "photo" figures with captions, and a "jump to recipe" button that scrolls to an embedded recipe card at the end. JS: a reading-progress bar, jump-to-recipe smooth scroll, sticky byline. Beautiful editorial typography.' },
  { slug: 'recipe-video-recipe', title: 'Cookbook — Video Recipe layout (steps synced)', category: 'pages', difficulty: 'med', tags: 'video, synced-steps',
    build: 'A video-recipe layout: a large faux video player (gradient poster, play overlay, scrubber, fake timeline) on the left, and a synced step list on the right where the "current" step highlights as the (simulated) playback time advances. Clicking a step seeks the player to that timestamp. JS: a simulated play/pause that advances a timecode, highlights the matching step, click-step-to-seek, chapter markers on the scrubber. aria-current on active step.' },

  // 51.B — Recipe Patterns
  { slug: 'recipe-ingredient-list', title: 'Cookbook — Ingredient list + check-off', category: 'ui-components', difficulty: 'easy', tags: 'ingredients, checklist',
    build: 'A reusable ingredient checklist: grouped sub-headings (e.g. "For the sauce"), each item = checkbox + quantity + unit + name, optional note. Checking strikes through and updates a "X of Y gathered" progress. A "check all / clear" control and persistence to localStorage. JS: toggle items, group progress, check-all, persist. Clean, copy-ready primitive.' },
  { slug: 'recipe-scaler', title: 'Cookbook — Serving scaler (½× · 2× quantities)', category: 'ui-components', difficulty: 'med', tags: 'scaler, math',
    build: 'A serving-size scaler over an ingredient list: a control (½× · 1× · 2× · 3× and a numeric servings stepper) that live-recomputes every quantity, keeping nice fractions (½, ⅓, ¼, ¾) and rounding sensibly. Shows base servings → target servings. JS: scaling math with fraction formatting, updates all quantities in place with a subtle flash, aria-live on the servings count. Handles ranges and non-scalable items (e.g. "to taste").' },
  { slug: 'recipe-step-timeline', title: 'Cookbook — Numbered step timeline w/ inline timers', category: 'ui-components', difficulty: 'med', tags: 'steps, timeline',
    build: 'A vertical numbered step timeline: each step is a node (number badge on a connecting line) with the instruction, optional "tip" callout, and an inline timer button where a duration is mentioned (e.g. "simmer 20 min" → Start a 20:00 countdown). Completed steps get a check. JS: mark step done (collapses/dims), per-step countdown timers with toast at zero, overall progress. Connecting line fills as you complete steps.' },
  { slug: 'recipe-nutrition-facts', title: 'Cookbook — Nutrition facts panel', category: 'ui-components', difficulty: 'easy', tags: 'nutrition, panel',
    build: 'A nutrition-facts panel styled like a clean label: per-serving calories (big), macro bars (carbs/protein/fat) as inline CSS bars with %, a breakdown table (sat fat, fiber, sugar, sodium, etc. with %DV), and a per-serving / per-100g toggle. JS: the toggle recomputes all values; a small "servings" input scales totals. Accessible table semantics. Crisp, label-like styling.' },
  { slug: 'recipe-meta-badges', title: 'Cookbook — Prep/cook time · difficulty · diet badges', category: 'ui-components', difficulty: 'easy', tags: 'badges, meta',
    build: 'A recipe meta badge row component: pill badges for prep time, cook time, total time (clock icon), servings, difficulty (easy/med/hard with color), and diet tags (vegetarian/vegan/gluten-free/keto with icons + accessible labels). Show a few variants. JS: a tiny demo that toggles diet tags on/off and updates an aria-live summary. Inline SVG icons, on-palette colors, copy-ready.' },
  { slug: 'recipe-rating-reviews', title: 'Cookbook — Recipe rating + reviews block', category: 'ui-components', difficulty: 'easy', tags: 'rating, reviews',
    build: 'A rating + reviews block: an aggregate star rating (4.7 ★ with star bar + count), a rating-distribution bar chart (5→1 stars), an interactive "rate this recipe" star input, and a list of reviews (avatar initial, name, stars, "made it" badge, date, text, helpful count). JS: hover/click the star input to set a rating (updates aggregate optimistically), a "most helpful / newest" sort, a helpful toggle. Accessible radgroup for stars.' },

  // 51.C — Collections & Planning
  { slug: 'recipe-browse', title: 'Cookbook — Browse / Search (cuisine · diet filters)', category: 'pages', difficulty: 'med', tags: 'browse, search',
    build: 'A recipe browse/search page: a search box, filter sidebar (cuisine, diet, meal type, max time chips/checkboxes), a sort control, and a responsive grid of recipe cards (gradient photo, title, meta badges, rating, save heart). A results count + active-filter chips. JS: live filtering + search across a fictional dataset of ~12 recipes, sort (popular/quick/newest), removable filter chips, empty-state. Sidebar collapses to a filter drawer on mobile.' },
  { slug: 'recipe-collection', title: 'Cookbook — Recipe Collection / Cookbook index', category: 'pages', difficulty: 'easy', tags: 'collection, index',
    build: 'A curated recipe collection / cookbook index page: a header with collection title, cover gradient, author/curator, count + total time, and a description. Then a grid (or numbered editorial list) of recipe cards grouped into chapters/sections (e.g. Starters / Mains / Desserts). A "follow / save collection" button. JS: chapter jump-nav, a save toggle, a list/grid view switch. Editorial, book-like feel.' },
  { slug: 'recipe-meal-planner', title: 'Cookbook — Weekly Meal Planner (drag recipes)', category: 'pages', difficulty: 'hard', tags: 'planner, drag',
    build: 'A weekly meal planner: a 7-day × meal-slot (Breakfast/Lunch/Dinner) grid, a side tray of recipe cards you drag into slots, and per-day summaries (total time, servings). JS: HTML5 drag-and-drop (or pointer) to place/move/remove recipes into slots with drop highlight, a keyboard-accessible alternative, persistence to localStorage, a "clear week" + "generate shopping list" button (just counts items). Reflows to stacked days on mobile.' },
  { slug: 'recipe-shopping-list', title: 'Cookbook — Auto Shopping List (from selected recipes)', category: 'ui-components', difficulty: 'med', tags: 'shopping-list, aggregate',
    build: 'An auto shopping-list component: pick recipes (toggle chips) and it aggregates their ingredients into a categorized list (Produce / Dairy / Pantry / Meat), summing duplicate quantities with units. Check off items, edit/remove, "X items · Y aisles" summary, and a copy/print/share. JS: aggregation + unit summing across selected recipes, category grouping, check-off with progress, copy-to-clipboard. Clear grocery-list styling.' },

  // 51.D — Creator / Admin
  { slug: 'recipe-editor', title: 'Cookbook — Recipe Editor (ingredients + steps builder)', category: 'pages', difficulty: 'med', tags: 'editor, builder',
    build: 'A recipe editor / builder: fields for title, description, meta (prep/cook/servings/difficulty/diet), an ingredients builder (add row: qty + unit + name, reorderable, remove), a steps builder (add/reorder/remove numbered steps with textareas), and a live preview pane of the resulting recipe card. JS: add/remove/reorder rows (drag or up/down), live preview updates as you type, a fake "save" with validation + toast, draft persistence to localStorage.' },
  { slug: 'recipe-admin-dashboard', title: 'Cookbook — Food Blog Dashboard (traffic · top recipes)', category: 'pages', difficulty: 'med', tags: 'dashboard, analytics',
    build: 'A food-blog admin dashboard: sidebar nav, KPI row (page views, unique visitors, avg time on recipe, saves) with deltas + sparklines, an inline-SVG traffic line/area chart with a date-range toggle, a "top recipes" table (title, views, rating, saves, trend), and a recent-comments feed. JS: date-range recomputes KPIs + redraws the chart, sortable top-recipes table, a comment approve/reject action. Warm-but-clean admin styling. Fictional data.' },

  // 51.E — Themed Cookbook Landings
  { slug: 'recipe-landing-rustic', title: 'Cookbook — Rustic / Farmhouse Cookbook landing', category: 'pages', difficulty: 'med', tags: 'landing, rustic',
    palette: 'Cream + sage + clay, warm friendly serif, cozy handmade feel — textured paper backgrounds, hand-drawn-ish dividers, kraft tones.',
    build: 'A cozy farmhouse-cookbook landing: warm hero (gradient farmhouse-table photo, handwritten-style overline, serif headline, "Get the cookbook" CTA), a featured-recipes row, a "from our kitchen" story strip, seasonal categories, a newsletter sign-up, and a homely footer. JS: a subtle reveal-on-scroll, a recipe-of-the-day rotator, newsletter form with validation + toast. Handmade, cozy mood.' },
  { slug: 'recipe-landing-food-mag', title: 'Cookbook — Food Magazine (Bon Appétit-style) landing', category: 'pages', difficulty: 'med', tags: 'landing, magazine',
    palette: 'White + black + one bold accent, glossy editorial serif, high-contrast modern magazine — big imagery, tight grid, bold display type.',
    build: 'A glossy food-magazine landing: a bold cover-story hero (full-bleed gradient, big editorial headline, issue/byline), a featured-articles grid (varied tile sizes, kickers, read times), a "trending recipes" strip, a section nav (Recipes/Technique/Travel/Wine), and a subscribe band. JS: scroll-reveal, a sticky condensing header, a category tab filter on the grid, subscribe form. High-contrast glossy mood.' },
  { slug: 'recipe-landing-vintage', title: 'Cookbook — Vintage / Retro Recipes landing', category: 'pages', difficulty: 'med', tags: 'landing, vintage',
    palette: 'Mustard + avocado + cream, 70s display type, nostalgic playful — retro borders, groovy shapes, warm aged tones.',
    build: 'A nostalgic 70s vintage-recipes landing: a retro hero (mustard/avocado gradient, groovy display headline, scalloped/retro borders, "Browse the classics" CTA), a "recipe card box" grid styled like vintage index cards, a kitschy "tip of the day", and a retro footer. JS: a flippable recipe card (front photo / back recipe), scroll-reveal, a fun retro toast. Playful, aged, nostalgic mood with period styling.' },
  { slug: 'recipe-landing-wellness', title: 'Cookbook — Modern Wellness / Clean Eating landing', category: 'pages', difficulty: 'med', tags: 'landing, wellness',
    palette: 'Bone + matcha + terracotta, light airy sans, healthy minimal — lots of whitespace, soft greens, calm.',
    build: 'An airy modern-wellness / clean-eating landing: a calm minimal hero (bone background, matcha accents, light sans headline, "Start eating well" CTA), a values/benefits row (icons), a "balanced recipes" grid with nutrition highlights, a meal-plan teaser, testimonials, and a serene footer. JS: gentle scroll-reveal, a diet-preference toggle that re-labels featured recipes, a smooth-scroll nav. Healthy, calm, premium-minimal mood.' },
  { slug: 'recipe-landing-chef', title: 'Cookbook — Restaurant Chef / Fine Dining landing', category: 'pages', difficulty: 'hard', tags: 'landing, fine-dining',
    palette: 'Charcoal + gold + ivory, couture serif, refined premium — dark luxe surfaces, gold hairlines, dramatic spacing.',
    build: 'A refined fine-dining chef landing: a dramatic dark hero (charcoal gradient, gold hairline details, couture serif headline, chef name/Michelin-style overline, "Reserve" CTA), a signature-dishes showcase (elegant cards), a chef bio/philosophy strip, a tasting-menu teaser, press quotes, and an elegant footer with reservation CTA. JS: elegant scroll-reveal, an image-gradient parallax hint, a dish lightbox, reserve form. Luxe, dramatic, premium mood.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos "${COLLECTION}" (Phase 51 — Cookbook / Recipe Theme)…`)

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
