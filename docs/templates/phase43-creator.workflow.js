// ===========================================================================
// Phase 43 — Creator / Personal Brand Landings. Collection: creator. 5 landings.
// ===========================================================================

export const meta = {
  name: 'phase43-creator-build',
  description: 'Build 5 Creator personal-brand landing pages',
  phases: [{ title: 'Generate', detail: 'one agent per landing' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'creator'

const STYLE = `DESIGN SYSTEM (high-end personal-brand LANDING page, match the spirit; the palette override defines the identity):
- Google Font via <link> — pick a font that fits the variant (display for music/gamer, minimal sans for photography, serif for author, friendly sans for coach). Set font-family with system fallbacks.
- Define ALL colors as CSS variables in :root first. box-sizing border-box reset, antialiased, line-height 1.5.
- This is a FULL one-page personal-brand LANDING. Include in order: top nav (name/logo + links + CTA), a strong hero (name, tagline, primary CTA, portrait/visual), and 4-5 distinct sections chosen for the creator type (work/showcase gallery, about/bio, offers — shows/prints/books/sessions/memberships, testimonials/press, links & socials, newsletter), and a footer.
- Visually distinctive per variant: real hierarchy, generous spacing, large type, tasteful motion, hover & scroll micro-interactions. NOT a generic template.
- Accessible: semantic landmarks, aria where relevant, WCAG AA contrast, keyboard-usable interactive elements.
- Responsive: great at desktop AND down to ~360px (mobile nav toggle, stacked sections — add @media (max-width:720px) and (max-width:520px)).
- Vanilla JS only (no frameworks/build): mobile menu, smooth-scroll, scroll-reveal, plus a theme-relevant interaction (gallery lightbox, audio/track list player mock, book preview, booking form, latest-stream embed mock). A toast(msg) helper for CTA clicks is good.
- Realistic but clearly fictional creator name, copy, testimonials. No lorem ipsum, no TODOs.`

const DISCLAIMER = '> Illustrative UI only — fictional creator, not a real person or brand.'

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}, landing, ${s.tags}]`

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
collections: [${COLLECTION}]
labRoute: /pages/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-17
updatedAt: 2026-06-17
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the landing page, its sections and interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static personal-brand LANDING PAGE. Self-contained, polished, visually distinctive — portfolio quality, not a placeholder.

${STYLE}

PALETTE & MOOD (visual identity): ${s.palette}

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
  { slug: 'creator-landing-musician', title: 'Creator — Musician Landing', difficulty: 'med', tags: 'musician, artist',
    palette: 'Musician / artist — Dark #0c0c12 + neon (magenta + cyan) glow · bold display font · moody, hype, electric',
    build: 'Musician personal landing: dark hero with artist name + new-release CTA + cover art, latest tracks list with a mock play/pause mini-player, tour dates list with ticket links, music-video gallery, merch teaser, newsletter, socials, footer. Interactive: track play toggle, mobile nav, reveal.' },
  { slug: 'creator-landing-photographer', title: 'Creator — Photographer Landing', difficulty: 'med', tags: 'photographer, portfolio',
    palette: 'Photographer — White + full-bleed photography + ink · minimal sans · gallery-quiet, refined',
    build: 'Photographer personal landing: minimal hero with full-bleed image + name, masonry portfolio gallery with lightbox, services (portrait/event/commercial), about, client logos, booking/contact, footer. Interactive: gallery lightbox, category filter, mobile nav, reveal.' },
  { slug: 'creator-landing-author', title: 'Creator — Author Landing', difficulty: 'easy', tags: 'author, writer',
    palette: 'Author / writer — Cream #f6f1e7 + ink + one accent · literary serif · warm, bookish, calm',
    build: 'Author personal landing: warm hero with latest book cover + buy CTA, books grid, about-the-author bio, praise/review quotes, events/readings, newsletter signup, socials, footer. Interactive: book quick-look modal, mobile nav, reveal.' },
  { slug: 'creator-landing-coach', title: 'Creator — Coach / Speaker Landing', difficulty: 'med', tags: 'coach, speaker',
    palette: 'Coach / speaker — Warm white + bold accent (teal or coral) · friendly confident sans · trustworthy, motivating',
    build: 'Coach/speaker personal landing: confident hero with name + book-a-call CTA, programs/offers cards, about + credentials, results/testimonials, speaking topics, free-resource lead magnet, contact, footer. Interactive: booking form, testimonial slider, mobile nav, reveal.' },
  { slug: 'creator-landing-streamer', title: 'Creator — Streamer / Gamer Landing', difficulty: 'med', tags: 'streamer, gamer',
    palette: 'Streamer / gamer — Black + purple #8b5cf6 + neon green · gamer display sans · electric, fan-first, energetic',
    build: 'Streamer/gamer personal landing: dark hero with handle + live-now badge + watch CTA, schedule grid, latest-stream/clips gallery, membership/sub tiers, sponsors/gear, community links (Discord), socials, footer. Interactive: live-now pulse, schedule day tabs, mobile nav, reveal.' },
]

phase('Generate')
log(`Generando ${SPECS.length} landings de creador…`)

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
