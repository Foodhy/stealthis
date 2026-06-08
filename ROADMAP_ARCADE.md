# Roadmap: `apps/arcade`

Phased build plan for the Duolingo-style challenges app. Each phase has a clear **goal**, **scope**, and **exit criteria**. Don't move to the next phase until exit criteria are met.

See [`PLAN_ARCADE.md`](./PLAN_ARCADE.md) for the architecture decisions, content model, and runner specs.

**Legend:** ☐ not started · ◐ in progress · ☑ done

---

## Phase 0 — Foundations

**Status: complete (2026-05-22)**

**Goal:** Schema, app shell, and one fixture render without errors.

**Scope:**
- ☑ Extend `packages/schema`:
  - `ChallengeMetaSchema` (discriminated union on `type`).
  - `LessonSchema`.
  - `loadChallenges()` and `loadLessons()` helpers in `loader.ts`.
  - Re-exports from `index.ts`.
  - Mirror TS interfaces in `types.ts`.
- ☑ Scaffold `apps/arcade`:
  - `package.json`, `astro.config.mjs` (port `4324`, `@content` / `@schema` aliases), `tailwind.config.mjs`, `tsconfig.json`.
  - `src/layouts/Base.astro` (minimal, dark theme, full-bleed).
  - `src/content/config.ts` wiring `challenges` + `lessons` collections via the `glob` loader.
  - `src/pages/index.astro` listing topics from challenges directory.
- ☑ Add `packages/content/challenges/css-grid-basics-quiz/index.mdx` (single quiz fixture).
- ☑ Add `packages/content/challenges/_lessons/css-grid/basics.yaml`.
- ☑ Add root scripts: `dev:arcade`, `build:arcade`. Wire into `dev` and `build` aggregates.

**Exit criteria:**
- ☑ `bun run dev:arcade` boots on port 4324.
- ☑ `/` renders the topic grid with one card.
- ☑ `bun run --filter @stealthis/arcade build` succeeds.

---

## Phase 1 — Vertical slice: quiz runner

**Status: complete (2026-05-22)** — build verified; in-browser interaction not yet tested.

**Goal:** One quiz challenge plays end-to-end. Click answer → see correct/incorrect → click "next" → result screen.

**Scope:**
- ☑ `src/pages/[topic]/[lesson].astro` — sequential lesson runner.
- ☑ `src/components/runners/QuizRunner.astro`.
- ☑ `src/components/Chrome.astro` — sticky top progress bar.
- ☑ Inline result screen on the lesson page (no separate route — simpler).
- ☑ Client-side state in a single `<script>` block. `localStorage` key: `arcade:progress`.
- ☑ Topic grid + lesson list read progress and show completion counts.

**Exit criteria:**
- ☑ Build succeeds, all three routes prerendered.
- ☐ Manual run-through in browser confirms flow. (Pending eyes-on test.)
- ☐ Lighthouse ≥ 90. (Pending.)

**2026-05-22 fix pass:** Tightened `Base.astro` head — added meta description, theme-color, canonical link, OG and Twitter tags. Should lift Lighthouse SEO/best-practices scores without further work.

---

## Phase 2 — `complete` runner + multi-challenge lessons

**Status: complete (2026-05-22)** — build verified; retry-on-wrong deferred.

**Goal:** Lessons with mixed challenge types, including fill-in-the-blank.

**Scope:**
- ☑ `src/components/runners/CompleteRunner.astro` — parses `{{BLANK_N}}` markers, renders inline inputs, trim + case-insensitive by default.
- ☑ Author 4 more challenges. `basics.yaml` now has 5 challenges interleaving quiz + complete.
- ☑ Lesson runner advances through mixed types; tracks per-challenge correctness; per-blank red/green feedback.
- ☐ "Retry" on wrong (deferred — explanation panel is enough for MVP).

**Exit criteria:**
- ☑ A 5-challenge lesson (3 quiz, 2 complete) plays through, tracks per-challenge state, lands on result screen.

---

## Phase 3 — Polish & feel

**Status: partial (2026-05-22)** — keyboard nav + pips + transitions landed; mobile/empty-state pass deferred.

**Goal:** Feels good to use. Keyboard-first. Snappy.

**Scope:**
- ☑ Keyboard bindings: `Enter` = Check/Next, `1..4` = pick option, `Esc` = skip (marks incorrect).
- ☑ CSS transition between challenges (fade + slide on `[data-active]`).
- ☑ Difficulty pips (1–5 dots, refresh per slide).
- ☑ Topic icons (`TopicIcon.astro` — css-grid/html/javascript/react + fallback).
- ☑ Mobile-responsive pass at 375px (Chrome compacts: back-link hides topic text, pips hidden, page padding tightens to px-4).
- ☐ Empty/loading states beyond the basic "no topics yet". (Deferred.)

**Exit criteria:**
- ☑ Run a lesson with keyboard only (Enter/digits/Esc).
- ☑ Mobile pass (build verified; visual verification still pending eyes-on).

---

## Phase 4 — `fix` runner (hardest piece)

**Status: v1 complete (2026-05-22)** — textarea editor instead of CodeMirror; CodeMirror upgrade deferred.

**Goal:** Edit broken code in-browser, see live preview, get pass/fail vs. solution.

**Scope:**
- ☐ ~~CodeMirror 6~~ — deferred. v1 uses a plain `<textarea>` for editor input. CodeMirror layered on later for syntax highlighting / line numbers.
- ☑ `src/components/runners/FixRunner.astro` (no React island needed for v1).
- ☑ `src/lib/sandbox.ts` — `buildSrcdoc()` helper + `IFRAME_SANDBOX` constant.
- ☑ `src/lib/dom-compare.ts` — normalized DOM snapshot + `domEqual()`.
- ☑ Pass criterion: `dom-equal` (default) and `regex` (alternative). Both user output and solution output rendered in separate iframes with `sandbox="allow-scripts"`.
- ☑ Author 2 `fix` challenges in `_lessons/css-grid/practice.yaml`.

