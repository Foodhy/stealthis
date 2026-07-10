---
title: Playbooks
description: Situation-first guides — arrive with a problem, leave with a diagnosis, a grounded recommendation, code with Big O when it applies, and the trade-offs of what was ruled out.
---

**Playbooks** start from a situation, not a technology. You arrive with a symptom
("my list of 10,000 items is slow", "my endpoint takes 3 seconds", "should this be a web
app or a native app?") and leave with:

1. **A diagnosis** — why it happens, connected to the fundamentals of the area
2. **A grounded recommendation** — with before/after code and complexity (Big O) when it applies
3. **Honest thresholds** — when the fix matters and when it doesn't ("with n < 1,000 you won't notice")
4. **Discarded alternatives** — each with its trade-offs and the situation where it *would* be the right call
5. **How to measure** — the concrete tool to verify before and after; never optimize without measuring

The technology is the *consequence* of the recommendation, never the starting point.

## How to use this section

Each area opens with a **Fundamentals** page — the mental model explained from zero, with
primary sources (MDN, web.dev, official Node/Postgres/React Native docs). The **cases**
then apply that fundamental to concrete situations. If a case's diagnosis doesn't click,
read the area's fundamentals first.

## Find your symptom

| This is happening to you | Go here |
| --- | --- |
| You combine two lists and it gets slow as data grows | [Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/) |
| You need search or filtering and it's sluggish | [You need to search/filter](/playbooks/algorithms/case-search-filter/) |
| Sorting or ranking data takes too long | [You sort/rank data](/playbooks/algorithms/case-sorting-ranking/) |
| Deduplicating or counting items is slow | [Duplicates and counting](/playbooks/algorithms/case-dedup-counting/) |
| A CPU-heavy computation blocks everything | [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/) |
| You fire many async operations and it's slow or flaky | [Many async operations at once](/playbooks/runtime/case-async-patterns/) |
| A list of thousands of items renders slowly | [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/) |
| Typing in an input feels laggy | [The input lags while typing](/playbooks/frontend-performance/case-janky-input/) |
| Images make your page heavy and slow | [Your images are slow](/playbooks/frontend-performance/case-slow-images/) |
| The UI freezes during a heavy computation | [The UI freezes](/playbooks/frontend-performance/case-frozen-ui/) |
| An endpoint takes seconds to respond | [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/) |
| You read the same data over and over | [You read the same data constantly](/playbooks/backend-data/case-repeated-reads/) |
| Heavy tasks block your request handlers | [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/) |
| Traffic is growing and you don't know what to scale | [Traffic is growing](/playbooks/backend-data/case-growing-traffic/) |
| You're starting a product and don't know the platform | [Web, PWA, hybrid or native?](/playbooks/platform-choice/case-new-product/) |
| You're building an internal tool or dashboard | [An internal tool or dashboard](/playbooks/platform-choice/case-internal-tool/) |
| Your mobile animations stutter | [Animations stutter on mobile](/playbooks/mobile-native/case-janky-animations/) |
| Long lists scroll badly on mobile | [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/) |
| Your app must work offline | [It must work offline](/playbooks/mobile-native/case-offline-sync/) |

## The areas

- **[Algorithms & Data Structures](/playbooks/algorithms/fundamentals/)** — Big O in
  practice: what each JS operation actually costs, and when shape-of-the-algorithm is
  your real problem.
- **[Runtime & Concurrency](/playbooks/runtime/fundamentals/)** — the event loop in the
  browser and Node, why "single-threaded" doesn't mean "no concurrency". Conceptual base
  for the frontend and backend areas.
- **[Frontend Performance](/playbooks/frontend-performance/fundamentals/)** — the browser
  render pipeline, React re-renders, Core Web Vitals.
- **[Backend & Data](/playbooks/backend-data/fundamentals/)** — how a database executes a
  query, indexes, query plans, and the layers above them.
- **[Platform Choice](/playbooks/platform-choice/fundamentals/)** — deciding between web,
  PWA, hybrid, and native based on team, time, budget, and requirements.
- **[Mobile & Native](/playbooks/mobile-native/fundamentals/)** — the React Native
  bridge/JSI, JS thread vs UI thread, and why mobile jank is a threading problem.

## How this differs from Recommendations

[Recommendations](/recommendations/) compare **tools** for a need you already understand
("which payment processor?"). Playbooks diagnose a **situation** you don't fully
understand yet ("why is this slow?") — the tool, if any, falls out of the diagnosis.
