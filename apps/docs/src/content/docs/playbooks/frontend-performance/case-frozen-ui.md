---
title: "The UI freezes during a computation"
description: "One long task starves rendering completely — zero frames until it ends. Fix the algorithm first; then chunk the work or move it to a Web Worker, each with explicit trade-offs."
sidebar:
  label: "The UI freezes"
playbook:
  area: "frontend-performance"
  situation: "While the app processes something (file, big dataset, heavy transform) the entire UI stops responding"
  symptoms: ["page ignores clicks for seconds", "spinner freezes mid-spin", "browser offers to kill the page", "one long task in the profiler"]
  recommendation: "algorithm-first-then-chunk-or-worker"
  complexity_before: "one task of seconds; 0 frames painted"
  complexity_after: "many <50ms tasks, or work off-thread; UI stays at 60fps"
  alternatives: ["web-worker", "chunking-with-yield", "move-to-backend", "css-only-feedback"]
---

## The situation

The user clicks "Import" or "Generate report", and the page dies for five seconds. No
click works, the spinner freezes mid-frame, text can't be selected. Then everything
snaps back at once. Chrome may even offer to kill the page. The work *completes* — it
just takes the UI hostage while it runs.

## Diagnosis: why it happens

Rendering happens **between** tasks, never during one (see
[Runtime fundamentals](/playbooks/runtime/fundamentals/) and the
[render pipeline](/playbooks/frontend-performance/fundamentals/)). A 5-second synchronous
task = 5 seconds × 0 frames painted, 0 events handled. The freeze isn't a slow pipeline
— the pipeline never gets a turn.

The 50ms rule: tasks under ~50ms leave the UI feeling responsive
([web.dev long tasks](https://web.dev/articles/optimize-long-tasks)). One 5,000ms task
is 100× over budget. And `async`/`await` alone doesn't help — synchronous CPU inside an
`async` function blocks identically.

Confirm the shape in DevTools → Performance: one long yellow block = this case. Many
medium tasks (renders) = a different case
([Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/)).
And check *what* the block is: if it's an accidentally-quadratic loop, fix that and this
case may evaporate → [Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/).

## Recommendation: chunk it, or move it off-thread

Two mechanically different fixes; pick by the work's nature.

**Chunking** — same thread, but yield every slice so the browser can paint and handle
input:

**Before** — one 5s task:
```ts
function processAll(rows: Row[]) {
  for (const row of rows) processRow(row) // 5s, UI dead
}
```

**After** — 50ms slices, UI alive, progress for free:
```ts
async function processAll(rows: Row[], onProgress: (done: number) => void) {
  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    for (const row of rows.slice(i, i + CHUNK)) processRow(row)
    onProgress(i + CHUNK)
    await new Promise((r) => setTimeout(r, 0)) // yield to the event loop
    // (or `await scheduler.yield()` where supported — same idea, better priority)
  }
}
```

**Worker** — a real second thread; the main thread only posts input and receives the
result. See the full pattern with code in
[A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/) — that case
is the runtime-level view of this same problem.

Choosing:

| | Chunking | Worker |
| --- | --- | --- |
| UI stays responsive | Yes (mostly — shares the thread) | Yes (fully) |
| Total time | Slightly longer | Same or shorter (true parallel) |
| Needs DOM access | Works | No DOM in workers |
| Serialization cost | None | Copies data both ways |
| Complexity | ~5 lines | New file, message protocol |

**When does it matter?** Under ~100ms of blockage: a progress affordance is enough,
don't restructure. 100–500ms on a user-triggered action: chunking. Multi-second or
recurring work: worker. Minutes-long: it doesn't belong in the browser (→ backend).

## Discarded alternatives (and when they ARE the right call)

### Web Worker as the default reflex
- **What it solves:** total isolation of the work from the UI thread.
- **Why it's not the first option here:** for moderate work, serialization overhead and
  the no-DOM constraint make it more machinery than the problem needs; chunking is 5
  lines. (For genuinely heavy work it *is* the recommendation — see the decision table.)
- **When it IS the right call:** work in the seconds range, pure data-in/data-out →
  [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/).

### Moving the computation to the backend
- **What it solves:** the client does nothing; results cacheable across users; the
  browser can't run out of memory on it.
- **Why it's not the first option here:** round-trip latency, upload cost for local
  data (a 50MB file the user just picked), backend infrastructure, no offline.
- **When it IS the right call:** the data already lives server-side, the result is
  shared, or the work takes minutes → then it's a job queue, not a request
  ([Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/)).

### CSS-only feedback (spinner and hope)
- **What it solves:** in theory, perceived responsiveness.
- **Why it's not the first option here:** it doesn't work — CSS animations driven by the
  main thread freeze with it. (Compositor-driven animations may keep moving, which is
  *worse*: a lively spinner over a dead page.) Clicks still go nowhere.
- **When it IS the right call:** never as the fix. As a *companion* to chunking/workers
  — progress bars, disabled buttons — always: the user should see that work is
  happening.

## How to measure before and after

DevTools → Performance → record the action. Before: one long task (red triangle),
frames row empty for its whole duration. After chunking: a comb of ~50ms tasks with
paints between them. After a worker: main thread nearly idle, work visible in the
worker lane.

Quick sanity check without the profiler: start the action, try to select text or hover
a button. If the hover state responds, the loop is breathing.

In production: INP (target < 200ms) catches exactly this on real users.

## Signals you need something else

- The "computation" is actually rendering thousands of nodes →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).
- It fires on every keystroke →
  [The input lags while typing](/playbooks/frontend-performance/case-janky-input/).
- The work is quadratic by accident → fix the algorithm and skip the infrastructure
  ([Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/)).
- Same symptom in React Native (JS thread busy, gestures dead) →
  [Animations stutter on mobile](/playbooks/mobile-native/case-janky-animations/).

## Related resources

- [Frontend fundamentals: the render pipeline](/playbooks/frontend-performance/fundamentals/)
- [Runtime fundamentals: the event loop](/playbooks/runtime/fundamentals/)
- web.dev — [Optimize long tasks](https://web.dev/articles/optimize-long-tasks): yielding patterns, `scheduler.yield()`, the 50ms budget
- MDN — [Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
