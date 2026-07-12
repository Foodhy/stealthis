// Workflow — build Phases 85-88 theme resources (dating, coach, interior, video)
export const meta = {
  name: 'themes-85-88-build',
  description: 'Generate 80 theme resources (dating/coach/interior/video): mdx + html/css/js',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const BASE_STYLE = `DESIGN SYSTEM (match exactly unless a palette override is given):
- Google Font Inter via <link> (weights 400;500;600;700;800). Collections may add a display font via Google Fonts (see palette).
- box-sizing:border-box reset, antialiased, line-height 1.5.
- Accessible: aria where relevant, WCAG AA contrast, keyboard-usable controls, visible focus.
- Responsive: works down to ~360px (include a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional names/data. For imagery use https://images.unsplash.com/... placeholder URLs OR CSS gradient blocks — never hotlink random sites.
- No TODOs, no lorem ipsum. Multiple cards/rows, clear hierarchy, hover/active/focus states, badges, smooth micro-interactions, genuinely interactive script.`

const COLLECTIONS = {
  dating: { disclaimer: '', palette: `Dating — playful app. :root — --bg:#fff5f6; --surface:#ffffff; --ink:#2a1a2e; --ink-2:#5a4a55; --muted:#8a7a85; --coral:#ff5e6c; --coral-d:#e63950; --violet:#8b5cf6; --violet-d:#7c3aed; --pink:#ff8fb1; --grad:linear-gradient(135deg,#ff5e6c,#8b5cf6); --line:rgba(42,26,46,0.10); --white:#fff; radii --r-sm:12px --r-md:20px --r-lg:28px, pill buttons. Rounded, gradient accents, mobile-app feel — for app-screen resources wrap content in a ~430px phone-frame container centered on the page.` },
  coach: { disclaimer: '', palette: `Fitness coach — energetic dark. :root — --bg:#0f1115; --surface:#171a21; --surface-2:#1f232c; --lime:#c2f542; --lime-d:#a3d62f; --orange:#ff6b35; --ink:#f2f4f0; --muted:#9aa0a6; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18); --white:#fff; radii --r-sm:8px --r-md:14px --r-lg:20px. Bold uppercase display headings (Inter 800, letter-spacing), electric-lime CTAs that glow, motivational energy.` },
  interior: { disclaimer: '', palette: `Interior design — warm editorial. :root — --bg:#f6f2ec; --paper:#fbf9f5; --ink:#2c2620; --ink-2:#5a5147; --muted:#8a8175; --clay:#b08968; --clay-d:#8c6a4f; --walnut:#5c4433; --sage:#9caf88; --line:rgba(44,38,32,0.12); --white:#fff; radii --r-sm:4px --r-md:8px --r-lg:14px. Add display serif "Cormorant Garamond" (Google Fonts, 400;500;600) for headings. Editorial, generous whitespace, thin rules, muted natural palette.` },
  video: { disclaimer: '', palette: `Videographer — cinematic dark. :root — --bg:#0a0a0b; --surface:#141416; --surface-2:#1c1c1f; --amber:#ffb020; --amber-d:#e6971a; --red:#ff4d4d; --ink:#f4f4f6; --muted:#8a8a92; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18); --white:#fff; radii --r-sm:6px --r-md:10px --r-lg:16px. Add "JetBrains Mono" for timecodes. Letterbox black bars on hero, cinematic amber accents, film-forward.` },
}

const SPECS = [
  // ── Dating (20) ──
  { slug: 'dating-hero-landing', c: 'dating', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Dating app hero: bold gradient headline, phone-frame mockup showing a profile card, app-store buttons, feature strip (match/chat/safety), stats.' },
  { slug: 'dating-swipe-deck', c: 'dating', cat: 'ui-components', d: 'hard', tags: 'swipe, deck', build: 'Swipeable card deck: draggable profile cards (photo, name/age, bio, interests), drag left=nope/right=like with rotation + colored stamp, buttons for rewind/nope/super/like, next card behind, "no more" empty state. Pointer + touch.' },
  { slug: 'dating-profile-card', c: 'dating', cat: 'ui-components', d: 'easy', tags: 'profile, card', build: 'Profile card component variants: photo carousel dots, name/age, verified badge, distance, bio, interest chips, online status.' },
  { slug: 'dating-match-modal', c: 'dating', cat: 'ui-components', d: 'easy', tags: 'match, modal', build: 'An "It is a match!" celebration modal: two avatars sliding together, confetti/heart burst animation, Send-message + Keep-swiping buttons. Trigger button to replay.' },
  { slug: 'dating-chat-messages', c: 'dating', cat: 'pages', d: 'med', tags: 'chat, messages', build: 'Chat/messages screen: conversation list sidebar with unread dots + last message, active chat with bubbles, typing indicator, send input with emoji, match banner at top.' },
  { slug: 'dating-discovery-grid', c: 'dating', cat: 'pages', d: 'med', tags: 'discovery, grid', build: 'Browse profiles grid: card grid with photo, name/age, online dot, like button on hover, filter bar (distance/age), infinite feel.' },
  { slug: 'dating-edit-profile', c: 'dating', cat: 'pages', d: 'med', tags: 'profile, edit', build: 'Edit profile: photo upload grid (drag reorder), bio textarea with counter, interest chips (toggle), prompts (pick + answer), profile completeness meter.' },
  { slug: 'dating-filters-preferences', c: 'dating', cat: 'ui-components', d: 'med', tags: 'filters, preferences', build: 'Filters/preferences panel: age range dual slider, distance slider, gender/looking-for toggles, interests multiselect, verified-only switch, live "X people match" count, apply/reset.' },
  { slug: 'dating-onboarding-flow', c: 'dating', cat: 'pages', d: 'hard', tags: 'onboarding, flow', build: 'Signup onboarding: multi-step (phone → name/age → photos → interests → intentions), progress dots, validation, back/next, welcome finish. Phone-frame.' },
  { slug: 'dating-safety-center', c: 'dating', cat: 'pages', d: 'easy', tags: 'safety', build: 'Safety center: safety tips cards, report/block how-to, verification CTA, emergency resources, community guidelines accordion.' },
  { slug: 'dating-premium-upsell', c: 'dating', cat: 'ui-components', d: 'med', tags: 'premium, paywall', build: 'Premium paywall: tiered plans (Plus/Gold/Platinum) with perks table, most-popular highlight, monthly/yearly toggle with savings, unlock feature list, subscribe CTA.' },
  { slug: 'dating-likes-you', c: 'dating', cat: 'ui-components', d: 'easy', tags: 'likes', build: 'Who-liked-you grid: blurred locked cards for free users + a few revealed, "upgrade to see all" overlay, count badge, like-back buttons on revealed.' },
  { slug: 'dating-profile-detail', c: 'dating', cat: 'pages', d: 'med', tags: 'profile, detail', build: 'Full profile view: photo gallery with dots, name/age/verified, about, prompt answers, interests, basics (height/job/education), like/pass floating buttons, report menu.' },
  { slug: 'dating-icebreakers', c: 'dating', cat: 'ui-components', d: 'easy', tags: 'icebreakers, prompts', build: 'Icebreaker prompt cards: shuffleable deck of conversation-starter prompts, categories, tap to copy/send (toast), favorite a prompt.' },
  { slug: 'dating-video-date', c: 'dating', cat: 'ui-components', d: 'med', tags: 'video, call', build: 'Video-date call UI: main video area (placeholder avatar/gradient), self PiP, controls (mute/camera/end/effects), call timer, connection quality, incoming-call variant.' },
  { slug: 'dating-notifications', c: 'dating', cat: 'ui-components', d: 'easy', tags: 'notifications', build: 'Notifications feed: grouped (likes/matches/messages) rows with avatar, action text, time, unread highlight, mark-all-read, filter tabs.' },
  { slug: 'dating-landing-serious', c: 'dating', cat: 'pages', d: 'med', tags: 'landing, serious', build: 'Relationship-focused dating landing: warmer tone, success-stories, compatibility angle, testimonials, signup CTA.' },
  { slug: 'dating-landing-casual', c: 'dating', cat: 'pages', d: 'med', tags: 'landing, casual', build: 'Casual dating landing: fun energetic tone, nearby/tonight angle, playful copy, big signup CTA.' },
  { slug: 'dating-landing-lgbtq', c: 'dating', cat: 'pages', d: 'med', tags: 'landing, lgbtq', build: 'LGBTQ+ inclusive dating landing: inclusive imagery/colors, identity/pronoun options highlight, safe-space messaging, community, signup.' },
  { slug: 'dating-landing-professionals', c: 'dating', cat: 'pages', d: 'med', tags: 'landing, professionals', build: 'Professionals dating landing: refined palette, verified/vetted angle, career-minded matches, testimonials, apply-to-join CTA.' },

  // ── Coach (20) ──
  { slug: 'coach-hero-landing', c: 'coach', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Fitness coach hero: bold uppercase headline, action photo, "Start your transformation" CTA, stats (clients/years/success%), program strip.' },
  { slug: 'coach-programs-list', c: 'coach', cat: 'pages', d: 'easy', tags: 'programs', build: 'Programs list: program cards (name, weeks, level, focus, price), filter by goal/level, enroll button, popular badge.' },
  { slug: 'coach-booking-1on1', c: 'coach', cat: 'pages', d: 'hard', tags: 'booking', build: '1-on-1 session booking: pick session type, coach availability calendar with slots, timezone note, details form, confirm, confirmation.' },
  { slug: 'coach-workout-builder', c: 'coach', cat: 'ui-components', d: 'hard', tags: 'workout, builder', build: 'Workout builder: exercise library panel, drag exercises into a day plan, set reps/sets/rest per exercise, reorder, total volume/time estimate, save.' },
  { slug: 'coach-progress-tracker', c: 'coach', cat: 'ui-components', d: 'med', tags: 'progress, charts', build: 'Progress tracker: weight/strength line chart (inline SVG, animated), log entry form, streak counter, PRs list, measurements grid.' },
  { slug: 'coach-nutrition-plan', c: 'coach', cat: 'pages', d: 'med', tags: 'nutrition', build: 'Nutrition plan: daily macros ring (protein/carbs/fat), meal cards with calories, swap options, water tracker, grocery list.' },
  { slug: 'coach-client-dashboard', c: 'coach', cat: 'pages', d: 'hard', tags: 'dashboard', build: 'Client dashboard: todays workout card, weekly plan strip, progress mini-chart, next session, coach messages, streak + goals widgets.' },
  { slug: 'coach-transformations', c: 'coach', cat: 'ui-components', d: 'med', tags: 'transformations, before-after', build: 'Transformations gallery: before/after slider cards with stats (weeks/lbs), filter by goal, testimonial quote per case.' },
  { slug: 'coach-pricing-plans', c: 'coach', cat: 'pages', d: 'easy', tags: 'pricing', build: 'Pricing plans: coaching tiers (self/guided/1-on-1) with features, monthly/quarterly toggle, most-popular, CTA.' },
  { slug: 'coach-testimonials', c: 'coach', cat: 'ui-components', d: 'easy', tags: 'testimonials', build: 'Testimonials: client quote cards with photo, result stat, star rating, carousel.' },
  { slug: 'coach-exercise-library', c: 'coach', cat: 'pages', d: 'med', tags: 'exercises, library', build: 'Exercise library: searchable/filterable grid (muscle/equipment), exercise cards with thumbnail, click opens detail modal with steps + target muscles.' },
  { slug: 'coach-workout-timer', c: 'coach', cat: 'ui-components', d: 'med', tags: 'timer, hiit', build: 'Interval/HIIT timer: configurable work/rest/rounds, big countdown, phase color change, beep/vibration cue (visual), start/pause/reset, round progress.' },
  { slug: 'coach-meal-log', c: 'coach', cat: 'ui-components', d: 'med', tags: 'meal, calories', build: 'Calorie/meal log: add food (name/calories/macros), running daily total vs goal bar, meal sections (breakfast/lunch/dinner/snack), remove item.' },
  { slug: 'coach-check-in-form', c: 'coach', cat: 'pages', d: 'med', tags: 'check-in, form', build: 'Weekly check-in form: weight, measurements, energy/sleep/adherence sliders, progress photos upload, notes, submit → summary.' },
  { slug: 'coach-habit-tracker', c: 'coach', cat: 'ui-components', d: 'easy', tags: 'habits', build: 'Habit tracker: weekly grid of habits × days with tap-to-complete, streak per habit, completion %, add habit.' },
  { slug: 'coach-video-lesson', c: 'coach', cat: 'ui-components', d: 'med', tags: 'video, lesson', build: 'Video lesson: video player placeholder, step-by-step instructions synced list, sets/reps, mark-complete, next-exercise.' },
  { slug: 'coach-landing-weightloss', c: 'coach', cat: 'pages', d: 'med', tags: 'landing, weightloss', build: 'Weight-loss coach landing: transformation focus, program overview, calorie/results angle, testimonials, join CTA.' },
  { slug: 'coach-landing-strength', c: 'coach', cat: 'pages', d: 'med', tags: 'landing, strength', build: 'Strength coach landing: powerlifting/hypertrophy angle, program phases, PR focus, gritty imagery, join CTA.' },
  { slug: 'coach-landing-yoga', c: 'coach', cat: 'pages', d: 'med', tags: 'landing, yoga', build: 'Yoga coach landing: calmer softer accents over the coach palette, class types, mindfulness angle, schedule, join CTA.' },
  { slug: 'coach-landing-online', c: 'coach', cat: 'pages', d: 'med', tags: 'landing, online', build: 'Online coaching landing: remote/app-based angle, how-it-works steps, app mockup, pricing teaser, apply CTA.' },

  // ── Interior (20) ──
  { slug: 'interior-hero-landing', c: 'interior', cat: 'pages', d: 'med', tags: 'landing, hero', build: 'Interior studio hero: full-bleed room photo, serif studio name, tagline, "Book a consultation" CTA, featured-projects strip, awards line.' },
  { slug: 'interior-portfolio-grid', c: 'interior', cat: 'pages', d: 'med', tags: 'portfolio', build: 'Project portfolio: filterable grid (residential/commercial/hospitality), large image cards with project name + year, hover zoom, opens detail.' },
  { slug: 'interior-project-detail', c: 'interior', cat: 'pages', d: 'med', tags: 'project, case-study', build: 'Project case-study: hero image, brief/scope, image gallery, before/after, materials used, client quote, next-project link.' },
  { slug: 'interior-moodboard', c: 'interior', cat: 'ui-components', d: 'hard', tags: 'moodboard', build: 'Draggable moodboard: canvas where swatches/material/furniture tiles can be dragged, repositioned, and layered; palette strip auto-derived; add/remove tiles.' },
  { slug: 'interior-services', c: 'interior', cat: 'pages', d: 'easy', tags: 'services', build: 'Services: service cards (full design/e-design/consultation/styling) with description, deliverables, "from $X", enquire.' },
  { slug: 'interior-room-visualizer', c: 'interior', cat: 'ui-components', d: 'hard', tags: 'visualizer', build: 'Room visualizer: a styled room illustration whose wall/floor/accent colors and material swatches change live when you pick palettes/materials; saved-looks chips.' },
  { slug: 'interior-quote-request', c: 'interior', cat: 'pages', d: 'med', tags: 'quote, form', build: 'Quote request: project type, rooms, size, budget slider, style multiselect, timeline, contact; live estimate range; submit → summary.' },
  { slug: 'interior-process-timeline', c: 'interior', cat: 'ui-components', d: 'easy', tags: 'process, timeline', build: 'Process timeline: numbered steps (discovery → concept → design → sourcing → install) with descriptions, connectors, icons.' },
  { slug: 'interior-materials-finishes', c: 'interior', cat: 'ui-components', d: 'med', tags: 'materials, swatches', build: 'Materials/finishes selector: swatch grid grouped (woods/stones/textiles/metals), click to see enlarged swatch + name/spec, build a selection tray, palette preview.' },
  { slug: 'interior-team', c: 'interior', cat: 'pages', d: 'easy', tags: 'team', build: 'Team page: designer cards with portrait, name, role, specialty, short bio, editorial layout.' },
  { slug: 'interior-before-after', c: 'interior', cat: 'ui-components', d: 'med', tags: 'before-after', build: 'Before/after slider: draggable divider comparing empty vs designed room, multiple room examples, labels.' },
  { slug: 'interior-testimonials', c: 'interior', cat: 'ui-components', d: 'easy', tags: 'testimonials', build: 'Testimonials: elegant serif quote cards with client name, project, subtle carousel.' },
  { slug: 'interior-style-quiz', c: 'interior', cat: 'ui-components', d: 'med', tags: 'quiz', build: 'Find-your-style quiz: multi-question image-choice quiz, progress, computes a style result (e.g. Japandi/Mid-century/Modern) with description + palette + next CTA.' },
  { slug: 'interior-pricing-packages', c: 'interior', cat: 'pages', d: 'easy', tags: 'pricing', build: 'Pricing packages: design package tiers with room count, revisions, deliverables, timeline; comparison; book.' },
  { slug: 'interior-lookbook', c: 'interior', cat: 'ui-components', d: 'med', tags: 'lookbook, gallery', build: 'Magazine lookbook: editorial spread layout, mixed image sizes, captions, page-turn or scroll sections, lightbox.' },
  { slug: 'interior-consultation-booking', c: 'interior', cat: 'pages', d: 'med', tags: 'consultation, booking', build: 'Consultation booking: consultation type, calendar slots, in-person/virtual toggle, details form, confirm.' },
  { slug: 'interior-landing-residential', c: 'interior', cat: 'pages', d: 'med', tags: 'landing, residential', build: 'Residential interior landing: home focus, room-by-room, warm imagery, consultation CTA.' },
  { slug: 'interior-landing-commercial', c: 'interior', cat: 'pages', d: 'med', tags: 'landing, commercial', build: 'Commercial interior landing: office/retail/hospitality focus, brand-experience angle, case logos, enquire CTA.' },
  { slug: 'interior-landing-luxury', c: 'interior', cat: 'pages', d: 'med', tags: 'landing, luxury', build: 'Luxury interior landing: refined dark-on-bone, bespoke/high-end angle, curated projects, private-consultation CTA.' },
  { slug: 'interior-landing-minimal', c: 'interior', cat: 'pages', d: 'med', tags: 'landing, minimal', build: 'Minimalist interior landing: extreme whitespace, few large images, sparse type, quiet CTA.' },

  // ── Video (20) ──
  { slug: 'video-hero-showreel', c: 'video', cat: 'pages', d: 'med', tags: 'landing, showreel', build: 'Showreel hero: full-bleed video-poster with big play button opening an in-page player (placeholder), studio name, "Watch reel"/"Book" CTAs, client logos, letterbox bars.' },
  { slug: 'video-portfolio-grid', c: 'video', cat: 'pages', d: 'med', tags: 'portfolio', build: 'Portfolio grid: video thumbnail cards (duration badge, category), hover shows animated preview/scrub, filter by type, opens detail.' },
  { slug: 'video-project-detail', c: 'video', cat: 'pages', d: 'med', tags: 'project, detail', build: 'Project detail: big player, project meta (client/role/year), synopsis, stills gallery, credits list, related films.' },
  { slug: 'video-packages', c: 'video', cat: 'pages', d: 'easy', tags: 'packages', build: 'Video packages: tiered packages (deliverables, duration, revisions, turnaround, price), popular badge, enquire.' },
  { slug: 'video-booking', c: 'video', cat: 'pages', d: 'hard', tags: 'booking', build: 'Booking flow: project type, date, package, details form, review, confirm; progress steps; confirmation.' },
  { slug: 'video-player-custom', c: 'video', cat: 'ui-components', d: 'hard', tags: 'player', build: 'Cinematic custom player: real <video> or simulated, timeline scrub with buffered, play/pause, volume, speed, fullscreen, chapters, timecode display (mono), keyboard shortcuts.' },
  { slug: 'video-reel-carousel', c: 'video', cat: 'ui-components', d: 'med', tags: 'reel, carousel', build: 'Reel carousel: horizontal snapping film cards, autoplay preview on active, prev/next, progress dots, category label.' },
  { slug: 'video-pipeline-tracker', c: 'video', cat: 'ui-components', d: 'med', tags: 'pipeline', build: 'Project pipeline: kanban-ish stages (brief → shoot → edit → grade → delivery) with project cards, drag between stages, status/due badges.' },
  { slug: 'video-testimonials', c: 'video', cat: 'ui-components', d: 'easy', tags: 'testimonials', build: 'Testimonials: client quote cards with logo, name/role, star rating, carousel; dark cinematic.' },
  { slug: 'video-services-gear', c: 'video', cat: 'pages', d: 'easy', tags: 'services, gear', build: 'Services & gear: services list (film/edit/color/aerial), gear showcase cards (camera/lenses/lighting) with specs.' },
  { slug: 'video-grade-before-after', c: 'video', cat: 'ui-components', d: 'med', tags: 'color-grade, before-after', build: 'Color-grade before/after: draggable slider comparing ungraded vs graded frame, multiple looks, LUT-name labels.' },
  { slug: 'video-pricing', c: 'video', cat: 'pages', d: 'easy', tags: 'pricing', build: 'Pricing: rate cards (half-day/full-day/project), add-ons, comparison, request-quote CTA.' },
  { slug: 'video-vimeo-grid', c: 'video', cat: 'ui-components', d: 'med', tags: 'grid, hover-preview', build: 'Hover-preview video grid: thumbnail grid where hovering plays a muted looping preview + shows title/duration, click opens modal player.' },
  { slug: 'video-storyboard', c: 'video', cat: 'ui-components', d: 'med', tags: 'storyboard', build: 'Storyboard frames: numbered board panels with sketch placeholder, shot type/camera-move/duration notes, add/reorder frames, scene grouping.' },
  { slug: 'video-contact-brief', c: 'video', cat: 'pages', d: 'med', tags: 'brief, form', build: 'Project brief form: project type, goal, audience, deliverables checklist, budget, deadline, references links; submit → summary.' },
  { slug: 'video-landing-wedding', c: 'video', cat: 'pages', d: 'med', tags: 'landing, wedding', build: 'Wedding film landing: romantic-cinematic, sample films, packages, testimonials, enquire CTA.' },
  { slug: 'video-landing-commercial', c: 'video', cat: 'pages', d: 'med', tags: 'landing, commercial', build: 'Commercial/brand film landing: bold, client logos, case reels, ROI/engagement angle, quote CTA.' },
  { slug: 'video-landing-musicvideo', c: 'video', cat: 'pages', d: 'med', tags: 'landing, musicvideo', build: 'Music-video landing: vibrant energetic accents, artist reels, style, booking CTA.' },
  { slug: 'video-landing-documentary', c: 'video', cat: 'pages', d: 'med', tags: 'landing, documentary', build: 'Documentary landing: editorial storytelling tone, film stills, festival laurels, contact CTA.' },
  { slug: 'video-landing-realestate', c: 'video', cat: 'pages', d: 'med', tags: 'landing, realestate', build: 'Real-estate video landing: property-tour focus, packages (tour/drone/social), turnaround promise, order CTA.' },
]

function buildPrompt(s) {
  const col = COLLECTIONS[s.c]
  const type = s.cat === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const title = `${cap(s.c)} — ${titleize(s.slug, s.c)}`
  const tagList = `[${s.c}, ${s.tags}]`
  return `You are generating ONE production-quality static UI demo resource. Self-contained, polished, visually distinctive — not a placeholder.

${BASE_STYLE}

PALETTE / THEME for this collection (use it): ${col.palette}

RESOURCE: ${s.slug}
COLLECTION: ${s.c}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/index.mdx — EXACTLY this frontmatter (write a rich 55-90 word description yourself, no internal double-quotes), then a short prose body (2-3 paragraphs describing the UI + interactions):

---
slug: ${s.slug}
title: "${title}"
description: "<one-line rich description>"
category: ${s.cat}
type: ${type}
tags: ${tagList}
tech: [html, css, vanilla-js]
difficulty: ${s.d}
targets: [html]
collections: [${s.c}]
labRoute: /${s.cat}/${s.slug}
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-07-01
updatedAt: 2026-07-01
---

2. ${dir}/snippets/html.html — full <!doctype html>, all Google Font <link>s, <link rel="stylesheet" href="style.css">, semantic markup, <script src="script.js"></script> before </body>.
3. ${dir}/snippets/style.css — all styles, :root palette first, substantial + responsive (@media max-width:520px).
4. ${dir}/snippets/script.js — working vanilla JS interactions, no external libs.

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active/focus states, badges, smooth micro-interactions, genuinely interactive script. No TODOs or lorem ipsum.

After writing all files, return your result.`
}

function cap(x) { return x.charAt(0).toUpperCase() + x.slice(1) }
function titleize(slug, c) {
  return slug.replace(new RegExp('^' + c + '-'), '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

phase('Generate')
log(`Generando ${SPECS.length} recursos de temas (dating/coach/interior/video)…`)

const RESULT = {
  type: 'object',
  properties: { slug: { type: 'string' }, files: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } },
  required: ['slug', 'files'],
}

const results = await parallel(
  SPECS.map((s) => () => agent(buildPrompt(s), { label: s.slug, phase: 'Generate', agentType: 'general-purpose', schema: RESULT }))
)

const ok = results.filter(Boolean)
return {
  requested: SPECS.length,
  completed: ok.length,
  missing: SPECS.filter((s) => !ok.find((r) => r.slug === s.slug)).map((s) => s.slug),
}
