// ===========================================================================
// Phase 62 — Pricing & Paywall  (collection: patterns, prefix: pay-)
// ===========================================================================
export const meta = {
  name: 'pay-phase62-finish',
  description: 'Generate Phase 62 — Pricing & Paywall (16 resources, mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'un agente por recurso' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'patterns'

const STYLE = `DESIGN SYSTEM (match exactly unless told otherwise):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif.
- Neutral product-UI palette in :root —
  --brand:#5b5bf0; --brand-d:#4646d6; --brand-700:#3a3ab8; --brand-50:#eef0ff;
  --accent:#00b4a6; --accent-soft:#d8f5f2;
  --ink:#101322; --ink-2:#3a4060; --muted:#6c7393;
  --bg:#f6f7fb; --white:#ffffff; --surface:#ffffff;
  --line:rgba(16,19,34,0.1); --line-2:rgba(16,19,34,0.16);
  --ok:#2f9e6f; --warn:#d98a2b; --danger:#d4503e;
  radii: --r-sm:8px --r-md:14px --r-lg:20px; soft shadows (0 1px 2px / 0 8px 24px rgba(16,19,34,.08)).
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background, centered max-width container.
- Accessible: aria where relevant (role=dialog/aria-modal for modals, aria-live for dynamic counts), WCAG AA contrast, keyboard-usable buttons, focus-visible rings, Esc closes overlays.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Use simple inline SVG icons/illustrations (no external assets, no <img>).
- Realistic but clearly fictional names/data (fictional SaaS brand, e.g. "Northwind", "Lumen", plans Starter/Pro/Scale).`

const DISCLAIMER = ''

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

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
createdAt: 2026-06-13
updatedAt: 2026-06-13
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>${DISCLAIMER ? '\n\n' + DISCLAIMER : ''}`

  return `You are generating ONE production-quality static UI demo resource for a "Pricing & Paywall" pattern library. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling pricing data, multiple plan cards/rows with feature lists and prices, clear hierarchy, a highlighted "Most popular" tier where relevant, hover/active/focus states, badges, smooth micro-interactions, and genuinely interactive JS (toggles update prices, modals open/close, counters tick). No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 62.A — Pricing Tables
  { slug: 'pay-pricing-3tier', title: 'Pricing — Classic 3-tier table', category: 'ui-components', difficulty: 'easy', tags: 'pricing, plans',
    build: 'Three side-by-side plan cards (Starter / Pro / Scale) with price, short tagline, feature checklist (check/x SVG icons), and a CTA button each. Middle "Pro" card visually highlighted with a "Most popular" ribbon, brand border and subtle lift. JS: clicking a CTA flashes a toast "Selected the {plan} plan". Hover raises cards.' },
  { slug: 'pay-pricing-toggle', title: 'Pricing — Monthly/annual toggle', category: 'ui-components', difficulty: 'med', tags: 'pricing, billing-toggle',
    build: 'Same 3-tier layout but with a Monthly | Annual segmented toggle at the top showing a "Save 20%" badge on annual. JS: toggling animates the displayed prices (number count-up/swap) between monthly and annual figures, updates the per-period label (/mo vs /yr billed annually), and persists choice via aria-pressed. Keyboard-operable toggle.' },
  { slug: 'pay-pricing-slider', title: 'Pricing — Usage slider (price scales)', category: 'ui-components', difficulty: 'hard', tags: 'pricing, usage-based',
    build: 'A single pricing card with a range slider for a usage metric (e.g. monthly active users or API calls). Dragging the slider updates the computed price in real time using tiered/stepped pricing, shows the current tier name, included quota, and overage rate. Display a small breakdown (base + usage). aria-valuenow/valuetext on slider, live region announces price. Tick marks and a filled track.' },
  { slug: 'pay-pricing-compare', title: 'Pricing — Feature comparison matrix', category: 'ui-components', difficulty: 'med', tags: 'pricing, comparison',
    build: 'A full feature-comparison table: rows = features grouped into sections (Core, Collaboration, Security, Support), columns = plans. Cells show check/x SVG or specific values (e.g. "10 GB", "Unlimited"). Sticky header row with plan names + prices + CTA. JS: a "highlight a plan" interaction dims other columns; collapsible feature groups. Horizontal scroll on mobile with sticky first column.' },
  { slug: 'pay-pricing-single', title: 'Pricing — Single-plan / one-price layout', category: 'ui-components', difficulty: 'easy', tags: 'pricing, single-plan',
    build: 'A centered single-plan hero card: big price, "Everything included" headline, two columns of feature checkmarks, a money-back guarantee line, and one prominent CTA. A small FAQ accordion (3-4 items) below. JS: accordion expand/collapse with aria-expanded; CTA toast.' },
  { slug: 'pay-pricing-enterprise', title: 'Pricing — Tiers + Contact-sales enterprise card', category: 'ui-components', difficulty: 'easy', tags: 'pricing, enterprise',
    build: 'Three priced tiers plus a fourth distinct "Enterprise" card with no price — instead "Custom" and a "Contact sales" CTA, listing enterprise-only features (SSO, SLA, dedicated support). JS: "Contact sales" opens a small inline lead form (name, work email, company size select) that validates and shows a success state. Esc/overlay closes.' },

  // 62.B — Paywalls & Gates
  { slug: 'pay-paywall-hard', title: 'Paywall — Hard paywall (full block)', category: 'ui-components', difficulty: 'easy', tags: 'paywall, gate',
    build: 'An article page where after the first paragraph the rest of the content is fully replaced by a hard paywall card: lock icon, "Subscribe to keep reading", two plan options, and Sign-in link. No content leaks below. JS: plan select highlights and updates a "Continue with {plan}" button; sign-in link toggles a tiny inline form. Clean, centered gate card with backdrop.' },
  { slug: 'pay-paywall-soft', title: 'Paywall — Soft / metered paywall', category: 'ui-components', difficulty: 'med', tags: 'paywall, metered',
    build: 'A metered paywall: shows "X of 5 free articles left this month" counter. Article text fades to transparent (gradient mask) near the bottom with a "You have N free reads left — subscribe for unlimited" bar that slides up. JS: a "Read another (simulate)" button decrements the meter via aria-live; at 0 it hardens into a full block. Counter ring/progress visual.' },
  { slug: 'pay-paywall-blur', title: 'Paywall — Blur-locked premium content', category: 'ui-components', difficulty: 'easy', tags: 'paywall, blur',
    build: 'A dashboard/report card where premium sections are CSS-blurred (filter: blur) with a centered lock overlay and "Unlock with Pro" button. Show 2-3 blurred metric tiles/charts (use simple SVG bars). JS: clicking unlock removes blur with a smooth transition and reveals the real numbers (demo-only), swapping the overlay for an "Unlocked" toast.' },
  { slug: 'pay-feature-gate', title: 'Paywall — Inline feature-locked gate (pro badge)', category: 'ui-components', difficulty: 'easy', tags: 'paywall, feature-gate',
    build: 'A settings/toolbar UI where some controls carry a "PRO" pill and are disabled. Hovering or clicking a locked control pops a small tooltip/popover: "This is a Pro feature" with an Upgrade button. JS: popover positioning, focus management, and an "upgrade" action that (demo) unlocks the gated rows with a state change. Locked rows show a lock SVG.' },

  // 62.C — Upsell, Trial & Nudges
  { slug: 'pay-upgrade-modal', title: 'Upsell — Upgrade modal (plan compare)', category: 'ui-components', difficulty: 'med', tags: 'upsell, modal',
    build: 'A trigger button "Upgrade" opens a modal dialog (role=dialog, aria-modal, focus trap, Esc/overlay close) comparing the current plan vs the recommended upgrade side by side, highlighting newly unlocked features and the price delta. A monthly/annual toggle inside. Confirm button shows a success/processing state. Smooth open/close transition.' },
  { slug: 'pay-trial-banner', title: 'Upsell — Trial countdown banner', category: 'ui-components', difficulty: 'easy', tags: 'trial, banner',
    build: 'A top-of-app banner: "Your Pro trial ends in N days" with a live-ish countdown, a progress bar of trial usage, an "Add billing" CTA, and a dismiss X. JS: a real countdown updating from a fixed fictional end timestamp (days/hours), dismiss collapses the banner, and a state when expired switches the banner to a red "Trial ended" variant. aria-live polite.' },
  { slug: 'pay-usage-limit', title: 'Upsell — Usage-limit reached prompt', category: 'ui-components', difficulty: 'easy', tags: 'limit, nudge',
    build: 'A card/inline prompt that appears when a quota is hit: "You\'ve used all 1,000 of your monthly credits." Show a usage progress bar at 100%, the reset date, and two CTAs: "Upgrade plan" and "Buy add-on credits". JS: an add-on quantity stepper that updates the price and a "purchase" success state that visually adds credits back and shrinks the bar.' },
  { slug: 'pay-addon-upsell', title: 'Upsell — Add-on / cross-sell at checkout', category: 'ui-components', difficulty: 'med', tags: 'upsell, cross-sell',
    build: 'A checkout summary panel for a base plan with a list of optional add-ons (extra seats, priority support, extra storage) as toggle/checkbox cards with prices. JS: toggling add-ons live-updates an order summary (subtotal, tax, total) with smooth number changes, a seat-count stepper, and a "Recommended" badge on one add-on. Sticky total + checkout button.' },
  { slug: 'pay-discount-offer', title: 'Upsell — Win-back / discount offer modal', category: 'ui-components', difficulty: 'easy', tags: 'discount, retention',
    build: 'An exit-intent style modal: "Wait! Here\'s 30% off your first 3 months". Big discount badge, comparison of old vs new price (strikethrough), a copyable promo code field, and "Claim offer" / "No thanks" actions. JS: copy-to-clipboard with a copied toast, a small urgency countdown, focus trap, Esc closes. Confetti-free but celebratory accent.' },
  { slug: 'pay-cancel-flow', title: 'Retention — Cancellation / downgrade flow', category: 'pages', difficulty: 'med', tags: 'cancellation, retention',
    build: 'A multi-step cancellation/retention page: Step 1 cancel reason (radio list), Step 2 a tailored retention offer based on reason (pause subscription, switch to cheaper plan, or discount), Step 3 confirm + feedback textarea, then a final confirmation screen. JS: step navigation with a progress indicator, the offer step adapts to the chosen reason, "Accept offer" diverts to a saved-state, "Confirm cancel" shows the goodbye screen. Back/next, aria-current on steps.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos "${COLLECTION}" (Phase 62 — Pricing & Paywall)…`)

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