**Exit criteria:**
- ☑ Build green; lesson page emits textareas + iframes with the expected attributes.
- ☐ Manual playthrough: editing the broken HTML to the solution makes Check turn green. (Pending eyes-on test.)
- ☑ Iframe sandbox is `allow-scripts` only — no `allow-same-origin`, no `allow-top-navigation`, no `allow-forms`, no `allow-popups`. User code runs JS but cannot escape the iframe, talk to the parent, or navigate.

**2026-05-22 fix pass:** Editor gained a line-number gutter that stays in sync with the textarea on edit + scroll. Closes the most-missed CodeMirror feature without any new dependencies. Full CodeMirror upgrade still deferred.

---

## Phase 5 — `identify` + `animation` runners

**Status: complete (2026-05-22)** — build verified; in-browser interaction pending.

**Goal:** Full set of challenge types available.

**Scope:**
- ☑ `IdentifyRunner.astro` — handles both variants: if `options` present → MCQ over the code block; otherwise → click-a-line on each line of the snippet.
- ☑ `AnimationRunner.astro` — renders `embed` HTML inside a sandboxed iframe. Optional `followUp` MCQ; "I get it" button when no follow-up. Schema gained `embed: string` field (alongside `component` for future use).
- ☑ One animation challenge (`css-grid-fr-animation` — fr units redistribute space, 4s loop, with follow-up).
- ☑ Two identify challenges — click-line (`css-grid-spot-the-bug-line`) and MCQ (`css-grid-spot-the-bug-mcq`).
- ☑ New `_lessons/css-grid/advanced.yaml` running all three.

**Exit criteria:**
- ☑ All 5 runner types exist with hand-authored examples.
- ☑ Build green; advanced lesson prerenders with 1 animation iframe + 2 identify slides.

---

## Phase 6 — Generator pipeline

**Status: partial (2026-05-22)** — generator and scripts landed; manual quality review pending.

**Goal:** Bulk-generate baseline challenges from existing resource snippets.

**Scope:**
- ☑ `scripts/generate-challenges.ts` walking `packages/content/resources/*/snippets/`.
- ☑ Strategy modules: `remove-css-property`, `blank-identifier`, `delete-closing-tag`, `wrong-value-mcq`. (`swap-lines` deferred.)
- ☑ Output to `packages/content/challenges/_generated/<slug>/`. Idempotent overwrites.
- ☑ Per-challenge `quality: draft | published` field; only `published` appears in default lessons.
- ☑ Root script: `bun run generate:challenges`.

**Exit criteria:**
- ☑ Running the script produces ≥ 20 generated challenges across ≥ 3 topics.
- ☑ All generated challenges parse with `ChallengeMetaSchema`.
- Manually reviewing 5 produces ≥ 3 that are reasonable (not trivially solvable, not impossible).

---

## Phase 7 — Integration with the rest of stealthis

**Status: partial (2026-05-22)** — Nav done; i18n, MCP, deploy pending.

**Goal:** Arcade is discoverable and lives alongside the other apps.

**Scope:**
- ☑ Add "Arcade" link to `apps/www/src/components/Nav.astro` with `New!` badge (replaces the prior badges on Applications + Zen Pomodoro).
- ☑ Add `SITE_URLS.arcade` (`localhost:4329` dev, `arcade.stealthis.dev` prod).
- ☑ Add `nav.arcade` to all 17 i18n locales.
- ☐ Spanish routes inside the arcade app itself (`/es/`, `/es/css-grid`, etc.).
- ☐ MCP tools: `list_challenges`, `get_challenge`, `list_lessons_by_topic` in `apps/mcp`. Regenerate `apps/mcp/src/catalog.json` to include challenges.
- ☐ Deploy via `wrangler pages deploy apps/arcade/dist --project-name stealthis-arcade`.
- ☐ Add deploy step to root `deploy` script.

**Exit criteria:**
- ☐ Production URL live.
- ☐ MCP server returns challenges via the new tools.
- ☐ Spanish locale works for at least the topic grid + one lesson.

---

## Post-MVP / v2 (not scheduled)

- ☐ Accounts (Cloudflare D1 or external auth). Streaks, XP, hearts.
- ☐ Daily challenge + spaced repetition.
- ☐ Leaderboards.
- ☐ User-submitted challenges (with moderation).
- ☐ AI hint system (LLM nudge, never the answer).
- ☐ Visual-diff pass criterion for `fix` (pixelmatch in a worker).
- ☐ Mobile app (Capacitor or React Native wrapper).

---

## Phase ordering rationale

- **P0 first** because nothing renders without schema + scaffold. Tightest feedback loop.
- **P1 quiz before everything else** because it's the cheapest end-to-end vertical slice — exercises page routing, lesson YAML, state, and progress storage without needing an editor or iframe.
- **P2 `complete` next** because it reuses P1's chrome with a different input widget.
- **P3 polish before P4** so the core loop feels good before adding hard-to-test pieces.
- **P4 `fix` ahead of `identify`/`animation`** because `fix` is the riskiest piece and gates trust in the whole platform. De-risk it early.
- **P6 generator after the runners exist**, so the generator can target real components.
- **P7 integration last** — don't ship until the loop feels good.

## How to update this file

When you finish work, flip the ☐ to ☑ inline. When a phase's exit criteria are all met, append `**Status: complete (<date>)**` under the phase header. Don't rewrite history — just add status lines.
