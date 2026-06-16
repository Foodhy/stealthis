// ===========================================================================
// Workflow — Phase 68 (Remotion: Data & Reports) — 12 resources
// ===========================================================================
export const meta = {
  name: 'remotion-phase68-finish',
  description: 'Generate the 12 Phase 68 Remotion Data & Reports resources (mdx + react.tsx)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'remotion'

// ── Remotion design system shared by all Phase 68 resources ───────────────
const STYLE = `REMOTION COMPOSITION RULES (follow exactly):
- Import from "remotion": AbsoluteFill, Composition, interpolate, spring, useCurrentFrame, useVideoConfig, Easing.
- Dark cinema background: BG_COLOR = "#0a0a0f" (or a deep dark variant that fits the comp).
- Color palette (data/charts): use vibrant, distinct hues — indigo #6366f1, violet #8b5cf6, cyan #06b6d4, emerald #10b981, amber #f59e0b, rose #ef4444, sky #38bdf8, orange #f97316. At least 4–6 colors for multi-series data.
- Typography: fontFamily "system-ui, -apple-system, sans-serif", fontWeight 700/600/500, white/rgba(255,255,255,0.6) for muted.
- All animations: use spring() for physical motion (bars growing, counters, reveals) and interpolate() with Easing for fades/slides.
- Each file must export: (1) the main composition component, (2) RemotionRoot with <Composition> wired up.
- Standard resolution: width=1280, height=720, fps=30. durationInFrames varies per comp (see per-resource spec).
- Always include at least: a composed title/heading, animated data elements, and a subtle BG glow or gradient.
- TypeScript with proper interfaces for data shapes. No external dependencies beyond "remotion" and "react".
- Data must be realistic but clearly fictional (e.g. company names, product names, countries — not real companies).
- No TODOs, no placeholder comments. Production-quality compositions ready to render.`

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`

  const mdxInstr = `Create ${dir}/index.mdx with EXACTLY this frontmatter (write a real description yourself), then the prose body:

---
slug: ${s.slug}
title: "${s.title}"
description: "<ONE-LINE description, 55-90 words, no internal double-quotes>"
category: remotion
type: animation
tags: [remotion${s.tags ? ', ' + s.tags : ''}]
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

## ${s.title.replace(/^Remotion — /, '')}

<2-3 short paragraphs: what the composition shows, what animates and how, key design choices.>

### Composition specs

| Property | Value |
|---|---|
| Resolution | 1280 × 720 |
| FPS | 30 |
| Duration | ${s.duration || '5–8 s'} |

### Data format

<Brief description of the data shape and how to customize it.>

(The mdx body must end with that Composition specs + Data format section.)`

  return `You are generating ONE production-quality Remotion composition resource. It must be a real, renderable Remotion animation — polished and visually distinctive, not a generic placeholder.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
DURATION: ${s.frames} frames at 30fps (${Math.round(s.frames / 30)}s)
DIFFICULTY: ${s.difficulty}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/react.tsx  — the complete Remotion composition as described below
2. ${dir}/index.mdx  — frontmatter + prose as specified below

REACT.TSX REQUIREMENTS:
- Full TypeScript React file
- Imports from "remotion" and "react" only
- A main composition component (e.g. export const ${s.componentName}: React.FC = () => {...})
- export const RemotionRoot: React.FC = () => (<Composition id="${s.componentName}" component={${s.componentName}} durationInFrames={${s.frames}} fps={30} width={1280} height={720} />)
- All data hardcoded as constants at the top (realistic fictional data, 6-12 data points)
- Smooth staggered animations with spring() + interpolate()
- A title/heading that fades in, animated data elements, subtle background glow

${mdxInstr}

QUALITY BAR: every data element should animate distinctly, value labels should count-up or reveal, colors must be vibrant and distinct, layout must feel intentional. No lorem ipsum.

After writing the files, return your result.`
}

// ── Phase 68 SPECS ─────────────────────────────────────────────────────────
const SPECS = [
  // ── Charts ────────────────────────────────────────────────────────────────
  {
    slug: 'remotion-bar-race',
    title: 'Remotion — Animated Bar Chart Race',
    difficulty: 'hard',
    tags: 'bar-chart, race, ranking, data-visualization',
    frames: 300,
    duration: '10 s (300 frames)',
    componentName: 'BarRace',
    build: `A bar chart race: 6–8 bars representing competing items (e.g. top apps by users, countries by GDP). The bars grow/shrink and re-rank over 3 "time snapshots" (e.g. 2022, 2023, 2024). Between snapshots the bars animate to new widths and sort-order with spring physics. Each bar shows item name, current value, and a colored badge. A year/period label in the corner counts up. Use spring() for bar width transitions, interpolate() for rank-order vertical positions. At least 4 distinct datasets, smooth 60–80 frame cross-fade between periods. Include a bold title + subtle BG glow.`,
  },
  {
    slug: 'remotion-line-chart',
    title: 'Remotion — Animated Line Chart',
    difficulty: 'med',
    tags: 'line-chart, trend, data-visualization, svg',
    frames: 180,
    duration: '6 s (180 frames)',
    componentName: 'LineChart',
    build: `An animated line chart showing 2 data series over 12 time points (months). The SVG polyline draws itself left-to-right using a stroke-dashoffset animation driven by interpolate(). Each series has its own color and a subtle area fill (semi-transparent). Animated data point dots appear at each node once the line reaches them. A legend with color swatches and series names fades in at frame 0. Axis lines (X and Y) fade in first, then gridlines, then the line draws. Title at top. Value labels on hover simulated via the last data point showing a callout. Include smooth easing.`,
  },
  {
    slug: 'remotion-pie-reveal',
    title: 'Remotion — Pie Chart Reveal',
    difficulty: 'med',
    tags: 'pie-chart, donut, data-visualization, svg',
    frames: 150,
    duration: '5 s (150 frames)',
    componentName: 'PieReveal',
    build: `An animated donut/pie chart. 5–6 segments representing categories (e.g. revenue by product). Segments reveal one-by-one via a CSS conic-gradient trick or SVG arc drawn with stroke-dashoffset — each segment grows into view with a stagger of 15 frames. A center label shows total value counting up. Each segment has a percentage label that pops in after the segment finishes. A legend with colored dots and category names slides in from the left. Vibrant distinct colors per segment, dark background, title at top.`,
  },
  {
    slug: 'remotion-area-chart',
    title: 'Remotion — Animated Area Chart',
    difficulty: 'med',
    tags: 'area-chart, fill, gradient, data-visualization, svg',
    frames: 180,
    duration: '6 s (180 frames)',
    componentName: 'AreaChart',
    build: `An animated area chart with gradient fill. One primary series (weekly revenue or visitors, 12 data points) — the area fills up from left to right using a clip-rect animation. The fill uses a vertical gradient from the accent color at 40% opacity to transparent at the bottom. The stroke line draws first, then the fill reveals. Data point markers pop in staggered along the line. A "current value" callout badge with arrow at the rightmost point slides in last. Also include a secondary subtle gridline system. Title + subtitle at top, current period label animates in.`,
  },

  // ── KPIs ──────────────────────────────────────────────────────────────────
  {
    slug: 'remotion-kpi-cards',
    title: 'Remotion — KPI Cards Animation',
    difficulty: 'med',
    tags: 'kpi, cards, metrics, dashboard',
    frames: 150,
    duration: '5 s (150 frames)',
    componentName: 'KpiCards',
    build: `Four KPI metric cards arranged in a 2×2 grid (or a row of 4 for 1280px). Each card slides up from below with a stagger of 20 frames using spring(). Cards contain: icon (use a simple CSS shape / unicode symbol), metric label, value that counts up from 0, and a delta badge (e.g. "+12.4% vs last period") that fades in after the count completes. Metrics: Total Revenue ($1.24M), Active Users (48,291), Conversion Rate (3.8%), Avg Order Value ($84). Each card has a distinct left-border accent color. Dark card backgrounds with subtle glow. Section title "Q4 Performance" fades in first.`,
  },
  {
    slug: 'remotion-metric-counter',
    title: 'Remotion — Animated Metric Counter',
    difficulty: 'easy',
    tags: 'counter, metric, number, count-up',
    frames: 120,
    duration: '4 s (120 frames)',
    componentName: 'MetricCounter',
    build: `A focused single-metric counter composition — the hero element is a very large number (e.g. "1,000,000 Users") that counts up from 0 using interpolate() with Easing.out(Easing.cubic). Supports prefix ($) and suffix (K / M / +). Below the number: a label ("Total Signups"), and a sub-label ("as of June 2024"). A radial glow pulses under the number. Number text is huge (200px+), bold, in white with the accent color for the suffix. The counter is flanked by subtle decorative lines that draw in on each side. Simple, impactful, centered layout.`,
  },
  {
    slug: 'remotion-growth-chart',
    title: 'Remotion — Growth Chart Reveal',
    difficulty: 'med',
    tags: 'growth, bar-chart, yoy, data-visualization',
    frames: 180,
    duration: '6 s (180 frames)',
    componentName: 'GrowthChart',
    build: `A year-over-year growth bar chart: 6 years × 2 bars each (current year in accent color, previous year in muted). Bars grow up from baseline with staggered spring physics. On top of each pair: a growth % delta badge (e.g. "+23%") that pops in after bars finish. Y-axis with gridlines and labels (values in $M or K). X-axis with year labels. Title "Revenue Growth YoY", period range subtitle. A final annotation arrow pointing to the highest bar with a callout label. Smooth entrance of axis first, then bars, then labels.`,
  },
  {
    slug: 'remotion-dashboard-recap',
    title: 'Remotion — Dashboard Recap Video',
    difficulty: 'hard',
    tags: 'dashboard, recap, summary, composite',
    frames: 270,
    duration: '9 s (270 frames)',
    componentName: 'DashboardRecap',
    build: `A multi-section "monthly dashboard recap" video (like a Wrapped-style summary). Structured in 3 timed segments: (1) frames 0-80: Hero — company name + "November Recap" title slide with animated metric trio (revenue, orders, users) counting up; (2) frames 80-180: Top Products — a horizontal bar chart of top 5 products by revenue, bars growing left-to-right staggered; (3) frames 180-270: Closing — a bold single hero stat "Best month ever — $2.4M" with a large count-up + confetti effect (several small colored squares raining down via interpolate). Smooth cross-fade transitions between segments using interpolate opacity. Polished, cinematic feel.`,
  },

  // ── Rankings ──────────────────────────────────────────────────────────────
  {
    slug: 'remotion-leaderboard',
    title: 'Remotion — Animated Leaderboard',
    difficulty: 'med',
    tags: 'leaderboard, ranking, scoreboard',
    frames: 210,
    duration: '7 s (210 frames)',
    componentName: 'Leaderboard',
    build: `An animated leaderboard of 8 players/teams. Rows slide in from the right staggered (20 frames each). Each row shows: rank number with medal emoji for top 3 (🥇🥈🥉 via text), avatar placeholder (colored circle with initials), name, score, and a horizontal score bar that fills left-to-right with spring(). The #1 rank row is highlighted with a subtle gold glow. A "Weekly Leaderboard" title fades in first. Score values count up as bars fill. After all rows appear, a subtle shimmer sweeps across the #1 row. Colors: gold for rank 1, silver for rank 2, bronze for rank 3, muted for the rest.`,
  },
  {
    slug: 'remotion-stock-ticker',
    title: 'Remotion — Stock Ticker Reel',
    difficulty: 'med',
    tags: 'stock, ticker, finance, scrolling',
    frames: 180,
    duration: '6 s (180 frames)',
    componentName: 'StockTicker',
    build: `A financial stock ticker reel. Top half: a large "market summary" section with 3 index values (e.g. "SX500 4,892 +0.8%", "TECH-X 14,220 -0.3%", "GLOBAL 2,108 +1.2%") — each value counts up and a delta arrow (▲/▼) fades in colored green/red. Bottom half: a horizontally scrolling ticker bar (translate-X animation, looping) showing 8–10 stock symbols with price and delta. Two individual "featured stock" cards above the ticker show a mini sparkline (SVG polyline) that draws in. Title "Market Close – June 2024" at top. Dark terminal-like aesthetic with green/red accents on white text.`,
  },
  {
    slug: 'remotion-survey-results',
    title: 'Remotion — Survey Results Video',
    difficulty: 'med',
    tags: 'survey, results, poll, horizontal-bars',
    frames: 210,
    duration: '7 s (210 frames)',
    componentName: 'SurveyResults',
    build: `An animated survey results presentation. 6 questions, each with a horizontal bar showing % response for the winning answer. Sections reveal one-by-one staggered (25 frames). Each row: question label at left, a horizontal bar filling right with spring(), % badge at the bar tip that counts up, and a secondary "n= respondents" count. A category icon (simple geometric shape or unicode) before the question. Title "Product Satisfaction Survey — Q3 2024", subtitle "2,400 respondents". After all bars animate, the highest-scoring question gets a subtle gold highlight pulse. Clean, professional, muted purple/blue palette on dark BG.`,
  },
  {
    slug: 'remotion-poll-results',
    title: 'Remotion — Poll Results Animation',
    difficulty: 'easy',
    tags: 'poll, vote, results, donut',
    frames: 120,
    duration: '4 s (120 frames)',
    componentName: 'PollResults',
    build: `A simple poll results animation for 4 options. A large donut chart in the center reveals clockwise with a conic-gradient animation. To the right: each option listed with colored dot, label, vote count, and % bar that fills left-to-right. Everything staggered: donut first (frames 0-60), then options one-by-one (frames 60-120, 15-frame stagger). Poll question at top: "Which feature do you want most?" Options: Dark Mode 42%, API Access 28%, Mobile App 18%, More Templates 12%. Winner option is highlighted. Total votes "1,842 votes" fades in under the donut. Simple, clear, friendly.`,
  },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos Remotion para Phase 68 "Data & Reports"…`)

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
