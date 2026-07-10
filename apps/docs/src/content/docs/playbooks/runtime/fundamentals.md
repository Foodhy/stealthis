---
title: "The Event Loop — Fundamentals"
description: "How JavaScript runs one thing at a time and still handles concurrency: the event loop in browser and Node, microtasks vs macrotasks, and why blocking the loop freezes everything."
sidebar:
  label: "Fundamentals"
  order: 0
playbook:
  area: "runtime"
  type: "fundamentals"
  covers: ["event-loop", "microtasks-vs-macrotasks", "blocking-the-main-thread", "concurrency-without-threads"]
---

## What it is and why it affects you

JavaScript runs your code on **one thread with one call stack** — one function at a time,
to completion. And yet a page handles clicks, timers, and network responses "at once".
The trick is the **event loop**: a scheduler that runs one task, then picks the next from
a queue.

You've relied on this without naming it:

```ts
console.log('1')
setTimeout(() => console.log('3'), 0)
console.log('2')
// prints 1, 2, 3 — the timeout callback waits its turn even at 0ms
```

The consequence that bites you: **while your code runs, nothing else can**. No clicks
processed, no rendering, no timers. A 3-second loop means a 3-second frozen page —
that's the mechanism behind half the cases in these playbooks.

"Single-threaded" doesn't mean "no concurrency", though. I/O (network, disk, timers)
happens *off* your thread — the platform does the waiting and queues a callback when
ready. JS is single-threaded in *your code*, concurrent in its I/O. What it can't do
concurrently is *your CPU work* — for that you need actual extra threads
(Web Workers / `worker_threads`).

## The mental model

One loop, one rule: **finish the current task, drain all microtasks, maybe render, take
the next task.**

```
            ┌─────────────────────────────┐
            │      task (macrotask)       │  ← script, setTimeout cb, click handler,
            │   runs to completion, no    │    fetch response handler
            │       interruptions         │
            └──────────────┬──────────────┘
                           ▼
            ┌─────────────────────────────┐
            │    drain microtask queue    │  ← promise .then/await continuations,
            │  (ALL of them, even newly   │    queueMicrotask
            │        queued ones)         │
            └──────────────┬──────────────┘
                           ▼
            ┌─────────────────────────────┐
            │   render if needed (browser)│  ← style, layout, paint — only between
            └──────────────┬──────────────┘    tasks, never mid-task
                           ▼
                 next task from queue ──► (loop)
```

Three rules cover almost every situation:

1. **Tasks are atomic.** Nothing preempts running JS. A long task delays input handling
   *and* rendering — the browser can only paint between tasks.
2. **Microtasks run before anything else gets a turn.** Every `await`/`.then`
   continuation runs before the next task or render. An infinite chain of microtasks
   starves rendering just like a `while(true)`.
3. **`await` yields, it doesn't unblock.** `await fetch(...)` frees the loop while the
   network works (the waiting is elsewhere). But `await heavyComputation()` where the
   function is plain synchronous JS blocks exactly the same — `async` doesn't create
   threads.

Node's loop adds phases (timers, poll, check/`setImmediate`) and
`process.nextTick` (ahead of even microtasks), but the model is the same: callbacks run
one at a time on one thread; blocking it blocks *every* request the process is serving,
not just one user's.

Step through one full turn of the loop yourself:

<script src="/playbooks-demos.js"></script>

<pb-eventloop></pb-eventloop>

## Reference table

| You write | It's queued as | When it runs |
| --- | --- | --- |
| synchronous code | current task | now, blocking everything |
| `promise.then(cb)` / code after `await` | microtask | after current task, before render/next task |
| `queueMicrotask(cb)` | microtask | same as above |
| `process.nextTick(cb)` (Node) | nextTick queue | even before microtasks |
| `setTimeout(cb, 0)` / `setInterval` | (macro)task | a later loop turn — after render can happen |
| `setImmediate(cb)` (Node) | check phase | after I/O callbacks this turn |
| I/O callback (`fetch` resolution, `fs` cb) | task (+ microtasks for promise APIs) | when the platform finishes the I/O |
| `requestAnimationFrame(cb)` | rendering step | right before the next paint |
| `requestIdleCallback(cb)` | idle period | when the loop has nothing better to do |
| Web Worker / `worker_threads` code | **another thread entirely** | in parallel; talks via message passing |

The practical budget: at 60fps the browser paints every ~16ms, and
[web.dev's long-task guideline](https://web.dev/articles/optimize-long-tasks) flags any
task over **50ms** as jank territory. A task of 500ms is a visible freeze.

## How this connects to the cases

- [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/) — "parsing
  a big file / crunching numbers freezes the UI (or starves my Node server)"
- [Many async operations at once](/playbooks/runtime/case-async-patterns/) — "I fire
  hundreds of promises and things get slow, flaky, or rate-limited"

This area is also the base for the others: frontend jank
([The UI freezes](/playbooks/frontend-performance/case-frozen-ui/),
[The input lags while typing](/playbooks/frontend-performance/case-janky-input/)) and
backend stalls ([Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/))
are this same loop, blocked in different places.

## Primary sources

- [MDN — The event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) — the normative description of the run-to-completion model and task queues.
- [MDN — Microtask guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) — exactly when microtasks run relative to tasks and rendering.
- [Node.js docs — The event loop, timers, and process.nextTick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — Node's loop phases and how they differ from the browser.
- [Philip Roberts — "What the heck is the event loop anyway?" (JSConf EU)](https://www.youtube.com/watch?v=8aGhZQkoFbQ) — the canonical 25-minute visual explanation; if the diagram above didn't click, this will.
- [web.dev — Optimize long tasks](https://web.dev/articles/optimize-long-tasks) — the 50ms guideline and yielding patterns.
