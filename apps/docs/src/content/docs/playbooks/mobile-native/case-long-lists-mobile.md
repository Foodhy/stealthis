---
title: "Long lists scroll badly on mobile"
description: "Blank cells and dropped frames: list virtualization is already there, but item render cost on the JS thread can't keep up with the scroll. Cheaper items first, FlashList when structure allows."
sidebar:
  label: "Long lists on mobile"
playbook:
  area: "mobile-native"
  situation: "A FlatList/feed drops frames, shows blank cells while scrolling fast, or takes seconds to appear"
  symptoms: ["blank areas while scrolling fast", "scroll stutters on mid-range devices", "list takes long to first render", "memory grows as you scroll"]
  recommendation: "cheaper-items-then-flashlist"
  complexity_before: "heavy render per item × items entering the viewport"
  complexity_after: "recycled views with cheap, measured items"
  alternatives: ["flatlist-tuning-props", "pagination-load-more", "getitemlayout", "scrollview"]
---

## The situation

The feed works, but on a real device fast scrolling shows blank patches where rows
haven't rendered yet; the scroll hitches on a two-year-old Android; and opening the
screen takes a beat before anything appears. You're already using `FlatList` — isn't
that supposed to be the optimized one?

## Diagnosis: why it happens

`FlatList` *is* virtualized — it renders a window of items, not all of them (same
principle as [on the web](/playbooks/frontend-performance/case-large-lists/)). But
virtualization has a race built in: as you scroll, items entering the viewport must be
**rendered by the JS thread** before they can be drawn. Native scrolling runs on the UI
thread and *doesn't wait* (see
[Mobile fundamentals](/playbooks/mobile-native/fundamentals/)). If rendering an item
costs 50ms and a fast flick brings in 10 items per second, JS can't keep up — the
scroll shows the fallback: **blank cells**.

So blank cells and scroll jank are usually **item render cost**, multiplied by mobile
CPUs. The typical heavy item: deep view trees (nested cards), non-memoized components
re-rendering on any parent update, inline closures/objects re-created per render
defeating memoization, full-resolution images decoded for 80px thumbnails, and
per-item `onLayout`/measurement work.

## Recommendation: make items cheap, then let FlashList recycle them

**Step 1 — cheap, memoized items.** This is where most of the win lives, whatever list
component you use:

**Before** — every parent render re-renders every visible row; images oversized:
```tsx
<FlatList
  data={posts}
  renderItem={({ item }) => (
    <Post post={item} onPress={() => open(item.id)} />  // new closure every render
  )}
/>
```

**After** — memoized rows, stable callbacks, sized images:
```tsx
const PostRow = memo(function PostRow({ post, onOpen }: Props) {
  return (
    <Pressable onPress={() => onOpen(post.id)}>
      <Image source={{ uri: post.thumb }} style={{ width: 80, height: 80 }} />
      {/* thumb = server-resized 160px variant, not the 4MB original */}
      <Text numberOfLines={2}>{post.title}</Text>
    </Pressable>
  )
})

const onOpen = useCallback((id: string) => open(id), [])
<FlatList data={posts} renderItem={({ item }) => <PostRow post={item} onOpen={onOpen} />} />
```

Flatten the item's view tree while you're there — every nested `View` is a real native
view with measure/draw cost.

**Step 2 — recycle instead of re-mount: FlashList.** Shopify's drop-in replacement
reuses off-screen cells (the pattern native `UICollectionView`/`RecyclerView` always
used) instead of unmounting and re-creating them, and it wants an `estimatedItemSize`:

```tsx
import { FlashList } from '@shopify/flash-list'

<FlashList data={posts} renderItem={renderPost} estimatedItemSize={96} />
```

The honest requirement: recycled components must render correctly when *re-bound to
different data* — item-local `useState` that assumes "fresh mount per item" will leak
state between rows. Cheap items + recycling routinely takes a janky feed to 60fps on
mid-range hardware.

See the blank-cell race for yourself — flick-scroll hard:

