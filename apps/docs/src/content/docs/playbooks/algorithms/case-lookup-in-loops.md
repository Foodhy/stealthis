---
title: "Crossing two lists is slow"
description: "Searching inside a loop is O(n²) without looking like it. Diagnosis, the Map fix in O(n), real thresholds, and alternatives with trade-offs."
sidebar:
  label: "Crossing two lists is slow"
playbook:
  area: "algorithms"
  situation: "Combining two arrays (e.g. orders with users) gets slow as the data grows"
  symptoms: ["page takes long to load data", "function that 'used to be instant' now takes seconds", "CPU at 100% processing arrays"]
  recommendation: "index-with-map"
  complexity_before: "O(n·m)"
  complexity_after: "O(n+m)"
  alternatives: ["join-in-db", "web-worker", "leave-as-is"]
---

## The situation

You have two lists — say `orders` and `users` — and you need to attach each order's user
to it. You wrote something natural with `.find()`, it worked perfectly in development
with 50 records, and today with 5,000 orders and 2,000 users the page hangs for a couple
of seconds. You didn't change anything; the data just grew.

## Diagnosis: why it happens

```ts
const enriched = orders.map((order) => ({
  ...order,
  user: users.find((u) => u.id === order.userId), // ← O(m) search …
}))                                               //   inside an O(n) loop
```

`.find()` walks the array until it hits the element: **O(m)** on average. Calling it
inside a `.map()` over `orders` makes the total cost **O(n·m)**. With 5,000 orders ×
2,000 users that's up to 10,000,000 comparisons — which is why what used to be instant
now takes seconds. The problem isn't JavaScript or your framework: it's the shape of the
algorithm (see [Fundamentals: Big O in JS](/playbooks/algorithms/fundamentals/)).

The trap is that `orders.map(...).find(...)` doesn't *look* like a nested double loop,
but it is one. The same applies to `.filter()`, `.includes()`, `.indexOf()`, or `.some()`
inside any iteration.

## Recommendation: index first with a Map

Build an `id → user` index once and query it in O(1):

**Before** — O(n·m):
```ts
const enriched = orders.map((order) => ({
  ...order,
  user: users.find((u) => u.id === order.userId),
}))
```

**After** — O(n+m):
```ts
const usersById = new Map(users.map((u) => [u.id, u])) // O(m), one time

const enriched = orders.map((order) => ({
  ...order,
  user: usersById.get(order.userId) ?? null,           // O(1) per lookup
}))
```

With 5,000 × 2,000 you go from ~10M operations to ~7,000. In practice: from seconds to
milliseconds.

**When does it matter?** Be honest with yourself before refactoring:
- **n·m < ~100,000** (e.g. 300 × 300): the difference is microseconds. Keep it readable.
- **n·m between 10⁵ and 10⁶:** starts to be perceptible (tens of ms). Worth the Map if
  the code runs on every render or interaction.
- **n·m > 10⁶:** the Map is mandatory; without it you're blocking the main thread.

The same pattern applies to membership: if you call `arr.includes(x)` inside a loop,
convert `arr` to a `Set` first (`set.has(x)` is O(1)).

## Discarded alternatives (and when they ARE the right call)

### Doing the JOIN in the database
- **What it solves:** the DB combines the tables using its indexes and the data arrives
  already joined; you also stop shipping two full datasets over the network.
- **Why it's not the first option here:** this case assumes you already have both lists
  on the client (or they come from different APIs). If you can change the backend, do it
  — but that's an API contract change, not a local fix.
- **When it IS the right call:** whenever you control the backend and the data lives in
  the same DB. In fact, if you're pulling 5,000 orders to the client just to join them,
  the real question may be a different one → see
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

### Moving the join to a Web Worker
- **What it solves:** the computation no longer freezes the UI while it runs.
- **Why it's not the first option here:** the worker doesn't make the work faster, it
  only moves it off the main thread — and serializing two large arrays to the worker has
  its own cost. Fix the algorithm first: O(n+m) probably doesn't need a worker anymore.
- **When it IS the right call:** when the work is still heavy *after* optimizing the
  algorithm (parsing large files, real numeric computation) → see
  [The UI freezes](/playbooks/frontend-performance/case-frozen-ui/).

### Leaving it as is
- **What it solves:** maximum readability, zero regression risk.
- **Why it's not the first option here:** the case starts from you already noticing the
  slowness.
- **When it IS the right call:** small and stable n·m (config lists, fixed catalogs).
  Optimizing that is free complexity in the wrong direction.

## How to measure before and after

```ts
console.time('enrich')
const enriched = /* … */
console.timeEnd('enrich') // enrich: 2340ms → enrich: 4ms
```

To see it in real context: DevTools → Performance tab → record the interaction and look
for the long yellow (scripting) block with your function in the flame chart. Measure
before and after; if the improvement doesn't show up in the profile, the optimization
wasn't there.

## Signals you need something else

- The data no longer fits comfortably in memory or takes long to arrive over the network
  → the join must happen in the backend
  ([Backend & Data: fundamentals](/playbooks/backend-data/fundamentals/)).
- It's still slow after the Map because the per-item work is heavy (not the lookup) →
  workers or chunking ([Runtime: fundamentals](/playbooks/runtime/fundamentals/)).
- You need to search by text, not by exact id → that's a different problem
  ([You need to search/filter](/playbooks/algorithms/case-search-filter/)).

## Related resources

- [Fundamentals: Big O and the cost of JS operations](/playbooks/algorithms/fundamentals/)
- MDN — [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map): semantics and performance of keyed lookups
