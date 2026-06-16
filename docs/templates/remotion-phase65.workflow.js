export const meta = {
  name: 'remotion-phase65-ads-promo',
  description: 'Phase 65 — Remotion: Ads & Promo (12 resources)',
  phases: [{ title: 'Generate', detail: 'un agente por recurso Remotion' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'remotion'

const STYLE = `REMOTION DESIGN SYSTEM (match exactly):
- Framework: Remotion (React). All components are React functional components using Remotion hooks.
- ALWAYS import from "remotion": AbsoluteFill, Composition, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, Sequence.
- Composition: 1280×720, 30fps. Duration varies by resource (typically 90–180 frames).
- Font: system-ui, -apple-system, sans-serif (no external font loading in Remotion TSX).
- Dark bg default: #0a0a0f or #0d0d14. Use vivid accent colors that pop on dark.
- Animation pattern: spring() for entrances, interpolate() with Easing for smooth transitions.
- extrapolateLeft:"clamp", extrapolateRight:"clamp" on all interpolate calls.
- Each sub-component receives frame and fps props.
- globalOpacity = interpolate(frame, [durationInFrames-20, durationInFrames], [1, 0]) for fade-out.
- Use inline styles only (no CSS files for Remotion).
- Export BOTH the main composition component AND RemotionRoot (with <Composition>).
- No external dependencies beyond remotion and react.
- Realistic, polished data. Multiple animated elements. No TODOs.`

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`
  const durationFrames = s.durationFrames || 120

  return `You are generating ONE production-quality Remotion animation resource.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
DURATION: ${durationFrames} frames at 30fps = ${Math.round(durationFrames/30)} seconds
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths):

1. ${dir}/index.mdx — with EXACTLY this frontmatter:
---
slug: ${s.slug}
title: "${s.title}"
description: "<ONE-LINE rich description 55-90 words, no internal double-quotes, describe the animation timing and visual style>"
category: remotion
type: animation
tags: [remotion, ${s.tags}]
tech: [remotion, react, typescript]
difficulty: ${s.difficulty}
targets: [react]
collections: [remotion]
license: MIT
createdAt: 2026-06-12
updatedAt: 2026-06-12
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
---

## ${s.title.replace(/ \(Remotion\)$/, '')}

<2-3 short paragraphs describing what the animation shows, timing breakdown, and customizable constants.>

### Composition specs

| Property | Value |
|---|---|
| Resolution | 1280 × 720 |
| FPS | 30 |
| Duration | ${Math.round(durationFrames/30)} s (${durationFrames} frames) |

### Timeline

<A table with 3-5 rows: Time | Action — describing the animation phases.>

2. ${dir}/snippets/react.tsx — the full Remotion component. Requirements:
   - All config constants at the top (UPPERCASE, easy to customize).
   - Multiple sub-components each handling one visual element.
   - spring() for all entrance animations. interpolate() with Easing for continuous motion.
   - Rich visual design: gradients, glows, badges, counters, or typographic effects as appropriate.
   - Export named main component + RemotionRoot with <Composition id="..." component={...} durationInFrames={${durationFrames}} fps={30} width={1280} height={720} />.
   - globalOpacity fade-out in last 20 frames.

QUALITY BAR: cinematic feel, smooth spring animations, layered depth (background glow + midground + foreground), realistic copy/data, no placeholders.

After writing both files, return your result as JSON with: slug, files (array of paths written), summary.`
}

const SPECS = [
  // ── Video Ads ──────────────────────────────────────────────────────
  {
    slug: 'remotion-product-ad',
    title: 'Product Ad Spot (Remotion)',
    difficulty: 'med',
    durationFrames: 150,
    tags: 'ads, product, marketing, commercial',
    build: 'A 5-second product advertisement spot. Shows a product hero image placeholder (colored card) zoom-in, product name animates letter-by-letter, key benefits (3 bullet points) stagger in one by one, price badge springs up with a pulse, and a strong CTA button appears last with a shimmer effect. Use bold typography and vivid brand color (electric blue #2563eb on dark bg). Realistic product: "ProFlow X1 — Wireless Earbuds".',
  },
  {
    slug: 'remotion-app-promo',
    title: 'App Store Promo (Remotion)',
    difficulty: 'med',
    durationFrames: 180,
    tags: 'app, promo, mobile, store, ios, android',
    build: 'A 6-second app store promo. Phone mockup (rounded rectangle) slides in from bottom with spring, app screenshots (3 colored panels) carousel inside the phone, app name and rating (5 stars animate one by one) appear above, download count counter animates up (0→500k), then App Store and Play Store badge shapes appear. Dark bg with purple gradient glow (#7c3aed). App: "Habito — Daily Habit Tracker".',
  },
  {
    slug: 'remotion-sale-spot',
    title: 'Sale Announcement Spot (Remotion)',
    difficulty: 'easy',
    durationFrames: 90,
    tags: 'sale, discount, announcement, retail',
    build: 'A 3-second sale announcement. Bold "SALE" text explodes in with scale spring (0→1.2→1), discount percentage (50% OFF) slides in from left with elastic spring, original price strikethrough fades in, new price bounces in, confetti-style colored dots scatter across the screen (5-8 positioned divs with staggered float-up animations). Bright, energetic: red-orange #ef4444 on off-black. Brand: "ShopNow".',
  },
  {
    slug: 'remotion-flash-sale',
    title: 'Flash Sale Countdown Ad (Remotion)',
    difficulty: 'med',
    durationFrames: 150,
    tags: 'flash-sale, countdown, urgency, timer',
    build: 'A 5-second flash sale ad with urgency. "FLASH SALE" header pulses (scale oscillates 1→1.05→1 continuously). A live countdown timer shows HH:MM:SS computed from frame number (start from 01:30:00 counting down). Each digit segment has its own color-flash on change. Deal text ("Up to 70% off electronics") slides in. Stock bar animates from 100%→35% width showing "Only 12 left!". Urgent red #dc2626 + amber #f59e0b palette on dark.',
  },

  // ── Seasonal & Events ──────────────────────────────────────────────
  {
    slug: 'remotion-holiday-promo',
    title: 'Holiday Promo (Remotion)',
    difficulty: 'med',
    durationFrames: 150,
    tags: 'holiday, seasonal, christmas, promo',
    build: 'A 5-second holiday promo. Snowflake particles (6-8 divs) drift down at different speeds using interpolate on Y position. "Happy Holidays" headline writes itself character by character. A gift box shape (nested divs) unwraps (lid slides up with spring). Offer text ("25% off everything — use code HOLIDAY25") appears with stagger. Warm palette: deep forest green #166534 + gold #fbbf24 + white on dark charcoal #111827.',
  },
  {
    slug: 'remotion-black-friday',
    title: 'Black Friday Deal (Remotion)',
    difficulty: 'med',
    durationFrames: 120,
    tags: 'black-friday, deals, sale, promo',
    build: 'A 4-second Black Friday video. Dramatic dark bg (#000000). "BLACK FRIDAY" text slams in from top (translateY spring from -200 to 0) with dramatic shadow. "STARTS NOW" flashes with opacity pulse. Deal grid: 3 deal cards (product name, original/sale price, % off badge) stagger in from sides. A glowing countdown "ENDS IN 24:00:00" at bottom. Neon yellow #facc15 + white on pure black. Intense, high-contrast.',
  },
  {
    slug: 'remotion-event-promo',
    title: 'Event Promo Teaser (Remotion)',
    difficulty: 'med',
    durationFrames: 150,
    tags: 'event, promo, teaser, conference',
    build: 'A 5-second event promo teaser. Particle background (8 small glowing dots moving in slow arcs). Event logo/name ("DEVCONF 2026") scales in with spring. Date and location ("June 20–22 · San Francisco") slide in from bottom. Speaker headshots (3 circular avatar placeholders with colored gradients) appear with stagger spring. "Register Now" CTA pulsing. Tech blue #3b82f6 + purple #a855f7 gradient on dark navy #0f172a.',
  },
  {
    slug: 'remotion-webinar-promo',
    title: 'Webinar Promo (Remotion)',
    difficulty: 'easy',
    durationFrames: 120,
    tags: 'webinar, promo, education, live',
    build: 'A 4-second webinar promo. "FREE WEBINAR" badge pulses in top-left. Webinar title ("Mastering Modern React in 2026") large typography slides in. Host info (avatar circle + name + title) fades in below. Date/time chip ("Tue Jun 18 · 3:00 PM EST") slides in from right. "Save Your Spot" button springs up with arrow. Live viewer count animates (0→1,247). Clean teal #0d9488 + white on slate #1e293b.',
  },

  // ── Retail Hooks ──────────────────────────────────────────────────
  {
    slug: 'remotion-coupon-reveal',
    title: 'Coupon Reveal Animation (Remotion)',
    difficulty: 'easy',
    durationFrames: 90,
    tags: 'coupon, reveal, discount, code',
    build: 'A 3-second coupon reveal. A coupon card (dashed border, warm background) scales in with spring. Scissors icon (two overlapping circles + line) animates cutting across the top edge. Coupon code ("SAVE20") reveals character by character with typewriter effect. "20% OFF" in large bold text bounces in. Expiry "Valid until Jun 30" fades in. Confetti dots burst from center. Warm: amber #f59e0b + cream #fef3c7 on dark #1c1917.',
  },
  {
    slug: 'remotion-discount-banner',
    title: 'Discount Banner (Remotion)',
    difficulty: 'easy',
    durationFrames: 90,
    tags: 'discount, banner, sale, retail',
    build: 'A 3-second animated discount banner. Wide horizontal banner format (1280×200 content area centered). Scrolling ticker text ("FREE SHIPPING on orders over $50") moves RTL using interpolate on translateX. Large "15% OFF" badge rotates in (spring rotation 0→360 then settles). Brand name "Luxe Store" with logo placeholder. Shop link animates underline. Gradient banner: violet #7c3aed → pink #db2777. Clean and bold.',
  },
  {
    slug: 'remotion-limited-offer',
    title: 'Limited-Time Offer (Remotion)',
    difficulty: 'med',
    durationFrames: 150,
    tags: 'limited, offer, urgency, scarcity',
    build: 'A 5-second limited-time offer spot. "LIMITED OFFER" stamp rotates in (spring from -20deg to 2deg tilt). Product card slides up: image placeholder, name ("Artisan Coffee Bundle"), original price struck through. Sale price in large green. Urgency bar: "Only 8 left in stock" with animated stock indicator (dots, 3 filled + 7 empty, fill animates). Countdown clock from 2:00:00 counting down via frame math. CTA with shake micro-animation every 2s. Earthy green #15803d + amber on dark.',
  },
  {
    slug: 'remotion-giveaway',
    title: 'Giveaway Announcement (Remotion)',
    difficulty: 'easy',
    durationFrames: 120,
    tags: 'giveaway, contest, social, announcement',
    build: 'A 4-second giveaway announcement. "GIVEAWAY" text explodes in with scale spring (0→1.3→1) in rainbow gradient. Prize box (emoji-style rectangle with ribbon) bounces in. Prize description ("Win a $500 Tech Bundle!") types in. Entry count animates up (0→4,231 entries). 3 steps to enter (follow, like, tag) stagger in with check marks animating. "Enter Now" pulsing button. Vibrant: pink #ec4899 + yellow #fbbf24 + cyan #06b6d4 on dark. Celebratory confetti dots.',
  },
]

phase('Generate')
log(`Phase 65 — Remotion: Ads & Promo. Generando ${SPECS.length} recursos…`)

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
log(`Completados: ${ok.length}/${SPECS.length}`)

return {
  requested: SPECS.length,
  completed: ok.length,
  resources: ok.map((r) => ({ slug: r.slug, fileCount: (r.files || []).length })),
}
