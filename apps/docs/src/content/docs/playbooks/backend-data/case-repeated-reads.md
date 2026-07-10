---
title: "You read the same data a thousand times"
description: "The same query, the same config, the same profile — recomputed on every request. Cache layers from in-process memory to Redis to CDN, and the staleness price of each."
sidebar:
  label: "Same data read constantly"
playbook:
  area: "backend-data"
  situation: "Data that rarely changes is fetched or recomputed on every single request"
  symptoms: ["DB busy with identical queries", "hot endpoints dominated by the same SELECTs", "config/catalog fetched per request", "third-party API rate limits from repeated identical calls"]
  recommendation: "cache-at-the-cheapest-sufficient-layer"
  complexity_before: "every read hits the source: n identical queries"
  complexity_after: "reads hit a cache; the source sees ~1 query per TTL window"
  alternatives: ["in-process-memory", "redis", "http-cdn-cache", "materialized-view", "no-cache"]
---

## The situation

Your metrics show the database spending most of its time on the *same handful of
queries*: the product catalog, the current user's profile, feature flags, that
"categories" table that changes twice a year. Every request pays for data that hasn't
changed since the last thousand requests paid for it.

## Diagnosis: why it happens

Nothing is broken — it's the default. Every request is stateless and independently
fetches what it needs, so read cost scales with *traffic*, not with how often the data
*changes*. When reads/change ratios hit thousands-to-one, you're doing thousands of
redundant reads.

The fix is a cache, and the design space is really three questions:

1. **Where does the copy live?** In-process memory (fastest, per-instance), a shared
   store like Redis (fast, shared, extra hop), or HTTP/CDN (before your server entirely).
2. **How stale can it be?** The honest question. Feature flags: minutes is fine. A
   product price at checkout: maybe nothing is fine.
3. **How does it update?** TTL (expire and re-fetch — simple, bounded staleness) vs
   explicit invalidation (precise, and famously easy to get wrong).

There's a reason for the joke about cache invalidation being one of the two hard
problems: every cache is a copy, and copies drift. Buy staleness consciously.

## Recommendation: cache at the cheapest layer that satisfies your staleness budget

Start in-process with a TTL — it's ~15 lines and no infrastructure:

**Before** — every request hits the DB:
```ts
app.get('/api/catalog', async (req, res) => {
  res.json(await db.query('SELECT * FROM categories ORDER BY name'))
})
```

**After** — the DB sees one query per minute, total:
```ts
const cache = new Map<string, { value: unknown; expires: number }>()

async function cached<T>(key: string, ttlMs: number, fetch: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T
  const value = await fetch()
  cache.set(key, { value, expires: Date.now() + ttlMs })
  return value
}

app.get('/api/catalog', async (req, res) => {
  res.json(await cached('catalog', 60_000, () =>
    db.query('SELECT * FROM categories ORDER BY name')))
})
```

Watch the same 12 requests hit each version:

<script src="/playbooks-demos.js"></script>

<pb-cache></pb-cache>

Reads drop from `traffic × query` to `instances × (1 per TTL)`. Rules that keep this
honest:

- **Pick TTL from the product, not the tech:** "how stale can a category list be before
  someone notices?" — usually minutes, not milliseconds.
- **Cache only hot, shared, slow-changing reads.** Per-user data in a shared cache is
  where leaks come from — key by user id *explicitly* or don't cache it.
- **Escalate layers only when forced:** multiple instances that must agree, or cache
  data too big for process memory → Redis. Anonymous, public responses → HTTP/CDN.

**When does it matter?** Don't cache below ~100 identical reads/min against a query
that's already <5ms — you'll add a staleness bug surface to save nothing. It matters
when: the DB is measurably busy with duplicate reads, you're rate-limited by a
third-party API you call redundantly, or a hot endpoint's latency is dominated by a
recomputation that rarely changes.

## Discarded alternatives (and when they ARE the right call)

### Redis (shared cache) as the first move
- **What it solves:** all instances share one cache (one miss total, coherent
  invalidation), survives deploys, holds more than process memory.
- **Why it's not the first option here:** a network hop (~0.5–1ms vs ~0.001ms
  in-process), a service to run and monitor, serialization for every value. Most apps
  reach for it before exhausting the 15-line version.
- **When it IS the right call:** many instances where per-instance misses hurt (N
  instances = N misses per TTL), cache entries you must invalidate *now* everywhere, or
  sessions/rate-limit counters — shared state, not just cache.

### HTTP caching / CDN (`Cache-Control`, edge cache)
- **What it solves:** requests stop reaching your server at all — infinite read scaling
  for public content, free with your existing CDN.
- **Why it's not the first option here:** only fits *public, anonymous* responses;
  per-user data behind auth mostly can't use shared HTTP caches. Invalidation is
  TTL-or-purge, coarser than app-level.
- **When it IS the right call:** public catalogs, blog/docs pages, images and assets —
  anything identical for every visitor. Do this *in addition to* app caching.

### Materialized view / precomputed table
- **What it solves:** an *expensive aggregation* (the dashboard query joining five
  tables) computed once per refresh instead of per read — caching inside the DB, where
  consistency is easier to reason about.
- **Why it's not the first option here:** it fixes "query too expensive", not "query
  too frequent". A cheap query run a million times needs a cache, not a view.
- **When it IS the right call:** heavy analytics reads (rankings, aggregates) tolerant
  of refresh-interval staleness — often *combined* with a cache in front.

### Not caching (fix the query instead)
- **What it solves:** zero staleness, zero invalidation bugs, one source of truth.
- **Why it's not the first option here:** the case assumes reads vastly outnumber
  changes — at some ratio, even a 2ms query × 10k/min is pure waste.
- **When it IS the right call:** the query is slow rather than frequent → index it
  first ([Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)). Data
  where staleness is unacceptable (balances, stock at checkout). Low traffic. Caching
  before measuring is optimizing without measuring.

## How to measure before and after

- **Find the redundancy:** `pg_stat_statements` ordered by `calls` (not just
  `total_exec_time`) — the top rows by call count with near-identical results are your
  candidates.
- **Hit rate after:** count hits vs misses in `cached()` (one counter each). A cache
  below ~80% hits on a hot path is usually mis-keyed or mis-TTL'd.
- **The endpoint number:** p50/p95 latency before/after, and DB QPS before/after — the
  drop in identical queries is the direct evidence.

## Signals you need something else

- Cache-miss requests are still slow → the underlying query needs fixing first
  ([Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)).
- You're caching to survive load spikes on *writes* or uncacheable traffic →
  [Traffic is growing](/playbooks/backend-data/case-growing-traffic/).
- The recomputation is heavy CPU (report generation) rather than a read →
  [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/).
- Invalidation logic is spreading through the codebase → shrink what you cache; a
  smaller cache with obvious invalidation beats a big one with clever invalidation.

## Related resources

- [Backend & Data fundamentals: indexes and query plans](/playbooks/backend-data/fundamentals/)
- MDN — [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching): `Cache-Control`, freshness, and shared vs private caches
- Postgres — [Materialized views](https://www.postgresql.org/docs/current/rules-materializedviews.html)
- Redis — [Client-side caching](https://redis.io/docs/latest/develop/reference/client-side-caching/): the two-layer (in-process + Redis) pattern, from Redis themselves
