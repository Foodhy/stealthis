# Recommendations — Authoring Guide & Spec

Curated **topic** pages that group several **alternatives** for a need (e.g. "AI App
Builders", "Payment Processors", "Learn UX") and let visitors compare them. An alternative
can be a tool, library, book, site, or external content like a **YouTube video**.

> **Mental model:** one card = one topic. To add a tool, add an entry to that topic's
> `options:` list. Do **not** create a new card per tool.

---

## ✍️ How to add or edit a recommendation

### A) Add a new alternative to an existing topic (most common)

1. Open the topic file: `packages/content/resources/<topic-slug>/index.mdx`
   (e.g. `ai-app-builders/index.mdx`).
2. Add one entry under `options:` (copy an existing one and edit).
3. If the topic has a comparison table, fill the same `attributes:` keys that appear in
   `comparison:` so the new row lines up.
4. Save. That's it — the card count, the comparison table, and search update automatically.

### B) Create a new topic (new card)

1. Make a folder: `packages/content/resources/<your-topic-slug>/`
2. Add `index.mdx` using the **template below**.
3. Pick a `recommendationKind` from the list further down (it sets the card badge). If you
   need a brand-new kind, see "Adding a new kind".
4. Save. It appears in the Library under **Recommendations** and in the landing category
   grid automatically.

### C) After editing — verify

```bash
bun run dev:www        # http://localhost:4321/library  → find your topic, open it
# (optional) type-check that frontmatter is valid:
cd apps/www && bunx astro sync   # errors here = a frontmatter/YAML problem
```

You do **not** need to regenerate the MCP catalog — recommendations are excluded from it.

---

## 📋 Copy-paste template

Create `packages/content/resources/<topic-slug>/index.mdx`:

```mdx
---
slug: <topic-slug>            # MUST match the folder name
title: My Topic Title
description: One sentence describing the need this topic answers.
category: recommendations     # always exactly this
type: recommendation          # always exactly this
recommendationKind: app-builders   # one of the kinds listed below (sets the badge)
tags: [keyword1, keyword2, alias]  # help search; include synonyms people might type
comparison: [Output, Hosting, Free tier]   # the comparison-table COLUMNS (order matters)
options:
  - name: First Alternative
    url: https://example.com           # external "Visit" link (optional)
    demo: https://example.com/demo     # optional — a "Demo" link (e.g. a HF Space)
    video: https://youtu.be/VIDEO_ID   # optional — embeds a YouTube player
    logo: /logos/first.svg             # optional — else a favicon is used
    description: One or two lines about this alternative.
    bestFor: The one thing it's best at
    highlight: true                    # optional — marks it ★ recommended
    pros: [Strength one, Strength two]
    cons: [Watch-out one]
    attributes:                        # keys here SHOULD match the `comparison:` columns
      Output: "React + backend"
      Hosting: Built-in
      Free tier: "Yes"
  - name: Second Alternative
    url: https://example.org
    description: Another option.
    bestFor: A different strength
    pros: [Good at X]
    cons: [Weak at Y]
    attributes:
      Output: "UI only"
      Hosting: Vercel
      Free tier: "Yes"
# Required by the resource schema — keep these as-is for recommendations:
license: MIT
difficulty: easy        # not shown for recommendations, but the field is required
tech: []
targets: []
createdAt: 2026-06-08   # YYYY-MM-DD
updatedAt: 2026-06-08
---

A short paragraph (this is the page intro, shown above the alternatives). Explain how to
choose between the options — what makes each different and who each is best for.
```

---

## 🧾 Field reference

**Topic (frontmatter) — required:** `slug`, `title`, `description`, `category`
(`recommendations`), `type` (`recommendation`), `difficulty` (`easy`), `createdAt`,
`updatedAt`.

**Topic — recommendation-specific:**

| Field | Required | What it does |
|---|---|---|
| `recommendationKind` | recommended | Card badge label / bucket (see kinds) |
| `tags` | optional | Search keywords + synonyms (e.g. `personal-agents`) |
| `options[]` | yes (to be useful) | The alternatives shown + compared |
| `comparison[]` | optional | Comparison-table columns, in order. If omitted, columns are derived from the union of `attributes` keys |

**Option (each item in `options:`):**

| Field | Required | What it does |
|---|---|---|
| `name` | yes | Alternative's name (also indexed for search) |
| `description` | optional | 1–2 line summary on its card |
| `url` | optional | External "Visit" link |
| `demo` | optional | A second link rendered as "Demo" (e.g. a Hugging Face Space) |
| `video` | optional | YouTube URL → embedded player + "Watch" link |
| `logo` | optional | `/logos/<file>.svg` in `apps/www/public/`; else favicon from `url` |
| `bestFor` | optional | The "best for X" one-liner |
| `pros` / `cons` | optional | Strengths / watch-outs (lists) |
| `highlight` | optional | `true` marks it ★ recommended |
| `attributes` | optional | Comparison-table cells: `Column name: "value"` |

---

## 🏷️ Categories (kinds) we have (sets the card badge)

`recommendationKind` is the bucket shown as the card badge. We currently have **38 kinds**.
Pick the closest one; topics can share a kind. Each row shows the value, the badge label
(`en`), and an example topic to copy from.

| `recommendationKind` | Badge label | Example topic(s) |
|---|---|---|
| `agent-frameworks` | Agent Frameworks | `ai-coding-agents` (incl. ESP-Claw) |
| `agent-tools` | Agent Tooling | `ai-agent-tooling` |
| `editors` | Code Editors & IDEs | `ai-code-editors` |
| `ai-models` | AI Models & Providers | `ai-models-providers`, `free-ai-apis` |
| `local-ai` | Local & Self-Hosted AI | `run-llms-locally` |
| `app-builders` | AI App Builders | `ai-app-builders` |
| `backend` | Backends & BaaS | `backend-as-a-service` |
| `vector-db` | Vector DBs & RAG | `vector-databases` |
| `payments` | Payments & Billing | `payment-processors` |
| `creative-apps` | Creative & Video Apps | `ai-image-generation`, `ai-video-generation`, `open-image-models` |
| `audio` | Speech & Voice AI | `speech-voice-ai` |
| `3d` | 3D Generation | `3d-generation` |
| `libraries` | Libraries & SDKs | `computer-vision-libraries`, `robotics-js-libraries`, `3d-web-libraries`, `orm-query-builders`, `ui-component-libraries`, `web-animation-libraries`, `chart-libraries`, `state-data-fetching`, `e2e-testing-tools`, `api-layer-tools`, `maps-libraries`, `mobile-frameworks` |
| `platforms` | Platforms & Hubs | `ml-ai-hubs`, `customer-support-tools`, `scheduling-booking`, `forms-surveys`, `developer-documentation`, `caching-kv`, `webhook-platforms`, `secrets-management`, `push-notification-services`, `privacy-consent-tools`, `legal-document-tools`, `email-marketing-tools`, `crm-sales-tools`, `dns-domain-registrars`, `localization-platforms`, `invoicing-accounting-tools` |
| `business-apps` | Business Apps | `open-business-apps` |
| `hosting` | Hosting & Deploy | `hosting-deploy`, `ci-cd-platforms` |
| `media` | Media & Image CDN | `media-optimization` |
| `design-assets` | Design Assets | `design-assets`, `icons-and-fonts` |
| `design-tools` | Responsive Design | `design-dev-tools`, `css-frameworks`, `design-software`, `prototyping-tools`, `accessibility-tools`, `design-tokens-tools` |
| `mcp` | MCP Servers | `mcp-servers-directory` |
| `game-dev` | Game Engines | `game-engines` |
| `practice-platforms` | Practice & Training | `coding-practice-platforms`, `interview-prep-platforms` |
| `hackathons-events` | Hackathons & Events | `hackathon-platforms` |
| `internships` | Internships & Programs | `internship-programs`, `open-source-contributor-programs` |
| `learning` | Learning & Courses | `learn-ux-design`, `learn-to-code-platforms`, `learn-system-design`, `dev-podcasts-newsletters` |
| `books` | Books | `tech-coding-books`, `business-strategy-books`, `entrepreneurship-books`, `venture-investing-books` |
| `graphics` | Graphics & Rendering | `graphics-rendering-apis` |
| `auth` | Authentication | `auth-providers` |
| `email` | Email & SMS | `email-sms-providers` |
| `databases` | Databases | `serverless-databases` |
| `analytics` | Analytics | `product-analytics`, `mobile-analytics` |
| `cms` | Headless CMS | `headless-cms` |
| `search` | Search | `search-services` |
| `realtime` | Realtime | `realtime-services` |
| `monitoring` | Monitoring | `error-monitoring`, `logging-platforms`, `status-pages`, `apm-tracing` |
| `jobs` | Background Jobs | `background-jobs` |
| `feature-flags` | Feature Flags | `feature-flags` |
| `storage` | Object Storage | `object-storage` |

---

## Library theme navigation (sub-sections)

The Library **Recommendations** group is split into six coarser navigation themes (distinct
from `recommendationKind`, which stays on each card as a badge):

| Theme ID | EN label | What goes here |
|---|---|---|
| `ai` | AI | Models, agents, creative AI, MCP, vector DBs, CV libs |
| `software` | Software | Docs platforms, CMS, product analytics, charts, state/data fetching, E2E testing, API layer, mobile frameworks, maps, 3D web, game engines, robotics JS, graphics APIs, i18n platforms |
| `infra` | Infra | Hosting, CI/CD, BaaS, payments, auth, email, DBs, ORM, jobs, flags, storage, cache/KV, search, realtime, monitoring, logging, status pages, APM/tracing, webhooks, secrets, push, mobile analytics, DNS, media CDN |
| `design` | Design | Design software, prototyping, a11y, design tokens, assets, icons & fonts, UI libs, CSS, web animation, responsive QA |
| `learning` | Learning | Courses, system design, OSS programs, podcasts, interview prep, practice, hackathons, internships, tech books |
| `business` | Business | Open business apps, support, scheduling, forms, email marketing, CRM, privacy/consent, legal docs, invoicing, strategy/entrepreneurship/investing books |

Mapping lives in `apps/www/src/lib/recommendation-themes.ts` (`RECOMMENDATION_THEME_BY_SLUG`).
**When you add a new topic**, add its slug to that map in the same PR. Labels are in i18n under
`recommendations.theme.*` (`en` + `es`).

### Adding a new kind

If none fit, add one in **three** places (keep them in sync):

1. `packages/schema/src/schema.ts` → `RecommendationKindSchema` enum
2. `packages/schema/src/types.ts` → `RecommendationKind` union
3. `apps/www/src/content/config.ts` → `RecommendationKindSchema` enum

Then add its label to `apps/www/src/i18n/index.ts` under both `en` and `es`:
`"recommendations.cat.<your-kind>": "Nice Label"` (also add it to the small union casts in
`ResourceCard.astro` and `pages/r/[slug].astro` so TypeScript is happy).

---

## ⚠️ Common mistakes (the "correct form")

- **Quote yes/no/number attribute values.** YAML turns `Free tier: Yes` into a boolean and
  the build rejects it. Write `Free tier: "Yes"`. Same for numbers/versions: `"3"`.
- **`slug` must equal the folder name.** `resources/foo/index.mdx` → `slug: foo`.
- **Comparison columns vs. attribute keys:** a row only fills a column when the option's
  `attributes` has that exact key (case-sensitive). Missing cells show `—`.
- **`category` / `type` are fixed strings:** always `recommendations` / `recommendation`.
- **Video links:** `https://youtu.be/ID`, `https://www.youtube.com/watch?v=ID`, or an
  `/embed/ID` URL all work; other hosts won't embed (use `url` instead).
- **Don't add a Lab/code:** recommendations are static; the detail page hides the code/Lab
  sections for them.

---

## How it shows up (no extra wiring needed)

- **Library** → a "Recommendations" section; each topic is a card showing the kind badge,
  a few alternative chips, and the count (e.g. "4 alternatives").
- **Landing** → a "Recommendations ★" card in "Browse by Category" → opens the Library
  filtered to recommendations. (No header-nav link by design.)
- **Detail page** (`/r/<slug>`) → intro paragraph, the alternatives list (logo, pros/cons,
  Visit, embedded video), and the interactive comparison table (checkboxes pick rows).
- **Search** → topic is found by its title/tags **and** by any alternative's `name`
  (so "lovable", "stripe", "opencv" all surface their topic).

---

## Where the feature is implemented

- Schema: `packages/schema/src/{schema,types}.ts`, `apps/www/src/content/config.ts`
- Comparison table: `apps/www/src/components/ComparisonTable.astro`
- Detail rendering: `apps/www/src/pages/r/[slug].astro`
- Card: `apps/www/src/components/ResourceCard.astro`
- Library group: `apps/www/src/pages/library/index.astro`
- Search index: `apps/www/src/pages/library-index.json.ts`
- Landing card: `apps/www/src/pages/index.astro`
- MCP exclusion: `apps/mcp/scripts/generate-catalog.ts`
- i18n: `apps/www/src/i18n/index.ts` (`category.recommendations`, `recommendations.cat.*`,
  `recommendations.bestFor|pros|cons|visit|watch|alternatives|alternative|compare|compareHint`)

## Seeded topics (86, edit these for examples)

ai-coding-agents · ai-code-editors · ai-agent-tooling · ai-models-providers ·
free-ai-apis · run-llms-locally · ai-app-builders · backend-as-a-service ·
payment-processors · vector-databases · ai-video-generation · ai-image-generation ·
open-image-models · speech-voice-ai · 3d-generation · computer-vision-libraries ·
robotics-js-libraries · ml-ai-hubs · open-business-apps · hosting-deploy ·
media-optimization · graphics-rendering-apis · design-assets · design-dev-tools ·
icons-and-fonts · ui-component-libraries · css-frameworks · web-animation-libraries ·
design-software · prototyping-tools · accessibility-tools · design-tokens-tools ·
mcp-servers-directory · game-engines · auth-providers ·
email-sms-providers · serverless-databases · product-analytics · headless-cms ·
search-services · realtime-services · error-monitoring · 3d-web-libraries ·
background-jobs · feature-flags · orm-query-builders · object-storage ·
chart-libraries · state-data-fetching · e2e-testing-tools · api-layer-tools ·
developer-documentation · ci-cd-platforms · caching-kv · maps-libraries · logging-platforms ·
webhook-platforms · status-pages · secrets-management · apm-tracing ·
mobile-frameworks · push-notification-services · mobile-analytics ·
dns-domain-registrars · localization-platforms ·
customer-support-tools · scheduling-booking · forms-surveys ·
privacy-consent-tools · legal-document-tools ·
email-marketing-tools · crm-sales-tools · invoicing-accounting-tools ·
learn-ux-design (has a video option) · learn-to-code-platforms · learn-system-design ·
open-source-contributor-programs · dev-podcasts-newsletters · interview-prep-platforms ·
coding-practice-platforms · hackathon-platforms · internship-programs ·
tech-coding-books · business-strategy-books · entrepreneurship-books ·
venture-investing-books.

## Non-goals

No live API/rankings, no user submissions, not in the MCP catalog, no Lab/code, no
difficulty rating shown.

## Open / next

- Index option *descriptions* too if name-only search is too narrow (e.g. searching an
  author like "Don Norman" rather than the book title).
- Real logo SVGs in `apps/www/public/logos/` (favicon fallback for now).
