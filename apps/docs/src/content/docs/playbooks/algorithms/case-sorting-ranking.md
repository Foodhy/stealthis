---
title: "You sort or rank data and it feels slow"
description: "sort() is O(n log n) and usually not your problem — sorting in the wrong place is. When to sort in the DB, when top-k beats a full sort, and when comparators are the real cost."
sidebar:
  label: "Sorting/ranking is slow"
playbook:
  area: "algorithms"
  situation: "Sorting a list to display it (or to take the top N) takes noticeable time or feels wasteful"
  symptoms: ["sorting a big array blocks the UI", "you fetch everything just to show the top 10", "sort inside a render runs on every update", "comparator does heavy work per comparison"]
  recommendation: "sort-where-the-data-lives-and-only-what-you-need"
  complexity_before: "O(n log n) client-side over the full dataset, repeated"
  complexity_after: "O(n log n) once where it belongs, or O(n log k) for top-k"
  alternatives: ["sort-in-db", "top-k-selection", "memoize-sort", "leave-as-is"]
---

## The situation

You show a ranked list — most recent orders, top products, highest scores. Somewhere
there's an `array.sort()`, and either it visibly stalls with big data, or you're fetching
thousands of rows from the API just to display the first 10, and it feels wrong.

## Diagnosis: why it happens

`Array.prototype.sort()` is **O(n log n)** — that part is nearly optimal and rarely the
bug. The actual problems come in three flavors:

1. **Sorting in the wrong place.** Pulling 20,000 rows over the network to sort them in
   the browser and show 10 pays network + memory + CPU for data you throw away. The DB
   could return the right 10 rows using an index, often without sorting anything at
   runtime.
2. **Sorting more than you need.** If you only need the top k of n, a full sort does
   n log n work for k results. With n = 100,000 and k = 10 that's ~100× more work than
   needed.
3. **An expensive comparator, or sorting repeatedly.** Sort cost is
   O(n log n) *comparisons* — if each comparison computes `new Date(a.createdAt)` or
   `str.toLowerCase()`, you pay that ~n log n times. And a sort inside a React render
   re-runs on every render.

Also: `.sort()` **mutates** the array — sorting props or state in place is a separate
class of bug. Use `toSorted()` (or copy first) in render code.

(Background: [Fundamentals: Big O in JS](/playbooks/algorithms/fundamentals/).)

## Recommendation: sort where the data lives, precompute keys

**If the data comes from a DB, sort there** — with an index on the sort column,
`ORDER BY … LIMIT 10` reads the first 10 index entries instead of sorting anything:

```sql
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

**If it's genuinely client-side data, sort cheap:** precompute sort keys once instead of
inside the comparator.

**Before** — key computed ~n log n times:
```ts
items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
```

**After** — key computed n times, then a cheap comparison:
```ts
const keyed = items.map((item) => ({ item, ts: new Date(item.createdAt).getTime() }))
keyed.sort((a, b) => a.ts - b.ts)
const sorted = keyed.map((k) => k.item)
```

Same O(n log n) shape, but the constant factor drops dramatically when the key
extraction was the expensive part (dates, locale-aware strings — for those, use
`Intl.Collator` once instead of `localeCompare` in the comparator).

Measure it on your own machine — the demo really sorts 60,000 rows both ways:

<script src="/playbooks-demos.js"></script>

<pb-sortcost></pb-sortcost>

**When does it matter?**
- **n < ~10,000 with a cheap comparator:** `sort()` runs in single-digit ms. Don't
  optimize; just don't re-run it needlessly (memoize in React with `useMemo`).
- **n in the tens-to-hundreds of thousands client-side:** perceptible (tens to hundreds
  of ms). Precompute keys; question why this much data is in the browser at all.
- **You display k ≪ n:** sort in the DB with `LIMIT`, or use a top-k selection
  client-side.

## Discarded alternatives (and when they ARE the right call)

### Sorting in the database with `ORDER BY` + index
- **What it solves:** the client never sees data it won't display; an index makes
  top-N queries nearly free; pagination comes naturally.
- **Why it's not the first option here:** only applies if you control the backend and
  the data lives in a DB. For data already loaded (or computed client-side), a round
  trip is slower than sorting locally.
- **When it IS the right call:** any ranked list backed by your own API — it's the
  default, not the exception. If your endpoint returns thousands of rows for a top-10
  view, start at [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

### Top-k selection instead of a full sort
- **What it solves:** keeps a running "best k" (a bounded sorted buffer or heap) in
  O(n log k) instead of O(n log n). With n = 1M, k = 10 that's real savings, and memory
  stays O(k) — pairs well with streaming data.
- **Why it's not the first option here:** more code than `.sort().slice(0, k)`, and for
  n under ~100k the difference is milliseconds. JS has no built-in heap, so you either
  hand-roll it or add a dependency.
- **When it IS the right call:** very large n client-side (log processing, analytics in
  a worker), streaming input, or hot paths where the full sort measurably shows in the
  profile.

### Memoizing the sort (`useMemo`, cached sorted copy)
- **What it solves:** stops paying O(n log n) on every render when neither data nor sort
  key changed — often the *felt* problem in React apps.
- **Why it's not the first option here:** it hides cost rather than reducing it; the
  first sort is as slow as ever. If a single sort already jank-blocks the UI, memoizing
  only makes it less frequent.
- **When it IS the right call:** moderate data, frequent re-renders — a sorted list in a
  component that re-renders on unrelated state. That's standard, correct React.

### Leaving it as is
- **What it solves:** simplicity; `.sort()` on small data is the right tool.
- **Why it's not the first option here:** the case starts from noticing the cost.
- **When it IS the right call:** n in the hundreds or low thousands, sorted on demand
  (a click, not every keystroke). That's microseconds — move on.

## How to measure before and after

```ts
console.time('sort')
const sorted = data.toSorted(cmp)
console.timeEnd('sort')
```

In React, use the DevTools Profiler to confirm the sort is inside a render that repeats.
For the DB path, `EXPLAIN ANALYZE` your query: `Sort` node vs `Index Scan` +
`Limit` tells you whether the index is actually being used (see
[Backend & Data: fundamentals](/playbooks/backend-data/fundamentals/)).

## Signals you need something else

- The sorted list is fast to compute but slow to render →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).
- Sorting is fast but you sort on every keystroke of a filter input →
  [The input lags while typing](/playbooks/frontend-performance/case-janky-input/).
- Ranking needs scoring/relevance, not a single sort key → that's search territory
  ([You need to search/filter](/playbooks/algorithms/case-search-filter/)).

## Related resources

- [Fundamentals: Big O and the cost of JS operations](/playbooks/algorithms/fundamentals/)
- MDN — [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort): mutation semantics and comparator contract; see also `toSorted()`
- Postgres — [Indexes and ORDER BY](https://www.postgresql.org/docs/current/indexes-ordering.html): how an index satisfies a sort for free
