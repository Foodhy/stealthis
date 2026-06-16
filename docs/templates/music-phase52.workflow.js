// ===========================================================================
// Workflow — Phase 52 (Music / Album / Artist Theme) — 22 resources
// ===========================================================================
export const meta = {
  name: 'music-phase52-finish',
  description: 'Generate the 22 Phase 52 music resources (mdx + html/css/js)',
  phases: [{ title: 'Generate', detail: 'one agent per resource' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'
const COLLECTION = 'music'

const STYLE = `DESIGN SYSTEM (match exactly unless a PALETTE OVERRIDE is given):
- Google Font via <link>: "Space Grotesk" or "Sora" (bold display) + "Inter" (body) — Inter weights 400;500;600;700;800.
  Use the display font for big titles / artist names, Inter for body/UI.
- Dark-first default palette in :root —
  --bg:#0b0b0f; --bg-2:#13131a; --surface:#1a1a22; --surface-2:#22222c;
  --text:#f4f4f7; --muted:#a0a0ad; --line:rgba(255,255,255,0.10); --line-2:rgba(255,255,255,0.18);
  --accent:#1db954; --accent-2:#8b5cf6; --accent-3:#ff3d71;
  radii: --r-sm:8px --r-md:14px --r-lg:20px --r-full:999px; soft shadows, subtle glassy surfaces.
- Album-art-driven look: large CSS-drawn cover artwork (gradients/shapes, NOT <img>), accent color
  pulled from the "cover" so each card/page feels themed. Big cover imagery, rounded corners.
- Music motifs: animated equalizer bars, waveform/progress scrubbers, play/pause morph buttons,
  now-playing states, like (heart) toggles, duration timestamps (e.g. 3:42), play counts.
- box-sizing border-box reset, antialiased, line-height 1.5, --bg page background, --text foreground.
- Accessible: aria where relevant (aria-pressed on play/like, role=slider on scrubbers), WCAG AA
  contrast for body text, keyboard-usable buttons and sliders.
- Responsive: works down to ~360px (add a @media (max-width:520px) section).
- Vanilla JS only (no frameworks/build, no audio files — simulate playback with timers/transforms).
  A small toast(msg) helper is a good pattern.
- Realistic but clearly fictional artists/albums/tracks (e.g. "Neon Tides", "Velvet Static",
  album "Midnight Reservoir", track "Paper Lanterns").`

const DISCLAIMER = '> Illustrative UI only — fictional artists, albums, tracks, and data. No real audio playback.'

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
createdAt: 2026-06-08
updatedAt: 2026-06-08
---

## ${s.title.replace(/^.*— /, '')}

<2-3 short paragraphs describing the UI and its interactions.>

${DISCLAIMER}

(The body MUST end with that exact disclaimer line.)`

  return `You are generating ONE production-quality static UI demo resource for a Music/Album/Artist collection. It must be self-contained, polished, and visually distinctive — not a generic placeholder.

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

QUALITY BAR: real-feeling content, multiple cards/rows/tracks, clear hierarchy, hover/active states, animated player/equalizer/waveform motifs, smooth micro-interactions, a genuinely interactive script (simulated playback with timers, working scrubbers/toggles). No TODOs or lorem ipsum.

After writing the files, return your result.`
}

const SPECS = [
  // 52.B — Player Patterns (toolkit first)
  { slug: 'music-player-bar', title: 'Music — Sticky Bottom Player Bar', category: 'ui-components', difficulty: 'med', tags: 'player, playback',
    build: 'A sticky bottom now-playing player bar: left = small album cover + track title + artist + like (heart) toggle; center = transport controls (shuffle, prev, play/pause morph, next, repeat) with a clickable progress scrubber showing current/total time that advances while "playing"; right = volume slider (with mute), queue button, and a fullscreen/expand button. JS: simulated playback timer drives the progress bar and time labels, play/pause toggles a small equalizer animation, scrubber seek by click/drag, volume + like toggles, all keyboard-accessible.' },
  { slug: 'music-player-full', title: 'Music — Full-Screen Now Playing', category: 'ui-components', difficulty: 'hard', tags: 'player, now-playing',
    build: 'A full-screen "Now Playing" view: huge centered CSS-drawn album cover with a soft ambient color glow pulled from the cover, blurred cover-art backdrop, track title + artist, a large waveform/progress scrubber with time labels, big transport controls (shuffle/prev/play-pause/next/repeat), like + add-to-playlist + share + queue actions, and a lyrics/up-next toggle drawer. JS: simulated playback advances the scrubber + animates the cover (subtle vinyl-spin or pulse), play/pause, seek by drag, like toggle, and a swap-track that recolors the ambient glow.' },
  { slug: 'music-waveform', title: 'Music — Waveform / Progress Scrubber', category: 'ui-components', difficulty: 'med', tags: 'waveform, scrubber',
    build: 'A reusable waveform progress scrubber (SoundCloud-style): a row of CSS-drawn vertical bars of varying heights; the played portion is filled with the accent color, the unplayed portion muted; a draggable playhead with a time tooltip; hover shows a preview position line. Below it: play/pause, current/total time, and a playback-speed selector. JS: generate a deterministic bar pattern, simulated playback fills bars over time, click/drag to seek, hover preview, and speed affects fill rate. Smooth and precise.' },
  { slug: 'music-equalizer-anim', title: 'Music — Animated Equalizer Bars', category: 'ui-components', difficulty: 'easy', tags: 'equalizer, animation',
    build: 'An animated equalizer / audio-visualizer component: several sets of bouncing equalizer bars in different styles (classic bars, dots, mirrored center-out, circular radial). Bars animate with staggered CSS keyframes to feel like reacting to audio. A play/pause toggle starts/stops the animation (bars settle flat when paused), a "bands" slider changes bar count, a speed slider changes tempo, and an accent color picker recolors them. JS drives play/pause state, band count, speed (animation-duration), and color.' },
  { slug: 'music-track-row', title: 'Music — Track List Row', category: 'ui-components', difficulty: 'easy', tags: 'track, list, row',
    build: 'A polished track-list row component shown as a small tracklist (6-8 rows): each row has an index number that swaps to a play button on hover (and to an animated equalizer when "playing"), track title + artist, album name, a like (heart) toggle, play count, a "..." more menu, and duration. The currently-playing row is highlighted with accent text. JS: clicking a row plays it (sets active row + equalizer, others reset), like toggles per row, hover number/play swap, and an optional drag handle. Clean, dense, Spotify-like.' },
  { slug: 'music-queue-panel', title: 'Music — Up-Next Queue Panel', category: 'ui-components', difficulty: 'med', tags: 'queue, panel',
    build: 'An "up next" queue side panel: a header with "Now playing" (single highlighted track with equalizer) and a "Next in queue" section listing upcoming tracks (cover, title, artist, duration, drag handle). Each queued item is reorderable (drag to reorder, up/down fallback buttons) and removable (x). A "Clear queue" button and a "From: <playlist>" source label. JS: reorder via drag-and-drop with live preview, remove items, clear-all with toast, and clicking a queued track promotes it to now-playing.' },

  // 52.A — Listener-Facing
  { slug: 'music-artist-page', title: 'Music — Artist Page (hero · top tracks · about)', category: 'pages', difficulty: 'med', tags: 'artist, profile, page',
    build: 'An artist profile page: full-bleed hero with a large CSS-drawn artist banner, verified artist name, monthly-listeners count, a big Play + Follow + "..." actions row; a "Popular" top-tracks list (rank, cover, title, play count, duration, like, hover-play with equalizer for the active track); a discography strip of album cards; an "About" card with bio + stats; and a "Fans also like" artist row. JS: play/pause active track with equalizer, follow toggle, show-more on top tracks, and hover states throughout. Dark, immersive, accent pulled from the artist color.' },
  { slug: 'music-album-page', title: 'Music — Album Page (tracklist · credits)', category: 'pages', difficulty: 'med', tags: 'album, tracklist, page',
    build: 'An album detail page: header with large CSS-drawn album cover, album title, artist, year · track-count · total runtime, a big Play + like + add-to-playlist + download + "..." row, and an accent glow from the cover. A full numbered tracklist (title, featured artists, play count, like, duration; active row shows equalizer). Below: a credits/notes section (producers, writers, label, ℗ line) and a "More by this artist" album row. JS: play/pause per track + album-level play, like toggles, total-runtime sum, and a tracklist sort/normal toggle.' },
  { slug: 'music-track-lyrics', title: 'Music — Track + Synced Lyrics View', category: 'pages', difficulty: 'med', tags: 'lyrics, synced, page',
    build: 'A track page with time-synced lyrics: top shows the playing track (cover, title, artist, waveform scrubber + time). The main area is a vertical lyrics list where the current line is highlighted/enlarged and auto-scrolls to center as simulated playback advances; past lines dim, upcoming lines are muted. Clicking any lyric line seeks playback to that timestamp. Controls: play/pause, a font-size toggle, and a "show timestamps" toggle. JS: a timed lyric schedule drives active-line highlighting + auto-scroll, click-to-seek, play/pause. Smooth karaoke feel.' },
  { slug: 'music-discography', title: 'Music — Discography Grid (albums · singles)', category: 'pages', difficulty: 'easy', tags: 'discography, grid, page',
    build: 'A discography page: header with artist name and release-type filter tabs (All / Albums / Singles & EPs / Compilations) plus a sort dropdown (Newest / Oldest / Most played). A responsive grid of release cards — each a CSS-drawn cover, title, year, type badge, and a hover play button overlay. JS: tab filtering, sort, hover-to-play overlay (sets an active card with equalizer), and a grid/list view toggle. Clean cover-forward layout.' },
  { slug: 'music-playlist-page', title: 'Music — Playlist Page (cover · tracks · share)', category: 'pages', difficulty: 'med', tags: 'playlist, page',
    build: 'A playlist detail page: header with a CSS-drawn mosaic/gradient playlist cover, playlist title, creator + description, track-count · total duration · likes, and a big Play + shuffle + like + share + "..." row. A track table (cover, title, artist, album, date added, duration, like, active-row equalizer). A search-within-playlist input and a sort. JS: play/shuffle, per-track like + play, search filter, sort, and a share popover with a copy-link button (toast). Editable playlist title on click is a nice touch.' },

  // 52.C — Discovery & Social
  { slug: 'music-browse', title: 'Music — Browse / Genres / New Releases', category: 'pages', difficulty: 'med', tags: 'browse, discover, page',
    build: 'A browse/discover home: a greeting header, a "New Releases" horizontal scroller of album cards, a colorful genre/mood grid of CSS-gradient category tiles (Pop, Hip-Hop, Chill, Workout, Focus, Party…), a "Made for you" mixes row, and a "Charts" top-50 preview list. JS: working horizontal scrollers (drag + arrows), hover-play overlays on cards, genre tile hover lift, and a tab switch (Music / Podcasts) that swaps the feed. Vibrant, cover-rich, Spotify-home vibe.' },
  { slug: 'music-search', title: 'Music — Search (artists · albums · tracks)', category: 'ui-components', difficulty: 'med', tags: 'search, filter',
    build: 'A music search component: a prominent search input with an animated icon; as you type, live results group into sections (Top result card, Songs, Artists, Albums, Playlists) with a category filter chip row (All / Songs / Artists / Albums) to narrow. Recent searches show when empty, with clear-all. JS: live client-side filtering over a fictional catalog dataset, debounced highlight of the matched substring, category chips, keyboard up/down to move through results + Enter to "play", and recent-search memory. Fast and tactile.' },
  { slug: 'music-profile', title: 'Music — Listener Profile (top artists · stats)', category: 'pages', difficulty: 'med', tags: 'profile, stats, page',
    build: 'A listener profile / year-in-review page: header with avatar, display name, follower/following counts and an edit-profile button; a "Top artists this month" rank list with play; a "Top genres" set of animated bars; listening-stats cards (minutes listened, tracks played, top day) with count-up; a top-tracks list; and a public-playlists strip. JS: a time-range toggle (4 weeks / 6 months / all time) that re-renders the top lists + animates the bars/counters, follow toggle, and hover-play on tracks. Personal, data-rich, celebratory.' },

  // 52.D — Artist / Label Admin
  { slug: 'music-artist-dashboard', title: 'Music — Artist Dashboard (streams · listeners · revenue)', category: 'pages', difficulty: 'hard', tags: 'dashboard, analytics, admin',
    build: 'A for-artists analytics dashboard: KPI stat cards (total streams, monthly listeners, followers, est. revenue) with trend deltas and animated count-up; a CSS/SVG line or area chart of streams over time with a range toggle (7d / 28d / 12mo); a top-tracks performance table (track, streams, listeners, saves, revenue, sortable); a "top locations" list with bar meters; and a recent-activity / milestones feed. JS: range toggle re-renders the chart, sortable table, count-up KPIs. Clean admin styling on the dark music palette.' },
  { slug: 'music-release-upload', title: 'Music — Release Upload (tracks · art · metadata)', category: 'pages', difficulty: 'med', tags: 'upload, release, admin',
    build: 'A release-upload / distribution form for artists: a cover-art drop-zone (simulated — click to pick a generated gradient cover), release metadata fields (title, primary artist, label, genre, release date, explicit toggle), and a reorderable tracklist where each row has track title, featured artists, ISRC, and an "audio uploaded ✓" simulated state with a tiny waveform. Add/remove/reorder tracks. A live "release preview" card reflects the form, and a stepper (Details → Tracks → Review). JS: add/remove/reorder tracks, live preview, drop-zone simulation, step validation, and a publish button with toast.' },

  // 52.E — Themed Music Landings (5 variants)
  { slug: 'music-landing-vinyl', title: 'Music — Vinyl / Analog Retro Landing', category: 'pages', difficulty: 'med', tags: 'landing, vinyl, retro',
    palette: 'Vinyl / analog retro — warm sepia + cream + oxblood. --bg:#241a12; --bg-2:#2e2118; --surface:#3a2a1d; --text:#f3e7d3; --muted:#c0a888; --accent:#8c2f22 (oxblood); --accent-2:#d99a4e (amber); --paper:#efe2c9. Vintage serif headings (use "Playfair Display" via link) + Inter body. Tactile, nostalgic, grainy paper texture.',
    build: 'A landing for a vinyl record shop / analog reissue label: warm hero with a spinning CSS-drawn vinyl record + tonearm, a vintage serif title, and a "Shop the press" CTA; a featured-pressings grid of record cards (sleeve + spinning disc on hover), a "why analog" feature trio (warmth, ritual, artwork), a turntable/equipment band, and a newsletter cut-out. JS: the record spins (play/pause via click on the disc, with a crackle equalizer), hover spins sleeve discs, and a tab to switch genres. Grainy, nostalgic, premium.' },
  { slug: 'music-landing-streaming', title: 'Music — Streaming / Modern Pop Landing', category: 'pages', difficulty: 'med', tags: 'landing, streaming, modern',
    palette: 'Streaming / modern pop — black + neon gradient. --bg:#08080c; --surface:#15151f; --text:#ffffff; --muted:#9a9ab0; --accent:#22e1ff (cyan); --accent-2:#a855f7 (violet); --accent-3:#ff2d95 (magenta). Bold sans (Space Grotesk/Sora). Sleek, dynamic, glassy, gradient glows.',
    build: 'A sleek modern music-streaming app landing: a dynamic hero with a phone/app mockup showing a now-playing screen, animated gradient glow blobs, a big "Start listening free" + app-store CTAs; a feature trio (offline, lossless, personalized) with glassy cards; a "millions of tracks" stat band with count-up; a plans/pricing toggle (Free / Premium / Family); and a footer. JS: animated gradient blobs, the mockup screen cycles tracks with an equalizer, monthly/annual price toggle, and scroll-reveal. Glossy, premium, dynamic.' },
  { slug: 'music-landing-festival', title: 'Music — Music Festival Landing', category: 'pages', difficulty: 'hard', tags: 'landing, festival, event',
    palette: 'Music festival — sunset gradient + black. --bg:#0c0608; --text:#fff; --muted:#d9c2c8; sunset hero gradient from #ff5e3a → #ff2d95 → #7b2ff7 over near-black; --accent:#ffd23f (gold); loud display type (use "Anton" or "Archivo Black" via link) + Inter body. Hype, energetic, poster-like.',
    build: 'A hype music-festival landing built like a gig poster: explosive hero with a sunset gradient sky, big stacked Anton lineup-poster title, dates + location, a "Get tickets" CTA and a live countdown timer to the festival; a headliner lineup poster (tiered, font-size by billing), a stages/days schedule with day tabs, a ticket-tiers pricing band (GA / VIP / Camping), an artist marquee scroller, and an FAQ/footer. JS: live countdown, day-tab schedule switch, scrolling artist marquee, ticket-tier select, and a sticky "Tickets" bar. Loud, energetic, poster-like.' },
  { slug: 'music-landing-classical', title: 'Music — Classical / Orchestra Landing', category: 'pages', difficulty: 'med', tags: 'landing, classical, orchestra',
    palette: 'Classical / orchestra — ivory + deep navy + gold. --bg:#0e1730 (deep navy); --bg-2:#13203f; --surface:#17274a; --text:#f4efe2 (ivory); --muted:#b9c0d4; --accent:#c9a24b (gold); --paper:#f4efe2. Elegant serif headings (use "Cormorant Garamond" or "Playfair Display" via link) + Inter body. Refined, timeless, generous whitespace.',
    build: 'An elegant landing for a symphony orchestra / concert season: a refined hero with a serif title, an atmospheric concert-hall CSS scene, season tagline, and a "Browse the season" CTA; a season-concerts list (date, programme, conductor, soloist, "Tickets"), a featured-conductor/soloist spotlight, a "subscribe to the season" packages band, a venue/about section, and a stately footer. JS: a concerts filter (by month/series), an elegant program-detail expand per concert, a subtle scroll-reveal, and a small "listen to a sample" play with a refined waveform. Restrained, timeless, premium.' },
  { slug: 'music-landing-hiphop', title: 'Music — Hip-Hop / Club Landing', category: 'pages', difficulty: 'hard', tags: 'landing, hiphop, club',
    palette: 'Hip-hop / club — black + chrome + acid accent. --bg:#050505; --surface:#121214; --text:#fff; --muted:#8e8e96; --accent:#caff00 (acid lime); --accent-2:#c0c0c8 (chrome); chrome/metallic gradients for headings. Condensed/heavy display (use "Archivo Black" or "Oswald" via link). Bold, street, high-contrast.',
    build: 'A bold hip-hop artist / club night landing: high-contrast hero with a chrome/metallic condensed title, an acid-lime accent, a CSS-drawn artist silhouette / cassette / boombox motif, "New album out now" + "Tour dates" CTAs, and a play button with a thumping equalizer; a latest-drop album showcase, a tour-dates list with "Tickets" buttons (sold-out states), a merch grid band, a video/visualizer block, and a footer with socials. JS: equalizer that "bumps", a marquee of track names, tour-date hover, merch hover, and a sticky CTA. Loud, street, chrome-and-acid.' },

  // 52.A — Tour dates (appended last to preserve resume cache positions)
  { slug: 'music-tour-dates', title: 'Music — Tour / Live Dates (list + tickets)', category: 'ui-components', difficulty: 'easy', tags: 'tour, dates, tickets',
    build: 'A tour / live-dates component: a header with the artist name and a region filter (All / North America / Europe / Asia) + a "Get notified" follow button. A list of upcoming shows — each row has a date block (month + day), city + venue, country flag/region tag, status (On sale / Few left / Sold out / Just announced) badge, and a "Tickets" / "Notify me" button that reflects status. A small map-pin/marquee accent. JS: region filtering, a sold-out disabled state, a "follow" toggle with toast, an expand-row for showtime/support-act details, and a count of upcoming shows. Clean dark music styling.' },
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
