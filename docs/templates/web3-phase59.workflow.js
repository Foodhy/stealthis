// ===========================================================================
// Workflow — Phase 59 (Crypto / Web3 Theme) — 21 resources
// ===========================================================================
export const meta = {
  name: 'web3-phase59-finish',
  description: 'Generate the 21 Phase 59 web3 resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'web3'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Google Fonts via <link>: "Space Grotesk" (geometric display/UI, weights 400;500;600;700) + "JetBrains Mono" (addresses, numbers, hashes, weights 400;500;700). Use the mono font for ALL wallet addresses, token amounts, hashes, gas values.
- Dark-first default palette in :root —
  --bg:#0a0b0f; --surface:#13151c; --surface-2:#1b1e27; --elevated:#23262f;
  --text:#e9ecf2; --muted:#8a90a2; --line:rgba(255,255,255,0.08); --line-2:rgba(255,255,255,0.16);
  --accent:#7c5cff; --accent-2:#00e0c6; --accent-glow:rgba(124,92,255,0.45);
  --pos:#26d07c; --neg:#ff4d6d; --warn:#ffb347;
  radii: --r-sm:8px --r-md:14px --r-lg:20px --r-pill:999px;
- Web3 visual language: glassy surfaces (subtle backdrop-blur + translucent fills), neon/gradient accents,
  soft glow shadows on primary actions, gradient borders on hero cards, animated numbers, clear
  positive(green)/negative(red) coloring for price/PnL, monospace truncated addresses (0x1234…ab9f).
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable buttons, focus-visible rings.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build, NO web3/ethers libs). A small toast(msg) helper is good.
- Realistic but clearly fictional tokens/chains/projects (e.g. "NOVA", "Lumen Chain", "0x7a3f…c41d").
- Clear risk/confirm states for any signing/swap/send action.`

const DISCLAIMER = '> UI-only simulation — no real wallet, RPC, or on-chain calls. Mock data, fictional tokens.'

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
createdAt: 2026-06-09
updatedAt: 2026-06-09
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Crypto/Web3 collection. It must be self-contained, polished, and visually distinctive — not a generic placeholder. It is a UI-only SIMULATION: never make real network/wallet/on-chain calls; use mock data and fictional tokens/chains.

${STYLE}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling crypto content, multiple tokens/cards/rows, clear hierarchy, hover/active states, glassy surfaces + neon accents, monospace addresses/amounts, smooth micro-interactions, animated numbers where it fits, a genuinely interactive script. Clear confirm/risk states for swaps/sends/signing. No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 59.B — Patterns first
  { slug: 'web3-connect-wallet', title: 'Web3 — Connect Wallet Button + Modal', category: 'ui-components', difficulty: 'med', tags: 'wallet, modal, connect',
    build: 'A "Connect Wallet" button that opens a modal listing wallet options (MetaMask, Coinbase Wallet, WalletConnect, Rabby, Ledger) each with an icon and "Installed"/"Popular" badge. Clicking one shows a simulated connecting spinner then a connected state: the button becomes an address chip (0x7a3f…c41d) with a small balance and a green dot. JS: open/close modal (overlay, Esc, focus trap), simulate connect with delay, switch to connected chip, and a disconnect option in a dropdown. Glassy modal, neon accent, glow on primary.' },
  { slug: 'web3-address-chip', title: 'Web3 — Address Chip (truncate · copy · ENS)', category: 'ui-components', difficulty: 'easy', tags: 'address, ens, copy',
    build: 'A reusable wallet address chip component shown in several variants: raw truncated address (0x7a3f…c41d) in mono, an ENS-resolved variant (vitalik.eth with a tiny avatar gradient blockie), a copy-on-click chip (clipboard + toast + checkmark flip), and a chip linking to a block explorer. Show small/medium/large sizes and an "online" status dot. JS: copy to clipboard with toast, toggle between raw/ENS display, and a generated gradient "blockie" avatar derived from the address string.' },
  { slug: 'web3-tx-confirm', title: 'Web3 — Transaction Confirm / Signing Sheet', category: 'ui-components', difficulty: 'med', tags: 'confirm, signing, sheet',
    build: 'A bottom-sheet / modal transaction confirmation (signing request) like a wallet popup: shows the action ("Swap 1.5 ETH → 4,210 USDC"), from/to, network badge, a fee breakdown (network fee, est. total), a data/details expander showing raw calldata, and risk warnings if applicable. Big "Reject" and "Confirm" buttons. JS: confirm triggers a signing spinner → success state with a tx hash + explorer link; reject closes; details expander; Esc/overlay close; focus trap. Clear, trustworthy, glassy.' },
  { slug: 'web3-gas-selector', title: 'Web3 — Gas / Network Fee Selector', category: 'ui-components', difficulty: 'med', tags: 'gas, fee, network',
    build: 'A gas/network-fee selector: three speed presets (Slow / Normal / Fast) as selectable cards each showing gwei, est. time (~3 min / ~45 s / ~15 s) and fiat cost, plus a "Custom" tab with max base fee + priority fee inputs and a computed total. A live "current base fee" ticker that animates. JS: selecting a preset updates a summary total, custom inputs recompute live, and a simulated base-fee that drifts every couple seconds updating the presets. Mono numbers, neon accent on selected.' },
  { slug: 'web3-token-row', title: 'Web3 — Token Balance Row (price · 24h · value)', category: 'ui-components', difficulty: 'easy', tags: 'token, balance, row',
    build: 'A token balance row/list component: each row has a token logo (gradient circle + symbol), name + symbol, balance (mono), unit price, 24h change (green/red with arrow + sparkline mini-chart drawn in CSS/SVG), and fiat value, right-aligned. Show a list of ~6 tokens (ETH, USDC, NOVA, ARB, LUMEN, …) and a portfolio total header. JS: a sort toggle (by value / by 24h change), a hide-small-balances switch, animated value count-up on load, and hover elevation. Sparklines reflect the change sign.' },
  { slug: 'web3-network-switch', title: 'Web3 — Network / Chain Switcher', category: 'ui-components', difficulty: 'easy', tags: 'network, chain, switch',
    build: 'A network/chain switcher dropdown: a current-chain pill (icon + name like "Ethereum") that opens a menu of chains (Ethereum, Arbitrum, Base, Optimism, Polygon, Lumen Chain) each with a colored icon, status dot, and a "Testnet" toggle section at the bottom. Selecting a chain shows a brief "Switching network…" state then updates the pill and an accent theme color. JS: open/close, switch with simulated delay, testnet filter toggle, search filter input, and the page accent color follows the active chain.' },

  // 59.A — Wallet & Trading
  { slug: 'web3-wallet-dashboard', title: 'Web3 — Wallet Dashboard (balances · tokens · NFTs)', category: 'pages', difficulty: 'hard', tags: 'wallet, dashboard, portfolio',
    build: 'A full wallet dashboard: top bar with address chip + network switcher; a hero "total balance" card with a big animated fiat value, 24h PnL, and Send/Receive/Swap/Buy action buttons; a portfolio donut/allocation bar; tabs for Tokens / NFTs / Activity. Tokens tab = token rows (logo, balance, price, 24h, value). NFTs tab = a small grid of CSS-drawn NFT thumbnails. Activity tab = recent tx list with status. JS: tab switching, animated balances, a hide-balances (eye) toggle that masks values, and hover states. Glassy, neon, premium.' },
  { slug: 'web3-token-swap', title: 'Web3 — Token Swap (from/to · slippage · route)', category: 'pages', difficulty: 'hard', tags: 'swap, dex, trade',
    build: 'A DEX token-swap card: "From" and "To" panels each with a token selector (opens a searchable token list modal), amount input (mono), balance + MAX button, and fiat estimate; a flip button to reverse; a live computed rate (1 ETH = 2,806 USDC), price-impact, minimum received, and a slippage settings popover (0.1/0.5/1% + custom). A route preview (ETH → USDC via a fictional pool) and a big "Swap" button that opens a confirm step. JS: typing an amount computes the other side from a mock rate, MAX, flip, token-select modal, slippage popover, and a swap → confirming → success flow with toast.' },
  { slug: 'web3-send-receive', title: 'Web3 — Send / Receive (address · QR · confirm)', category: 'ui-components', difficulty: 'med', tags: 'send, receive, qr',
    build: 'A combined Send/Receive component with two tabs. Send: recipient address input (with ENS resolve + validation + paste), token selector, amount with MAX + fiat, network fee summary, and a "Review" button leading to a confirm card with hash on success. Receive: the user\'s address in mono with a copy button, a CSS/SVG-drawn QR-style code block, a network selector, and a "request amount" optional field that updates the QR caption. JS: tab switch, address validation states, ENS mock-resolve, copy + toast, amount/fiat sync, and the review→confirm→success flow.' },
  { slug: 'web3-tx-history', title: 'Web3 — Transaction History (status · explorer link)', category: 'ui-components', difficulty: 'med', tags: 'transactions, history, list',
    build: 'A transaction history list: grouped by date, each row shows a type icon (Send / Receive / Swap / Approve / Mint), a label ("Swap ETH → USDC"), counterparty address (mono truncated), amount with +/− coloring, a status badge (Pending pulsing / Confirmed / Failed), timestamp, and an "explorer" external-link icon. A filter bar (All / Sent / Received / Swaps) and a search by hash/address. JS: filter chips, live search, a pending tx that flips to Confirmed after a few seconds, expand-row for details (hash, block, fee, nonce), and copy-hash toast.' },
  { slug: 'web3-portfolio-chart', title: 'Web3 — Portfolio Value Chart (PnL)', category: 'ui-components', difficulty: 'med', tags: 'chart, portfolio, pnl',
    build: 'A portfolio value chart card: a big current value (mono) with absolute + % PnL (green/red) for the selected range, a smooth SVG area/line chart with a gradient fill and a glow stroke, range tabs (1H / 1D / 1W / 1M / 1Y / ALL), and a crosshair tooltip that follows the cursor showing value + date at that point. Below: a tiny allocation legend. JS: drawing the SVG path from mock series per range, animated path draw-in on range change, interactive crosshair/tooltip on pointer move, and PnL recolor by sign. No chart libraries — hand-rolled SVG.' },

  // 59.C — NFT · DeFi · DAO
  { slug: 'web3-nft-marketplace', title: 'Web3 — NFT Marketplace (grid · filters · bid)', category: 'pages', difficulty: 'hard', tags: 'nft, marketplace, grid',
    build: 'An NFT marketplace browse page: a collection header (banner gradient, avatar, floor price, volume, items, owners stats), a sidebar/topbar of filters (status: Buy Now / On Auction, price range, trait chips), a sort dropdown (Price low→high, Recently listed, Rarity), and a responsive grid of NFT cards (CSS-drawn generative art thumbnail, name #id, price in ETH + fiat, last sale, a "Buy"/"Bid" button on hover, rarity badge). JS: filter + sort the grid live, a favorite (heart) toggle with count, a quick-buy modal, and grid/large-grid density toggle.' },
  { slug: 'web3-nft-detail', title: 'Web3 — NFT Detail (traits · history · buy)', category: 'pages', difficulty: 'med', tags: 'nft, detail, traits',
    build: 'An NFT detail page: large CSS-drawn artwork on the left with a zoom/fullscreen control and a fav/share row; on the right the name #id, collection link (verified check), current owner chip, a price/offer panel with "Buy now" + "Make offer" + a live auction countdown timer, a traits grid (each trait with rarity %), and tabs for Properties / Offers / Activity (a price-history mini chart + sales table). JS: countdown timer ticking down, tab switching, buy/offer flow opening a confirm sheet, fav toggle, and trait hover tooltips. Premium, glassy.' },
  { slug: 'web3-staking', title: 'Web3 — Staking / Yield (APR · stake · claim)', category: 'pages', difficulty: 'hard', tags: 'staking, yield, defi',
    build: 'A staking / yield page: a hero showing the staking pool (token NOVA), big APR %, TVL, and your staked balance + pending rewards that tick up in real time (mono, animated). A stake/unstake card with amount input + MAX, lock-period selector (Flexible / 30d / 90d / 1y) that changes a multiplier and projected yield, and Stake / Unstake / Claim buttons. A list of other pools with APRs. JS: live-incrementing rewards counter, projected-earnings calculator that updates as you change amount/lock, stake→confirm→success flow, claim animation, and pool selection.' },
  { slug: 'web3-liquidity-pool', title: 'Web3 — Liquidity Pool / Provide LP', category: 'ui-components', difficulty: 'hard', tags: 'liquidity, lp, defi',
    build: 'A "provide liquidity" component for a pair (ETH / USDC): two token-amount inputs that stay in ratio (entering one auto-fills the other from a mock pool price), balances + MAX, a pool-share % readout, current pool stats (TVL, 24h volume, fee tier selector 0.05/0.3/1%), estimated LP tokens received, and a fee-APR estimate. A summary of your existing position with "Add" / "Remove" tabs (remove uses a % slider). JS: ratio-linked inputs, pool-share computation, fee-tier select, add/remove tab + remove slider, and an "Add liquidity" → confirm → success flow with toast.' },
  { slug: 'web3-dao-governance', title: 'Web3 — DAO Governance (proposals · vote)', category: 'pages', difficulty: 'med', tags: 'dao, governance, vote',
    build: 'A DAO governance page: header with your voting power (token + delegated), treasury value, and active-proposal count; a proposals list with status filters (Active / Passed / Failed / Pending), each proposal card showing title, proposer chip, a For/Against/Abstain vote-bar with percentages and quorum progress, and a countdown for active ones. Clicking a proposal opens a detail panel with description, current results, and Vote For / Against / Abstain buttons that record your choice and update the bars. JS: filter, open detail, cast vote (updates bars + voting power state + toast), countdowns, and a "create proposal" stub modal.' },

  // 59.D — Themed Web3 landings
  { slug: 'web3-landing-exchange', title: 'Web3 — Crypto Exchange (CEX) Landing', category: 'pages', difficulty: 'hard', tags: 'landing, exchange, cex',
    palette: 'CEX / exchange — near-black --bg:#070a0d, clean surfaces, data-dense trustworthy. Green/red market accents: --pos:#16c784 (up), --neg:#ea3943 (down), --accent:#f0b90b (gold). Clean sans + mono numbers. Professional, financial.',
    build: 'A crypto exchange (CEX) landing: a trustworthy hero with a big headline, sign-up CTA + email capture, and a live "markets" widget (a ticker tape of coins with price + 24h green/red, and a top-pairs table with sparklines). Sections: feature trio (Spot, Futures, Earn), security/regulation trust band (badges, "$X insured"), a fees/comparison strip, supported-assets logo wall, app download CTA with phone mockup, and footer. JS: animated ticker tape loop, table sort, count-up stats, and live-ish price jitter on the markets widget. Data-dense, clean, financial.' },
  { slug: 'web3-landing-defi', title: 'Web3 — DeFi Protocol Landing', category: 'pages', difficulty: 'hard', tags: 'landing, defi, protocol',
    palette: 'DeFi protocol — dark + neon gradient, futuristic techy. --bg:#08080f, --accent:#7c5cff→#00e0c6 gradient, glow everywhere, glassy. Geometric sans (Space Grotesk). Animated, high-tech.',
    build: 'A DeFi protocol landing: a futuristic glowing hero with an animated gradient/mesh background, a headline like "The liquidity layer for everything", launch-app CTA, and big live protocol stats (TVL, total volume, users) counting up. Sections: how-it-works steps with glowing connector lines, a yields/markets table (asset, supply APR, borrow APR), an audited/security band, an ecosystem/integrations logo grid, a governance teaser, and footer. JS: animated mesh/gradient hero, count-up stat reveals on scroll, table hover, and a token-price ticker. Neon, glassy, premium-techy.' },
  { slug: 'web3-landing-nft', title: 'Web3 — NFT Project / Collection Landing', category: 'pages', difficulty: 'med', tags: 'landing, nft, mint',
    palette: 'NFT project — bold themed + glow, hype community vibe. Pick a strong duo, e.g. --bg:#0d0618, --accent:#ff4d8d (hot pink) + --accent-2:#3fd0ff (cyan), display font, lots of glow. Energetic, hype.',
    build: 'An NFT project / collection landing (PFP drop): a bold hero with the collection name, a marquee/grid of CSS-drawn generative-art PFP thumbnails, and a MINT panel — price, minted/total progress bar, quantity stepper, "Mint now" button, and a live countdown to / since launch. Sections: about/lore, rarity & traits showcase, roadmap timeline, team grid, FAQ accordion, and a Discord/X community CTA. JS: animated PFP marquee, mint quantity + simulated mint (progress bar advances, success state), countdown timer, FAQ accordion, and rarity hover. Hype, glowing, community.' },
  { slug: 'web3-landing-chain', title: 'Web3 — L1 / L2 Blockchain Landing', category: 'pages', difficulty: 'hard', tags: 'landing, chain, l1, l2',
    palette: 'L1/L2 chain — deep space + signature accent, visionary technical. --bg:#04060e (deep space), one signature accent like --accent:#5b8cff or #00ffa3, subtle starfield/grid, modern sans. Vast, futuristic, credible.',
    build: 'An L1/L2 blockchain landing: a vast "deep space" hero with a subtle animated starfield/grid and a visionary headline ("The chain built for a billion users"), Build / Read Docs CTAs, and headline metrics (TPS, finality time, fees, validators) counting up. Sections: performance comparison bars vs other chains, an architecture/tech diagram (CSS nodes + glowing links), ecosystem dApps grid, a "start building" developer band with a code-snippet card, validators/decentralization band, and footer. JS: animated starfield, count-up metrics, comparison-bar fill on scroll, code-snippet copy-to-clipboard, and tab-switch in the dev section. Credible, technical, futuristic.' },
  { slug: 'web3-landing-wallet', title: 'Web3 — Wallet App Landing', category: 'pages', difficulty: 'med', tags: 'landing, wallet, app',
    palette: 'Wallet app — clean dark + friendly accent, approachable & secure. --bg:#0c0e14, rounded sans, friendly single accent like --accent:#6c5ce7 or #2bd9a8, soft glow, rounded cards. Warm, trustworthy, consumer.',
    build: 'A consumer wallet-app landing: a friendly hero with a phone mockup showing the wallet UI (balance + tokens), a headline ("Your keys, your crypto, made simple"), and app-store download CTAs. Sections: feature trio (Self-custody, Swap & bridge, Buy with card) each with an icon + soft glow card, a security/"non-custodial" trust band, supported-chains row, a step-by-step "get started in 3 steps", reviews/testimonials, and footer. JS: an animated phone-screen that cycles between 2-3 app views, count-up download stat, testimonial slider, and chip hover. Rounded, warm, approachable, secure.' },
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
