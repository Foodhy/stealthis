---
title: "The Browser Render Pipeline — Fundamentals"
description: "How the browser turns your code into pixels: the render pipeline, why React re-renders cost what they cost, and the Core Web Vitals that measure it. Base for the frontend performance cases."
sidebar:
  label: "Fundamentals"
  order: 0
playbook:
  area: "frontend-performance"
  type: "fundamentals"
  covers: ["render-pipeline", "layout-paint-composite", "react-re-renders", "core-web-vitals"]
---

## What it is and why it affects you

Every visual update goes through the same assembly line: your JS changes the DOM, the
browser recalculates **styles**, computes **layout** (where every box goes), **paints**
pixels, and **composites** layers onto the screen. At 60fps, the whole line — your JS
included — has about **16ms per frame**.

Frontend slowness is almost always one of two things:

1. **The line runs too slowly** — one frame's work takes 200ms (heavy JS, layout over
   thousands of nodes), so scrolling and typing stutter.
2. **The line runs too often or too wide** — you trigger it for 10,000 nodes when 20
   changed, or on every keystroke when once per pause would do.

Everything in this area — virtualization, debouncing, image optimization, workers — is a
way of doing *less work per frame* or *fewer frames of work*.

## The mental model

```
 JS runs  →  Style  →  Layout  →  Paint  →  Composite
 (your      (which    (where     (fill     (stack layers,
  code)      rules     every      pixels)   GPU)
             apply)    box goes)
   ↑______________ all of this shares ONE main thread ______________↑
                    budget: ~16ms per frame at 60fps
```

Key consequences:

- **JS and rendering share one thread.** While your handler runs, no pixels move (see
  [Runtime fundamentals](/playbooks/runtime/fundamentals/) — same loop, viewed from the
  pixels' side).
- **Cost scales with affected nodes.** Layout over 50,000 DOM nodes is slow no matter
  how fast your JS is. The cheapest node is the one that doesn't exist — that's the
  whole idea of virtualization.
- **Not all CSS costs the same.** `transform`/`opacity` changes skip layout and paint
  (composite-only — GPU-cheap). Changing `width`, `top`, or anything geometric re-runs
  layout for affected subtrees. Animate transforms, not geometry.
- **Reading layout after writing forces a sync layout.** `el.offsetHeight` after a style
  change makes the browser compute layout *right now*, mid-task ("layout thrashing" when
  done in a loop).

See which stages each kind of change actually triggers:

<script src="/playbooks-demos.js"></script>

<pb-pipeline></pb-pipeline>

**Where React fits:** React re-runs component functions (**render**) to compute what
changed, then touches only those DOM nodes (**commit**). A parent re-render re-renders
all children by default. Render is usually cheap per component — the problems are
*multiplication* (2,000 rows × every keystroke) and *expensive commits* (mounting
thousands of new nodes). React reduces DOM writes; it does not make rendering free.

## Reference table

**Pipeline stages and what triggers them:**

| You change | Stages that run | Relative cost |
| --- | --- | --- |
| `transform`, `opacity` | Composite only | Cheapest — GPU |
| `background`, `color`, `box-shadow` | Paint + Composite | Medium |
| `width`, `height`, `top`, `font-size`, DOM insert/remove | Layout + Paint + Composite | Most expensive; scales with affected nodes |

**Core Web Vitals — the metrics that define "slow" ([web.dev](https://web.dev/articles/vitals)):**

| Metric | Measures | Good | Typical culprit |
| --- | --- | --- | --- |
| LCP (Largest Contentful Paint) | Loading — main content visible | < 2.5s | Heavy images, slow server, render-blocking resources |
| INP (Interaction to Next Paint) | Responsiveness — tap/type to visual response | < 200ms | Long JS tasks, giant re-renders |
| CLS (Cumulative Layout Shift) | Visual stability | < 0.1 | Images without dimensions, injected banners |

**Budget cheatsheet:** frame ≈ 16ms · a "long task" ≥ 50ms · perceived-instant response ≤ 100–200ms.

## How this connects to the cases

- [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/) —
  "thousands of rows: slow initial render, laggy scroll, high memory" (too many nodes)
- [The input lags while typing](/playbooks/frontend-performance/case-janky-input/) —
  "every keystroke re-runs expensive work" (pipeline runs too often)
- [Your images are slow](/playbooks/frontend-performance/case-slow-images/) — "LCP in
  seconds, layout jumps" (loading, not rendering)
- [The UI freezes](/playbooks/frontend-performance/case-frozen-ui/) — "a computation
  holds the thread; zero frames paint" (JS starves the pipeline entirely)

## Primary sources

- [web.dev — Rendering performance](https://web.dev/articles/rendering-performance) — the pixel pipeline, stage by stage; the source of the diagram above.
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals) — definitions and thresholds for LCP, INP, CLS.
- [MDN — CSS performance optimization](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS) — which properties trigger layout vs paint vs composite.
- [react.dev — Render and Commit](https://react.dev/learn/render-and-commit) — React's own model of the render → commit split.
- [web.dev — Optimize long tasks](https://web.dev/articles/optimize-long-tasks) — the 50ms task guideline and how to yield.
