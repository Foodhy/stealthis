---
title: "React Native Threads and the Bridge — Fundamentals"
description: "Why mobile jank is a threading problem: the JS thread vs the UI thread, the old bridge vs JSI, and what actually runs where. Base for the mobile & native cases."
sidebar:
  label: "Fundamentals"
  order: 0
playbook:
  area: "mobile-native"
  type: "fundamentals"
  covers: ["js-thread-vs-ui-thread", "bridge-and-jsi", "why-animations-jank", "frame-budget-on-mobile"]
---

## What it is and why it affects you

A React Native app is **two programs cooperating**: your JavaScript (components, state,
handlers) running on a **JS thread**, and the platform's native **UI thread** doing what
every iOS/Android app does — layout, drawing, touch, animation at 60–120fps.

They communicate asynchronously. Historically through the **bridge** (JSON messages,
batched, serialized); in the new architecture through **JSI** — a C++ layer that lets
JS hold references to native objects and call them directly, enabling synchronous calls
and shared memory where needed. JSI cuts the overhead dramatically, but the
**two-thread model is unchanged**: your JS still runs on one thread, the screen is
drawn by another, and neither waits for the other for free.

Why you care: **every classic RN performance mystery is a threading story.**

```tsx
<ScrollView onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}>
```

Scroll events fire on the UI thread → cross to the JS thread → your handler sets state
→ React re-renders → updates cross back → the view moves. If the JS thread is busy for
100ms (parsing a response, rendering a list), the parallax header you drove from
`offset` freezes for 100ms — *while native scrolling continues buttery underneath*,
because scrolling never needed JS. That contrast — some things stutter while others
stay smooth — is the two threads made visible.

## The mental model

```
   JS THREAD                              UI (MAIN) THREAD
   ─────────                              ────────────────
   your components render                 measures & draws views
   setState, effects, handlers            native scroll / gestures
   business logic, JSON parsing           platform animations
        │                                       │
        │   bridge (old): async JSON batches    │
        └──── JSI (new): direct C++ calls ──────┘
                     (still two threads)

   Busy JS thread  → taps queue up, JS-driven animations freeze,
                     list items appear blank while scrolling fast
   Busy UI thread  → everything frozen (rare — usually deep native views)
   Frame budget    → 16.7ms at 60fps; 8.3ms at 120fps
```

Three rules that explain the cases:

1. **What runs on the UI thread stays smooth no matter what JS is doing.** Native
   scrolling, `useNativeDriver` animations, Reanimated worklets. This is why the fix
   for janky animations is "move them to the UI thread", not "make JS faster".
2. **What runs per-frame through JS inherits JS's worst-case latency.** A JS-driven
   animation is only as smooth as the JS thread's least busy 16ms.
3. **Crossing threads costs; crossing per-frame costs × 60.** One `onScroll` state
   update per frame = 60 round trips/second competing with everything else JS does.

See the two-thread model live (in browser terms — same physics):

<script src="/playbooks-demos.js"></script>

<pb-threads></pb-threads>

**The mobile multiplier:** the same JS that hits 16ms budgets comfortably on your dev
machine runs on phone CPUs several times slower, with thermal throttling. Mobile is
where main-thread discipline (see [Runtime fundamentals](/playbooks/runtime/fundamentals/)
— the JS thread is exactly that event loop) stops being optional.

## Reference table

| Work | Which thread | Janks when |
| --- | --- | --- |
| Native scrolling, touch recognition | UI | almost never (that's the point) |
| `Animated` with `useNativeDriver: true` | UI (declared once, driven natively) | at setup only; limited to non-layout props (transform, opacity) |
| Reanimated worklets (`useAnimatedStyle`, gestures) | UI (JS-like code compiled to run there) | worklet itself does heavy work |
| `Animated` without native driver | JS → per-frame updates across | JS thread busy — the classic jank |
| `onScroll`/gesture handlers in plain JS | UI event → JS handler | JS thread busy; state-per-frame floods it |
| Component render, setState, effects | JS | big renders block everything JS-driven |
| JSON parse of a large response | JS | freezes JS-driven UI while parsing |
| FlatList item mount/render | JS (then commit to UI) | items too heavy → blank cells while scrolling |

Frame budgets: **16.7ms** (60Hz) / **8.3ms** (120Hz displays). A dropped frame on a
touchscreen is felt more than on desktop — the finger is *on* the moving pixel.

## How this connects to the cases

- [Animations stutter on mobile](/playbooks/mobile-native/case-janky-animations/) —
  "my animation freezes while data loads" → it's driven from the JS thread; move it
- [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/) — "blank
  cells and dropped frames while scrolling" → item render cost on the JS thread
- [It must work offline](/playbooks/mobile-native/case-offline-sync/) — persistence and
  sync (the area's non-threading case — the constraint is connectivity, not frames)

## Primary sources

- [React Native docs — Threading model](https://reactnative.dev/architecture/threading-model) — the official description of which threads exist and what runs on each.
- [React Native docs — About the New Architecture](https://reactnative.dev/architecture/landing-page) — JSI, Fabric, and what changed from the bridge (and what didn't: two threads).
- [React Native docs — Performance overview](https://reactnative.dev/docs/performance) — the frame budget and the standard causes of dropped frames, from the source.
- [Reanimated docs — Worklets](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/#worklet) — how "JS on the UI thread" actually works.
- [Expo docs — Profiling](https://docs.expo.dev/debugging/tools/) — the tooling for seeing which thread is dropping your frames.
