// Workflow — build Phase 89 component resources (Advanced Motion / WebGPU)
export const meta = {
  name: 'components-89-build',
  description: 'Generate 8 advanced-motion / WebGPU component resources: mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const STYLE = `DESIGN SYSTEM (dark, modern, developer-facing):
- Google Font Inter via <link> (400;500;600;700), plus "JetBrains Mono" for any code/mono.
- Dark UI :root — --bg:#0c0d10; --surface:#15161b; --surface-2:#1d1f27; --ink:#e9eaf0; --muted:#9a9cab; --accent:#8b5cf6; --accent-2:#22d3ee; --ok:#34d399; --warn:#fbbf24; --danger:#f87171; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18); radii --r-sm:8px --r-md:12px --r-lg:16px.
- box-sizing:border-box reset, antialiased, line-height 1.5.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable, visible focus, respect prefers-reduced-motion.
- Responsive: works down to ~360px (@media max-width:520px).
- Vanilla JS only, no external libraries or build. DPR-aware canvas/GPU where relevant.
- No TODOs, no lorem ipsum. Genuinely interactive, self-contained, polished. Include controls to interact and labels explaining what's shown.`

const SPECS = [
  { slug: 'webgpu-compute-particles', title: 'WebGPU Compute Particles', tech: '[webgpu, vanilla-js]', d: 'hard', tags: 'webgpu, particles, gpu', build: 'A GPU particle system driven by a WebGPU compute shader (WGSL) updating positions/velocities each frame, rendered as points; particles attracted to the cursor. MUST feature-detect navigator.gpu and gracefully fall back to a Canvas 2D particle sim when WebGPU is unavailable, with an on-screen note of which backend is active. Controls: particle count, force.' },
  { slug: 'spring-physics-cards', title: 'Spring Physics Drag', tech: '[vanilla-js, css]', d: 'med', tags: 'spring, physics, drag', build: 'Draggable cards with real spring/inertia physics (velocity + damped spring integrator in rAF): fling a card and it settles with rubber-band, snaps back to grid, over-drag resistance at bounds. Tunable stiffness/damping sliders. prefers-reduced-motion aware.' },
  { slug: 'flip-layout-animation', title: 'FLIP Layout Animation', tech: '[vanilla-js, css]', d: 'med', tags: 'flip, layout, animation', build: 'Demonstrate the FLIP technique: a grid whose items smoothly animate (transform-based) between layouts on shuffle/sort/filter/add/remove — measure First/Last, invert, play. Buttons to shuffle/sort/filter. Explain FLIP in a labeled note.' },
  { slug: 'scroll-linked-3d', title: 'Scroll-Linked 3D Scene', tech: '[vanilla-js, css]', d: 'hard', tags: 'scroll, 3d, motion', build: 'A 3D scene (CSS 3D transforms, layered cards/cube in perspective) whose rotation/exploded-view is linked to scroll progress within a tall section — scrub the assembly as you scroll. Sticky viewport, progress indicator, reduced-motion fallback to fade.' },
  { slug: 'morph-shape-transition', title: 'SVG Path Morph', tech: '[vanilla-js, svg]', d: 'med', tags: 'svg, morph, transition', build: 'Smoothly morph between SVG shapes (interpolate path data with equal point counts) on a timer and on click — a small set of icons/blobs morphing one to the next, easing, play/pause, pick-target buttons. Self-contained path interpolation (no libs).' },
  { slug: 'magnetic-cursor-elements', title: 'Magnetic Cursor', tech: '[vanilla-js, css]', d: 'med', tags: 'cursor, magnetic, hover', build: 'A custom cursor (dot + ring lagging with easing) plus magnetic buttons/links that pull toward the pointer within a radius and snap back on leave, with label-hover growth. Multiple magnetic targets. Hides on touch devices, reduced-motion aware.' },
  { slug: 'elastic-nav-indicator', title: 'Elastic Nav Indicator', tech: '[vanilla-js, css]', d: 'med', tags: 'nav, indicator, shared-element', build: 'A tab/nav bar with a shared-element pill/underline indicator that slides and elastically stretches (squash/overshoot) as it travels between items, adapting width to each item. Keyboard navigable, works for tabs + underline variants.' },
  { slug: 'parallax-depth-scene', title: 'Parallax Depth Scene', tech: '[vanilla-js, css]', d: 'med', tags: 'parallax, depth, motion', build: 'A multi-layer depth scene (background/mid/foreground layers) that parallaxes with both pointer movement and scroll, with subtle blur/scale per depth for a diorama feel. Toggle pointer vs scroll drive, reduced-motion fallback.' },
]

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`
  return `You are generating ONE production-quality static UI component demo. Self-contained, polished, visually distinctive — a developer-facing component library entry showcasing an advanced motion / GPU technique.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/index.mdx — EXACTLY this frontmatter (write a rich 55-90 word description yourself, no internal double-quotes), then a short prose body (2-3 paragraphs describing the component + interactions + the technique it demonstrates):

---
slug: ${s.slug}
title: "${s.title}"
description: "<one-line rich description>"
category: ui-components
type: component
tags: ${'[' + s.tags.split(', ').join(', ') + ']'}
tech: ${s.tech}
difficulty: ${s.d}
targets: [html]
collections: []
labRoute: /ui-components/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-07-01
updatedAt: 2026-07-01
---

2. ${dir}/snippets/html.html — full <!doctype html>, Google Font <link>s, <link rel="stylesheet" href="style.css">, semantic markup, <script src="script.js"></script> before </body>.
3. ${dir}/snippets/style.css — all styles, :root palette first, substantial + responsive.
4. ${dir}/snippets/script.js — working vanilla JS, no external libs.

QUALITY BAR: the demo must actually WORK and clearly showcase the technique, with controls to interact and a labeled explanation. Smooth 60fps-minded animation, reduced-motion handling. No TODOs or lorem ipsum. Feature-detect and gracefully fall back for bleeding-edge APIs (esp. WebGPU).

After writing all files, return your result.`
}

phase('Generate')
log(`Generando ${SPECS.length} recursos de componentes (advanced-motion / webgpu)…`)

const RESULT = {
  type: 'object',
  properties: { slug: { type: 'string' }, files: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['slug', 'files'],
}

const results = await parallel(
  SPECS.map((s) => () => agent(buildPrompt(s), { label: s.slug, phase: 'Generate', agentType: 'general-purpose', schema: RESULT }))
)

const ok = results.filter(Boolean)
return {
  requested: SPECS.length,
  completed: ok.length,
  missing: SPECS.filter((s) => !ok.find((r) => r.slug === s.slug)).map((s) => s.slug),
}
