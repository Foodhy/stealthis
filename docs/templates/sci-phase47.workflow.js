// ===========================================================================
// Phase 47 — Science / Research Theme 🔬  (collection: science)
// 26 resources: publication layouts, science primitives, data/interactive,
// lab/group/journal sites, and 5 themed science landings.
// ===========================================================================

export const meta = {
  name: 'sci-phase47-finish',
  description: 'Generate the 26 Phase 47 science resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'science'

// ── Shared design language (ROADMAP Phase 47) ──────────────────────────────
const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Fonts via Google Fonts <link>: "Source Serif 4" (prose, weights 400;600;700), "Inter" (UI/labels, 400;500;600;700), "JetBrains Mono" (data/equations/code, 400;500). Serif for body prose, Inter for nav/buttons/labels, mono for numbers, units, citations, equations.
- Default palette in :root — clean white + ink + one institutional accent (deep blue / teal):
  --bg:#ffffff; --bg-alt:#f6f8fb; --ink:#0f1b2d; --ink-2:#33445c; --muted:#697892;
  --accent:#1a4f8a; --accent-d:#123a66; --accent-50:#e9f0f9; --teal:#0f7d78; --teal-50:#e4f3f1;
  --line:rgba(15,27,45,0.12); --line-2:rgba(15,27,45,0.2);
  --ok:#2f9e6f; --warn:#c9821f; --danger:#cf4538;
  radii: --r-sm:6px --r-md:10px --r-lg:16px; subtle shadows, hairline borders.
- box-sizing border-box reset, antialiased, line-height 1.6 for prose. --bg page background.
- LaTeX-like equation styling: italic serif variables, mono for operators where apt, centered display blocks with right-aligned equation numbers like (1).
- Figure-caption discipline: every figure has "Figure N." bold label + descriptive caption in smaller muted text.
- Accessible: semantic landmarks, aria where relevant, WCAG AA contrast, keyboard-usable controls, visible focus.
- Responsive: works down to ~360px (add a @media (max-width:640px) section). Tables scroll-x on narrow.
- Vanilla JS only (no frameworks/build/external libs — no KaTeX/MathJax/Chart.js; fake them with HTML/CSS/canvas/inline SVG). A small toast(msg) helper is a good pattern.
- Realistic but clearly FICTIONAL authors, institutions, datasets, and figures.`

const DISCLAIMER = '> Illustrative UI only — fictional authors, data, and figures; **not** real scientific results.'

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

  const mdxInstr = s.mdxExists
    ? `DO NOT create index.mdx — it already exists and must be left untouched. Write ONLY the three snippet files.`
    : `Create ${dir}/index.mdx with EXACTLY this frontmatter (fill description yourself), then the prose body:

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

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Science / Research theme. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}
RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>s, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
${s.mdxExists ? '' : '4. ' + dir + '/index.mdx — frontmatter + prose as specified below.'}

${mdxInstr}

QUALITY BAR: real-feeling scientific data (plausible authors, DOIs, units, sig figs), multiple sections/cards/rows, clear hierarchy, hover/active states, badges, smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

