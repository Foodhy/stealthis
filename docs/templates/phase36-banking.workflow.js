// ===========================================================================
// Phase 36 — Banking / Fintech Theme. Collection: fintech. 23 resources (A–E).
// ===========================================================================

export const meta = {
  name: 'phase36-banking-build',
  description: 'Build 23 Banking/Fintech resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'fintech'

const STYLE = `DESIGN SYSTEM (Banking / Fintech — trust-first, dense-but-calm; match exactly unless a palette override is given):
- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif. Use tabular figures for all money/amounts (font-variant-numeric: tabular-nums).
- Default palette in :root —
  --navy:#0e1b3a; --navy-2:#16264d; --ink:#0e1726; --ink-2:#3a4660; --muted:#697089;
  --accent:#3b6ef6; --accent-d:#2a55cc; --accent-50:#eaf0ff;     /* trust blue */
  --teal:#0fb5a6; --violet:#7c5cff;                              /* secondary accents */
  --bg:#f5f7fb; --surface:#ffffff; --line:rgba(14,27,58,0.10); --line-2:rgba(14,27,58,0.18);
  --ok:#1f9d62; --warn:#d9982b; --danger:#d4493e; --credit:#1f9d62; --debit:#0e1726;
  radii: --r-sm:8px --r-md:14px --r-lg:20px; soft layered shadows.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- Money UI conventions: right-align amounts, color credits green / debits ink, masked card numbers (•••• 4242), security/verification cues (lock icons, "verified" badges, 2FA), clear status pills (pending/cleared/failed).
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons & inputs.
- Responsive: works down to ~360px (add a @media (max-width:520px) section). Mobile-first feel for customer screens.
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional names, merchants, amounts, IBANs/card numbers.`

const DISCLAIMER = '> Illustrative UI only — **not** real banking software or financial advice.'

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${COLLECTION}${s.tags ? ', ' + s.tags : ''}]`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (fill description yourself), then the prose body:

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
createdAt: 2026-06-16
updatedAt: 2026-06-16
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Banking/Fintech theme. Self-contained, polished, visually distinctive — not a generic placeholder.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, Inter <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, status badges, smooth micro-interactions, a genuinely interactive script. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ── 36.A Customer / Account ─────────────────────────────────────────────
  { slug: 'bank-dashboard', title: 'Banking — Account Overview', category: 'pages', difficulty: 'hard', tags: 'dashboard, accounts',
    build: 'Account overview dashboard: total balance hero, account cards (checking/savings/credit), spending donut by category, recent transactions list, quick actions (transfer/pay/deposit), upcoming bills. Interactive: toggle hide/show balances, switch accounts, filter recent tx.' },
  { slug: 'bank-transactions', title: 'Banking — Transactions', category: 'pages', difficulty: 'hard', tags: 'transactions, ledger',
    build: 'Full transaction history: searchable/filterable list grouped by date, category icons, credit/debit coloring, running balance, status pills (pending/cleared). Interactive: search, filter by type/category/date range, expand a row for detail, export button (toast).' },
  { slug: 'bank-transfer', title: 'Banking — Send Money', category: 'pages', difficulty: 'hard', tags: 'transfer, payments',
    build: 'Send-money / transfer flow: pick payee (saved + new), enter amount with keypad, choose source account, add note, review screen, then success. Interactive: multi-step flow, amount validation against balance, confirm with 2FA mock, success animation.' },
  { slug: 'bank-card-detail', title: 'Banking — Card Detail', category: 'pages', difficulty: 'med', tags: 'cards, controls',
    build: 'Card management screen: animated card visual (masked PAN, flip for CVV), freeze/unfreeze toggle, spending limit slider, create virtual card, card transactions list, settings (online/contactless/ATM toggles). Interactive: freeze toggle changes card state, limit slider, copy card number.' },
  { slug: 'bank-statements', title: 'Banking — Statements', category: 'pages', difficulty: 'easy', tags: 'statements, documents',
    build: 'Statements & documents page: monthly statement list with period, balance, download; tax docs section; filter by year. Interactive: year filter, download (toast), preview modal.' },
  { slug: 'bank-invest', title: 'Banking — Investing', category: 'pages', difficulty: 'hard', tags: 'investing, portfolio',
    build: 'Investing/portfolio screen: portfolio value with gain/loss, holdings list (ticker, shares, value, % change), allocation donut, a simple line chart (CSS/SVG/canvas), buy/sell panel. Interactive: timeframe tabs redraw chart, buy/sell modal, holding detail.' },

  // ── 36.B Fintech Patterns ───────────────────────────────────────────────
  { slug: 'bank-balance-card', title: 'Banking — Balance Card', category: 'ui-components', difficulty: 'easy', tags: 'pattern, card',
    build: 'Reusable account balance card: account name/type, masked number, balance with tabular figures, small sparkline, hide/show toggle, quick actions. Show 3 variants (checking/savings/credit) in a grid.' },
  { slug: 'bank-transaction-row', title: 'Banking — Transaction Row', category: 'ui-components', difficulty: 'easy', tags: 'pattern, list',
    build: 'Reusable transaction row component: merchant icon/avatar, name, category, date, amount (credit green/debit ink), status pill. Show a list of ~10 with hover, expand-on-click for details, pending vs cleared states.' },
  { slug: 'bank-amount-input', title: 'Banking — Amount Keypad', category: 'ui-components', difficulty: 'med', tags: 'pattern, input',
    build: 'Currency amount input with on-screen keypad: large formatted amount display, decimal handling, currency symbol, quick-amount chips, max/balance hint, shake on invalid. Interactive numeric keypad + backspace.' },
  { slug: 'bank-card-visual', title: 'Banking — Virtual Card Visual', category: 'ui-components', difficulty: 'med', tags: 'pattern, card',
    build: '3D-ish flippable bank card component: gradient/brand face, chip, masked PAN, holder, expiry; flip to show CVV. Show 3 themes (metal black, gradient, minimal white). Interactive: click to flip, copy number, reveal/hide.' },
  { slug: 'bank-spend-chart', title: 'Banking — Spending Breakdown', category: 'ui-components', difficulty: 'med', tags: 'pattern, chart',
    build: 'Spending breakdown widget: donut chart by category (CSS conic-gradient or SVG), legend with amounts & %, month switcher, total in center. Interactive: hover/click segment highlights legend, month toggle updates data.' },
  { slug: 'bank-otp-input', title: 'Banking — OTP / 2FA Input', category: 'ui-components', difficulty: 'easy', tags: 'pattern, security',
    build: '6-digit OTP/2FA input: auto-advance boxes, paste support, masked option, resend countdown timer, error/success states. Interactive: typing advances, paste fills all, verify button validates a mock code.' },

  // ── 36.C KYC / Onboarding ───────────────────────────────────────────────
  { slug: 'bank-onboard-signup', title: 'Banking — Account-Open Wizard', category: 'pages', difficulty: 'hard', tags: 'kyc, onboarding',
    build: 'Multi-step account opening (KYC) wizard: progress steps (personal info → address → ID → review), inline validation, document/selfie upload mock, terms, success. Interactive: step navigation with validation gating, progress bar, summary review.' },
  { slug: 'bank-id-verify', title: 'Banking — ID Verification', category: 'ui-components', difficulty: 'med', tags: 'kyc, security',
    build: 'ID/document verification step: choose doc type, upload front/back drop zones with preview, selfie/liveness mock, scanning animation, verified result. Interactive: drag-drop upload preview, simulated scan progress, success/fail states.' },
  { slug: 'bank-success-funded', title: 'Banking — Account Funded', category: 'pages', difficulty: 'easy', tags: 'onboarding, success',
    build: 'Account funded / welcome success screen: celebratory hero, confetti, new account number + virtual card reveal, next-step checklist (set up direct deposit, order card, invite). Interactive: confetti animation, checklist toggles, copy account number.' },

  // ── 36.D Admin / Ops ────────────────────────────────────────────────────
  { slug: 'bank-admin-dashboard', title: 'Banking — Ops Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, ops',
    build: 'Internal ops dashboard: KPIs (transaction volume, active users, fraud flags, KYC queue), volume chart, fraud-alert feed, KYC approval queue, recent disputes. Interactive: timeframe toggle, approve/reject KYC rows, dismiss alerts.' },
  { slug: 'bank-admin-customer', title: 'Banking — Customer Detail', category: 'pages', difficulty: 'med', tags: 'admin, crm',
    build: 'Admin customer detail: profile header with risk score, accounts list, recent activity, KYC status, action toolbar (freeze, flag, message). Interactive: tabs (overview/accounts/activity/notes), risk badge, action buttons with toasts.' },
  { slug: 'bank-admin-disputes', title: 'Banking — Disputes Queue', category: 'pages', difficulty: 'med', tags: 'admin, disputes',
    build: 'Chargeback/dispute queue: table of disputes (amount, reason, status, age, customer), filter by status, detail drawer with evidence, resolve actions (accept/reject/escalate). Interactive: filters, open drawer, status transitions.' },

  // ── 36.E Themed Fintech Landings (5) ────────────────────────────────────
  { slug: 'bank-landing-neobank', title: 'Banking — Neobank Landing', category: 'pages', difficulty: 'hard', tags: 'landing, neobank',
    palette: 'Neobank (Revolut/N26-style) — White + electric violet (#7c5cff) + soft lilac · bold modern sans · playful, app-first, energetic',
    build: 'Full marketing landing for a neobank: phone-mockup hero with app screens, killer feature grid (instant cards, FX, budgeting), social proof, pricing tiers, animated app showcase, big CTA, footer. Mobile nav, scroll reveal, animated counters.' },
  { slug: 'bank-landing-traditional', title: 'Banking — Traditional Bank Landing', category: 'pages', difficulty: 'med', tags: 'landing, retail-bank',
    palette: 'Traditional retail bank — Navy #0e1b3a + gold #c8a24b + ivory · serif accent headlines + sans body · stable, trusted, established',
    build: 'Full marketing landing for a traditional retail bank: trust-forward hero, product cards (checking, savings, mortgage, loans), branch/ATM locator teaser, rates table, testimonials, security assurances, CTA, footer. Mobile nav, smooth scroll.' },
  { slug: 'bank-landing-business', title: 'Banking — Business Banking Landing', category: 'pages', difficulty: 'med', tags: 'landing, b2b',
    palette: 'Business / SMB banking — Slate #16264d + green #1f9d62 + white · clean efficient sans · B2B, productive, professional',
    build: 'Full marketing landing for business/SMB banking: hero with dashboard mockup, features (multi-user, invoicing, expense cards, integrations), pricing by team size, logos, case study, CTA, footer. Mobile nav, pricing toggle, reveal.' },
  { slug: 'bank-landing-lending', title: 'Banking — Lending / BNPL Landing', category: 'pages', difficulty: 'med', tags: 'landing, lending',
    palette: 'Lending / BNPL — Warm white + coral #ff6b5e + mint · friendly rounded sans · fast, approachable, optimistic',
    build: 'Full marketing landing for a lending/BNPL product: hero with "split in 4" calculator, how-it-works steps, eligibility, partner merchants, rates/terms, FAQ, CTA, footer. Interactive payment calculator, mobile nav, accordion FAQ.' },
  { slug: 'bank-landing-wealth', title: 'Banking — Wealth / Investing Landing', category: 'pages', difficulty: 'hard', tags: 'landing, wealth',
    palette: 'Wealth / investing — Charcoal #14181f + emerald #0fb5a6 + bone · refined serif display + sans · premium, calm, sophisticated',
    build: 'Full marketing landing for a wealth/investing platform: elegant hero with portfolio chart mockup, features (advisory, auto-invest, tax-loss harvesting), performance band, pricing/fees, trust & credentials, testimonials, CTA, footer. Animated chart, reveal, mobile nav.' },
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