<script src="/playbooks-demos.js"></script>

<pb-blank></pb-blank>

**When does it matter?** A 30-row settings list needs none of this. It matters for
feeds/catalogs of hundreds+ of items with images, on the devices your users actually
own. Blank-cell reports from the field are the unambiguous trigger. And measure on a
mid-range Android in release mode — dev mode's overhead makes every list look guilty.

## Discarded alternatives (and when they ARE the right call)

### Tuning FlatList props (`windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`)
- **What it solves:** trades memory vs blank-risk vs batch jank around the *existing*
  render cost — a bigger window renders further ahead, smaller batches interleave
  better.
- **Why it's not the first option here:** it repositions the problem instead of
  shrinking it: with a 50ms item, every knob setting is bad. Tune after items are
  cheap, not instead.
- **When it IS the right call:** after steps 1–2, for the last mile — e.g. raising
  `windowSize` on image-heavy feeds to pre-render further ahead, at a memory cost.

### Pagination / load-more instead of a long list
- **What it solves:** initial render time and memory — fetch and hold 20 items, not
  2,000.
- **Why it's not the first option here:** it bounds *how much data* is loaded, not
  *how expensive each row is* — scroll jank and blank cells survive pagination intact.
  You should fetch incrementally anyway (`onEndReached`); it's just not the fix for
  this symptom.
- **When it IS the right call:** always, as the data-fetching strategy, paired with
  keyset pagination on the backend
  ([Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)).

### `getItemLayout` (skip measurement for fixed-height rows)
- **What it solves:** for fixed-size rows, FlatList skips async layout measurement —
  scroll-to-index works instantly, less layout work per batch.
- **Why it's not the first option here:** measurement is rarely the dominant cost —
  render is. It also silently breaks (misaligned scroll) the day rows stop being
  uniform.
- **When it IS the right call:** genuinely uniform rows on plain FlatList — it's a
  free, real win there (FlashList's `estimatedItemSize` plays the same role more
  forgivingly).

### Giving up on virtualization (`ScrollView` with all items)
- **What it solves:** no blank cells ever — everything is always rendered; simplest
  mental model.
- **Why it's not the first option here:** mount cost and memory scale with the whole
  list; a 2,000-item ScrollView takes seconds to appear and can OOM-crash on Android.
  It trades a scroll artifact for a startup problem.
- **When it IS the right call:** short, bounded lists (< ~50 light items) — settings
  screens, small pickers — where a list component's machinery is pure overhead.

## How to measure before and after

- **Perf monitor** (dev menu): JS FPS while flick-scrolling. Dropping to single digits
  = JS-bound item rendering — this case. UI FPS dropping too = something rarer (deep
  native view trees, shadows/blur overdraw).
- **React DevTools Profiler:** how many `PostRow` renders per scroll gesture and their
  duration. Post-memoization, rows should render only when *entering* the window,
  in single-digit ms.
- **The honest device test:** release build, mid-range Android, flick hard. Blank
  cells before vs after is the user-visible metric everything else approximates.
- FlashList ships [built-in performance hooks](https://shopify.github.io/flash-list/docs/metrics)
  (`onBlankArea` and friends) — the blank-cell rate as an actual number.

## Signals you need something else

- The list is fine but *getting the data* is slow →
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).
- Scrolling is smooth but animations around the list stutter →
  [Animations stutter on mobile](/playbooks/mobile-native/case-janky-animations/).
- Items are cheap, list is tuned, and scroll still hitches → profile what *else* is on
  the JS thread per frame (subscriptions firing per scroll event, analytics) →
  [Mobile fundamentals](/playbooks/mobile-native/fundamentals/).
- The same product's web list has the same problem →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).

## Related resources

- [Mobile fundamentals: threads and the bridge](/playbooks/mobile-native/fundamentals/)
- React Native — [Optimizing FlatList configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration): every knob and its trade-off, officially
- [FlashList docs](https://shopify.github.io/flash-list/): recycling, `estimatedItemSize`, and the state-reuse gotchas
