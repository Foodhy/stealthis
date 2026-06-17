// ===========================================================================
// Tanda 2 — Phases 37 (LMS), 41 (Delivery), 39 (Streaming). 54 resources.
// Collections: elearning | delivery | streaming. Each spec carries its own.
// ===========================================================================

export const meta = {
  name: 'tanda2-verticals-build',
  description: 'Build 54 resources across LMS / Delivery / Streaming verticals',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

const COMMON = `- Google Font Inter via <link> (weights 400;500;600;700;800), font-family: "Inter", system-ui, -apple-system, sans-serif (unless a variant calls for a display/serif/mono accent — then add it too).
- Define ALL colors as CSS variables in :root first. box-sizing border-box reset, antialiased, line-height 1.5.
- Accessible: semantic landmarks, aria where relevant, WCAG AA contrast, keyboard-usable interactive elements.
- Responsive: works at desktop AND down to ~360px (add @media (max-width:520px); customer/mobile screens feel mobile-first).
- Vanilla JS only (no frameworks/build). A small toast(msg) helper is a good pattern. Realistic but clearly fictional names/data. No lorem ipsum, no TODOs.`

const STYLES = {
  elearning: `DESIGN SYSTEM — E-learning / LMS (friendly, focused-reading, clear progress):
- Palette in :root — --brand:#5b5bd6; --brand-d:#4444c2; --brand-50:#eeeefc; --accent:#13b981 (success/progress); --amber:#f59e0b; --ink:#1a1a2e; --ink-2:#44465f; --muted:#6b6e87; --bg:#f7f7fb; --surface:#ffffff; --line:rgba(26,26,46,0.1); --ok:#13b981; --danger:#e05656; radii --r-sm:8px --r-md:14px --r-lg:20px; soft shadows.
- Conventions: progress bars/rings everywhere, level/difficulty pills, lesson check-offs, calm light theme; optional dark "study" mode where it fits.
${COMMON}`,
  delivery: `DESIGN SYSTEM — Delivery / Logistics (high-clarity, map-forward, big status/ETA):
- Palette in :root — --brand:#ff5a2c (delivery orange); --brand-d:#e0461d; --ink:#16181d; --ink-2:#3b3f4a; --muted:#71757f; --bg:#f4f5f7; --surface:#ffffff; --line:rgba(22,24,29,0.1); --ok:#1f9d62 (safety green); --warn:#e89422 (alert amber); --danger:#d4493e; --track:#5b8def (map/route blue); radii --r-sm:8px --r-md:14px --r-lg:20px; soft shadows.
- Conventions: big ETA/countdown, step status trackers, map placeholders (CSS grid + SVG route + animated driver marker), mobile-first driver screens, clear delivered/pending/failed pills.
${COMMON}`,
  streaming: `DESIGN SYSTEM — Streaming Platform (dark-first cinematic, poster art, minimal chrome):
- DARK theme. Palette in :root — --bg:#0b0b0f; --surface:#15151c; --surface-2:#1e1e27; --ink:#f4f4f7; --ink-2:#b6b7c3; --muted:#83859a; --brand:#e50914 (signature red, override per landing); --accent:#ffffff; --line:rgba(255,255,255,0.1); --line-2:rgba(255,255,255,0.16); radii --r-sm:8px --r-md:12px --r-lg:18px; deep shadows + subtle glow on hover.
- Conventions: poster/landscape cards with hover scale + preview, horizontal scroll rows, gradient overlays on hero billboard, minimal top nav that fades, ratings/quality badges (HD/4K), progress bars on continue-watching.
${COMMON}`,
}

const DISCLAIMERS = {
  elearning: '> Illustrative UI only — fictional courses, not a real learning platform.',
  delivery: '> Illustrative UI only — fictional brand, not a real delivery service.',
  streaming: '> Illustrative UI only — fictional titles, not a real streaming service.',
}

function buildPrompt(s) {
  const type = s.category === 'pages' ? 'page' : 'component'
  const dir = `${BASE}/${s.slug}`
  const tags = `[${s.collection}${s.tags ? ', ' + s.tags : ''}]`
  const DISCLAIMER = DISCLAIMERS[s.collection]

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
collections: [${s.collection}]
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

  return `You are generating ONE production-quality static UI demo resource. Self-contained, polished, visually distinctive — not a generic placeholder.

${STYLES[s.collection]}

${s.palette ? `PALETTE OVERRIDE (use INSTEAD of the default palette, same quality/conventions): ${s.palette}\n` : ''}RESOURCE: ${s.slug}
TITLE: ${s.title}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths, create dirs as needed):
1. ${dir}/snippets/html.html  — full <!doctype html>, font <link>, <link rel="stylesheet" href="style.css">, markup, <script src="script.js"></script> before </body>.
2. ${dir}/snippets/style.css  — all styles, :root first, substantial + responsive.
3. ${dir}/snippets/script.js  — working vanilla JS interactions, no external libs.
4. ${dir}/index.mdx — frontmatter + prose as specified below.

${mdxInstr}

QUALITY BAR: real-feeling data, multiple cards/rows, clear hierarchy, hover/active states, badges, smooth micro-interactions, a genuinely interactive script. ${s.category === 'pages' && s.slug.includes('-landing-') ? 'FULL multi-section landing page (nav, hero, 4-5 sections, footer, mobile nav, scroll reveal).' : ''} No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // ===== Phase 37 — LMS (elearning) =====
  { collection: 'elearning', slug: 'lms-catalog', title: 'LMS — Course Catalog', category: 'pages', difficulty: 'med', tags: 'catalog, courses',
    build: 'Course catalog: filter rail (level, duration, category, price), search, sortable grid of course cards (thumbnail, title, instructor, rating, level pill, progress if enrolled). Interactive: filters + search update grid, sort dropdown, enroll toast.' },
  { collection: 'elearning', slug: 'lms-course-detail', title: 'LMS — Course Detail', category: 'pages', difficulty: 'med', tags: 'course, syllabus',
    build: 'Course detail: hero (title, instructor, rating, enroll CTA, preview video poster), syllabus accordion (modules → lessons with durations), what-you-learn list, reviews, instructor bio. Interactive: expand modules, sticky enroll bar, tabs (overview/curriculum/reviews).' },
  { collection: 'elearning', slug: 'lms-classroom', title: 'LMS — Classroom Player', category: 'pages', difficulty: 'hard', tags: 'classroom, player',
    build: 'Classroom: video player area (poster + controls), right sidebar curriculum with current lesson highlighted + check-offs, tabs below (transcript, notes, resources, Q&A). Interactive: lesson switching marks progress, note-taking textarea, transcript click-to-seek, mark-complete advances.' },
  { collection: 'elearning', slug: 'lms-quiz', title: 'LMS — Quiz / Assessment', category: 'pages', difficulty: 'hard', tags: 'quiz, assessment',
    build: 'Quiz runner: progress + timer header, one question at a time (multiple choice, multi-select, true/false), prev/next, flag for review, submit → score screen with per-question feedback. Interactive: timer countdown, selection state, scoring, review mode.' },
  { collection: 'elearning', slug: 'lms-dashboard', title: 'LMS — Learner Dashboard', category: 'pages', difficulty: 'med', tags: 'dashboard, progress',
    build: 'Learner dashboard: continue-learning cards with progress rings, streak/XP widget, weekly goal, in-progress vs completed tabs, earned certificates, upcoming deadlines. Interactive: tab switch, streak animation, resume buttons.' },
  { collection: 'elearning', slug: 'lms-certificate', title: 'LMS — Completion Certificate', category: 'pages', difficulty: 'easy', tags: 'certificate',
    build: 'Completion certificate page: framed certificate with name, course, date, signature, verification code/QR; download/share/print actions; LinkedIn-add button. Interactive: download (toast), copy verify code, print styles.' },
  { collection: 'elearning', slug: 'lms-course-card', title: 'LMS — Course Card', category: 'ui-components', difficulty: 'easy', tags: 'pattern, card',
    build: 'Reusable course card: thumbnail with level pill, title, instructor avatar, star rating, duration/lessons, price or progress bar, hover lift + quick-enroll. Show a responsive grid of ~6 variants (free/paid/in-progress/completed).' },
  { collection: 'elearning', slug: 'lms-lesson-list', title: 'LMS — Curriculum Accordion', category: 'ui-components', difficulty: 'med', tags: 'pattern, accordion',
    build: 'Curriculum/lesson accordion: modules expand to lessons (type icon video/quiz/reading, duration, lock/complete state, preview link). Interactive: expand/collapse, progress per module, completed checkmarks, locked rows.' },
  { collection: 'elearning', slug: 'lms-progress-ring', title: 'LMS — Progress Ring', category: 'ui-components', difficulty: 'easy', tags: 'pattern, progress',
    build: 'Progress ring / completion meter component: SVG circular progress with animated fill, percentage center, label; plus linear progress bar + XP/level meter variants. Interactive: buttons to set progress animate the ring.' },
  { collection: 'elearning', slug: 'lms-video-controls', title: 'LMS — Lesson Player Controls', category: 'ui-components', difficulty: 'med', tags: 'pattern, player',
    build: 'Lesson player control bar: play/pause, scrubber with buffered+played, time, volume, playback speed menu, captions toggle, quality, fullscreen, next-lesson. Interactive: working scrubber drag, speed/caption menus, keyboard shortcuts.' },
  { collection: 'elearning', slug: 'lms-quiz-question', title: 'LMS — Quiz Question Types', category: 'ui-components', difficulty: 'hard', tags: 'pattern, quiz',
    build: 'Set of quiz question components: single-choice, multi-select, true/false, drag-to-match/order, fill-in-the-blank, code snippet. Interactive: each fully interactive with check-answer showing correct/incorrect states.' },
  { collection: 'elearning', slug: 'lms-streak-badge', title: 'LMS — Streak / XP Badges', category: 'ui-components', difficulty: 'easy', tags: 'pattern, gamification',
    build: 'Gamification widgets: streak counter with flame + weekly calendar dots, XP/level bar, achievement badge grid (locked/unlocked), daily-goal ring. Interactive: claim badge animation, streak increment.' },
  { collection: 'elearning', slug: 'lms-admin-dashboard', title: 'LMS — Instructor Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, instructor',
    build: 'Instructor dashboard: KPIs (enrollments, revenue, completion rate, avg rating), revenue chart, top courses table, recent enrollments, student questions feed. Interactive: timeframe toggle redraws chart, course row drill, reply to questions.' },
  { collection: 'elearning', slug: 'lms-admin-course-builder', title: 'LMS — Course Builder', category: 'pages', difficulty: 'hard', tags: 'admin, builder',
    build: 'Course builder: left module/lesson tree (reorderable), center lesson editor (title, type, video upload mock, content), right settings (price, level, tags), publish bar. Interactive: add/remove/reorder modules & lessons, edit fields, save/publish toast.' },
  { collection: 'elearning', slug: 'lms-admin-gradebook', title: 'LMS — Gradebook', category: 'pages', difficulty: 'med', tags: 'admin, grading',
    build: 'Gradebook: students × assignments matrix with scores/status, filter by cohort, submission detail drawer for grading (rubric, feedback, grade). Interactive: filters, open drawer, enter grade updates cell, class average.' },
  { collection: 'elearning', slug: 'lms-landing-university', title: 'LMS — University Landing', category: 'pages', difficulty: 'med', tags: 'landing, university',
    palette: 'University / academic — Deep blue #1e3a8a + crimson #9b1c2e + ivory · serif headlines + sans body · scholarly, credible, established',
    build: 'University/academic e-learning landing: prestige hero, programs/degrees grid, faculty highlights, accreditation & stats band, student outcomes, testimonials, apply CTA, footer.' },
  { collection: 'elearning', slug: 'lms-landing-bootcamp', title: 'LMS — Coding Bootcamp Landing', category: 'pages', difficulty: 'hard', tags: 'landing, bootcamp',
    palette: 'Coding bootcamp — Black #0d0d12 + neon green #2bff88 + mono accent · technical mono headline + sans · intense, career-focused, high-energy',
    build: 'Coding bootcamp landing: bold hero with outcome stats (job rate, salary), curriculum timeline, tech stack, instructor/mentor section, hiring-partner logos, financing options, cohort dates CTA, footer. Animated counters.' },
  { collection: 'elearning', slug: 'lms-landing-kids', title: 'LMS — Kids Learning Landing', category: 'pages', difficulty: 'med', tags: 'landing, kids',
    palette: 'Kids learning — Bright primaries (sunny yellow, sky blue, coral) + white · rounded chunky sans · playful, safe, fun',
    build: 'Kids learning landing: playful hero with mascot, age-group cards, subject icons grid, parent-trust section (safe, ad-free, progress reports), fun testimonials, free-trial CTA, footer. Bouncy hover animations.' },
  { collection: 'elearning', slug: 'lms-landing-language', title: 'LMS — Language App Landing', category: 'pages', difficulty: 'med', tags: 'landing, language',
    palette: 'Language app — White + warm gradient (green→teal) · friendly rounded sans · gamified, motivating',
    build: 'Language-learning app landing: phone-mockup hero showing a lesson, gamified features (streaks, XP, bite-size), languages grid, social proof, pricing, app-store CTAs, footer. Animated streak/lesson demo.' },
  { collection: 'elearning', slug: 'lms-landing-cert', title: 'LMS — Professional Certification Landing', category: 'pages', difficulty: 'med', tags: 'landing, certification',
    palette: 'Professional certification — Slate #1f2937 + gold #c8a24b + white · clean authoritative sans · B2B, credible',
    build: 'Professional certification landing: authoritative hero, certification paths, exam/curriculum overview, employer-recognition logos, salary-uplift stats, testimonials, enroll CTA, footer.' },

  // ===== Phase 41 — Delivery (delivery) =====
  { collection: 'delivery', slug: 'ship-track', title: 'Delivery — Live Order Tracking', category: 'pages', difficulty: 'hard', tags: 'tracking, map',
    build: 'Live order tracking: map area with animated route + driver marker, big ETA, status step tracker (placed→preparing→out→delivered), driver card (name, photo, call/message), order summary. Interactive: animated driver moving along route, status advancing, ETA countdown.' },
  { collection: 'delivery', slug: 'ship-order-detail', title: 'Delivery — Order Detail', category: 'pages', difficulty: 'easy', tags: 'order, receipt',
    build: 'Order detail / receipt: items list with qty & price, totals breakdown (subtotal, fees, tip, total), delivery address + instructions, payment method, status, reorder/help actions. Interactive: reorder toast, rate-order stars, expand fee breakdown.' },
  { collection: 'delivery', slug: 'ship-schedule', title: 'Delivery — Schedule a Delivery', category: 'pages', difficulty: 'med', tags: 'schedule, booking',
    build: 'Schedule-a-delivery flow: pickup/dropoff address inputs, package size selector, date + time-slot picker, service level (standard/express), price estimate, confirm. Interactive: slot selection, live price update by service/size, confirm success.' },
  { collection: 'delivery', slug: 'ship-driver-route', title: 'Delivery — Driver Route', category: 'pages', difficulty: 'hard', tags: 'driver, route',
    build: 'Mobile-first driver route screen: map with stops, next-stop card (address, customer, ETA, navigate), stop list with sequence, earnings-so-far header, accept/decline new order sheet. Interactive: complete-stop advances to next, swipe/accept order, collapse list.' },
  { collection: 'delivery', slug: 'ship-driver-delivery', title: 'Delivery — Delivery Confirm', category: 'pages', difficulty: 'med', tags: 'driver, proof',
    build: 'Mobile delivery-confirmation: customer + address, photo-proof capture mock, signature pad (canvas), drop-off notes, leave-at-door option, confirm-delivered button. Interactive: working signature canvas, photo placeholder capture, confirm success animation.' },
  { collection: 'delivery', slug: 'ship-driver-earnings', title: 'Delivery — Driver Earnings', category: 'pages', difficulty: 'easy', tags: 'driver, earnings',
    build: 'Driver earnings / shift summary: today total + breakdown (base, tips, bonus), trips count, hours, weekly bar chart, recent trips list, cash-out button. Interactive: day/week toggle, chart bars, cash-out toast.' },
  { collection: 'delivery', slug: 'ship-status-tracker', title: 'Delivery — Status Step Tracker', category: 'ui-components', difficulty: 'easy', tags: 'pattern, status',
    build: 'Reusable status step tracker: horizontal + vertical variants (placed → confirmed → out for delivery → delivered), animated active step, timestamps, current-state highlight. Interactive: buttons to advance state animate the tracker.' },
  { collection: 'delivery', slug: 'ship-eta-badge', title: 'Delivery — ETA / Countdown Badge', category: 'ui-components', difficulty: 'easy', tags: 'pattern, eta',
    build: 'ETA / countdown badge set: live countdown badge, "arriving now" pulse, delayed (amber) state, delivered (green) state, time-window pill. Interactive: live ticking countdown, state transitions.' },
  { collection: 'delivery', slug: 'ship-map-route', title: 'Delivery — Map Route', category: 'ui-components', difficulty: 'hard', tags: 'pattern, map',
    build: 'Map-with-route component: stylized map background (CSS grid + roads), SVG route polyline from origin to destination, animated moving driver marker, pickup/dropoff pins, recenter button. Interactive: marker animates along the path, play/pause, ETA updates.' },
  { collection: 'delivery', slug: 'ship-package-row', title: 'Delivery — Package / Shipment Row', category: 'ui-components', difficulty: 'easy', tags: 'pattern, list',
    build: 'Reusable shipment list row: tracking number, route (from → to), status pill, ETA, carrier icon, progress mini-bar; expandable for tracking history timeline. Show a list of ~8 with varied states. Interactive: expand row history.' },
  { collection: 'delivery', slug: 'ship-admin-dispatch', title: 'Delivery — Dispatch Board', category: 'pages', difficulty: 'hard', tags: 'admin, dispatch',
    build: 'Dispatch board: unassigned orders column + driver columns (kanban), each card with pickup/dropoff & priority, live driver status sidebar, assign by drag/select. Interactive: assign order to driver, filter, live counts, reassign.' },
  { collection: 'delivery', slug: 'ship-admin-warehouse', title: 'Delivery — Warehouse / Picking', category: 'pages', difficulty: 'med', tags: 'admin, warehouse',
    build: 'Warehouse / inventory & picking: pick-list queue with bin locations, item rows with qty & scan-to-pick check-off, inventory levels table with low-stock flags, zone map teaser. Interactive: check off picks (progress), filter low stock, complete pick-list.' },
  { collection: 'delivery', slug: 'ship-landing-food', title: 'Delivery — Food Delivery Landing', category: 'pages', difficulty: 'med', tags: 'landing, food',
    palette: 'Food delivery — White + appetite red/orange (#ff5a2c) + sunny yellow · friendly bold sans · fast, tasty, crave-able',
    build: 'Food-delivery landing: hero with address input + food imagery, cuisine categories, featured restaurants grid, how-it-works, app download + driver/partner CTAs, footer. Mobile nav, scroll reveal.' },
  { collection: 'delivery', slug: 'ship-landing-parcel', title: 'Delivery — Parcel / Courier Landing', category: 'pages', difficulty: 'med', tags: 'landing, parcel',
    palette: 'Parcel / courier — Blue #1d4ed8 + white + slate · clean sans · reliable, trustworthy',
    build: 'Parcel/courier landing: hero with track-your-package input, services (same-day, next-day, international), pricing calculator teaser, coverage map, business solutions, CTA, footer. Interactive track + quote widgets.' },
  { collection: 'delivery', slug: 'ship-landing-freight', title: 'Delivery — Freight / B2B Logistics Landing', category: 'pages', difficulty: 'hard', tags: 'landing, freight',
    palette: 'Freight / B2B logistics — Slate #1e293b + safety amber #f59e0b + steel · industrial condensed sans · heavy-duty, enterprise',
    build: 'Freight/B2B logistics landing: industrial hero, services (FTL, LTL, intermodal, warehousing), fleet/network stats, real-time visibility feature, enterprise logos, request-quote CTA, footer. Animated stats.' },
  { collection: 'delivery', slug: 'ship-landing-grocery', title: 'Delivery — Grocery Delivery Landing', category: 'pages', difficulty: 'med', tags: 'landing, grocery',
    palette: 'Grocery delivery — Fresh green #16a34a + cream + orange · rounded friendly sans · wholesome, fresh',
    build: 'Grocery-delivery landing: hero with basket/produce imagery + zip input, category tiles, fresh-guarantee section, membership/subscription pricing, how-it-works, app CTAs, footer. Mobile nav, reveal.' },
  { collection: 'delivery', slug: 'ship-landing-lastmile', title: 'Delivery — Last-mile / Instant Landing', category: 'pages', difficulty: 'med', tags: 'landing, lastmile',
    palette: 'Last-mile / instant — Black #0b0b0f + electric lime #c6ff00 · bold sans · speed, urgency, modern',
    build: 'Last-mile/instant-delivery landing: high-energy hero ("in minutes"), live-ETA demo, coverage cities, use-cases, rider/partner CTA, app download, footer. Animated ETA/speed motifs.' },

  // ===== Phase 39 — Streaming (streaming) =====
  { collection: 'streaming', slug: 'stream-browse', title: 'Streaming — Browse Home', category: 'pages', difficulty: 'hard', tags: 'browse, home',
    build: 'Streaming browse home: full-width hero billboard (featured title, gradient overlay, play/info), multiple horizontal scroll rows (Continue Watching with progress, Trending, New, by genre), top nav that condenses on scroll. Interactive: row horizontal scroll, hover-scale posters with preview, hero rotate.' },
  { collection: 'streaming', slug: 'stream-title-detail', title: 'Streaming — Title Detail', category: 'pages', difficulty: 'med', tags: 'title, detail',
    build: 'Title detail: backdrop hero (title, meta, play/add-list/like), synopsis, episode list with season tabs (for series), cast row, similar titles row. Interactive: season switching, episode hover, add-to-list toggle, expand cast.' },
  { collection: 'streaming', slug: 'stream-player', title: 'Streaming — Video Player', category: 'pages', difficulty: 'hard', tags: 'player, video',
    build: 'Full-screen video player: poster/backdrop, center play, bottom control bar (scrubber w/ buffered, time, volume, captions, settings/quality, next-episode, fullscreen), auto-hiding controls, next-up card near end, skip-intro button. Interactive: working scrubber, controls auto-hide, settings menu, skip-intro.' },
  { collection: 'streaming', slug: 'stream-search', title: 'Streaming — Search / Category Grid', category: 'pages', difficulty: 'med', tags: 'search, browse',
    build: 'Search & category grid: search bar with live suggestions, genre filter chips, responsive poster grid with hover, empty/loading states. Interactive: type-to-filter grid, genre chips, sort, hover previews.' },
  { collection: 'streaming', slug: 'stream-profiles', title: 'Streaming — Profile Switcher', category: 'pages', difficulty: 'easy', tags: 'profiles, account',
    build: 'Who-is-watching profile select: centered grid of avatar profiles + add-profile, kids badge, manage-profiles mode (edit/delete), hover scale. Interactive: select profile (loading transition), toggle manage mode, add profile.' },
  { collection: 'streaming', slug: 'stream-poster-card', title: 'Streaming — Poster Card', category: 'ui-components', difficulty: 'med', tags: 'pattern, card',
    build: 'Reusable poster/landscape card: artwork, hover expands to preview (title, meta, play/add/like, progress bar), quality badge. Show a row + grid of variants (movie/series/continue-watching). Interactive: hover preview, add-to-list, mute toggle.' },
  { collection: 'streaming', slug: 'stream-content-row', title: 'Streaming — Carousel Row', category: 'ui-components', difficulty: 'med', tags: 'pattern, carousel',
    build: 'Reusable content carousel row: title, horizontal scroll with left/right arrow controls, snap, lazy-load placeholders, pagination dots, "explore all" end card. Interactive: arrow + drag scroll, snap, hover reveals arrows.' },
  { collection: 'streaming', slug: 'stream-player-controls', title: 'Streaming — Player Control Bar', category: 'ui-components', difficulty: 'hard', tags: 'pattern, player',
    build: 'Standalone player control bar component: play/pause, scrubber with buffered/hover-preview tooltip, time, volume slider, captions, settings/quality menu, next-episode, PiP, fullscreen, auto-hide. Interactive: full scrubber drag with thumbnail tooltip, menus, keyboard shortcuts.' },
  { collection: 'streaming', slug: 'stream-episode-list', title: 'Streaming — Episode Picker', category: 'ui-components', difficulty: 'med', tags: 'pattern, episodes',
    build: 'Episode picker / season tabs: season dropdown/tabs, episode rows (thumbnail, number, title, duration, progress, synopsis), now-playing highlight, downloaded badge. Interactive: season switch, episode select, expand synopsis, progress bars.' },
  { collection: 'streaming', slug: 'stream-hero-billboard', title: 'Streaming — Hero Billboard', category: 'ui-components', difficulty: 'med', tags: 'pattern, hero',
    build: 'Featured hero billboard: full-bleed backdrop with gradient scrim, logo/title, meta badges, synopsis, play + more-info buttons, mute/replay, auto-rotating featured carousel with indicator dots. Interactive: auto-rotate, manual dots, mute toggle.' },
  { collection: 'streaming', slug: 'stream-account', title: 'Streaming — Account / Plan', category: 'pages', difficulty: 'easy', tags: 'account, billing',
    build: 'Account & plan screen: current plan card with upgrade options, billing history, registered devices list (remove), playback settings, profiles summary. Interactive: change-plan modal, remove device, toggle settings, cancel flow.' },
  { collection: 'streaming', slug: 'stream-admin-dashboard', title: 'Streaming — Content Dashboard', category: 'pages', difficulty: 'hard', tags: 'admin, analytics',
    build: 'Content analytics dashboard (dark admin): KPIs (active viewers, watch hours, retention, churn), viewership line chart, top titles table, retention curve, regional heat list. Interactive: timeframe toggle redraws charts, title drill, metric tabs.' },
  { collection: 'streaming', slug: 'stream-landing-svod', title: 'Streaming — General SVOD Landing', category: 'pages', difficulty: 'hard', tags: 'landing, svod',
    palette: 'General SVOD (Netflix-style) — Black #0b0b0f + signature red #e50914 · bold sans · blockbuster, premium',
    build: 'General SVOD marketing landing: dark hero with title-wall backdrop + email-to-start, value props (watch anywhere, download, cancel anytime), content showcase rows, plan/pricing cards, FAQ accordion, footer. Mobile nav, reveal.' },
  { collection: 'streaming', slug: 'stream-landing-kids', title: 'Streaming — Kids Streaming Landing', category: 'pages', difficulty: 'med', tags: 'landing, kids',
    palette: 'Kids streaming — Bright (purple, sky, sunshine) + rounded · playful rounded sans · safe, fun, colorful',
    build: 'Kids-streaming landing: playful hero with characters, parental-controls trust section, age-appropriate content tiles, educational value, family pricing, testimonials from parents, CTA, footer. Bouncy animations.' },
  { collection: 'streaming', slug: 'stream-landing-sports', title: 'Streaming — Live Sports Landing', category: 'pages', difficulty: 'med', tags: 'landing, sports',
    palette: 'Live sports — Dark #0b0e14 + electric green #1aff6a · condensed bold sans · live, urgent, competitive',
    build: 'Live-sports streaming landing: hero with live-now badge + upcoming fixtures ticker, leagues grid, multi-view/stats features, schedule, pricing/passes, CTA, footer. Animated live ticker, reveal.' },
  { collection: 'streaming', slug: 'stream-landing-niche', title: 'Streaming — Niche / Indie Landing', category: 'pages', difficulty: 'med', tags: 'landing, niche',
    palette: 'Niche / indie (anime, docs) — Moody charcoal + bold accent (amber or magenta) · editorial sans/serif mix · curated, cool, cinephile',
    build: 'Niche/indie streaming landing (anime or docs vibe): editorial hero, curated collections, why-curated section, creator spotlight, community, pricing, CTA, footer. Tasteful hover, reveal.' },
  { collection: 'streaming', slug: 'stream-landing-music', title: 'Streaming — Music Streaming Landing', category: 'pages', difficulty: 'hard', tags: 'landing, music',
    palette: 'Music / audio streaming — Gradient (violet→pink→orange) on near-black · modern sans · rhythmic, vibrant',
    build: 'Music-streaming landing: vibrant gradient hero with album-wall + animated equalizer, features (offline, hi-fi, playlists, podcasts), artist spotlight, plan pricing (individual/family/student), app CTAs, footer. Animated equalizer, reveal.' },
]

phase('Generate')
log(`Generando ${SPECS.length} recursos (LMS · Delivery · Streaming)…`)

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
