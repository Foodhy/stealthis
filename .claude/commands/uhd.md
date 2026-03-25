---
description: Create a new UHD (Ultra High Definition) showcase landing page
argument-hint: <brand-name> [description]
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent, mcp__claude_ai_Stealthis__search, mcp__claude_ai_Stealthis__get_snippet, mcp__claude_ai_Stealthis__get_resource, mcp__claude_ai_Stealthis__list_resources]
---

# Create UHD Landing Page

You are building a new **Ultra High Definition (UHD)** showcase landing page for the stealthis project. UHD pages are premium, production-quality demos that compose multiple stealthis patterns (glassmorphism, scroll animations, gradient mesh, CSS mockups, etc.) into a cohesive landing page inspired by a real brand.

## Input

The user provides: `$ARGUMENTS`

Parse the first word as the **brand name** (e.g. "spotify", "nike", "tesla"). Everything after is an optional description of the desired page.

## Step 1 — Determine the next slug number

Find the highest existing UHD resource number:

```bash
ls packages/content/resources/ | grep 'lgc-.*-uhd-' | sort -t- -k2 -n | tail -1
```

The new resource slug will be `lgc-{NEXT_NUMBER}-uhd-{brand-name}` where NEXT_NUMBER is the highest + 1.

## Step 2 — Research the brand

Before designing, research what makes this brand's design distinctive:
- **Color palette**: What are the brand's signature colors? (e.g. Uber = black + #06C167 green, Spotify = #1DB954 green + dark)
- **Typography style**: Bold/clean/serif/rounded?
- **Design aesthetic**: Dark/light? Minimal? Playful? Corporate?
- **Key product/service**: What is the hero action? (ride, play music, buy shoes, etc.)
- **Sections that make sense**: What content sections fit this brand?

## Step 3 — Search stealthis for reusable patterns

Use the MCP tools to find existing resources that match the brand's needs:

```
mcp__claude_ai_Stealthis__search("glassmorphism")
mcp__claude_ai_Stealthis__search("hero")
mcp__claude_ai_Stealthis__search("scroll animation")
mcp__claude_ai_Stealthis__search("card")
```

Also read existing UHD pages for reference patterns:
- `lgc-80-uhd-apple-vision` — CSS device mockup, scroll reveal, spec counters, CTA rings
- `lgc-81-uhd-vercel` — Developer-focused, minimal
- `lgc-82-uhd-nintendo` — Playful, colorful
- `lgc-83-uhd-uber` — Dark glassmorphism, booking card, gradient mesh canvas, pinned scroll

## Step 4 — Design the page (plan before coding)

Design **6-8 sections** that tell a compelling story for this brand. Every UHD page MUST include:

### Required elements:
1. **Animated background** — Canvas 2D gradient mesh OR CSS gradient blobs (use brand colors)
2. **Hero section** — Full-viewport, massive headline, subtitle, primary CTA
3. **Feature/product showcase** — Cards or grid showing key offerings
4. **Scroll-pinned section** — At least one section using GSAP ScrollTrigger pin (300vh height)
5. **Animated stat counters** — Scroll-triggered number count-up with brand-relevant metrics
6. **CSS-only device mockup** — Phone, laptop, or product-specific illustration (NO external images)
7. **Glassmorphism elements** — At least one glass card with backdrop-filter
8. **Final CTA** — With expanding rings or gradient orbs

### Required technical patterns:
- **Lenis** smooth scroll via CDN script tag
- **GSAP + ScrollTrigger** via CDN script tag
- `.reveal` class pattern for scroll-triggered fade-in
- `prefers-reduced-motion` support (CSS + JS)
- Responsive breakpoints at 1024px, 768px, 480px
- CSS custom properties for the brand palette
- NO external images — everything CSS/SVG/Canvas
- NO importmap — use CDN `<script>` tags (same pattern as lgc-80)

## Step 5 — Create the files

Create exactly **4 files**:

### File structure:
```
packages/content/resources/lgc-{N}-uhd-{brand}/
├── index.mdx
└── snippets/
    ├── html.html
    ├── style.css
    └── script.js
```

