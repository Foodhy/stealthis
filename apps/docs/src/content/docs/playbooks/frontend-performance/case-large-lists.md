---
title: "Your huge list renders slowly"
description: "10,000 rows means 10,000× every DOM node — the browser chokes on volume, not on your code. Virtualization renders only what's visible; pagination and lazy loading each have their place."
sidebar:
  label: "Huge list renders slowly"
playbook:
  area: "frontend-performance"
  situation: "A list/table of thousands of items renders slowly, scrolls badly, or eats memory"
  symptoms: ["slow initial render", "scroll lag", "high memory", "tab becomes sluggish after loading data"]
  recommendation: "virtualization"
  complexity_before: "O(n) DOM nodes"
  complexity_after: "O(visible) DOM nodes"
  alternatives: ["pagination", "infinite-scroll", "server-side-filtering", "leave-as-is"]
---

## The situation

Your table or feed worked great with 100 rows. Product asked for "all results" — now
it's 10,000 rows, the initial render takes seconds, scrolling stutters, and the whole
tab feels heavy afterwards. The data fetch is fast; it's the *displaying* that hurts.

## Diagnosis: why it happens

Every row costs DOM nodes — a realistic row (cells, avatar, buttons) is 10–30 nodes.
10,000 rows ≈ **200,000 nodes**. Layout, paint, and memory all scale with live nodes
(see [Frontend fundamentals](/playbooks/frontend-performance/fundamentals/)), so you pay
that 200k on first render *and keep paying it* on every style/layout invalidation while
scrolling. In React, each row is also a component the reconciler must consider on
updates.

The user's screen fits ~20 rows. You're paying for 10,000 to show 20 — the other 9,980
are pure overhead. That framing is the fix.

## Recommendation: virtualization (windowing)

Render only the visible rows plus a small buffer; as the user scrolls, reuse/replace
them. A tall spacer element keeps the scrollbar honest. DOM cost goes from **O(n)** to
**O(visible)** — constant regardless of list size.

**Before** — O(n) nodes:
```tsx
<ul>
  {items.map((item) => <Row key={item.id} item={item} />)}
</ul>
```

**After** — O(visible) nodes, with `@tanstack/react-virtual`:
```tsx
const parentRef = useRef<HTMLDivElement>(null)
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48, // row height estimate in px
})

<div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
  <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
    {virtualizer.getVirtualItems().map((v) => (
      <div key={v.key} style={{ position: 'absolute', top: 0, width: '100%',
                                transform: `translateY(${v.start}px)` }}>
        <Row item={items[v.index]} />
      </div>
    ))}
  </div>
</div>
```

10,000 rows → ~25 mounted at any time. Initial render and scroll cost stop depending on
n entirely. (Vanilla JS / other frameworks: same technique, e.g. TanStack Virtual core;
mobile lists have their own case →
[Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/).)

**The honest costs:** absolute positioning changes styling assumptions; variable-height
rows need measurement (supported, but more config); Ctrl+F browser search only finds
mounted rows; and screen-reader/SEO behavior changes since unmounted rows don't exist.

**When does it matter?**
- **n < ~200 simple rows:** render it all. Virtualization adds complexity you won't
  perceive.
- **n ~200–1,000:** gray zone — measure. Often fixing row cost (memoize `Row`, remove
  per-row listeners) is enough.
- **n > ~1,000, or heavy rows (images, charts):** virtualize. Above ~10,000, also
  question whether the client should hold the data at all (→ server-side filtering).

## Discarded alternatives (and when they ARE the right call)

### Pagination
- **What it solves:** bounds DOM *and* data per view; the URL captures position
  (shareable, back-button-friendly); the backend only sends one page.
- **Why it's not the first option here:** it's a UX change, not just a rendering fix —
  "show me everything scrollable" (feeds, logs, pickers) genuinely wants one continuous
  list. This case assumes that requirement.
- **When it IS the right call:** admin tables, search results, anything users navigate
  by position or link to. If you also shouldn't *fetch* it all, pair with keyset
  pagination server-side → [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

### Infinite scroll (load-more batches)
- **What it solves:** fast *initial* render and fetch — you start with 50 and append.
- **Why it's not the first option here:** it only defers the problem. By batch 40 the
  DOM holds 10,000 rows again and scroll is as bad as ever. It bounds time-to-first-row,
  not total nodes.
- **When it IS the right call:** feeds where users rarely scroll deep. For deep
  scrolling, combine it *with* virtualization (fetch in batches, render windowed) —
  that's the standard production pair.

### Server-side filtering/search ("don't ship 10,000 rows")
- **What it solves:** nobody reads 10,000 rows — they scan for something. A search box
  backed by the DB returns the 20 relevant rows and the whole client-side problem
  evaporates.
- **Why it's not the first option here:** requires backend work and a UX rethink; some
  tools (log viewers, data grids) legitimately need bulk local data for instant
  filtering.
- **When it IS the right call:** the list is a "find one item" flow in disguise —
  which is most of them. See [You need to search/filter](/playbooks/algorithms/case-search-filter/).

### Leaving it as is
- **What it solves:** simplest code, all rows findable with Ctrl+F, no positioning
  tricks.
- **Why it's not the first option here:** the case starts from visible jank.
- **When it IS the right call:** bounded lists (settings, a 100-row report). Don't
  virtualize a list that fits in a few screens.

## How to measure before and after

React DevTools → Profiler: record the mount — before, thousands of `Row` renders and a
commit of hundreds of ms; after, ~25 renders and a single-digit-ms commit.

Browser DevTools → Performance: record a scroll. Before: dropped frames, long
layout/paint blocks. After: steady ~60fps. Memory tab confirms the node-count drop
(heap snapshots before/after).

If the profile shows the time inside *fetching or transforming* the data rather than
rendering, this isn't your case → check
[Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/) or
[Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

## Signals you need something else

- Typing in a filter above the list is what lags →
  [The input lags while typing](/playbooks/frontend-performance/case-janky-input/).
- Rows are cheap but *data processing* before render is heavy →
  [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/).
- The list is images and *they* are the weight →
  [Your images are slow](/playbooks/frontend-performance/case-slow-images/).
- Same problem in React Native →
  [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/).

## Related resources

- [Frontend fundamentals: the render pipeline](/playbooks/frontend-performance/fundamentals/)
- [TanStack Virtual](https://tanstack.com/virtual/latest): headless virtualization for React/Vue/Solid/vanilla
- web.dev — [Virtualize large lists](https://web.dev/articles/virtualize-long-lists-react-window): the technique explained by the Chrome team
