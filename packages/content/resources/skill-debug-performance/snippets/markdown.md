# Performance Profiling in the Browser — Cheatsheet

A field guide to the Chrome DevTools **Performance** and **Memory** panels. Use it to
record a trace, read the flame chart, find long tasks and layout thrashing, measure
Core Web Vitals, and capture heap snapshots. Everything here uses real, current DevTools
behavior and the standard `web-vitals` / `PerformanceObserver` APIs — no invented flags.

## Opening the panels

```text
Open DevTools:        F12  or  Cmd+Opt+I (macOS) / Ctrl+Shift+I (Win/Linux)
Performance panel:    Cmd+Opt+I → "Performance" tab
Memory panel:         Cmd+Opt+I → "Memory" tab
Command menu:         Cmd+Shift+P → type "Show Performance"
Start/stop recording: Ctrl+E (while Performance panel is focused)
Record + reload:      click the circular-arrow "reload" button in the Performance panel
```

Tip: always profile in an **Incognito window** with extensions disabled so extension
work does not pollute the trace.

## Recording a trace (Performance panel)

```text
1. Performance tab → gear icon to expose capture settings.
2. Set "CPU" throttling: 4x or 6x slowdown to simulate mid-tier mobile.
3. Set "Network" throttling: "Slow 4G" / "Fast 4G" for realistic load.
4. Tick "Screenshots" to get a filmstrip; tick "Memory" to overlay the JS heap line.
5. For page load:  click the reload button (records load + reload).
   For interaction: click record (●), do the interaction, click stop (■).
6. Keep recordings short (3–8s). Long traces are slow to analyze.
```

Programmatic markers show up on the **Timings** track of the trace:

```js
// User Timing API — these appear as named bars in the flame chart
performance.mark("checkout:start");
doExpensiveWork();
performance.mark("checkout:end");
performance.measure("checkout", "checkout:start", "checkout:end");

// Read it back
const [m] = performance.getEntriesByName("checkout");
console.log(m.duration.toFixed(1), "ms");
```

In modern Chrome you can also add custom tracks with `console.timeStamp` extension args,
but `performance.measure` is the portable, standard approach.

## Reading the flame chart

The **Main** track is a flame chart: width = time spent, vertical stacking = call depth.
The top bar is the entry point; children below are the functions it called.

```text
Wide bars            = expensive (focus here first)
Tall stacks          = deep call chains
Red corner triangle  = a "long task" (>50ms) — blocks the main thread
Yellow blocks        = scripting (JS)
Purple blocks        = rendering (style/layout)
Green blocks         = painting/compositing
Gray blocks          = system / idle / other
```

Navigation in the panel:

```text
W / S            zoom in / out on the timeline
A / D            pan left / right
Click a bar      see Summary, Bottom-Up, Call Tree, Event Log in the drawer
Ctrl+F           search the flame chart for a function name
"Bottom-Up" tab  = which leaf functions cost the most total self-time
"Call Tree" tab  = top-down, where time goes from the entry point
```

Self time vs total time: **Self** is time in the function itself; **Total** includes
children. A function with huge total but tiny self is just a slow caller — drill down.

## Finding long tasks

Any task that occupies the main thread for **>50ms** is a "long task" and hurts
responsiveness (and INP). The Performance panel flags them with a red triangle. You can
also detect them at runtime:

```js
// Log every long task as it happens
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn(`Long task: ${entry.duration.toFixed(0)}ms`, entry.attribution);
  }
});
obs.observe({ type: "longtask", buffered: true });
```

Fixes once you find one:

```js
// 1. Yield to the browser between chunks of work
async function processInChunks(items, chunk = 100) {
  for (let i = 0; i < items.length; i += chunk) {
    items.slice(i, i + chunk).forEach(doWork);
    await new Promise((r) => setTimeout(r, 0)); // or: await scheduler.yield()
  }
}

// 2. scheduler.yield() (Chrome) — yields but keeps priority
async function withYield(items) {
  for (const item of items) {
    doWork(item);
    if (navigator.scheduling?.isInputPending?.()) await scheduler.yield();
  }
}

// 3. Move pure CPU work off-thread
const worker = new Worker(new URL("./crunch.js", import.meta.url), { type: "module" });
worker.postMessage(data);
```

## Detecting layout thrashing (forced reflow)

Layout thrashing = reading a layout property right after writing one, forcing the browser
to recompute layout synchronously, in a loop. In the trace it shows as purple **"Layout"**
or **"Recalculate Style"** bars, often with a warning "Forced reflow is a likely
performance bottleneck."

```js
// BAD — read → write → read → write forces a reflow every iteration
boxes.forEach((box) => {
  const w = box.offsetWidth;        // READ  (forces layout)
  box.style.width = w + 10 + "px";  // WRITE (invalidates layout)
});

// GOOD — batch all reads, then all writes
const widths = boxes.map((box) => box.offsetWidth); // all READs
boxes.forEach((box, i) => {                          // all WRITEs
  box.style.width = widths[i] + 10 + "px";
});
```

Properties that force a synchronous reflow when read after a write include:
`offsetWidth/Height/Top/Left`, `clientWidth/Height`, `scrollWidth/Height/Top`,
`getBoundingClientRect()`, `getComputedStyle()`, and `scrollIntoView()`.

```js
// Schedule writes in a frame, reads in the next — clean separation
requestAnimationFrame(() => {
  // writes
  requestAnimationFrame(() => {
    // reads (after layout has settled)
  });
});
```

## Core Web Vitals

The three field metrics. Targets are "good" thresholds at the 75th percentile.

