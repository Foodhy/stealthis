# Plan: `apps/arcade` — Duolingo-style tech challenges

**Status:** Draft / not started
**Owner:** @GregoryInnovo
**Last updated:** 2026-05-22

A new app in the `stealthis` monorepo for short, intuitive challenges (fix a bug, fill a blank, identify a problem, quiz, animated explainer) so the user — and eventually anyone — can practice and learn tech topics tied to the existing resource catalog.

Captures the "quick rounds, immediate feedback" energy of a Duolingo loop. URL: `stealthis.dev/arcade`.

---

## 1. Goals

- Practice loop modeled on Duolingo: one challenge per screen, immediate feedback, sequence of challenges per lesson, lesson per topic.
- Reuse the existing content/schema packages — challenges link to resources where it makes sense.
- Public, no accounts in v1. Accounts/streaks/XP/leaderboards deferred to v2.
- Intuitive and simple. Minimal chrome. Keyboard-driven.

## 2. Non-goals (v1)

- User accounts, auth, server-side persistence.
- Social features (leaderboards, friends, shared progress).
- Hearts/lives economy or paid tiers.
- Mobile app — web responsive only.

---

## 3. Shape

**New app:** `apps/arcade` — Astro 5 SSG, same stack as `apps/www` / `apps/lab`. Tailwind 3 via the shared preset. Reuses `packages/content` and `packages/schema`.

**Progress storage:** `localStorage` keyed by challenge slug. No server.

**Routing:**

| Path | Purpose |
| --- | --- |
| `/arcade` | Topic grid — cards per topic with progress % |
| `/arcade/<topic>` | Lesson list for that topic |
| `/arcade/<topic>/<lesson>` | Sequential runner (challenge → check → next) |
| `/arcade/random` | Random challenge picker with topic + difficulty filter |
| `/arcade/c/<slug>` | Direct link to a single challenge |

i18n follows `apps/www`: default `en` at `/arcade`, Spanish at `/es/arcade`.

---

## 4. Content model

New content type at `packages/content/challenges/<slug>/index.mdx`.

### Frontmatter (Zod schema in `packages/schema/src/schema.ts`)

```yaml
slug: css-grid-fix-gap          # required, unique
topic: css-grid                  # required — reuse resource tags taxonomy
difficulty: 1                    # 1..5
type: fix | complete | identify | quiz | animation
resourceSlug: rest-pos-payment   # optional — links back to a resource
estimatedSeconds: 30
createdAt: 2026-05-22
updatedAt: 2026-05-22

# type-specific:
fix:
  starter: snippets/broken.html  # path relative to challenge dir
  solution: snippets/fixed.html
  criterion: dom-equal           # dom-equal | regex | visual

complete:
  template: snippets/template.html  # contains {{BLANK_1}} markers
  answers:
    BLANK_1: "grid-template-columns"

identify:
  code: snippets/code.html
  answer: 12                     # line number, or option index
  options:                       # optional, for multiple-choice variant
    - "Missing semicolon"
    - "Wrong selector"
    - "Invalid property value"

quiz:
  question: "Which CSS property…?"
  options: ["a", "b", "c", "d"]
  answer: 2                      # 0-indexed
  explanation: "…"

animation:
  component: ./Explainer.astro   # custom component slot
  followUp:                      # optional embedded quiz after the animation
    question: "…"
    options: ["…"]
    answer: 0
```

### Lessons

`packages/content/challenges/_lessons/<topic>/<lesson>.yaml`:

```yaml
title: "Grid basics"
topic: css-grid
order: 1
challenges:
  - css-grid-fix-gap
  - css-grid-identify-track
  - css-grid-quiz-units
```

A lesson = ordered list of challenge slugs. Lessons are grouped by topic and ordered.

### Authoring rule

- Hand-authored challenges live in `packages/content/challenges/<slug>/`.
- Generated baseline challenges live in `packages/content/challenges/_generated/<slug>/`.
- Generator never touches files outside `_generated/`.

---

## 5. Challenge runners

One Astro/React component per `type`. Mounted by `/arcade/<topic>/<lesson>`.

| Type | UI | Pass criterion |
| --- | --- | --- |
| `fix` | CodeMirror 6 editor + sandboxed `<iframe srcdoc>` preview | DOM snapshot equality vs. solution (default), or regex match on output |
| `complete` | Code block with input fields where `{{BLANK_N}}` markers are | Exact-match per blank (trim + case-insensitive optional) |
| `identify` | Rendered code block, click-a-line OR multiple-choice | Selected line/option == `answer` |
| `quiz` | Standard MCQ | Selected option == `answer` |
| `animation` | Embedded MDX/Astro/React component, then optional follow-up quiz | Follow-up quiz answer, or "I get it" button |

**Shared chrome:**

