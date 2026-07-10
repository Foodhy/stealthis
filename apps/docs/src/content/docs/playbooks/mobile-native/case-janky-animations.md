---
title: "Your mobile animations stutter"
description: "The animation is driven from the JS thread, so it freezes whenever JS is busy. Run it on the UI thread — native driver or Reanimated — and it survives anything JS does."
sidebar:
  label: "Animations stutter"
playbook:
  area: "mobile-native"
  situation: "React Native animations drop frames or freeze, especially while data loads or screens mount"
  symptoms: ["animation freezes during navigation transitions", "smooth in isolation, janky in the real app", "gesture-driven UI lags behind the finger", "jank while a request resolves"]
  recommendation: "drive-animations-on-the-ui-thread"
  complexity_before: "60 JS round trips per second, gated by JS thread availability"
  complexity_after: "0 JS involvement per frame after setup"
  alternatives: ["optimize-js-thread", "layoutanimation", "lottie-or-video", "reduce-animation"]
---

## The situation

The drawer animation is silky in your demo screen. In the real app, opening it *while
the home feed loads* makes it stutter or freeze halfway, then snap to the end. A
gesture-driven bottom sheet trails behind the finger exactly when the app is doing
something. Animations work — until the app is busy, which is always.

## Diagnosis: why it happens

The animation is being **driven from the JS thread**: every frame, JS computes the next
value and sends it to the native view. That's 60 crossings per second that queue behind
whatever else JS is doing (see
[Mobile fundamentals](/playbooks/mobile-native/fundamentals/)). When a response parses
or a screen mounts, the JS thread is busy for 100–500ms — and your animation gets
*zero* frames in that window. It freezes, then jumps.

```tsx
// JS-driven: every frame crosses from JS to native
Animated.timing(slideAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false, // ← the whole problem
}).start()
```

The tell: the animation stutters *while native scrolling stays smooth* — the UI thread
is fine; your animation just lives on the wrong one. Same mechanism as
[a blocked event loop](/playbooks/runtime/case-blocking-cpu/), with a twist: here you
can move the *animation* off the busy thread instead of moving the work.

## Recommendation: run the animation on the UI thread

**For property animations, `useNativeDriver: true`** — the whole curve is declared once
to the native side, which then drives every frame with no JS involvement:

**Before** — gated by JS availability:
```tsx
Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start()
```

**After** — immune to JS thread load:
```tsx
Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
```

The catch: the native driver only handles **non-layout props** — `transform` and
`opacity`. Animating `width`/`height`/`top` won't work with it… which is fine, because
transform-based animation is also what the render pipeline wants
([same rule on the web](/playbooks/frontend-performance/fundamentals/)): slide with
`translateX`, don't animate `left`.

**For gesture-driven and complex animations, Reanimated** — worklets are small JS
functions compiled to run *on the UI thread*, so even value-dependent logic never
crosses threads per frame:

```tsx
const offset = useSharedValue(0)
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }], // runs on the UI thread, every frame
}))
const pan = Gesture.Pan().onChange((e) => { offset.value += e.changeX }) // also UI thread
```

Finger-to-pixel with no JS round trip — the sheet tracks the finger even mid-mount.

The same physics, demonstrated in your browser (rAF = JS-driven Animated; CSS
transform = native driver / Reanimated):

<script src="/playbooks-demos.js"></script>

<pb-threads></pb-threads>

**When does it matter?** `useNativeDriver: true` costs nothing when applicable — it's
just correct; use it always. Reanimated is a real dependency with a learning curve:
adopt it when gestures drive animation, when you must animate layout smoothly, or when
the design leans on motion. A settings screen with one fade needs neither library nor
worry.

## Discarded alternatives (and when they ARE the right call)

### Optimizing the JS thread instead
- **What it solves:** the root congestion — lighter renders and deferred work make
  *everything* JS-driven better, including taps and list fill.
- **Why it's not the first option here:** it makes jank *rarer*, not impossible — some
  JS burst will always coincide with an animation. UI-thread animation is categorical;
  JS optimization is statistical. Do it for its own sake, not as the animation fix.
- **When it IS the right call:** when taps and interactions lag too (the problem is
  bigger than animations) → the diagnosis path in
  [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/) and
  [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/).

### `LayoutAnimation` (animate the next layout change automatically)
- **What it solves:** one-line animation of layout changes (insert/remove/resize),
  executed natively — no values to manage at all.
- **Why it's not the first option here:** it's global and blunt (the *next* layout
  pass animates, whatever it includes), historically flaky on Android, and offers no
  interruption or gesture control.
- **When it IS the right call:** simple "list item appears/disappears smoothly"
  effects where you'd otherwise write boilerplate. Try it first for those; upgrade to
  Reanimated when you need control.

### Lottie / pre-rendered video for the fancy parts
- **What it solves:** designer-authored complexity (character motion, elaborate
  loaders) rendered natively from an exported file — no hand-coded curves.
- **Why it's not the first option here:** it plays canned content; it can't respond to
  gestures or app state beyond play/pause/progress. A bottom sheet can't be a Lottie.
- **When it IS the right call:** decorative, self-contained motion — onboarding
  illustrations, success checkmarks, branded loaders. Standard practice there.

### Reducing/removing the animation
- **What it solves:** no animation, no jank — and honors `prefers-reduced-motion`
  users besides.
- **Why it's not the first option here:** motion carries real UX information (where
  the sheet came from, what dismissed). Deleting it because the implementation was on
  the wrong thread is fixing the symptom by amputation.
- **When it IS the right call:** decorative motion that tested poorly, low-end-device
  modes, accessibility settings — as a *respect* for context, not as a performance
  workaround.

## How to measure before and after

- **Perf monitor** (dev menu → Show Perf Monitor): watch both FPS numbers during the
  janky flow. The signature of this case: **UI ~60, JS ~10** while the animation
  stutters. After moving to the UI thread: the animation holds 60 even when JS drops.
- **Reproduce the coincidence deliberately:** trigger the animation while pressing a
  button that does heavy JS (parse a big JSON in the handler). Before: freeze. After:
  smooth. That's the whole proof.
- On real, mid-range Android hardware — the simulator's CPU hides exactly the
  contention you're debugging.

## Signals you need something else

- Everything JS-driven lags (taps, inputs), not just animations → JS thread congestion
  is the disease → [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/)
  and [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/).
- The jank happens only while a huge list scrolls →
  [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/).
- You're animating layout properties and fighting the native driver's limits →
  restructure to transforms, or Reanimated — not `useNativeDriver: false`.

## Related resources

- [Mobile fundamentals: threads and the bridge](/playbooks/mobile-native/fundamentals/)
- React Native — [Animations: using the native driver](https://reactnative.dev/docs/animations#using-the-native-driver): the official guidance and its prop limitations
- [Reanimated docs](https://docs.swmansion.com/react-native-reanimated/): worklets, shared values, gesture integration