```text
LCP  Largest Contentful Paint  — loading       — good ≤ 2.5s
INP  Interaction to Next Paint — responsiveness — good ≤ 200ms
CLS  Cumulative Layout Shift   — visual stability — good ≤ 0.1
```

Measure them in the lab with the `web-vitals` library:

```bash
npm install web-vitals
```

```js
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP((m) => console.log("LCP", m.value.toFixed(0), "ms", m.rating));
onINP((m) => console.log("INP", m.value.toFixed(0), "ms", m.rating));
onCLS((m) => console.log("CLS", m.value.toFixed(3), m.rating));
```

Or with raw `PerformanceObserver` (no dependency):

```js
// LCP
new PerformanceObserver((l) => {
  const e = l.getEntries().at(-1);
  console.log("LCP", e.startTime.toFixed(0), "ms", e.element);
}).observe({ type: "largest-contentful-paint", buffered: true });

// CLS (sum of unexpected layout shifts)
let cls = 0;
new PerformanceObserver((l) => {
  for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
  console.log("CLS", cls.toFixed(3));
}).observe({ type: "layout-shift", buffered: true });
```

In DevTools, the **Performance** panel shows LCP/CLS markers on the timeline, and the
**Lighthouse** panel reports all three from a lab run. Use the live **CrUX/CWV overlay**
via Command menu → "Show Core Web Vitals" for an on-page HUD.

## Memory snapshots (Memory panel)

Use the **Memory** panel to find leaks — detached DOM nodes, growing arrays, closures
holding references.

```text
Memory panel → three profiling types:
  • Heap snapshot          — point-in-time map of all live JS objects
  • Allocation timeline    — records allocations over time (find what allocates)
  • Allocation sampling    — low-overhead sampling of allocation stacks
```

Leak-hunting workflow with snapshots:

```text
1. Load page, take Heap snapshot #1 (baseline).
2. Do the suspect action N times (e.g. open/close a modal 10x).
3. Force GC: click the trash/garbage-collect icon in the Memory panel.
4. Take Heap snapshot #2.
5. In snapshot #2, switch the dropdown to "Comparison" vs snapshot #1.
6. Sort by "# Delta" / "Size Delta". Positive deltas that never free = leak.
7. Filter the class list for "Detached" to find detached DOM trees.
```

Confirm in code with the modern measurement API (Chrome, cross-origin-isolated pages):

```js
if (performance.measureUserAgentSpecificMemory) {
  const result = await performance.measureUserAgentSpecificMemory();
  console.log("bytes:", result.bytes);
}
```

## Common workflows

### 1. Janky scroll / dropped frames

```text
1. Performance panel → enable Screenshots, 4x CPU throttle.
2. Record (●), scroll the janky region, stop (■).
3. Look at the "Frames" track: red bars = dropped/partial frames.
4. Click a slow frame → Main track shows what ran during it.
5. If purple "Layout" dominates → batch reads/writes (see layout thrashing).
6. If yellow scripting dominates → open Bottom-Up, fix the top self-time function.
```

### 2. Slow page load / bad LCP

```text
1. Performance panel → reload button (●↻) with Slow 4G + 4x CPU.
2. Find the LCP marker on the timeline; note its element in the Summary.
3. Check the network waterfall above: is the LCP image/font late or render-blocking?
4. Fixes: preload the LCP resource, set fetchpriority="high", defer non-critical JS,
   inline critical CSS, add explicit width/height to stop the image shifting layout.
```

```html
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high" />
<img src="/hero.avif" width="1200" height="630" fetchpriority="high" alt="" />
```

### 3. Laggy click / high INP

```text
1. Record an interaction trace; perform the slow click once.
2. Find the "Interactions" track entry → it spans input to next paint.
3. Drill into the Main track inside that span: input handler + rendering.
4. If a long task blocks paint → break work up with scheduler.yield()/setTimeout(0)
   or move it to a Worker; keep the handler that updates UI synchronous and small.
```

### 4. Tab memory grows over time

```text
1. Memory panel → Heap snapshot baseline.
2. Repeat the suspect flow 5–10x, then click GC.
3. Take a 2nd snapshot → "Comparison" view, sort by Size Delta.
4. Filter "Detached" → trace a retained node's "Retainers" path to the JS that holds it
   (often an event listener never removed, or a global cache/array that only grows).
5. Fix: removeEventListener on teardown, use WeakMap/WeakRef for caches, bound the array.
```

## Gotchas / tips

- **Profile a release-like build.** Dev servers, source maps, and HMR distort timing.
  Use a production build, Incognito, and disable extensions.
- **Throttle on purpose.** Your dev machine is fast; real users are not. 4x–6x CPU and
  Slow/Fast 4G expose problems that "ran fine locally."
- **Self time, not total time,** tells you where the CPU actually went — use Bottom-Up.
- **Force GC before a comparison snapshot,** or you will mistake garbage for a leak.
- **CLS counts only *unexpected* shifts** — those without `hadRecentInput`. Shifts within
  500ms of a user action are excluded.
- **Lab ≠ field.** DevTools/Lighthouse is lab data; real INP/LCP/CLS come from CrUX field
  data. A green lab score can still have a poor field INP.
- **`scheduler.yield()` and `measureUserAgentSpecificMemory()` are Chromium-only** and
  the memory API needs a cross-origin-isolated page. Feature-detect before using.
- **Record short.** Multi-minute traces hang the panel; capture the smallest window that
  reproduces the problem.
- **Watch for forced-reflow warnings** in the trace's Summary/Event Log — DevTools names
  the exact line causing the synchronous layout.
