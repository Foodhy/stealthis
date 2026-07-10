---
title: "A CPU-bound task blocks everything"
description: "Heavy synchronous work freezes the UI (or starves your Node server) because it never yields the event loop. Workers move it off-thread — with a real serialization cost and cases where chunking wins."
sidebar:
  label: "CPU task blocks everything"
playbook:
  area: "runtime"
  situation: "A heavy computation (parsing, transforming, number crunching) freezes the UI or starves other requests in Node"
  symptoms: ["page unresponsive while processing", "spinner doesn't even animate", "Node server stops answering other requests", "DevTools shows one long task of seconds"]
  recommendation: "web-worker-or-worker-threads"
  complexity_before: "main thread blocked for the full task duration"
  complexity_after: "main thread free; work runs in parallel on another thread"
  alternatives: ["fix-the-algorithm-first", "chunking-with-yield", "move-to-backend-or-queue"]
---

## The situation

The user uploads a CSV, or you transform a big JSON, or you compute something genuinely
heavy — and the whole page freezes. Not slow: *frozen*. The spinner you added doesn't
even spin. In Node, the equivalent: one endpoint does heavy work and the entire server
stops responding to everyone else.

## Diagnosis: why it happens

JavaScript runs your task **to completion on the one thread that does everything else**
— input handling, rendering, other requests (see
[Runtime fundamentals](/playbooks/runtime/fundamentals/)). A 4-second parse is a
4-second window where the browser cannot paint a single frame. That's why the spinner
freezes: animating it requires the thread you're hogging.

Making the function `async` changes nothing — `await` yields only at actual async
boundaries. Synchronous CPU work inside an `async` function blocks identically.

First, be sure it's actually CPU. Record in DevTools → Performance: one long yellow
(scripting) block of hundreds of ms or seconds = CPU-bound, this case. Lots of small
gaps waiting on network = I/O-bound, different problem
([Many async operations at once](/playbooks/runtime/case-async-patterns/)).

## Recommendation: move it to a worker

Workers are real separate threads with their own event loop. The main thread posts the
input, keeps handling clicks and painting frames, and receives the result as a message.

**Before** — main thread blocked ~4s:
```ts
function handleFile(text: string) {
  const rows = parseAndAggregate(text) // 4s of sync CPU
  render(rows)
}
```

**After** — main thread free; work in parallel:
```ts
// worker.ts
self.onmessage = (e) => {
  self.postMessage(parseAndAggregate(e.data))
}

// main.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
worker.onmessage = (e) => render(e.data)
function handleFile(text: string) {
  worker.postMessage(text) // UI stays interactive
}
```

In Node the same shape is `worker_threads`; for a server, prefer a small pool (e.g.
piscina) over spawning per request — threads are ~MBs each and take ms to start.

**The honest cost:** `postMessage` **copies** the data (structured clone). Shipping a
100MB object to a worker and back can cost more than the computation you saved. Mitigate
by sending the raw input (a `File`/`ArrayBuffer` — buffers are *transferable*, moved not
copied) and returning the small aggregated result, not the full parsed dataset.

**When does it matter?**
- **Task < ~50ms:** nobody perceives it. No worker.
- **50–200ms:** perceptible on interactions that should feel instant. Chunking (below)
  is usually enough and much simpler.
- **> ~500ms, or repeated:** worker territory — in Node, anything CPU-heavy on a server
  that serves concurrent users.

## Discarded alternatives (and when they ARE the right call)

### Fixing the algorithm first
- **What it solves:** if the work is accidentally O(n²), making it O(n) can turn 4s into
  40ms — and then no infrastructure is needed at all.
- **Why it's not the first option here:** it *is* the first option — always. This case
  assumes the work is *legitimately* heavy after that check.
- **When it IS the right call:** always check first →
  [Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/). A worker
  wrapped around a quadratic loop is a slow program with better manners.

### Chunking: slice the work and yield between slices
- **What it solves:** process 500 rows, yield to the loop so it can paint and handle
  input, continue. No worker, no serialization, same-thread access to everything.
  ```ts
  for (const chunk of chunks(rows, 500)) {
    processChunk(chunk)
    await new Promise((r) => setTimeout(r, 0)) // yield (or scheduler.yield())
  }
  ```
- **Why it's not the first option here:** total time gets *longer* (the work
  time-shares with rendering), and it doesn't help Node throughput — the loop is still
  spending most turns on your work.
- **When it IS the right call:** moderate work (~50–500ms), or when the work needs DOM
  access (workers have none), or when the serialization cost of a worker would dominate.
  Progressive rendering ("show rows as they parse") falls out naturally.

### Moving it to the backend / a job queue
- **What it solves:** the client does nothing; heavy work runs on servers sized for it,
  cacheable and shareable across users.
- **Why it's not the first option here:** latency (upload + wait + download), backend
  cost and complexity, and it can't work offline. For one-off client-side transforms of
  data the user already has, a worker is simpler.
- **When it IS the right call:** the work needs data that lives server-side anyway,
  results are reused across users, or it's minutes-long → that's a job queue
  ([Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/)).

## How to measure before and after

DevTools → Performance → record the interaction. Before: one long task (red-flagged) of
seconds. After (worker): main thread shows only short tasks; the work appears under the
worker's own lane. Confirm the fix with feel: the spinner animates during processing.

```ts
console.time('parse')        // inside the worker
const out = parseAndAggregate(input)
console.timeEnd('parse')
```

In Node: monitor event-loop delay with
[`perf_hooks.monitorEventLoopDelay()`](https://nodejs.org/api/perf_hooks.html) — p99 in
the hundreds of ms means the loop is being starved.

## Signals you need something else

- Work still too slow even in parallel, or needs server data → backend job queue
  ([Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/)).
- The freeze is many small renders, not one computation →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).
- The slowness is waiting on many network calls, not CPU →
  [Many async operations at once](/playbooks/runtime/case-async-patterns/).

## Related resources

- [Runtime fundamentals: the event loop](/playbooks/runtime/fundamentals/)
- [The UI freezes](/playbooks/frontend-performance/case-frozen-ui/) — the frontend-flavored view of this same problem
- MDN — [Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers): API, limitations (no DOM), transferables
- Node.js — [worker_threads](https://nodejs.org/api/worker_threads.html): when Node's docs themselves say to use (and not use) threads
