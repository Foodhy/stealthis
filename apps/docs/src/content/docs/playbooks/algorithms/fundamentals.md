---
title: "Big O in JavaScript — Fundamentals"
description: "The mental model of algorithmic complexity, a reference table of what common JS operations actually cost, and the primary sources. Base for the algorithms cases."
sidebar:
  label: "Fundamentals"
  order: 0
playbook:
  area: "algorithms"
  type: "fundamentals"
  covers: ["big-o", "js-operation-costs", "arrays-vs-maps-vs-sets", "when-it-matters"]
---

## What it is and why it affects you

Big O notation describes **how the cost of an operation grows as the data grows**. Not
how fast it is today — how it *scales*. That distinction is why code that felt instant in
development with 50 records suddenly takes seconds in production with 5,000: nothing
changed except *n*.

You've already written code where this concept was hiding:

```ts
const user = users.find((u) => u.id === id)
```

`.find()` walks the array until it hits a match. With 100 users that's up to 100
comparisons — nothing. Call it once per order in a list of 5,000 orders, and it's up to
100 × 5,000 = 500,000 comparisons. The individual operation didn't get slower; you
multiplied it.

Big O captures that multiplication. `O(n)` means cost grows linearly with the data;
`O(n²)` means doubling the data quadruples the cost; `O(1)` means the cost doesn't grow
at all. `O(log n)` grows so slowly it's almost flat (doubling the data adds *one* step).

## The mental model

Ask two questions about any loop or built-in method:

1. **How many items does this touch?** (`.find()`, `.includes()`, `.filter()` touch up
   to all of them — they're loops in disguise)
2. **Is it inside another loop?**

If the answer to 2 is yes, multiply. A `.find()` (O(n)) inside a `.map()` (O(n)) is
O(n²), even though the code doesn't *look* like two nested `for` loops:

```ts
orders.map((order) => users.find((u) => u.id === order.userId))
//     └─ n iterations      └─ up to m comparisons each  →  O(n·m)
```

The most common fix in JavaScript is to **trade memory for lookups**: build a `Map` or
`Set` once (O(n)), then query it in O(1). One pass to index, one pass to use the index —
O(n + m) instead of O(n·m).

Rough scale of what different growth rates cost at n = 10,000:

```
O(1)        1 step
O(log n)    ~13 steps
O(n)        10,000 steps
O(n log n)  ~130,000 steps
O(n²)       100,000,000 steps  ← this is where "the page freezes"
```

A modern machine does tens of millions of simple operations per ~100ms on the main
thread. O(n²) crosses that line at n in the low thousands. O(n) crosses it around
tens of millions. That's the whole reason the distinction matters in practice.

Drag the slider — watch which classes explode and which stay flat:

<script src="/playbooks-demos.js"></script>

<pb-growth></pb-growth>

## Reference table: what JS operations cost

| Operation | Structure | Complexity | Notes |
| --- | --- | --- | --- |
| `arr[i]` | Array | O(1) | Index access is free |
| `arr.push(x)` | Array | O(1) amortized | |
| `arr.find(fn)` / `arr.findIndex(fn)` | Array | O(n) | Walks until match |
| `arr.includes(x)` / `arr.indexOf(x)` | Array | O(n) | Walks until match |
| `arr.filter(fn)` / `arr.map(fn)` / `arr.some(fn)` | Array | O(n) | Always walks (some/find can stop early) |
| `arr.unshift(x)` / `arr.splice(0, 1)` | Array | O(n) | Shifts every element |
| `arr.sort(fn)` | Array | O(n log n) | |
| `map.get(k)` / `map.set(k, v)` / `map.has(k)` | Map | O(1) average | Hash-based |
| `set.has(x)` / `set.add(x)` | Set | O(1) average | Hash-based |
| `obj[key]` / `key in obj` | Object | O(1) average | Fine as a lookup table for string keys |
| `Object.keys(obj)` / `...obj` | Object | O(n) | Materializes all keys |
| `new Map(entries)` / `new Set(arr)` | Map/Set | O(n) | The one-time indexing cost |
| `str.includes(sub)` | String | O(n·m) worst case | n = string, m = substring |

Two traps worth memorizing:

- **Linear methods inside loops** — `.find()`, `.includes()`, `.indexOf()`, `.filter()`,
  `.some()` inside any `.map()`/`.forEach()`/`for` makes it quadratic.
- **`unshift`/`splice(0, …)` in a loop** — building an array by prepending is O(n²).
  Push and reverse once at the end instead.

## When it matters (and when it doesn't)

Big O is about growth, not absolute speed. Honest thresholds:

- **Total work < ~100,000 operations** (e.g. two lists of 300 × 300): differences are
  microseconds. Write the most readable version and move on.
- **~10⁵–10⁶ operations**: tens of milliseconds — perceptible if it runs on every
  render, keystroke, or request. Worth the index.
- **> 10⁶ operations**: you're blocking the main thread noticeably. Fix the algorithm
  first, *then* consider workers or the backend if it's still heavy.

Never restructure readable code for data that is small and stays small. A quadratic
loop over a config list of 20 items is not a bug — it's a non-issue.

## How this connects to the cases

- [Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/) — "I combine
  `orders` with `users` and it takes seconds since the data grew"
- [You need to search/filter](/playbooks/algorithms/case-search-filter/) — "search over
  my data is sluggish and I don't know if I need a library, the backend, or a search engine"
- [You sort/rank data](/playbooks/algorithms/case-sorting-ranking/) — "I sort a big list
  to show the top 10 and it feels wasteful and slow"
- [Duplicates and counting](/playbooks/algorithms/case-dedup-counting/) — "removing
  duplicates / counting occurrences crawls as the list grows"

## Primary sources

- [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) — semantics of every array method; which ones traverse and which ones stop early.
- [MDN — Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) — spec requires access "sublinear on the number of elements"; in practice hash-based O(1).
- [MDN — Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) — same guarantee for membership checks; the tool for dedup and "seen" checks.
- [ECMA-262 — Map and Set](https://tc39.es/ecma262/#sec-map-objects) — the actual language spec text behind those performance requirements.
- [web.dev — Optimize long tasks](https://web.dev/articles/optimize-long-tasks) — what happens to the page when a computation holds the main thread, and the 50ms task guideline.
