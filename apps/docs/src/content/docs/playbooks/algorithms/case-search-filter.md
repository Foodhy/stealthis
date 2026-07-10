---
title: "You need to search or filter and it's sluggish"
description: "Substring matching, inverted indexes, backend queries, or a search engine — the diagnosis that tells you which layer your search belongs in, with thresholds."
sidebar:
  label: "Search/filter is sluggish"
playbook:
  area: "algorithms"
  situation: "A search box or filter over client-side data feels slow or the results are poor"
  symptoms: ["typing in the search box lags", "filtering takes noticeably long", "search misses obvious matches", "results feel dumb (no typo tolerance, no ranking)"]
  recommendation: "match-search-layer-to-data-size-and-quality-needs"
  complexity_before: "O(n·m) per keystroke"
  complexity_after: "O(n) precomputed + cheap per-keystroke, or delegated to DB/engine"
  alternatives: ["fuzzy-search-library", "backend-sql-query", "search-engine", "leave-as-is"]
---

## The situation

You added a search box over a list — products, contacts, documents. A simple
`.filter()` with `.includes()` worked fine with a few hundred items. Now with more data
(or richer matching needs) typing feels laggy, or users complain the search "doesn't
find things" unless they type an exact substring.

## Diagnosis: why it happens

```ts
const results = items.filter((item) =>
  item.name.toLowerCase().includes(query.toLowerCase())
)
```

Two separate problems hide in this line:

1. **Cost.** Each keystroke runs O(n) string scans, and `String.includes` is itself
   proportional to the text length — call it O(n·m) per keystroke. With 10,000 items ×
   short names that's fine (~a few ms); with 50,000 items × long descriptions, re-run on
   every keystroke, it lags. Also `toLowerCase()` on every item on every keystroke is
   repeated work you can hoist.
2. **Quality.** Exact substring match has no typo tolerance, no ranking, no multi-word
   support. No amount of optimization fixes that — it's a different algorithm.

Diagnose which one you have. Slow but good results → cost problem. Fast but bad results
→ quality problem. Both → both. (Background:
[Fundamentals: Big O in JS](/playbooks/algorithms/fundamentals/).)

## Recommendation: pick the layer by data size and quality needs

**If it's a cost problem and data is client-side (n up to ~50k short strings):**
precompute the searchable text once, and debounce the input so you're not filtering on
every keystroke.

**Before** — repeated work on every keystroke:
```ts
const results = items.filter((item) =>
  item.name.toLowerCase().includes(query.toLowerCase())
)
```

**After** — normalize once, filter cheap:
```ts
// once, when data loads
const indexed = items.map((item) => ({
  item,
  text: `${item.name} ${item.tags.join(' ')}`.toLowerCase(),
}))

// per (debounced) keystroke
const q = query.toLowerCase()
const results = indexed.filter((e) => e.text.includes(q)).map((e) => e.item)
```

Pair it with a debounced input so you filter ~4 times per second instead of on every
keystroke (see [The input lags while typing](/playbooks/frontend-performance/case-janky-input/)).

Feel it live — both boxes search the same 40,000 records on your machine:

<script src="/playbooks-demos.js"></script>

<pb-search></pb-search>

**If it's a quality problem:** you need scored, typo-tolerant matching — that's a fuzzy
search index (see alternatives below), not a faster `.filter()`.

**When does it matter?**
- **n < ~5,000 short strings:** plain `.filter` + `.includes` is microseconds-to-low-ms.
  Don't add anything.
- **n ~5,000–50,000:** precompute + debounce keeps you comfortably under a frame. A
  fuzzy library is fine here too if you need the quality.
- **n > ~50,000, or the data doesn't all live in the client:** stop searching in the
  browser. Filter in the backend/DB — that's what indexes are for.

## Discarded alternatives (and when they ARE the right call)

### A fuzzy-search library (Fuse.js, MiniSearch, FlexSearch)
- **What it solves:** typo tolerance, ranking, multi-field search — the quality problem.
  MiniSearch/FlexSearch build an inverted index (tokens → documents), so per-keystroke
  cost stops depending on scanning all documents.
- **Why it's not the first option here:** if plain substring results are *good enough*,
  a library adds a dependency, an index build step, and memory for a problem you don't
  have. Fuse.js in particular still scans all items per query (it's fuzzy, not indexed) —
  it fixes quality, not cost.
- **When it IS the right call:** user-facing search over thousands of client-side records
  where "close enough" matches and ranking matter (command palettes, product pickers).

### Filtering in the backend (SQL `WHERE` / `ILIKE` / full-text search)
- **What it solves:** the client stops holding and scanning the whole dataset; the DB
  uses indexes (or at worst scans in a process built for it). Postgres full-text search
  or trigram indexes give typo-adjacent matching without new infrastructure.
- **Why it's not the first option here:** if the data is already fully loaded in the
  client and small, a network round-trip per query is slower and adds loading states.
  It's also a backend change, not a local fix.
- **When it IS the right call:** the dataset is bigger than you'd ship to the browser,
  changes frequently, or is per-user private. If you're loading 50,000 rows to filter
  them client-side, the real problem is the endpoint →
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

### A dedicated search engine (Meilisearch, Typesense, Elasticsearch)
- **What it solves:** search as a product feature — relevance tuning, faceting, synonyms,
  typo tolerance at millions of documents scale.
- **Why it's not the first option here:** it's a service to deploy, sync, and pay for.
  Overkill until Postgres full-text search demonstrably falls short.
- **When it IS the right call:** search *is* a core feature (marketplace, docs site,
  catalog with facets), the corpus is large, and you've outgrown DB-native search.

### Leaving it as is
- **What it solves:** zero work, zero dependencies.
- **Why it's not the first option here:** the case starts from users noticing lag or bad
  results.
- **When it IS the right call:** small lists (a settings page filter over 200 rows).
  `.filter` + `.includes` is the correct engineering there.

## How to measure before and after

```ts
console.time('search')
const results = search(query)
console.timeEnd('search') // per-query cost
```

For the felt experience: DevTools → Performance → record while typing. Look for long
tasks (> 50ms) on keystrokes. If the filter itself is fast but the UI still lags, the
problem is rendering the results, not finding them →
[Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).

## Signals you need something else

- The filter is fast but rendering thousands of results is slow →
  [Your huge list renders slowly](/playbooks/frontend-performance/case-large-lists/).
- Typing itself is janky even with fast search →
  [The input lags while typing](/playbooks/frontend-performance/case-janky-input/).
- The dataset can't (or shouldn't) live in the browser →
  [Backend & Data: fundamentals](/playbooks/backend-data/fundamentals/).

## Related resources

- [Fundamentals: Big O and the cost of JS operations](/playbooks/algorithms/fundamentals/)
- MDN — [String.prototype.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes): substring matching semantics
- Postgres — [Full Text Search](https://www.postgresql.org/docs/current/textsearch.html): what the DB gives you before you reach for a search engine