// ── Phase 47 resources (26) ────────────────────────────────────────────────
const SPECS = [
  // 47.A — Publication Layouts
  {
    slug: 'sci-paper-layout', title: 'Science — Academic Paper Layout', category: 'pages', difficulty: 'hard',
    tags: 'paper, publication, layout',
    build: 'Full academic paper page: running header (journal name, vol/issue, DOI), title, author list with superscript affiliation markers, structured abstract, keywords, two-column body on wide screens (single column on mobile) with numbered sections (1. Introduction, 2. Methods, …), inline citation links [1] that smooth-scroll to a numbered references list, at least one figure with "Figure 1." caption, a data table, an equation display block with number (1), footnotes, and a sticky mini-TOC sidebar that highlights the active section on scroll.',
  },
  {
    slug: 'sci-preprint-page', title: 'Science — Preprint / arXiv Article Page', category: 'pages', difficulty: 'med',
    tags: 'preprint, arxiv',
    build: 'arXiv-style preprint landing: left meta rail (submission id like arXiv:2606.01234, subject badges cs.LG/stat.ML, version v2 dropdown, submitted/revised dates, license), main column with title, authors, abstract, and a download panel (PDF / TeX source / Other formats buttons with a toast on click), "Cite" button revealing a BibTeX block with a copy button, and a references/comments tab strip.',
  },
  {
    slug: 'sci-review-article', title: 'Science — Review / Survey Layout', category: 'pages', difficulty: 'med',
    tags: 'review, survey',
    build: 'Long-form review/survey article with prominent figures and comparison tables: lead section, a taxonomy/overview figure, several themed sections each with a summary table comparing methods (rows = methods, columns = properties with check/cross/partial glyphs), pull-quote callouts, a "key takeaways" boxed summary per section, and a collapsible references list. Sticky section nav.',
  },
  {
    slug: 'sci-poster', title: 'Science — Conference Poster', category: 'pages', difficulty: 'med',
    tags: 'poster, conference',
    build: 'Single-sheet academic poster on a fixed large canvas (e.g. portrait A0-ish proportions, scaled responsively): bold title band with authors + institution logos (text logos), multi-column grid of panels — Introduction, Methods, Results (with a chart figure and a results table), Conclusion, References, QR-code-styled box (CSS-drawn) and contact. Print-poster aesthetic with accent header bars per panel. A "fit to screen / actual size" zoom toggle.',
  },
  {
    slug: 'sci-popsci-article', title: 'Science — Popular-Science Article', category: 'pages', difficulty: 'med',
    tags: 'popsci, explainer',
    build: 'Accessible popular-science explainer article: big hero with kicker + headline + dek + byline + read-time, large lead image with caption, readable single-column prose with subheads, an inline "How it works" stepper diagram (CSS), a pull quote, a sidebar "The science, simplified" glossary card with expandable terms, and a related-articles footer grid. Friendly but credible tone.',
  },

  // 47.B — Science Patterns (primitives)
  {
    slug: 'sci-figure-caption', title: 'Science — Figure + Numbered Caption', category: 'ui-components', difficulty: 'easy',
    tags: 'figure, caption, primitive',
    build: 'Reusable figure block component: <figure> with an SVG/CSS-drawn chart placeholder, a bold "Figure 2." label, descriptive caption with a source line, optional sub-panels labelled (a)(b)(c), and a small toolbar (expand to lightbox overlay, copy citation, download). Show 2-3 variants (full-width, half-width, multi-panel) on the page.',
  },
  {
    slug: 'sci-equation-block', title: 'Science — Equation Block', category: 'ui-components', difficulty: 'med',
    tags: 'equation, math, katex',
    build: 'KaTeX-style display equation blocks rendered with pure HTML/CSS (no math libs): centered equations with italic serif variables, proper fractions (stacked numerator/denominator with rule), superscripts/subscripts, summation/integral glyphs, Greek letters, and a right-aligned equation number (1),(2). Include inline-math examples within a paragraph, a hover-to-highlight referenced equation, and a "copy LaTeX" button per equation revealing the source.',
  },
  {
    slug: 'sci-citation-list', title: 'Science — References + Inline Citations', category: 'ui-components', difficulty: 'med',
    tags: 'citation, references, bibliography',
    build: 'A paragraph with inline citation links [1], [2-4] that, on click/hover, show a tooltip preview of the reference and smooth-scroll to a numbered references list. References list with authors, title, venue, year, DOI link, and per-entry "Cite" (copy BibTeX) + "Copy" buttons. A style toggle switching the visible format between numeric [1], author-year (Smith et al., 2024), and superscript.',
  },
  {
    slug: 'sci-data-table', title: 'Science — Scientific Data Table', category: 'ui-components', difficulty: 'med',
    tags: 'table, data, units',
    build: 'A scientific results table with a "Table 1." caption: column headers carrying units (e.g. "Mass (kg)"), values aligned on the decimal point with consistent significant figures, uncertainties shown as 12.34 ± 0.05, footnote markers, a highlighted best-result row, sortable columns, and a "Download CSV" button (builds a Blob). Mono font for numerics. Zebra striping and a sticky header.',
  },
  {
    slug: 'sci-abstract-card', title: 'Science — Structured Abstract Card', category: 'ui-components', difficulty: 'easy',
    tags: 'abstract, card',
    build: 'A structured abstract card with labelled segments (Background, Methods, Results, Conclusions), a keywords chip row, an article-type badge and open-access badge, DOI line, and a "Copy abstract" button. Clean bordered card with an accent left rail and a subtle reveal/expand for a long abstract.',
  },
  {
    slug: 'sci-author-affiliations', title: 'Science — Author + Affiliation + ORCID', category: 'ui-components', difficulty: 'easy',
    tags: 'authors, affiliations, orcid',
    build: 'Author byline block: author names with superscript affiliation numbers and an ORCID iD icon (green CSS circle) linking out, a corresponding-author asterisk with email reveal, a numbered affiliations list below, and equal-contribution daggers. Hovering an author highlights their matching affiliation. Include a compact and an expanded variant.',
  },
  {
    slug: 'sci-peer-review-badge', title: 'Science — Peer-Review / Open-Access Badges', category: 'ui-components', difficulty: 'easy',
    tags: 'badges, peer-review, open-access',
    build: 'A set of status badges for scholarly articles: Peer-reviewed, Open Access (gold/green/diamond variants with tooltips), Preprint, Registered Report, Data available, Code available, Reproduced. Each badge has an icon (CSS/SVG), accessible label, and a hover tooltip explaining it. Show them assembled into a realistic article meta strip plus a legend gallery.',
  },

  // 47.C — Data & Interactive
  {
    slug: 'sci-dataset-explorer', title: 'Science — Dataset Explorer', category: 'pages', difficulty: 'hard',
    tags: 'dataset, explorer, filter',
    build: 'A dataset portal explorer page: search bar + faceted filter rail (domain, format, license, size, year) that live-filters a grid/list of dataset cards (title, description, size, file count, license badge, citation count, download button). Sort dropdown, results count, a detail drawer/modal opening on a card showing variables table, sample preview, versions, and a "Download" + "Cite this dataset" action. All client-side over a seeded in-script dataset array.',
  },
  {
    slug: 'sci-interactive-chart', title: 'Science — Interactive Figure (toggle series)', category: 'ui-components', difficulty: 'med',
    tags: 'chart, interactive, figure',
    build: 'An interactive scientific figure drawn with inline SVG or canvas (NO chart libs): a multi-series line/scatter plot with axes, gridlines, units, a legend whose entries toggle series visibility, hover tooltips reading out (x, y) values with error bars, a log/linear y-axis toggle, and a "Figure N." caption. Smooth show/hide transitions. Seeded data in JS.',
  },
  {
    slug: 'sci-experiment-timeline', title: 'Science — Experiment / Methods Timeline', category: 'ui-components', difficulty: 'med',
    tags: 'timeline, methods, protocol',
    build: 'A vertical (horizontal on wide) methods/experiment timeline: ordered protocol steps with phase grouping (Preparation, Treatment, Measurement, Analysis), durations, instruments/reagents per step, status dots, and expandable step detail with parameters. A "play" control that sequentially highlights steps, and a total-duration summary.',
  },
  {
    slug: 'sci-periodic-table', title: 'Science — Interactive Periodic Table', category: 'pages', difficulty: 'hard',
    tags: 'periodic-table, chemistry',
    build: 'A full interactive periodic table: all 118 elements positioned in the correct CSS grid layout (lanthanides/actinides in their own rows), each cell showing atomic number, symbol, name, atomic mass. Category color legend (alkali metals, noble gases, etc.) with a toggle to recolor by category / state / electronegativity. Hover lifts a cell; click opens a detail panel (electron configuration, group/period, discovery year, fictional-safe facts). A search box that highlights matching elements. Embed the element dataset in script.js.',
  },
  {
    slug: 'sci-molecule-viewer', title: 'Science — Molecule / Structure Viewer Card', category: 'ui-components', difficulty: 'hard',
    tags: 'molecule, structure, viewer',
    build: 'A molecule viewer card: a 2D/pseudo-3D ball-and-stick molecule drawn with inline SVG (atoms as colored circles, bonds as lines/double-lines) that the user can rotate (drag updates a CSS/SVG transform) and zoom. Element color legend, info panel (formula, molar mass, name), a small selector to switch between a few molecules (water, caffeine, benzene, methane), and a spin toggle. No 3D libs — fake depth with scaling/opacity.',
  },

  // 47.D — Lab / Group / Journal Sites
  {
    slug: 'sci-lab-landing', title: 'Science — Research Lab / Group Landing', category: 'pages', difficulty: 'med',
    tags: 'lab, group, landing',
    build: 'A university research-group landing: hero with lab name, one-line mission, and PI; "Research Areas" card grid; a "Recent Publications" list (3-4 with venue + year); a "News" feed; a "Join us / Openings" CTA; funding/partner logo strip (text logos); and footer with address + contact. Institutional, credible, modern.',
  },
  {
    slug: 'sci-publications-index', title: 'Science — Publications List', category: 'pages', difficulty: 'med',
    tags: 'publications, list, filter',
    build: 'A publications index page: filter controls (by year, topic, author, type) and a search box that live-filter a chronological list grouped by year. Each entry: authors (bold the group member), title, venue, year, badges (peer-reviewed/preprint/best-paper), and links (PDF, DOI, code, BibTeX-copy). A count summary and a "cite" copy action. Seeded list in JS.',
  },
  {
    slug: 'sci-people-page', title: 'Science — Researchers / Team Page', category: 'pages', difficulty: 'easy',
    tags: 'people, team',
    build: 'A research team/people page: grouped sections (Principal Investigator, Postdocs, PhD Students, Alumni) with avatar cards (CSS monogram avatars), name, role, research interests chips, and links (email, ORCID, scholar, site). A filter/search and a hover card that flips or expands to a short bio. Clean grid, responsive.',
  },
  {
    slug: 'sci-journal-issue', title: 'Science — Journal Issue Index', category: 'pages', difficulty: 'med',
    tags: 'journal, issue, toc',
    build: 'A journal issue table-of-contents page: masthead (journal title, ISSN, "Volume 12 · Issue 4 · June 2026"), a volume/issue selector, article-type sections (Editorial, Research Articles, Reviews, Letters) listing each article with title, authors, page range, abstract toggle, open-access badge, and PDF/DOI links. A cover thumbnail panel and "download full issue" button.',
  },

  // 47.E — Themed Science Landings (5)
  {
    slug: 'sci-landing-journal', title: 'Science — Academic Journal Landing', category: 'pages', difficulty: 'hard',
    tags: 'landing, journal',
    palette: 'Academic journal (Nature/Science-style): white + ink + a signature red (--accent:#b3132b, --accent-d:#8a0f21, --accent-50:#fcebed). Classic serif headlines (Source Serif 4 700), authoritative & scholarly. Hairline rules, generous whitespace.',
    build: 'A flagship academic-journal homepage: top masthead with journal title in serif, a thin red rule, nav (Home, Research, Reviews, Authors, About); a "This Week" featured-article hero with cover image block; a "Latest Research" two-column list with article cards; an issue-cover sidebar + "Submit your research" CTA; metrics strip (impact factor, articles/year); newsletter signup; authoritative footer. Scholarly, classic.',
  },
  {
    slug: 'sci-landing-popsci', title: 'Science — Popular-Science Magazine Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, popsci, magazine',
    palette: 'Popular-science magazine: deep blue + white + a vivid accent (--accent:#1f4ed8, --pop:#ff5a36, --bg-alt:#eef3ff). Friendly sans (Inter) for UI + serif for story headlines. Curious, accessible, energetic. Bold imagery blocks, rounded cards.',
    build: 'A pop-science magazine homepage: bold hero feature story with category kicker + big headline + image; a colorful topic chip row (Space, Biology, Climate, Tech, Mind); a featured grid of story cards with read-time and category color tags; a "Explainers" horizontal scroller; a "Newsletter / Subscribe" band; trending sidebar list. Lively but trustworthy.',
  },
  {
    slug: 'sci-landing-lab', title: 'Science — University Research Lab Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, lab, university',
    palette: 'University research lab: institutional navy + grey + teal (--accent:#16365c, --teal:#0f8f86, --bg-alt:#eef1f5, --muted:#5d6b7e). Clean grotesque/sans (Inter), credible & modern. Structured grids, calm.',
    build: 'A polished university-lab landing distinct from sci-lab-landing: full-bleed hero with department crest (CSS), lab name and research statement; a "Focus Areas" alternating image+text band; a metrics row (publications, grants, members, citations); featured project spotlight; team avatar strip; partners/funding logos; and a contact/visit footer with a CSS map placeholder. Credible, institutional.',
  },
  {
    slug: 'sci-landing-dataset', title: 'Science — Open Data / Dataset Portal Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, dataset, open-data',
    palette: 'Open-data portal: white + slate + green (--accent:#1f7a4d, --slate:#334155, --bg-alt:#f1f5f4, --mono-bg:#0f1b2d). Mono (JetBrains Mono) + sans (Inter), technical & utilitarian. Dense, functional, gridlines.',
    build: 'A government/open-data portal homepage: prominent search hero ("Search 4,200 open datasets") with example query chips; category tiles (Climate, Genomics, Economics, Astronomy) with dataset counts; a "Featured datasets" table with size/format/license/updated columns and download buttons; an API/access panel with a copyable curl/endpoint snippet in mono; usage stats counters; and a developer-friendly footer. Technical, no-nonsense.',
  },
  {
    slug: 'sci-landing-conference', title: 'Science — Scientific Conference Landing', category: 'pages', difficulty: 'med',
    tags: 'landing, conference',
    palette: 'Scientific conference: charcoal + cyan + white (--bg:#0f1419, --accent:#22d3ee, --accent-2:#7c3aed, --ink:#eaf2f5 on dark). Geometric sans (Inter 700), energetic & forward-looking. Dark hero, neon accents, bold type.',
    build: 'A scientific-conference homepage (dark theme): hero with conference name, tagline, dates + city, and a live countdown timer to the event; key-info chips (dates, venue, format); "Keynote Speakers" card grid with monogram avatars; a tabbed program/schedule preview (Day 1/2/3); registration tiers pricing cards with a highlighted tier; important-dates timeline (abstract deadline, notification, camera-ready); sponsors tier logos; register CTA. Energetic, modern.',
  },
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
