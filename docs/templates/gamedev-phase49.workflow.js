// ===========================================================================
// Workflow — Phase 49 (Game Dev Pages, Styles & Patterns) — 29 resources
// ===========================================================================
export const meta = {
  name: 'gamedev-phase49-finish',
  description: 'Generate the 29 Phase 49 gamedev resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'gamedev'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Google Fonts via <link>: "Orbitron" (display/gaming headings, weights 500;700;900) + "Inter" (body/UI, weights 400;500;600;700;800). Use Orbitron for titles, HUD numbers, CTAs; Inter for body/long text.
- Default palette in :root — dark gaming UI:
  --bg:#0a0b10; --bg-2:#12131c; --panel:#171926; --panel-2:#1f2233;
  --text:#e7e9f3; --muted:#9aa0bf; --line:rgba(231,233,243,0.10); --line-2:rgba(231,233,243,0.18);
  --accent:#00e5ff; --accent-2:#7c4dff; --accent-3:#ff3d71;
  --success:#36e27a; --warn:#ffc857; --danger:#ff4d4d;
  --glow: 0 0 18px rgba(0,229,255,0.45);
  radii: --r-sm:6px --r-md:10px --r-lg:16px.
- Gaming core primitives: dark panels with subtle gradient/inner-glow, neon accent borders + glow on hover/active, angled/clipped corners (clip-path polygon) for a sci-fi HUD feel, large bold CTAs ("Wishlist", "Play Now", "Buy"), animated/pulsing accent states, progress/stat bars with fill animation.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background, --text default color.
- Accessible: aria where relevant, WCAG AA contrast for body text, keyboard-usable buttons, :focus-visible rings.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional game/studio/character names (e.g. "Ashen Vanguard", "Neon Drift", "Hollow Reign", studio "Nullforge").`

const DISCLAIMER = '> Illustrative UI only — fictional games, studios, characters, and data. Not engine integrations.'

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

  return `You are generating ONE production-quality static UI demo resource for a Game Dev / Gaming collection. It must be self-contained, polished, and visually distinctive — not a generic placeholder. Aim for a real AAA/indie game-site or in-game-HUD feel.

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

QUALITY BAR: real-feeling content, multiple cards/rows/panels, clear hierarchy, hover/active/focus states, neon glow accents, smooth micro-interactions, a genuinely interactive script (no dead buttons). No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 49.C — In-Game UI patterns first (the toolkit)
  { slug: 'game-hud-overlay', title: 'Game — HUD Overlay (health · ammo · minimap)', category: 'ui-components', difficulty: 'hard', tags: 'hud, in-game',
    build: 'A full in-game HUD overlay laid over a CSS-drawn game-scene backdrop: top-left health + shield bars with segmented fill, bottom-left ability/cooldown icons with radial cooldown sweeps, bottom-center ammo counter + weapon name + reload pulse, top-right minimap (radar) with rotating blips, a crosshair, score/objective banner, and a kill-feed strip. JS: a "simulate combat" loop that damages health, fires ammo (decrement + reload), triggers ability cooldowns, animates minimap blips, and pushes kill-feed entries. Buttons to take damage / heal / fire / use ability.' },
  { slug: 'game-main-menu', title: 'Game — Main Menu (Play · Options · Quit)', category: 'ui-components', difficulty: 'med', tags: 'menu, in-game',
    build: 'A cinematic game main menu: animated title logo, vertical menu list (Continue, New Game, Load, Options, Credits, Quit) with neon hover slide + selector chevron, a slow parallax/ambient background scene, version + build string footer, and a press-start prompt. JS: keyboard up/down + Enter navigation mirroring mouse hover, a settings sub-panel that slides in (volume sliders, difficulty selector), and a confirm-quit modal.' },
  { slug: 'game-pause-menu', title: 'Game — Pause / Settings Overlay', category: 'ui-components', difficulty: 'med', tags: 'pause, settings, in-game',
    build: 'An in-game pause overlay: dimmed/blurred frozen game scene behind a centered panel with Resume, Settings, Restart Checkpoint, Quit to Menu. A settings tab group (Graphics / Audio / Controls) with sliders, toggles, dropdowns, and a key-rebind row. JS: tab switching, live-updating slider value labels, a working key-rebind capture (press a key to bind), and Esc to resume. Sci-fi HUD framing.' },
  { slug: 'game-inventory-grid', title: 'Game — Inventory Grid (drag · tooltips)', category: 'ui-components', difficulty: 'hard', tags: 'inventory, drag, in-game',
    build: 'An RPG inventory grid: a slot grid (e.g. 6x4) with item icons (CSS-drawn), rarity-colored borders (common→legendary), stack counts, an equipment panel (head/chest/weapon/ring slots) on the side, weight/capacity bar, and gold counter. JS: native HTML5 drag-and-drop to move/swap items between slots and into equipment, hover tooltips showing item name + rarity + stats, right-click to "use/equip", and a sort button. Empty slots highlight on drag.' },
  { slug: 'game-dialogue-box', title: 'Game — Dialogue Box (typewriter · choices)', category: 'ui-components', difficulty: 'med', tags: 'dialogue, narrative, in-game',
    build: 'A visual-novel / RPG dialogue box: speaker portrait (CSS-drawn), speaker name plate, a typewriter-animated dialogue line, a continue indicator (blinking ▶), and branching choice buttons. JS: a small scripted conversation tree — typewriter reveal (click/space to fast-forward or skip to full line), choices advance to different nodes, portrait + name swap per speaker, and an end state. Include a text-speed control.' },
  { slug: 'game-skill-tree', title: 'Game — Skill / Tech Tree (nodes + links)', category: 'ui-components', difficulty: 'hard', tags: 'skill-tree, progression, in-game',
    build: 'An interactive skill/tech tree: nodes (CSS-drawn hex/diamond icons) connected by SVG link lines across tiers, with locked / available / unlocked states, prerequisites, and a skill-points budget counter. JS: clicking an available node spends a point and unlocks it (only if prereqs met), highlights newly-available children, animates the link line lighting up, a respec button refunds all points, and a tooltip shows each node’s effect + cost. Pan is optional but draw the tree clearly.' },
  { slug: 'game-quest-log', title: 'Game — Quest Log / Objectives Tracker', category: 'ui-components', difficulty: 'med', tags: 'quest, objectives, in-game',
    build: 'A quest log: left list of quests (Main / Side / Completed tabs) with type icon, title, and progress; right detail pane with description, objective checklist (some checked), rewards (xp/gold/items), and a "Track" toggle. A compact on-screen quest tracker widget mirrors the tracked quest. JS: tab filtering, selecting a quest updates the detail pane, checking objectives updates progress + the tracker, and completing all objectives moves the quest to Completed with a toast.' },
  { slug: 'game-achievement-toast', title: 'Game — Achievement / Trophy Unlock Toast', category: 'ui-components', difficulty: 'easy', tags: 'achievement, toast, in-game',
    build: 'An achievement-unlock toast system (Xbox/PSN/Steam style): a slide-in toast with trophy/badge icon, rarity tier, achievement name, gamerscore/points, and a shine sweep animation + unlock sound-icon pulse. Below, a small achievements list with locked/unlocked + progress bars. JS: buttons to trigger different rarity unlocks (common→platinum) which queue and play toasts one-by-one, update the list, and increment a total-points counter with a count-up.' },
  { slug: 'game-health-bar', title: 'Game — Health / Mana / XP Bar Variants', category: 'ui-components', difficulty: 'easy', tags: 'bars, hud, in-game',
    build: 'A showcase of game stat-bar variants: segmented health bar, smooth gradient health with delayed "damage chip" trailing fill, shield-over-health stacked bar, mana/energy bar, an XP bar with level-up overflow, and a boss-style centered name + big health bar. JS: controls to deal damage / heal / gain XP that animate the fills (with the trailing chip effect), trigger a level-up flash when XP overflows, and a low-health pulsing red vignette under a threshold.' },
  { slug: 'game-loading-screen', title: 'Game — Loading Screen (tips + progress)', category: 'ui-components', difficulty: 'easy', tags: 'loading, in-game',
    build: 'A game loading screen: full-bleed atmospheric CSS-drawn key-art backdrop, a rotating gameplay "TIP:" line, a lore blurb, a determinate progress bar with percentage + animated spinner/loader glyph, and a "Press any key to continue" prompt once at 100%. JS: simulate a load that ramps the bar (variable speed, occasional hitches) to 100%, cycles tips every few seconds, then reveals the continue prompt; a restart button replays it.' },
  { slug: 'game-character-select', title: 'Game — Character / Loadout Select Screen', category: 'ui-components', difficulty: 'med', tags: 'select, loadout, in-game',
    build: 'A character/hero select screen (fighting/hero-shooter style): a roster grid of selectable character tiles (CSS portraits, role icon, locked state), a large featured panel showing the hovered/selected character with name, role, difficulty pips, ability list, and stat bars, plus a loadout strip (primary/secondary/perk) and a READY button. JS: hover/click selects a character and updates the featured panel + stats (animated), loadout slot cycling, and a lock-in confirm with countdown.' },

  // 49.A — Marketing & store pages
  { slug: 'game-landing-hero', title: 'Game — Game Landing (trailer · wishlist CTA)', category: 'pages', difficulty: 'hard', tags: 'landing, marketing',
    build: 'A AAA game landing page: full-bleed hero with a CSS-drawn key-art scene, big Orbitron title + tagline, a "Watch Trailer" button that opens a video-lightbox placeholder, prominent "Wishlist" + "Pre-order" CTAs, platform badges, a features strip (3-4 mechanics with icons), a screenshot gallery carousel, an editions/preorder band, and a newsletter footer. JS: sticky nav with scroll state, trailer lightbox open/close, screenshot carousel (auto + manual), wishlist toggle with count, and scroll-reveal sections.' },
  { slug: 'game-store-page', title: 'Game — Store Page (Steam-style: media · specs · buy)', category: 'pages', difficulty: 'hard', tags: 'store, marketing',
    build: 'A Steam-style store page: left media column (big screenshot/video viewer + thumbnail strip), right purchase column (title, capsule art, short description, price + discount %, "Add to Cart" / "Wishlist", platform icons), tags/genre chips, "Reviews: Very Positive" summary bar, an about/long-description section, system-requirements Min/Recommended two-column table, and a DLC/editions list. JS: media viewer switching via thumbnails, add-to-cart + wishlist toggles, a reviews sentiment bar, and a min/rec requirements tab switch.' },
  { slug: 'game-features-page', title: 'Game — Features Showcase (mechanics scroll)', category: 'pages', difficulty: 'med', tags: 'features, marketing',
    build: 'A scrolling features/mechanics showcase: alternating left/right feature blocks (CSS-drawn illustration + headline + copy) for core mechanics (combat, exploration, crafting, co-op), each animating in on scroll, a sticky side progress/nav indicating the current feature, a stats band ("4 biomes · 60+ weapons"), and a closing CTA. JS: IntersectionObserver-driven scroll reveals + active side-nav highlighting, and smooth-scroll jump links.' },
  { slug: 'game-editions-compare', title: 'Game — Editions / Bundle Compare Table', category: 'ui-components', difficulty: 'med', tags: 'editions, pricing, marketing',
    build: 'An editions comparison table (Standard / Deluxe / Ultimate): column headers with edition art, price, and a "Buy" CTA, a feature matrix (base game, season pass, skins, early access, soundtrack) with check/cross/partial marks, a "best value" highlighted column, and a savings badge. JS: a monthly/one-time or currency toggle that updates prices, hover-highlight of a column, and an expandable "what’s included" row group. Make Ultimate visually emphasized.' },
  { slug: 'game-roadmap-page', title: 'Game — Game Roadmap / Early Access Timeline', category: 'pages', difficulty: 'med', tags: 'roadmap, timeline, marketing',
    build: 'An early-access roadmap page: a horizontal/vertical timeline of seasons or updates (Released / In Progress / Planned) each with title, date window, feature bullets, and a status pill; a progress header ("Phase 2 of 5"), filter chips by status, and a "current" marker. JS: status filtering, expandable update cards, an animated progress line that fills to the current milestone, and a toggle between timeline and list view.' },
  { slug: 'game-newsletter-signup', title: 'Game — Wishlist / Beta Signup Gate', category: 'ui-components', difficulty: 'easy', tags: 'signup, conversion, marketing',
    build: 'A wishlist / closed-beta signup gate: a compact card over a CSS key-art backdrop with headline, perks list ("early access · exclusive skin · dev updates"), email input + platform select, consent checkbox, and a glowing "Request Beta Access" CTA, plus a live signup counter and platform-share buttons. JS: inline email validation, a submit flow that shows a success state with a (fake) invite-code reveal + copy button, and the counter ticking up. Toast on copy.' },

  // 49.B — Content & community pages
  { slug: 'game-devlog', title: 'Game — Devlog / Update Post Layout', category: 'pages', difficulty: 'med', tags: 'devlog, content',
    build: 'A devlog / update-post layout: post header (version badge "Update 1.4", title, date, author, read time), a hero image block, rich body with section headings, inline screenshots with captions, a "patch highlights" callout box, and an embedded changelog snippet; a sticky table-of-contents sidebar and prev/next post nav, plus reactions + comment count. JS: scroll-spy TOC highlighting, smooth-scroll, a reactions toggle with counts, and a back-to-top button.' },
  { slug: 'game-press-kit', title: 'Game — Press Kit (presskit() style)', category: 'pages', difficulty: 'med', tags: 'presskit, content',
    build: 'A presskit()-style press kit page: studio/game header with logo, factsheet table (developer, release date, platforms, price, website), a description section, "Features" bullet list, downloadable assets grid (logos, screenshots, trailer — each a card with a fake download button + size), awards/quotes band, contact + social block, and a "request review copy" CTA. JS: copy-to-clipboard on contact + asset links (toast), an asset filter (logos/screens/art), and a select-all + "download selected" simulation.' },
  { slug: 'game-character-roster', title: 'Game — Character / Hero Roster (select grid)', category: 'pages', difficulty: 'hard', tags: 'roster, characters, content',
    build: 'A character/hero roster page: a filterable grid of heroes (CSS portraits, name, role icon, rarity ring), role filter chips (Tank/DPS/Support) + search, and a large featured hero panel with splash art, lore blurb, role, difficulty, and stat bars that update on selection. A bottom strip shows abilities with tooltips. JS: chip + search filtering, click-to-feature with animated stat bars and ability tooltips, and a rarity sort. Roster of 9-12 fictional heroes.' },
  { slug: 'game-character-detail', title: 'Game — Character Detail (stats · lore · abilities)', category: 'pages', difficulty: 'med', tags: 'character, content',
    build: 'A single-character detail page: hero banner with splash art, name, title, faction, and rarity; a stats panel (radar-ish or bars for HP/ATK/DEF/SPD), an abilities list with icons, cooldowns, and expandable descriptions, a lore/backstory section with read-more, a skins/variants selector that swaps the accent + splash treatment, and a "add to team" CTA. JS: ability expand/collapse, animated stat bars on load, skin selector swapping theme color, and read-more toggle.' },
  { slug: 'game-world-map', title: 'Game — Interactive World / Level Map', category: 'pages', difficulty: 'hard', tags: 'world-map, exploration, content',
    build: 'An interactive world/level map: a large CSS-drawn stylized map with region zones and location pins (towns, dungeons, bosses, fast-travel) using distinct icons + locked/discovered states; clicking a pin opens a detail popover (name, type, level range, description, "fast travel" button). A side legend with toggleable layers (quests/shops/bosses), a region progress meter, and zoom/pan controls. JS: pin selection + popover, layer toggles that show/hide pin groups, simple zoom via transform, and a "discover" interaction that reveals fogged pins.' },
  { slug: 'game-patch-notes', title: 'Game — Patch Notes / Changelog Layout', category: 'ui-components', difficulty: 'easy', tags: 'patch-notes, changelog, content',
    build: 'A patch-notes / changelog component: a version selector sidebar (1.4, 1.3, 1.2…), and a notes pane grouped into Added / Changed / Fixed / Balance sections with colored tags and bullet entries, plus a "highlights" pinned block and a search box. JS: version switching, live filter by keyword, category filter chips (e.g. show only Balance), and collapsible sections. Clean dark patch-notes styling with accent tags.' },
  { slug: 'game-leaderboard-page', title: 'Game — Leaderboard / Rankings Page', category: 'pages', difficulty: 'med', tags: 'leaderboard, competitive, content',
    build: 'A competitive leaderboard page: a top-3 podium with avatars, ranks, and scores; a ranked table below (rank, player, rank-tier badge, score, win-rate, trend arrow), season selector, a "Global / Friends / Region" scope tabs, search, and a highlighted "you" row. JS: tab + region switching that re-sorts data, search-to-jump, sortable columns (score/winrate), an animated rank-change indicator, and pagination or load-more. Realistic fake gamertags + tiered rank badges (Bronze→Master).' },

  // 49.D — Themed landings (genre/style variants)
  { slug: 'game-landing-aaa-cinematic', title: 'Game — AAA Cinematic Landing (Souls/God-of-War style)', category: 'pages', difficulty: 'hard', tags: 'landing, themed, aaa',
    palette: 'AAA cinematic — black + ember orange + cold steel. --bg:#08070a; --panel:#14110f; --text:#efe7df; --muted:#9b9088; --accent:#ff6a1a (ember); --accent-2:#c0392b; --steel:#5a6b78; epic display serif heading (use "Cinzel" via link for headings, Inter body — skip Orbitron). Dramatic, full-bleed, heavy.',
    build: 'A dark, dramatic AAA cinematic game landing (Souls/God-of-War vibe): full-bleed moody hero with a CSS-drawn brooding warrior/landscape scene, grain + ember-glow overlay, an ornate serif title and somber tagline, a "Watch Reveal Trailer" lightbox CTA + "Wishlist", a vertical chapter/world teaser scroll, a bosses/enemies showcase strip, an editions band, and a heavy footer. JS: cinematic scroll-reveals, parallax ember particles, trailer lightbox, and a hover "ignite" on cards. Restrained, premium, atmospheric.' },
  { slug: 'game-landing-indie-pixel', title: 'Game — Indie Pixel-Art Landing', category: 'pages', difficulty: 'hard', tags: 'landing, themed, indie, pixel',
    palette: 'Indie pixel-art — limited retro palette + scanlines. --bg:#1a1c2c; --panel:#262a44; --text:#f4f4f4; --muted:#a3a7c4; --accent:#ffcd75 (gold); --accent-2:#41ee9b (green); --accent-3:#ef7d57 (orange). Pixel font (use "Press Start 2P" via link for headings/accents, Inter body for readability). Crisp pixel borders (image-rendering: pixelated feel via hard box-shadows), CRT scanline overlay. Charming, retro-modern.',
    build: 'A charming indie pixel-art game landing: pixel-art hero (CSS-drawn pixel scene using box-shadow/grid blocks or stepped gradients) with a "Press Start 2P" title, scanline overlay, a wishlist + Steam CTA, a pixel feature trio, an animated GIF-style screenshot strip (CSS frame-swap animation), a soundtrack/chiptune teaser, and a pixel-bordered footer. JS: a blinking press-start prompt, frame-by-frame sprite animation toggle, hover "bounce" on pixel cards, and a wishlist toggle. Keep type readable (Inter for body).' },
  { slug: 'game-landing-mobile-casual', title: 'Game — Mobile Casual / Puzzle Landing', category: 'pages', difficulty: 'med', tags: 'landing, themed, mobile, casual',
    palette: 'Mobile casual / puzzle — bright candy palette on light. --bg:#fff7fb; --panel:#ffffff; --text:#2a2140; --muted:#7b738f; --accent:#ff5ea0 (pink); --accent-2:#ffd02e (yellow); --accent-3:#48d1ff (sky); --success:#56d364. Rounded chunky sans (use "Baloo 2" via link for headings, Inter body). Friendly, bouncy, glossy. Skip the dark gaming palette entirely.',
    build: 'A bright, bouncy mobile casual/puzzle game landing: a cheerful hero with a phone mockup showing colorful match-3/puzzle gameplay (CSS-drawn candy grid), big rounded "App Store" + "Google Play" download buttons, a star-rating + downloads badge, a playful feature trio with bouncy icons, a level/progress teaser, a rewards/daily-bonus band, and a chunky footer. JS: animated bouncing gameplay tiles, a download-count count-up, hover squish on buttons, and a swappable phone-screen demo. Glossy and friendly.' },
  { slug: 'game-landing-retro-arcade', title: 'Game — Retro Arcade / Neon Landing', category: 'pages', difficulty: 'med', tags: 'landing, themed, arcade, neon',
    palette: 'Retro arcade / neon — black + neon magenta/cyan, CRT glow. --bg:#05030a; --panel:#0e0a1a; --text:#f5f0ff; --muted:#9a8fc0; --accent:#ff2bd6 (magenta); --accent-2:#19f0ff (cyan); --accent-3:#ffe93d (yellow). Use "Orbitron" heavy with strong neon text-shadow glow + a CRT scanline/vignette overlay. 80s, high-energy.',
    build: 'A high-energy 80s retro-arcade neon landing: black hero with glowing neon-grid "Tron" floor (CSS perspective grid), big neon-glow title + flicker animation, a CRT scanline + vignette overlay, an "INSERT COIN / PLAY NOW" CTA, a high-score ticker, an arcade-cabinet game lineup carousel, a synthwave soundtrack teaser, and a neon footer. JS: title flicker, animated scrolling grid floor, high-score ticker, carousel, and a hover neon-pulse on cabinets. Loud and electric.' },
  { slug: 'game-landing-fantasy-rpg', title: 'Game — Fantasy RPG Landing', category: 'pages', difficulty: 'hard', tags: 'landing, themed, rpg, fantasy',
    palette: 'Fantasy RPG — parchment + gold + deep crimson. --bg:#1a130c; --panel:#241a10; --text:#f3e9d2; --muted:#b7a589; --accent:#e8c15a (gold); --accent-2:#9b1b30 (crimson); --parchment:#efe3c6. Ornate serif (use "Cinzel" for headings + "EB Garamond" or Inter for body via link). Epic, lore-rich, illuminated-manuscript feel with gold filigree borders.',
    build: 'An epic fantasy RPG landing with an illuminated-manuscript feel: parchment-and-gold hero with a CSS-drawn fantasy vista (mountains/castle), ornate gold filigree borders, a Cinzel title + lore tagline, "Begin Your Journey" + wishlist CTAs, a classes/races showcase (cards with crests + stat hints), a world-lore section with chapter scrolls, a factions band, and an ornate footer. JS: scroll-reveal with a gentle gold-shimmer, class-card hover crest glow, an unfurling lore-scroll accordion, and a wishlist toggle. Rich, regal, atmospheric.' },
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
