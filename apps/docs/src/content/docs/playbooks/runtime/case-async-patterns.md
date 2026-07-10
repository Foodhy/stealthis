---
title: "Many async operations, and it's slow or flaky"
description: "Sequential awaits waste time; unbounded Promise.all melts servers. Diagnosis of both failure modes and the concurrency-limit pattern in between, with trade-offs."
sidebar:
  label: "Many async operations"
playbook:
  area: "runtime"
  situation: "Firing many async operations (API calls, file reads) either takes forever sequentially or fails when parallelized"
  symptoms: ["loop of awaits takes minutes", "Promise.all randomly rejects everything", "429 Too Many Requests when parallelizing", "socket/connection errors under fan-out"]
  recommendation: "bounded-concurrency"
  complexity_before: "sequential: total = sum of latencies; unbounded: n simultaneous connections"
  complexity_after: "total ≈ sum/k with k in flight, no overload"
  alternatives: ["promise-all", "promise-allsettled", "sequential-loop", "batch-endpoint"]
---

## The situation

You need to do the same async thing many times — fetch details for 300 items, upload 50
files, call an API per row. You either wrote a loop with `await` inside and it takes
minutes, or you switched to `Promise.all` and now the API returns 429s, sockets error
out, or one failure nukes all the results.

## Diagnosis: why it happens

Two opposite failure modes, same root: **how many operations are in flight at once**.

```ts
// Mode 1 — sequential: one in flight
for (const item of items) {
  results.push(await fetchDetail(item)) // next starts only when this finishes
}
// 300 items × 200ms = 60 seconds
```

`await` in a loop serializes: total time = *sum* of latencies. The event loop is free
(it's I/O, not CPU — see [Runtime fundamentals](/playbooks/runtime/fundamentals/)), but
you're only ever waiting on one thing.

```ts
// Mode 2 — unbounded: all in flight
const results = await Promise.all(items.map(fetchDetail))
// 300 simultaneous requests
```

`Promise.all` starts *everything at once* (the promises are created by the `.map`, not
by `Promise.all`). 300 simultaneous requests trip rate limits, exhaust connection pools,
and spike the target server. And `Promise.all` is all-or-nothing: one rejection rejects
the aggregate while the other 299 keep running with results discarded.

## Recommendation: bounded concurrency

Keep k operations in flight; as one finishes, start the next. Total ≈ sum/k without
overwhelming anything.

**Before** — 60s sequential, or 300-wide stampede:
```ts
for (const item of items) results.push(await fetchDetail(item))
// or
await Promise.all(items.map(fetchDetail))
```

**After** — k = 10 in flight, ~6s, no overload:
```ts
import pLimit from 'p-limit'

const limit = pLimit(10)
const results = await Promise.allSettled(
  items.map((item) => limit(() => fetchDetail(item)))
)
const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
const failed = results.filter((r) => r.status === 'rejected')
```

`p-limit` is ~50 lines — a tiny pool of k workers pulling from a shared queue; easy to
hand-roll if you'd rather avoid the dependency. Note `allSettled` instead of `all`:
partial failure is the normal case at n = 300, so collect failures and retry those,
don't discard 299 successes.

Watch the three shapes run the same 12 requests — sequential is a staircase, unbounded
is a wall, bounded is lanes refilling:

<script src="/playbooks-demos.js"></script>

<pb-lanes></pb-lanes>

Picking k: for a third-party API, whatever its rate limit implies (often 5–20). For your
own backend, what its capacity tolerates. Browsers cap ~6 HTTP/1.1 connections per host
anyway (HTTP/2 multiplexes past that).

**When does it matter?**
- **n < ~10:** `Promise.all(items.map(...))` is correct and idiomatic. Don't add a
  limiter.
- **n ~10–100:** the stampede starts to matter if the target is rate-limited or the
  operations are heavy (uploads). Limit to be polite.
- **n > ~100, or any unattended/retried job:** bounded concurrency + `allSettled` +
  retry is the only shape that survives contact with production.

## Discarded alternatives (and when they ARE the right call)

### Plain `Promise.all`
- **What it solves:** simplest way to run independent operations concurrently and get
  ordered results; fail-fast when any failure should abort the whole unit.
- **Why it's not the first option here:** unbounded fan-out at large n, and one
  rejection throws away everything else.
- **When it IS the right call:** few operations (2–10), all needed, where partial
  success is useless — e.g. the 3 API calls that together render one page. That's most
  everyday code.

### `Promise.allSettled` without a limit
- **What it solves:** the all-or-nothing problem — every result or error is reported.
- **Why it's not the first option here:** still starts everything at once; the
  rate-limit/overload failure mode is untouched.
- **When it IS the right call:** small n with independent outcomes ("send 5 analytics
  events, log whichever fail"). Combine with a limiter when n grows — as in the
  recommendation.

### Keeping it sequential
- **What it solves:** trivially correct, preserves order, gentlest possible load — some
  APIs demand serialized calls.
- **Why it's not the first option here:** total time scales linearly with n; for
  independent I/O that's pure waiting you could overlap.
- **When it IS the right call:** operations *depend* on each other (each needs the
  previous result), the API requires serialization, or n is small enough that nobody
  cares (5 × 200ms = 1s — fine in a script).

### A batch endpoint (fix the shape of the API)
- **What it solves:** the real problem may be that you need 300 requests at all — one
  `POST /details` with 300 ids returns everything in one round trip.
- **Why it's not the first option here:** requires controlling the API; it's a contract
  change, not a client-side fix.
- **When it IS the right call:** it's your backend and this fan-out happens per user or
  per page load — that's an N+1 pattern crossing the network → see
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

## How to measure before and after

```ts
console.time('fanout')
const results = await run(items)
console.timeEnd('fanout') // 61,000ms → 6,400ms with k=10
```

DevTools → Network tab shows the shape directly: sequential = a staircase of one request
at a time; unbounded = a 300-row wall (with stalled/queued bars); bounded = k parallel
lanes refilling. Count the failures too: success rate before/after is the other half of
the metric.

## Signals you need something else

- The per-item work is CPU (parsing, transforming), not I/O → concurrency won't help,
  threads will ([A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/)).
- The fan-out exists because one endpoint won't give you the data →
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).
- The job is long, retryable, and shouldn't run inside a request at all →
  [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/).

## Related resources

- [Runtime fundamentals: the event loop](/playbooks/runtime/fundamentals/)
- MDN — [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all): fail-fast semantics, ordering guarantees
- MDN — [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled): the partial-failure shape
- [p-limit](https://github.com/sindresorhus/p-limit): the standard tiny concurrency limiter
