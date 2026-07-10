---
title: "Your images make the page slow"
description: "Multi-MB images sent at the wrong size in the wrong format, all at once. Modern formats + srcset + lazy loading fix 90% of it — with honest notes on when you need a CDN and when you don't."
sidebar:
  label: "Images are slow"
playbook:
  area: "frontend-performance"
  situation: "Pages load slowly and jump around because images are heavy, oversized, or all load eagerly"
  symptoms: ["LCP in seconds", "layout jumps as images arrive", "megabytes of transfer on first load", "images sharp on desktop but page slow on mobile"]
  recommendation: "right-format-right-size-lazy-below-fold"
  complexity_before: "full-resolution originals, all eager"
  complexity_after: "modern format, viewport-sized, only above-the-fold eager"
  alternatives: ["image-cdn", "framework-image-component", "blur-placeholders", "leave-as-is"]
---

## The situation

The page works, but loading feels heavy — the hero takes seconds to appear, content
jumps as images pop in, and the Network tab shows 8MB of transfer for a page with a
dozen images. Lighthouse is yelling about LCP and "properly size images".

## Diagnosis: why it happens

Images are usually **most of a page's bytes**, and the waste compounds from three
independent mistakes:

1. **Wrong size.** Shipping a 4000px-wide original into a 400px slot sends ~100× the
   pixels the screen can show (pixels scale with width *squared*).
2. **Wrong format.** JPEG/PNG cost roughly 30–50% more bytes than WebP/AVIF at the same
   visual quality.
3. **Wrong timing.** All images load eagerly, so below-the-fold images compete for
   bandwidth with the hero image the user is actually waiting for — directly hurting
   LCP. And images without declared dimensions cause layout shift (CLS) as each arrival
   re-runs layout (see [Frontend fundamentals](/playbooks/frontend-performance/fundamentals/)).

Multiply the three and an 8MB page was really a ~400KB page wearing the wrong clothes.

## Recommendation: right format, right size, lazy below the fold

**Before** — one original for everyone, eager:
```html
<img src="/photos/hero-original.jpg" class="hero">      <!-- 4.2MB, 4000px -->
<img src="/photos/product-1.jpg" class="card-thumb">    <!-- 1.8MB for a 300px slot -->
```

**After** — modern format, responsive sizes, lazy where it should be:
```html
<!-- Hero: the LCP element. Eager + high priority. -->
<img src="/photos/hero-1200.avif"
     srcset="/photos/hero-800.avif 800w, /photos/hero-1200.avif 1200w, /photos/hero-2000.avif 2000w"
     sizes="100vw"
     width="1200" height="600"
     fetchpriority="high" alt="…">

<!-- Below the fold: lazy. -->
<img src="/photos/product-1-300.avif"
     srcset="/photos/product-1-300.avif 300w, /photos/product-1-600.avif 600w"
     sizes="(max-width: 600px) 50vw, 300px"
     width="300" height="300"
     loading="lazy" decoding="async" alt="…">
```

The rules, in priority order:

1. **Always `width`/`height`** (or CSS `aspect-ratio`) — reserves space, kills CLS. Free.
2. **AVIF/WebP** — build-time conversion (`sharp`) or your framework's image pipeline.
3. **`srcset` + `sizes`** — the browser picks the right resolution for the device.
4. **`loading="lazy"` below the fold only** — never on the LCP image; that *adds*
   delay. Give the hero `fetchpriority="high"` instead.

Watch what `width`/`height` alone buys — same slow images, with and without reserved
space:

<script src="/playbooks-demos.js"></script>

<pb-images></pb-images>

**When does it matter?** A text-heavy page with 3 small images already sub-100KB won't
feel different — check the Network tab before engineering. Where it always matters:
image-led pages (commerce, galleries, landings), mobile networks, and any LCP > 2.5s
where the LCP element is an image — that's this case almost by definition.

## Discarded alternatives (and when they ARE the right call)

### An image CDN (Cloudinary, imgix, Cloudflare Images)
- **What it solves:** everything above via URL parameters (`?w=400&format=auto`) at
  request time — no build pipeline, handles user-uploaded content, serves from edge.
- **Why it's not the first option here:** a paid dependency for what `<img srcset>` +
  build-time conversion do for free when your images are known at build time.
- **When it IS the right call:** **user-uploaded images** (you can't pre-generate what
  you haven't seen) or catalogs of thousands where build-time processing gets slow.

### The framework's image component (`next/image`, Astro `<Image>`)
- **What it solves:** generates the srcset/formats/dimensions automatically — the whole
  recommendation with less manual work and no forgotten `sizes`.
- **Why it's not the first option here:** it isn't discarded so much as *deferred*: use
  it if you're on such a framework. Knowing the manual mechanics still matters — a wrong
  `sizes` prop silently ships oversized images through these components too.
- **When it IS the right call:** any Next/Astro/Nuxt project — it's the default there,
  not the alternative.

### Blur-up placeholders / LQIP
- **What it solves:** *perceived* speed — a blurred preview appears instantly, so
  arrival feels smooth rather than abrupt.
- **Why it's not the first option here:** pure polish; changes zero bytes and zero LCP.
  Adding it before fixing sizes is decorating the slow.
- **When it IS the right call:** after the fundamentals, on image-led UIs (galleries,
  feeds) where the aesthetic matters. Cheap with framework support.

### Leaving it as is
- **What it solves:** no build pipeline, no variants to manage.
- **Why it's not the first option here:** the case starts from measured slowness.
- **When it IS the right call:** internal tools on office networks, pages with trivial
  image weight, prototypes. Even then, `width`/`height` attributes are free — do those.

## How to measure before and after

- **Lighthouse** (DevTools → Lighthouse): before/after LCP and CLS; the "Properly size
  images" audit tells you exactly which images and how many wasted KB.
- **Network tab**, filtered to Img, disable cache + throttle to Fast 4G: total image
  bytes and *whether below-the-fold images load at all* before you scroll (they
  shouldn't).
- The LCP element itself: Performance panel → LCP marker — confirm it's the hero image
  and watch its timestamp drop.

## Signals you need something else

- Images optimized but LCP still bad → the bottleneck is the server or render-blocking
  resources → [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/) if
  it's TTFB; check [fundamentals](/playbooks/frontend-performance/fundamentals/) for the
  rest.
- Hundreds of images in a scrolling list → the DOM is the problem too →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).
- User-uploaded images at scale → image CDN (above), and validate/resize at upload time.

## Related resources

- [Frontend fundamentals: the render pipeline](/playbooks/frontend-performance/fundamentals/)
- MDN — [Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images): `srcset`/`sizes` explained precisely
- web.dev — [Optimize LCP](https://web.dev/articles/optimize-lcp): the full LCP playbook, images included
- web.dev — [Browser-level lazy loading](https://web.dev/articles/browser-level-image-lazy-loading): how `loading="lazy"` behaves, and why not on the hero
