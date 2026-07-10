---
title: "The input lags while typing"
description: "Every keystroke triggers work that costs more than a frame. Keep the input's own update cheap and make the expensive reaction less frequent (debounce) or less urgent (useDeferredValue)."
sidebar:
  label: "Input lags while typing"
playbook:
  area: "frontend-performance"
  situation: "Typing in a search/filter/form input feels delayed because each keystroke triggers expensive work"
  symptoms: ["letters appear late while typing", "typing fast drops characters", "results list stutters on each keystroke", "fan spins while typing"]
  recommendation: "decouple-input-from-expensive-reaction"
  complexity_before: "expensive work × every keystroke"
  complexity_after: "cheap echo per keystroke; expensive work once per pause (or at low priority)"
  alternatives: ["debounce-only", "usedeferredvalue", "memoize-the-work", "uncontrolled-input"]
---

## The situation

A search box filters a list as the user types. With little data it felt magic; now each
keystroke visibly hesitates — letters appear late, fast typing stutters. The user is
fighting your filter for the keyboard.

## Diagnosis: why it happens

Typing a character must feel instant, which means the keystroke's task has roughly a
frame (~16ms, generously 50ms) to finish before the pipeline paints the echo (see
[Frontend fundamentals](/playbooks/frontend-performance/fundamentals/)). But your
keystroke isn't just echoing a character — it's filtering 5,000 items *and re-rendering
the results list* in the same synchronous pass:

```tsx
const [query, setQuery] = useState('')
const results = items.filter((i) => i.text.includes(query)) // every render
// <input value={query} onChange={(e) => setQuery(e.target.value)} />
// <Results items={results} />  ← 500 rows re-render in the same pass
```

Keystroke → `setQuery` → render → filter 5,000 items → render 500 result rows → *then*
paint the character. Type at 10 keys/sec and a 100ms reaction means permanent lag. Often
the filter is the cheap part and the **re-render of results is the expensive one** —
profile before assuming.

## Recommendation: decouple the echo from the reaction

The input's own update must stay cheap and immediate. The expensive reaction gets
decoupled — either **less frequent** (debounce) or **less urgent** (React concurrent
rendering).

**Debounce** — run the reaction once the user pauses (~200–300ms):
```tsx
const [query, setQuery] = useState('')          // updates instantly — cheap echo
const [debounced, setDebounced] = useState('')

useEffect(() => {
  const t = setTimeout(() => setDebounced(query), 250)
  return () => clearTimeout(t)
}, [query])

const results = useMemo(
  () => items.filter((i) => i.text.includes(debounced)),
  [items, debounced]
)
```

**Or `useDeferredValue`** — React-specific, no timer: results render at low priority and
get *interrupted* by the next keystroke instead of blocking it:
```tsx
const [query, setQuery] = useState('')
const deferredQuery = useDeferredValue(query)   // lags behind under load
const results = useMemo(
  () => items.filter((i) => i.text.includes(deferredQuery)),
  [items, deferredQuery]
)
// <Results items={results} /> — ideally memo()'d so it skips re-render until deferredQuery changes
```

Debounce also cuts *how often* the work runs (essential when each keystroke would fire a
network request); `useDeferredValue` keeps results as fresh as the machine allows with
no tuning constant. They compose: debounce the fetch, defer the render.

Feel the difference — the left input really burns 80ms per keystroke:

<script src="/playbooks-demos.js"></script>

<pb-input></pb-input>

**When does it matter?**
- Reaction **< ~20ms** total: nothing needed — you won't beat "already instant".
- **~20–100ms:** perceptible under fast typing. Debounce is two lines; do it.
- **> ~100ms per keystroke:** mandatory decoupling, and also shrink the work itself —
  filter smarter ([You need to search/filter](/playbooks/algorithms/case-search-filter/))
  and render fewer nodes ([Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/)).

## Discarded alternatives (and when they ARE the right call)

### Debounce alone (no memo, no deferral)
- **What it solves:** frequency. 10 reactions/sec → ~4/sec; usually enough by itself.
- **Why it's not the first option here:** when the *single* reaction costs 300ms, firing
  it less often still freezes the UI 300ms every pause. Frequency fixes don't help cost
  problems.
- **When it IS the right call:** the reaction is moderately priced or remote (API
  autocomplete: debounce ~300ms + cancel stale requests is *the* standard pattern).

### `useDeferredValue` / `startTransition` alone
- **What it solves:** urgency. Keystrokes stay instant; heavy rendering happens in
  interruptible background renders. No magic-number delay.
- **Why it's not the first option here:** React-only, and it doesn't reduce *how often*
  expensive non-render work (network calls) fires — debounce does that. Requires the
  heavy child to be `memo`'d to actually skip work.
- **When it IS the right call:** client-side heavy *rendering* (big filtered lists,
  charts) in React 18+. For synchronous non-React work it does nothing.

### Memoizing / precomputing the work
- **What it solves:** cost. Precompute searchable strings once, `useMemo` the filter,
  `memo` the rows — the per-keystroke bill shrinks at the source.
- **Why it's not the first option here:** it's a complement, not an alternative —
  sufficiently big data outgrows any constant-factor trim.
- **When it IS the right call:** always worth the cheap wins (hoist `toLowerCase`,
  memo the results component). If that alone gets you under ~20ms, you're done — don't
  add layers.

### Uncontrolled input (read value on demand)
- **What it solves:** removes React from the keystroke path entirely — the browser owns
  the echo; you read `ref.current.value` when you need it.
- **Why it's not the first option here:** loses controlled-input features (live
  validation, programmatic clearing) and doesn't touch the expensive reaction — it just
  stops it from riding every keystroke.
- **When it IS the right call:** forms where you only need the value on submit, or
  extreme cases (input embedded in a component tree too expensive to re-render at all).

## How to measure before and after

React DevTools → Profiler → record while typing: look for renders per keystroke and
which components eat the time. After the fix, keystrokes render only the input; results
render once per pause.

Browser DevTools → Performance: type fast, look for tasks > 50ms per keypress event.
INP in production catches this too (target < 200ms). And the honest test — type as fast
as you can; the echo should never fall behind your fingers.

## Signals you need something else

- Filtering itself is the slow part even at low frequency →
  [You need to search/filter](/playbooks/algorithms/case-search-filter/).
- Rendering the results is the slow part →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).
- The work per keystroke is genuinely heavy CPU (parsing, scoring) →
  [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/).

## Related resources

- [Frontend fundamentals: the render pipeline](/playbooks/frontend-performance/fundamentals/)
- react.dev — [useDeferredValue](https://react.dev/reference/react/useDeferredValue): the official pattern for deferring expensive re-renders
- web.dev — [Debounce your input handlers](https://web.dev/articles/debounce-your-input-handlers): the classic guidance from the Chrome team
