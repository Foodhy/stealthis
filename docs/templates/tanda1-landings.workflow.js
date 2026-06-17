// ===========================================================================
// Tanda 1 — Landing-only packs: Phase 45 (AI), 42 (Agency), 44 (D2C)
// 15 themed marketing one-pagers. Collections: ai-product | agency | d2c.
// ===========================================================================

export const meta = {
  name: 'tanda1-landings-build',
  description: 'Build 15 themed landing pages (AI / Agency / D2C packs)',
  phases: [{ title: 'Generate', detail: 'one agent per landing' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const STYLE = `DESIGN SYSTEM (high-end marketing landing page, match the spirit unless the palette override says otherwise):
- Google Font via <link> — pick a font that fits the variant (Inter for clean SaaS, a serif for editorial/luxury, a mono accent for technical). Always set font-family with system fallbacks.
- Define ALL colors as CSS variables in :root first. box-sizing border-box reset, antialiased, line-height 1.5.
- This is a FULL one-page LANDING, not a component. It MUST include, in order: sticky/transparent top nav (logo + links + CTA), a strong hero (headline, subcopy, primary+secondary CTA, hero visual/mockup), at least 4-5 distinct content sections (e.g. logos/social-proof, features grid, how-it-works/process, showcase/case studies or product detail, testimonials/reviews, pricing or waitlist), and a footer.
- Visually distinctive per variant: real hierarchy, generous spacing, large type, tasteful gradients/shadows, hover & scroll micro-interactions. NOT a generic bootstrap page.
- Accessible: semantic landmarks, aria where relevant, WCAG AA contrast, keyboard-usable interactive elements.
- Responsive: looks great at desktop AND down to ~360px (mobile nav toggle, stacked sections — add @media (max-width:720px) and (max-width:520px)).
- Vanilla JS only (no frameworks/build): mobile menu toggle, smooth-scroll, scroll-reveal/intersection observer, an interactive bit relevant to the theme (tabs, accordion FAQ, prompt-mockup typewriter, pricing toggle, etc.). A toast(msg) helper for CTA clicks is a good pattern.
- Realistic but clearly fictional brand name, copy, testimonials, logos (text/SVG placeholders ok). No lorem ipsum, no TODOs.`

const DISCLAIMER = '> Illustrative UI only — fictional brand, not a real product.'

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`
  const tags = `[${s.collection}, landing, ${s.tags}]`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (write the description yourself), then the prose body:

---
slug: ${s.slug}
title: "${s.title}"
description: "<ONE-LINE rich description, 55-90 words, no internal double-quotes>"
category: pages
type: page
tags: ${tags}
tech: [html, css, vanilla-js]
difficulty: ${s.difficulty}
targets: [html]
collections: [${s.collection}]
labRoute: /pages/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-16
updatedAt: 2026-06-16
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the landing page, its sections and interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static marketing LANDING PAGE resource. Self-contained, polished, visually distinctive — agency-portfolio quality, not a placeholder.

${STYLE}

PALETTE & MOOD (use this as the visual identity): ${s.palette}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>, <link rel="stylesheet" href="style.css">, full landing markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: full multi-section landing, real-feeling copy & testimonials, clear hierarchy, hover/active states, scroll reveal, a genuinely interactive script, mobile nav. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── Phase 45 — AI Product (collection: ai-product) ──────────────────────
  {
    slug: 'ai-landing-chatbot', collection: 'ai-product', difficulty: 'hard',
    title: 'AI Product — Chat Assistant Landing', tags: 'ai, chatbot, saas',
    palette: 'Dark + gradient glow (deep slate #0b0f1a base, violet→cyan gradient accents) · modern sans (Inter) · intelligent, sleek, premium SaaS',
    build: 'Landing for a conversational AI assistant. Hero with animated chat-bubble mockup (typewriter prompt + streaming-style reply demo in JS), trust logos, feature grid (memory, tools, integrations), how-it-works steps, a live "try a prompt" interactive demo card, testimonials, pricing toggle (monthly/yearly), waitlist/CTA, footer.',
  },
  {
    slug: 'ai-landing-imagegen', collection: 'ai-product', difficulty: 'hard',
    title: 'AI Product — Image Generation Landing', tags: 'ai, image-gen, creative',
    palette: 'Black + iridescent/holographic accents (magenta→teal→gold sheen) · display headline font + sans body · creative, vivid, gallery-like',
    build: 'Landing for an AI image generator. Hero with a masonry gallery of generated images (CSS placeholders/gradients) and a prompt bar, before→after or style-grid showcase, feature sections (styles, resolution, editing), an interactive prompt-to-style picker (JS tabs that swap the gallery), pricing tiers, testimonials, CTA, footer.',
  },
  {
    slug: 'ai-landing-code', collection: 'ai-product', difficulty: 'med',
    title: 'AI Product — Code Assistant Landing', tags: 'ai, code, devtool',
    palette: 'Dark editor theme (#0d1117) + mono accents + syntax-highlight colors · technical mono headline + clean sans body · developer-native',
    build: 'Landing for an AI coding assistant. Hero with a fake code editor showing AI autocomplete/diff (animated typing in JS), supported-languages strip, feature grid (autocomplete, chat, refactor, tests), an interactive tabbed demo (switch between completion / chat / fix), install/CLI snippet with copy button, testimonials from devs, pricing, CTA, footer.',
  },
  {
    slug: 'ai-landing-voice', collection: 'ai-product', difficulty: 'med',
    title: 'AI Product — Voice AI Landing', tags: 'ai, voice, audio',
    palette: 'Deep indigo/navy + soft pastel waveform accents · soft rounded sans · calm, futuristic, human',
    build: 'Landing for a voice AI product. Hero with an animated waveform/orb visualization (CSS+JS) and a "press to talk" demo button that animates, use-case sections (assistants, dubbing, accessibility), voices showcase, how-it-works, an interactive waveform that reacts to a play button, pricing, testimonials, CTA, footer.',
  },
  {
    slug: 'ai-landing-search', collection: 'ai-product', difficulty: 'med',
    title: 'AI Product — AI Search Landing', tags: 'ai, search, answers',
    palette: 'Clean white + single bold accent (electric blue) + subtle gray · clean sans · fast, authoritative, trustworthy',
    build: 'Landing for an AI answer-engine / search. Hero with a big search bar that animates into a cited answer card (JS), feature grid (citations, real-time, follow-ups), comparison vs traditional search, an interactive "ask a question" mock that reveals a sourced answer, logos, pricing/free CTA, testimonials, footer.',
  },

  // ── Phase 42 — Agency (collection: agency) ──────────────────────────────
  {
    slug: 'agency-landing-design', collection: 'agency', difficulty: 'med',
    title: 'Agency — Design Studio Landing', tags: 'agency, design, studio',
    palette: 'Off-white #f6f4ef + ink #14110d + one bold accent (electric coral) · editorial serif headlines + clean sans body · confident, curated',
    build: 'Landing for a design studio. Big editorial hero with oversized type, selected-works case-study grid with hover reveals, services list, studio/about + team, awards/clients strip, process steps, testimonials, contact CTA, footer.',
  },
  {
    slug: 'agency-landing-dev', collection: 'agency', difficulty: 'med',
    title: 'Agency — Software / Dev Shop Landing', tags: 'agency, dev, software',
    palette: 'Dark #0c0e12 + mono accent (lime/green) + slate · technical sans + mono labels · precise, modern, engineering',
    build: 'Landing for a software dev shop. Hero with a terminal/code motif, tech-stack logos, services grid (web, mobile, AI, platform), case studies with metrics, process/engagement model, team, testimonials, "start a project" CTA, footer.',
  },
  {
    slug: 'agency-landing-marketing', collection: 'agency', difficulty: 'med',
    title: 'Agency — Marketing / Growth Landing', tags: 'agency, marketing, growth',
    palette: 'Bright gradient (purple→pink→orange) on white · punchy bold sans · energetic, results-driven',
    build: 'Landing for a growth/marketing agency. Punchy hero with a results stat counter (animated in JS), services (SEO, paid, content, social), case studies with big ROI numbers, client logos, process funnel, testimonials, an animated metrics band, book-a-call CTA, footer.',
  },
  {
    slug: 'agency-landing-video', collection: 'agency', difficulty: 'hard',
    title: 'Agency — Video / Production Landing', tags: 'agency, video, production',
    palette: 'Black + cinematic warm accents (amber/red) + film grain · dramatic display font · motion-rich, cinematic',
    build: 'Landing for a video production house. Full-bleed cinematic hero with a play-button video poster (animated), showreel/work grid with hover-play thumbnails, services (film, motion, ads), behind-the-scenes, clients, process, testimonials, "let\'s make something" CTA, footer.',
  },
  {
    slug: 'agency-landing-branding', collection: 'agency', difficulty: 'hard',
    title: 'Agency — Branding / Identity Landing', tags: 'agency, branding, identity',
    palette: 'Cream #f3efe6 + duotone (deep plum + warm sand) · refined sans + serif accents · artful, premium, identity-led',
    build: 'Landing for a branding/identity studio. Hero with a bold brand-mark animation, case studies showing logo/identity systems (color blocks, type specimens), services (strategy, identity, naming, guidelines), philosophy section, clients, process, testimonials, inquiry CTA, footer.',
  },

  // ── Phase 44 — D2C (collection: d2c) ────────────────────────────────────
  {
    slug: 'd2c-landing-skincare', collection: 'd2c', difficulty: 'med',
    title: 'D2C — Skincare / Beauty Landing', tags: 'd2c, skincare, beauty',
    palette: 'Soft neutrals (blush, cream, sand) + subtle gold · elegant light sans · clean, dewy, premium',
    build: 'D2C product landing for a skincare brand. Hero with product shot + key claim + add-to-cart, benefit grid (hydration, clean, dermatologist-tested), ingredient callouts, before/after or routine steps, reviews with star ratings, bundle pricing cards, FAQ accordion, sticky add-to-cart bar on scroll, footer.',
  },
  {
    slug: 'd2c-landing-coffee', collection: 'd2c', difficulty: 'med',
    title: 'D2C — Coffee / Beverage Landing', tags: 'd2c, coffee, beverage',
    palette: 'Kraft paper + espresso brown + cream · rugged serif headlines + sans body · artisanal, warm, craft',
    build: 'D2C landing for a specialty coffee brand. Hero with bag/product shot + origin story hook, roast-level selector (interactive), flavor notes, subscription vs one-time pricing toggle, brewing guide steps, reviews, sustainability section, sticky cart, FAQ, footer.',
  },
  {
    slug: 'd2c-landing-fashion', collection: 'd2c', difficulty: 'hard',
    title: 'D2C — Fashion / Apparel Landing', tags: 'd2c, fashion, apparel',
    palette: 'White + black + one editorial accent · couture serif + sans · editorial, aspirational, minimal',
    build: 'D2C landing for a fashion/apparel drop. Full-bleed editorial hero, lookbook gallery with hover, product highlight with size/color swatch picker (interactive), fabric/quality story, reviews, pricing with bundle, newsletter/drop-waitlist, sticky add-to-cart, footer.',
  },
  {
    slug: 'd2c-landing-hardware', collection: 'd2c', difficulty: 'hard',
    title: 'D2C — Hardware / Gadget Landing', tags: 'd2c, hardware, gadget',
    palette: 'Dark #0a0a0c + product spotlight + electric accent · clean sans · spec-proud, premium tech',
    build: 'D2C landing for a hardware gadget. Dramatic dark hero with product render + key specs, feature sections with exploded/spotlight visuals, interactive spec tabs or color picker, comparison table, reviews, pre-order/pricing, FAQ, sticky buy bar, footer.',
  },
  {
    slug: 'd2c-landing-supplements', collection: 'd2c', difficulty: 'med',
    title: 'D2C — Supplements / Wellness Landing', tags: 'd2c, supplements, wellness',
    palette: 'Clinical white + vibrant accent (teal/lime) + soft gray · confident clean sans · science-backed, energetic',
    build: 'D2C landing for a supplements/wellness brand. Hero with product + benefit claim + CTA, ingredient/science breakdown with study callouts, benefit icons grid, subscription pricing toggle, reviews with ratings, "how it works" timeline, FAQ accordion, sticky add-to-cart, footer.',
  },
]

phase('Generate')
log(`Generando ${SPECS.length} landings (AI · Agency · D2C)…`)

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
