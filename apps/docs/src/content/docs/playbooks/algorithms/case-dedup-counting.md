---
title: "Removing duplicates or counting is slow"
description: "Dedup with includes() inside a loop is O(n²) in disguise. Set/Map do it in O(n) — plus how to dedup objects by key and count occurrences without nested scans."
sidebar:
  label: "Duplicates and counting"
playbook:
  area: "algorithms"
  situation: "Deduplicating a list or counting occurrences crawls as the data grows"
  symptoms: ["dedup step takes seconds on bigger data", "building 'unique items' list pegs the CPU", "counting occurrences with filter().length in a loop"]
  recommendation: "set-or-map-single-pass"
  complexity_before: "O(n²)"
  complexity_after: "O(n)"
  alternatives: ["dedup-in-db", "sort-then-scan", "leave-as-is"]
---

## The situation

You merge data from a couple of sources — API pages, an import, user selections — and
need the unique items, or a count per category. You wrote the intuitive version with
`.includes()` or `.filter().length`, it was fine with hundreds of items, and now with
tens of thousands the "prepare data" step visibly hangs.

## Diagnosis: why it happens

The intuitive versions hide a linear scan inside a linear loop:

```ts
// dedup — O(n²)
const unique: Item[] = []
for (const item of items) {
  if (!unique.some((u) => u.id === item.id)) unique.push(item) // O(n) scan per item
}

// counting — O(n·c)
const counts = categories.map((cat) => ({
  cat,
  count: items.filter((i) => i.category === cat).length, // full O(n) scan per category
}))
```

`unique.some(...)` re-scans the accumulated array for every incoming item: **O(n²)**.
50,000 items → up to ~1.25 billion comparisons — that's seconds of blocked main thread.
The counting version re-scans all items once per category. Both are the
"linear method inside a loop" trap from
[Fundamentals: Big O in JS](/playbooks/algorithms/fundamentals/).

## Recommendation: one pass with Set/Map

Hash-based membership is O(1), so one pass does it all.

**Dedup primitives** — O(n):
```ts
const unique = [...new Set(values)] // strings, numbers, ids
```

**Dedup objects by key** — O(n), keeps the *last* occurrence per id:
```ts
const byId = new Map(items.map((item) => [item.id, item]))
const unique = [...byId.values()]
```
(Need the *first* occurrence? Loop and `if (!byId.has(id)) byId.set(id, item)`.)

**Count occurrences** — O(n), one pass total instead of one pass per category:
```ts
const counts = new Map<string, number>()
for (const item of items) {
  counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
}
```

With 50,000 items you go from ~10⁹ comparisons to ~10⁵ operations: from seconds to
single-digit milliseconds.

**When does it matter?**
- **n < ~1,000:** the O(n²) version costs microseconds-to-a-few-ms. If
  `.some()` reads clearer to your team, it's fine.
- **n ~1,000–10,000:** tens of ms — perceptible if it runs per render or interaction.
  The Set version is also *shorter*, so there's no readability trade-off to defend.
- **n > ~10,000:** O(n²) is a frozen tab. Single pass is mandatory.

One honest caveat: `Set`/`Map` compare objects **by reference**, not by value. Dedup of
objects always needs an explicit key (`item.id`, or a composite like
`` `${a.x}:${a.y}` ``). If your instinct is `JSON.stringify(item)` as the key, that
works but costs serialization per item — fine for small objects, wasteful for big ones.

## Discarded alternatives (and when they ARE the right call)

### Deduplicating in the database
- **What it solves:** `SELECT DISTINCT`, `GROUP BY`, or a `UNIQUE` constraint make
  duplicates the DB's problem — with indexes, at scales the browser can't touch. A
  `UNIQUE` constraint *prevents* duplicates instead of cleaning them up.
- **Why it's not the first option here:** this case assumes the merged data exists only
  client-side (multiple APIs, file imports, user input). Also, if duplicates keep
  arriving from your own backend, dedup on the client is treating the symptom.
- **When it IS the right call:** the duplicates originate in storage or in a query
  (missing constraint, a JOIN that fans out rows). Counting per category at scale is
  also a `GROUP BY` — see [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)
  before shipping raw rows to count them in the browser.

### Sort first, then scan adjacent pairs
- **What it solves:** dedup in O(n log n) with O(1) extra memory — no hash structure.
  Classic when memory is the constraint or the data must end up sorted anyway.
- **Why it's not the first option here:** O(n log n) is worse than O(n), it reorders the
  data as a side effect, and in JS the memory savings rarely matter — you already hold
  the array.
- **When it IS the right call:** the output must be sorted anyway (dedup for free during
  the pass), or you're in a memory-constrained context (streaming a huge file through a
  worker) where a giant Map hurts.

### Leaving it as is
- **What it solves:** nothing to review, nothing to break.
- **Why it's not the first option here:** the case starts from a visible hang.
- **When it IS the right call:** small, bounded lists (dedup of 30 selected tags). The
  quadratic version there is invisible and honest.

## How to measure before and after

```ts
console.time('dedup')
const unique = dedupe(items)
console.timeEnd('dedup') // dedup: 3200ms → dedup: 6ms
```

DevTools → Performance → record the interaction that triggers the processing; look for
your function in the long scripting block. If the numbers are already sub-frame
(< 16ms), stop — there's nothing worth refactoring.

## Signals you need something else

- Duplicates come from your own API or DB → fix them at the source
  ([Backend & Data: fundamentals](/playbooks/backend-data/fundamentals/)).
- After going O(n) it's still heavy (millions of rows client-side) → the processing
  belongs off the main thread ([A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/))
  or off the client entirely.
- The counting is really analytics (aggregations, time buckets) → that's a query, not a
  loop ([Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)).

## Related resources

- [Fundamentals: Big O and the cost of JS operations](/playbooks/algorithms/fundamentals/)
- MDN — [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set): O(1) membership, and why object equality is by reference
- MDN — [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map): the counting-by-key idiom
