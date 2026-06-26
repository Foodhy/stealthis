# React DevTools Debugging Cheatsheet

The React Developer Tools browser extension adds two tabs to your browser's
DevTools: **Components** (inspect the live component tree, props, state, and hooks)
and **Profiler** (record and analyze render performance). This cheatsheet covers the
practical workflows for both, plus visualizing re-renders and using
`why-did-you-render`.

## Install

```bash
# Chrome / Edge / Firefox: install the "React Developer Tools" extension
# from the browser's add-on store.

# Standalone app (for React Native, Safari, or non-browser targets):
npm install -g react-devtools
# or run without installing:
npx react-devtools
```

For the standalone app, add the script tag *before* any other scripts in your HTML
(or it is auto-injected by React Native):

```html
<script src="http://localhost:8097"></script>
```

## Components tab

Inspect the rendered component tree and the live data behind each node.

```text
- Click a component in the tree → right panel shows props, state, hooks, context.
- Use the search box (top of tree) to filter components by name.
- Eyedropper icon → click an element on the page to select its component.
- "Suspense" toggle (clock icon) → force-suspend a tree to test fallbacks.
```

### Inspecting props, state, and hooks

```text
- props:  shown as a tree; expand objects/arrays inline.
- state:  shown for class components and useState/useReducer hooks.
- hooks:  listed in call order (State, Reducer, Memo, Context, Effect, ...).
          Named hooks show their custom name if you use useDebugValue.
- Double-click a primitive value to EDIT it live and re-render.
- Right-click a value → "Copy value to clipboard" or "Store as global variable"
  (exposes it as $r-style temp var, e.g. temp1, in the Console).
```

The currently selected component is available in the browser Console as `$r`:

```js
$r              // the selected component instance / fiber
$r.props        // its props
$r.state        // its state (class components)
```

### useDebugValue for custom hooks

Label custom hooks so they read clearly in the hooks panel:

```jsx
import { useDebugValue, useState } from "react";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useDebugValue(isOnline ? "Online" : "Offline");
  return isOnline;
}
```

### Component filters

Hide noise (host components, HOC wrappers) from the tree:

```text
Settings (gear icon) → Components → Filters
- Filter by component type: host (DOM) nodes, etc.
- Filter by name (regex) or by HOC wrappers.
```

## Highlight re-renders

See exactly which components re-render and how often, in real time.

```text
Settings (gear icon) → General → "Highlight updates when components render"
```

```text
- Components flash with a colored border on every render.
- Color escalates blue → green → yellow → red as render frequency rises.
- Use it to spot a parent re-rendering its whole subtree on every keystroke.
```

## why-did-you-render

A library that logs *why* a component re-rendered (which prop/state/hook changed),
catching avoidable re-renders the highlight feature only hints at.

```bash
npm install @welldone-software/why-did-you-render --save-dev
```

Initialize it **before** React renders, only in development:

```js
// wdyr.js
import React from "react";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```

Import it first in your entry file:

```js
// index.js — must be the FIRST import
import "./wdyr";
import React from "react";
import { createRoot } from "react-dom/client";
```

Opt a specific component in (when not tracking all):

```jsx
function MyComponent(props) {
  /* ... */
}
MyComponent.whyDidYouRender = true;
```

It then logs grouped Console messages explaining each re-render and the values that
changed (props, state, hooks).

## Profiler tab

Record render performance, then inspect each commit.

```text
1. Open the Profiler tab.
2. Click the record (●) button.
3. Interact with the app (the slow action you want to measure).
4. Click record (●) again to stop.
```

```text
Settings (gear icon) → Profiler
- "Record why each component rendered while profiling" → adds change reasons.
- "Hide commits below" threshold → ignore trivially fast commits.
```

### Reading commits

Each recorded **commit** is a bar in the timeline at the top:

```text
- Bar height/color = how long that commit took (taller/yellow = slower).
- Click a bar to inspect that single commit.
- Left/right arrows step between commits.
```

### Flamegraph vs Ranked

```text
Flamegraph view:
  - Mirrors the component tree for the selected commit.
  - Width = time spent rendering that component + children.
  - Gray = did NOT render this commit; colored = rendered.

Ranked view:
  - Same commit, but components sorted slowest → fastest.
  - Fastest way to find the single most expensive component.
```

### Why did this render?

With "Record why each component rendered" enabled, selecting a component in a commit
shows the cause:

```text
- "Props changed (propA, propB)"
- "State changed"
- "Hooks changed"
- "The parent component rendered"
- "This is the first time the component rendered"
```

## Common workflows

### 1. Find the source of a wrong value on screen

```text
1. Components tab → eyedropper → click the misbehaving element.
2. Read its props/state in the right panel.
3. If the value is wrong here, walk UP the tree to the parent passing it.
4. Edit the prop/state inline to confirm the component renders correctly with
   the expected value, then fix it in code.
```

### 2. Stop a list re-rendering on every keystroke

```text
1. Enable "Highlight updates when components render".
2. Type in the input — watch the whole list flash red.
3. Add why-did-you-render to confirm the cause (e.g. a new array/object prop
   created inline each render).
4. Memoize: wrap rows in React.memo, stabilize callbacks with useCallback,
   stabilize derived data with useMemo.
5. Re-test: only the input should flash now.
```

### 3. Profile a slow interaction

```text
1. Profiler tab → record (●).
2. Perform the slow interaction once.
3. Stop recording.
4. Scan the commit timeline for the tallest (slowest) bar.
5. Open Ranked view on that commit → top entry is the worst offender.
6. Select it → read "why did this render" to learn what triggered it.
7. Optimize (memoize, split state, virtualize), then re-record to compare.
```

### 4. Debug a component from the Console

```jsx
// 1. Select the component in the Components tab.
// 2. In the Console:
$r.props            // inspect current props
$r.state            // inspect current state (class component)
// 3. Right-click a hook value → "Store as global variable" → temp1
//    then poke at temp1 directly in the Console.
```

## Gotchas / tips

```text
- DevTools only attaches to a DEV build for full data; production builds are
  minified, so component names and hook labels may be missing.
- why-did-you-render and the Profiler measure DEV renders, which are slower than
  production — use them to find RELATIVE hotspots, not absolute timings.
- "The parent component rendered" is normal; it only matters when the child is
  expensive. Don't memoize cheap components reflexively.
- Inline-editing props/state in Components is temporary — it does not change source
  and is reset on the next real render.
- The standalone react-devtools app listens on port 8097; make sure the inline
  <script src="http://localhost:8097"></script> loads first.
- If the Profiler shows "no profiling data", you stopped recording before any
  commit happened — interact with the app while recording.
- StrictMode double-invokes renders in development, which can inflate Profiler
  counts; this does not happen in production.
```