### 5a. `index.mdx` — Frontmatter template:
```yaml
---
slug: lgc-{N}-uhd-{brand}
title: {Brand} UHD {Page Type} Page
description: A premium {theme}-themed {page-type} page inspired by {Brand} — featuring {key features list}.
category: ultra-high-definition-pages
type: page
tags:
  - {brand}
  - {relevant tags}
  - uhd
  - landing-page
  - gsap
  - scroll-animation
tech:
  - gsap
  - scrolltrigger
  - lenis
  - css
  - vanilla-js
  - canvas
difficulty: hard
targets:
  - html
labRoute: /web-pages/lgc-{N}-uhd-{brand}
collections:
  - hero
  - motion
license: MIT
createdAt: {TODAY}
updatedAt: {TODAY}
author:
  name: Stealthis
  src: https://github.com/nicholasoxford/stealthis
---
```

### 5b. `html.html` — Structure requirements:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Brand} | {Tagline}</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <!-- Canvas for gradient mesh background -->
  <canvas id="mesh-bg"></canvas>

  <main id="main">
    <!-- 6-8 semantic sections -->
    <!-- Use .reveal class on elements for scroll animation -->
    <!-- Use inline SVGs for all icons (no external images) -->
    <!-- CSS-only device mockups (no images) -->
  </main>

  <!-- CDN dependencies (same versions as lgc-80) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>
  <script src="./script.js"></script>
</body>
</html>
```

### 5c. `style.css` — Must include:
- CSS custom properties with brand palette (`:root` block)
- Canvas positioning (`position: fixed; inset: 0; z-index: 0;`)
- Glass card base class (`.glass-card` with `backdrop-filter`)
- `.reveal` class (opacity: 0, translateY for GSAP to animate)
- `.tag` badge class
- `.section-title` typography class
- Device mockup styles (phone/laptop/product with CSS only)
- Button styles
- `@media (prefers-reduced-motion: reduce)` overrides
- Responsive: `@media (max-width: 1024px)`, `768px`, `480px`

### 5d. `script.js` — Must include:
```javascript
// 1. Canvas gradient mesh (IIFE, brand-colored orbs)
// 2. Lenis init (autoRaf: false, driven by GSAP ticker)
// 3. GSAP + ScrollTrigger registration
// 4. Hero entrance timeline
// 5. Generic .reveal scroll animation
// 6. Feature cards stagger reveal
// 7. Pinned scroll section with step transitions
// 8. Stat counter count-up (data-target, data-suffix attributes)
// 9. Safety/feature stagger reveal
// 10. Device mockup mouse-tilt parallax (if !reduced)
// 11. CTA rings expansion
```

**Lenis + GSAP ticker setup** (copy exactly):
```javascript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  autoRaf: false,
});
gsap.registerPlugin(ScrollTrigger);
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```

**Reduced motion handling**:
```javascript
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dur = (d) => (reduced ? 0 : d);
```

## Step 6 — Regenerate catalog

After creating all files, run:
```bash
bun run --filter @stealthis/mcp catalog
```

Verify the new resource appears in the catalog output.

## Step 7 — Report

Tell the user:
- The slug and lab URL (`/web-pages/lgc-{N}-uhd-{brand}`)
- What sections were created
- Which stealthis patterns were reused
- How to preview: `bun run dev:lab` then navigate to the URL

## Quality checklist

Before finishing, verify:
- [ ] All 4 files created
- [ ] Frontmatter has correct category (`ultra-high-definition-pages`)
- [ ] labRoute matches slug pattern (`/web-pages/lgc-{N}-uhd-{brand}`)
- [ ] No external images — all CSS/SVG/Canvas
- [ ] CDN script tags match lgc-80 versions
- [ ] Responsive breakpoints present
- [ ] prefers-reduced-motion handled in both CSS and JS
- [ ] Canvas gradient mesh uses brand colors
- [ ] At least one glassmorphism element
- [ ] At least one pinned scroll section
- [ ] Stat counters with data-target/data-suffix
- [ ] Device mockup with mouse-tilt parallax
- [ ] MCP catalog regenerated
