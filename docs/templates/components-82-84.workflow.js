// Workflow — build Phases 82-84 component resources (modern CSS, WebGL/canvas, AI-app UI)
// One agent per resource, in parallel. Each writes its own dir → no file conflicts.
export const meta = {
  name: 'components-82-84-build',
  description: 'Generate 26 component resources (modern CSS / WebGL-canvas / AI-app UI): mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const STYLE = `DESIGN SYSTEM (dark, modern, developer-facing):
- Google Font Inter via <link> (400;500;600;700), plus "JetBrains Mono" for any code/mono. font-family default "Inter", system-ui, sans-serif.
- Dark UI :root — --bg:#0c0d10; --surface:#15161b; --surface-2:#1d1f27; --ink:#e9eaf0; --muted:#9a9cab; --accent:#8b5cf6; --accent-2:#22d3ee; --ok:#34d399; --warn:#fbbf24; --danger:#f87171; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18); radii --r-sm:8px --r-md:12px --r-lg:16px.
- box-sizing:border-box reset, antialiased, line-height 1.5.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable, visible focus.
- Responsive: works down to ~360px (@media max-width:520px).
- Vanilla JS only, no external libraries or build. Prefer modern web platform APIs where the resource is about them.
- No TODOs, no lorem ipsum. Genuinely interactive, self-contained, polished, distinctive.`

const SPECS = [
  // ── Phase 82 — Modern CSS / Web Platform (10) ──
  { slug: 'scroll-driven-reveal', title: 'Scroll-Driven Reveal', tech: '[css, vanilla-js]', d: 'med', tags: 'css, scroll-driven, animation', build: 'Showcase CSS scroll-driven animations using animation-timeline: view() — elements fade/slide/scale in as they enter the viewport, a scroll progress bar driven by scroll-timeline, and a parallax section. Include a @supports fallback with a tiny IntersectionObserver polyfill note. Explain each in labeled demo blocks.' },
  { slug: 'view-transitions-gallery', title: 'View Transitions Gallery', tech: '[vanilla-js, css]', d: 'med', tags: 'view-transitions, css, api', build: 'Use the View Transitions API (document.startViewTransition) to animate a grid→detail transition of a small gallery with view-transition-name morphing the clicked thumbnail into the detail hero. Graceful fallback if unsupported.' },
  { slug: 'popover-api-menu', title: 'Native Popover API Menu', tech: '[vanilla-js, css]', d: 'easy', tags: 'popover, api, menu', build: 'Demonstrate the native HTML Popover API (popover attribute, popovertarget) with a dropdown menu, a tooltip, and a modal-ish popover — no JS positioning libs. Show light-dismiss, and a CSS anchor-positioned variant with @supports.' },
  { slug: 'anchor-positioning-tooltip', title: 'CSS Anchor Positioning', tech: '[css]', d: 'med', tags: 'anchor-positioning, css, tooltip', build: 'Pure-CSS anchor positioning (anchor-name / position-anchor / position-area) — tooltips and popovers that attach to anchors and flip with position-try-fallbacks. Multiple placements demo grid. @supports fallback.' },
  { slug: 'container-query-cards', title: 'Container Query Cards', tech: '[css]', d: 'easy', tags: 'container-queries, css, responsive', build: 'A card component that restyles based on its CONTAINER width (@container), not viewport. Show the same card in 3 differently-sized resizable containers (drag to resize) switching between stacked/horizontal/compact layouts.' },
  { slug: 'css-scope-theming', title: 'CSS @scope Theming', tech: '[css]', d: 'med', tags: 'scope, css, theming', build: 'Demonstrate @scope to scope styles + theme tokens to subtrees without leakage — two theme regions (e.g. brand-a / brand-b) with the same class names styled independently, plus donut-scope (to) example.' },
  { slug: 'scroll-snap-carousel', title: 'CSS Scroll-Snap Carousel', tech: '[css]', d: 'easy', tags: 'scroll-snap, css, carousel', build: 'Pure CSS scroll-snap carousel with mandatory snap, snap-stop, and CSS ::scroll-marker / scroll-marker-group dots for navigation (with @supports fallback to plain anchor dots). No JS required for core behavior.' },
  { slug: 'text-wrap-typography', title: 'text-wrap Balance & Pretty', tech: '[css]', d: 'easy', tags: 'typography, css, text-wrap', build: 'Typography demo of text-wrap: balance (headings) and text-wrap: pretty (body), with side-by-side toggles vs normal wrapping, plus hanging-punctuation and initial-letter for a drop cap. Live toggle controls.' },
  { slug: 'color-mix-theming', title: 'color-mix() Theme Generator', tech: '[css, vanilla-js]', d: 'med', tags: 'color-mix, css, theming', build: 'A live theme generator: pick a base hue (input), derive an entire palette (tints/shades/hover/borders) purely via CSS color-mix() in oklch, preview on sample UI, and show the generated CSS. relative color syntax variant too.' },
  { slug: 'has-selector-interactions', title: ':has() Parent Interactions', tech: '[css]', d: 'med', tags: 'has, css, selector', build: 'Interactions driven only by CSS :has() — a form that highlights the parent when an input is invalid/checked, a card grid that dims siblings on hover of one, a quantity-based layout, and a no-JS accordion/tab via :has(:checked).' },

  // ── Phase 83 — WebGL / Shader / Canvas (8) ──
  { slug: 'shader-gradient-bg', title: 'Shader Gradient Background', tech: '[webgl, vanilla-js]', d: 'hard', tags: 'webgl, shader, gradient', build: 'Animated full-viewport gradient rendered with a WebGL fragment shader (flowing noise-based color field). Vanilla WebGL (no three.js): compile vertex+fragment shaders, animate a u_time uniform via requestAnimationFrame, resize-aware. Controls to change color scheme + speed.' },
  { slug: 'particle-field-cursor', title: 'Particle Field + Cursor', tech: '[canvas, vanilla-js]', d: 'med', tags: 'canvas, particles, cursor', build: 'Canvas 2D particle field: hundreds of particles drifting, connected by lines when near, repelled/attracted by the cursor. requestAnimationFrame loop, DPR-aware, perf-conscious. Controls: particle count + connection distance.' },
  { slug: 'card-3d-tilt', title: '3D Tilt Card with Glare', tech: '[vanilla-js, css]', d: 'med', tags: '3d, tilt, hover', build: 'Pointer-driven 3D tilt card using CSS 3D transforms driven by JS pointer position (rotateX/Y), a moving specular glare highlight, and parallax layers inside the card. Smooth spring-back on leave. Multiple cards.' },
  { slug: 'generative-blob-bg', title: 'Generative Blob Background', tech: '[canvas, vanilla-js]', d: 'hard', tags: 'canvas, metaball, generative', build: 'Canvas metaball / gooey blob background: several moving blobs blended into organic shapes (threshold/gooey via radial gradients or marching), smooth animation, color palette control, mouse influences a blob.' },
  { slug: 'dot-grid-wave', title: 'Dot Grid Ripple', tech: '[canvas, vanilla-js]', d: 'med', tags: 'canvas, grid, ripple', build: 'Canvas dot grid that ripples: dots scale/brighten in a wave radiating from the cursor and from click-triggered ripples, continuous idle wave. DPR-aware, resize-aware.' },
  { slug: 'image-dissolve-shader', title: 'Image Dissolve Shader', tech: '[webgl, vanilla-js]', d: 'hard', tags: 'webgl, shader, hover', build: 'WebGL image hover effect: displacement/dissolve transition between two textures driven by a noise map and a u_progress uniform tied to hover, with RGB-shift on the edge. Vanilla WebGL, load images as textures (use crossorigin unsplash or generated canvas textures).' },
  { slug: 'noise-flow-field', title: 'Noise Flow Field', tech: '[canvas, vanilla-js]', d: 'hard', tags: 'canvas, flow-field, generative', build: 'Canvas flow-field: particles follow a Perlin/value-noise vector field leaving fading trails, creating organic streamlines. Include a small self-contained noise function. Controls: particle count, field scale, reset.' },
  { slug: 'text-scramble-canvas', title: 'Canvas Scramble Text', tech: '[canvas, vanilla-js]', d: 'med', tags: 'canvas, text, glitch', build: 'Canvas-rendered glitch/scramble text effect: text resolves from random glyphs with RGB channel-split and scanline glitch, retriggers on hover/click, cycles through phrases. DPR-aware.' },

  // ── Phase 84 — AI-app UI (8) ──
  { slug: 'agent-trace-viewer', title: 'Agent Trace Viewer', tech: '[vanilla-js, css]', d: 'med', tags: 'ai, agent, trace', build: 'A collapsible agent execution trace: a timeline of steps (thought → tool call → observation → answer) with status icons, durations, token counts, expandable payloads (JSON), nested sub-steps, and a filter (all/tools/errors). Simulated streaming-in of steps on a "Run" button.' },
  { slug: 'tool-call-card', title: 'Tool Call Card', tech: '[vanilla-js, css]', d: 'med', tags: 'ai, tool-call, card', build: 'An LLM tool-call card: shows the function name, arguments (pretty JSON), a pending→running→success/error state machine, the returned result (collapsible), latency + token badges, and a retry button. Several examples with different states.' },
  { slug: 'streaming-markdown', title: 'Streaming Markdown', tech: '[vanilla-js, css]', d: 'med', tags: 'ai, markdown, streaming', build: 'A streaming markdown renderer: types out a markdown response token-by-token with a blinking cursor, live-parsing headings/lists/bold/code-blocks/tables as they complete (small self-contained markdown parser), code blocks get a copy button. Start/stop/replay controls + speed.' },
  { slug: 'model-comparison-panel', title: 'Model Comparison Panel', tech: '[vanilla-js, css]', d: 'med', tags: 'ai, models, compare', build: 'Side-by-side model comparison: one prompt, 2-3 model columns each streaming their answer, per-model badges (latency/tokens/cost), a vote/pick-winner control, and a sync-scroll toggle. Simulated responses.' },
  { slug: 'prompt-playground', title: 'Prompt Playground', tech: '[vanilla-js, css]', d: 'hard', tags: 'ai, prompt, playground', build: 'A prompt playground: system + user prompt editors, parameter controls (model select, temperature/top-p sliders, max tokens), a live token/character meter that estimates cost, a Run button producing a simulated streamed response, and a variables/{{template}} panel.' },
  { slug: 'rag-source-panel', title: 'RAG Source Panel', tech: '[vanilla-js, css]', d: 'med', tags: 'ai, rag, citations', build: 'A RAG answer with sources: an answer containing inline citation chips [1][2] that, on hover/click, highlight the matching source card in a side panel (snippet, title, relevance score, URL). Panel is filterable/sortable by score.' },
  { slug: 'chat-branching', title: 'Chat Branching Tree', tech: '[vanilla-js, css]', d: 'hard', tags: 'ai, chat, branching', build: 'A conversation with branching: each assistant turn can be regenerated, creating sibling branches; a "2/3" pager on a turn switches between versions, and a compact branch-tree minimap shows the conversation graph. Edit-user-message forks a new branch.' },
  { slug: 'thinking-trace-collapsible', title: 'Thinking Trace', tech: '[vanilla-js, css]', d: 'easy', tags: 'ai, reasoning, thinking', build: 'A collapsible reasoning/thinking block (like modern reasoning models): a "Thinking…" header with a live timer + shimmer while streaming, that collapses to a summary once done, expandable to show the full step-by-step reasoning. Toggle to auto-collapse on finish.' },
]

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`
  return `You are generating ONE production-quality static UI component demo. Self-contained, polished, visually distinctive — not a placeholder. This is a developer-facing component library entry.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/index.mdx — EXACTLY this frontmatter (write a rich 55-90 word description yourself, no internal double-quotes), then a short prose body (2-3 paragraphs describing the component + interactions + which web API it demonstrates):

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

QUALITY BAR: the demo must actually WORK and clearly showcase the feature. Real-feeling data, clear labels explaining what's shown, controls to interact, hover/active/focus states, smooth micro-interactions. No TODOs or lorem ipsum. If using a bleeding-edge API, add a graceful @supports / feature-detect fallback.

After writing all files, return your result.`
}

phase('Generate')
log(`Generando ${SPECS.length} recursos de componentes (modern-css / webgl / ai-ui)…`)

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