- Top: progress bar (challenge N of M in lesson), topic badge, difficulty pips.
- Bottom: `Check` button (becomes `Next` after correct), explanation panel slides up on result.
- Keyboard: `Enter` = Check/Next, `1..4` = pick option, `Esc` = skip.

**Sandboxed preview pattern:** copy what `apps/lab` already does — inline CSS/JS into HTML at build time, render in `<iframe srcdoc sandbox="allow-scripts">`. No network, no parent access.

---

## 6. Generator pipeline

`scripts/generate-challenges.ts` (new), invoked via `bun run --filter @stealthis/content generate:challenges`.

Walks `packages/content/resources/*/snippets/*` and emits baseline challenges into `packages/content/challenges/_generated/`.

Mutation strategies (one challenge per applicable strategy per snippet):

1. **Remove a CSS property** → `fix` (DOM equality).
2. **Blank an identifier in HTML/JS** → `complete` (single blank).
3. **Swap two adjacent lines** → `identify` (which line is wrong).
4. **Delete a closing tag** → `fix`.
5. **Replace a value with a plausible-wrong one** (e.g. `flex` → `block`) → `identify` MCQ.

Each generated challenge:

- Gets a deterministic slug: `<resourceSlug>-<strategy>-<hash>`.
- Inherits `topic` from the resource's primary tag.
- Defaults `difficulty: 1`, `estimatedSeconds: 30`.
- Includes a generated `explanation` from the diff.

Idempotent: rerun overwrites `_generated/` only. Hand-authored content untouched.

---

## 7. Schema work

In `packages/schema/src`:

- New `Challenge` Zod schema and TS interface.
- New `Lesson` Zod schema.
- `loadChallenges()` and `loadLessons()` helpers, mirroring `loadResources()`.
- Reuse the `z.union([z.string(), z.date()]).transform(...)` pattern for dates (gray-matter quirk).

In `apps/arcade/src/content/config.ts`:

- Content collection for `challenges` using `glob` loader → `packages/content/challenges`.
- Content collection for `lessons` (YAML loader).

---

## 8. MVP cut

Build in this order. Stop and ship after step 5; iterate from there.

1. **Schema + one MDX challenge of each type.** Verify Zod parsing and Astro collection load.
2. **Astro pages:** topic index, lesson runner shell, result screen. No real runner logic yet — render the MDX prompt.
3. **Runners for `quiz` and `complete`.** Cheapest two — no editor, no iframe.
4. **localStorage progress.** Completed-slugs set + per-topic counts. Wire into topic grid.
5. **Polish:** keyboard nav, animations between challenges, topic icons.

Then, in any order based on appetite:

- `fix` runner (CodeMirror 6 + iframe preview — the hardest piece).
- `identify` runner.
- `animation` runner + first hand-authored animation challenge.
- Generator script.
- `/arcade/random` picker.

---

## 9. Open decisions

| # | Decision | Default I'd take | Why |
| --- | --- | --- | --- |
| 1 | Code editor library | **CodeMirror 6** | Lighter than Monaco, what most embedded playgrounds use, tree-shakeable. |
| 2 | `fix` pass criterion | **DOM snapshot equality** | Simplest, deterministic, no user-supplied assertions to sandbox. Visual diff added later if needed. |
| 3 | Topics taxonomy | **Reuse resource `tags`** | Avoids drift between resources and challenges. |
| 4 | App name | **arcade** | Picked 2026-05-22. Captures the quick-rounds/immediate-feedback feel. |
| 5 | Dev port | `4324` | Next free port after `lab` (`4323`). |

---

## 10. Risks

- **Sandbox correctness for `fix`.** Running arbitrary user code in an iframe is fine for the user's own browser but a footgun if we ever add sharing. Lock down `sandbox` attributes and document this.
- **Generator noise.** Bad mutations produce trivial or unsolvable challenges. Need a manual review step (or a `quality: draft|published` field) before generated challenges show up in the default lesson order.
- **Content drift.** When a resource snippet changes, generated challenges may become wrong. The generator's deterministic slug + overwrite-only-`_generated` mitigates this if the generator is rerun in CI.
- **Scope creep into accounts/XP.** Defer hard.

---

## 11. v2 ideas (not in scope)

- Accounts, streaks, XP, hearts.
- Daily challenge / spaced repetition.
- Leaderboards.
- User-submitted challenges.
- MCP tool: `get_challenge`, `list_challenges_by_topic` so the catalog is queryable like resources are today.
- AI-assisted hint system (LLM gives a nudge, not the answer).

---

## 12. Concrete next steps

- [x] Pick a name → **arcade**.
- [ ] Add `Challenge` + `Lesson` to `packages/schema`.
- [ ] Scaffold `apps/arcade` (copy `apps/lab` as a starting point, set dev port `4324`).
- [ ] Write one hand-authored challenge per type as a fixture.
- [ ] Build `quiz` runner end-to-end as the thinnest vertical slice.
