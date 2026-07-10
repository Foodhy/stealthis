---
title: "Your endpoint takes seconds"
description: "Usually not one slow query — it's a hundred fast ones (N+1), a missing index, or OFFSET walking the table. Diagnose with logs and EXPLAIN before touching anything."
sidebar:
  label: "Endpoint takes seconds"
playbook:
  area: "backend-data"
  situation: "An API endpoint that used to be fast now takes seconds as data grew"
  symptoms: ["endpoint latency grows with data size", "timeouts under mild load", "ORM fires hundreds of queries per request", "deep pagination pages are slowest"]
  recommendation: "find-the-multiplication-then-index"
  complexity_before: "O(n) queries per request, or O(n) row scans per query"
  complexity_after: "1–2 queries using indexes: O(log n)"
  alternatives: ["caching", "read-replica", "denormalization", "bigger-server"]
---

## The situation

`GET /orders` returned in 80ms for months. The table grew to a few hundred thousand
rows and now the same endpoint takes 3–5 seconds, sometimes timing out. Nothing in the
code changed. Load isn't even high — a single request is slow all by itself.

## Diagnosis: why it happens

Endpoint latency ≈ **(number of queries × round-trip cost) + (rows each query touches)**.
Data growth blows up one of those factors. The usual suspects, in order of frequency:

**1. N+1 queries.** The ORM lazily loads relations:

```ts
const orders = await Order.findAll({ limit: 100 })       // 1 query
for (const order of orders) {
  const user = await order.getUser()                     // +100 queries
}
```

101 round trips × ~1–3ms each = hundreds of ms *before any query is even slow*. It's the
[lookup-in-a-loop](/playbooks/algorithms/case-lookup-in-loops/) bug, crossing the
network per iteration.

**2. Missing index.** `WHERE user_id = 42` on 500k rows without an index on `user_id`
is a sequential scan — the DB reads the whole table per request (see
[fundamentals](/playbooks/backend-data/fundamentals/)). Grows linearly forever.

**3. OFFSET pagination.** `OFFSET 100000 LIMIT 20` walks and discards 100k rows. Page
5000 costs 5000× page 1.

**4. Over-fetching.** `SELECT *` dragging huge JSON/blob columns, or returning 10,000
rows so the client can show 20.

Don't guess — look. Enable query logging for one request (or use your APM): the
*number* of queries diagnoses N+1 instantly; `EXPLAIN ANALYZE` on the slowest query
shows `Seq Scan` vs `Index Scan`.

## Recommendation: collapse the queries, then index what remains

**Fix the N+1** — fetch relations in bulk (every ORM has this):

**Before** — 101 queries:
```ts
const orders = await Order.findAll({ limit: 100 })
for (const order of orders) order.user = await order.getUser()
```

**After** — 1–2 queries:
```ts
const orders = await Order.findAll({
  limit: 100,
  include: [User],        // JOIN, or one WHERE id IN (…) batch query
})
```

**Index the filter/sort columns** the remaining queries actually use:
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
-- Seq Scan on orders (actual time=0.01..312.44 rows=95) ← the problem

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
-- → Index Scan using idx_orders_user_created (actual time=0.04..0.31) ← 1000× less
```

**Replace deep OFFSET with keyset pagination:**
```sql
-- before: OFFSET grows linearly
SELECT * FROM orders ORDER BY id DESC OFFSET 100000 LIMIT 20;
-- after: constant cost at any depth ("give me what comes after the last id I saw")
SELECT * FROM orders WHERE id < $lastSeenId ORDER BY id DESC LIMIT 20;
```

**When does it matter?** Tables under ~10k rows: seq scans are single-digit ms; indexes
barely show. An admin endpoint used twice a day can stay lazy. The thresholds that
demand action: latency growing *with data size* (that's a scan), query counts growing
*with response size* (that's N+1), and any endpoint on a user path over ~500ms.

## Discarded alternatives (and when they ARE the right call)

### Caching the response
- **What it solves:** repeated identical reads stop hitting the DB at all — great
  latencies for the cache-hit crowd.
- **Why it's not the first option here:** it papers over the broken query. Cache misses
  still take 3s, invalidation is now your problem, and the unfixed query will resurface
  in every uncached path.
- **When it IS the right call:** *after* the query is sane, when the same result is
  read far more often than it changes →
  [You read the same data constantly](/playbooks/backend-data/case-repeated-reads/).

### A read replica
- **What it solves:** read *volume* — many concurrent readers spread across copies.
- **Why it's not the first option here:** this endpoint is slow *alone*. A replica runs
  the same bad plan at the same speed; you'd have two servers doing seq scans.
- **When it IS the right call:** queries are already efficient and the primary is
  saturated by read concurrency →
  [Traffic is growing](/playbooks/backend-data/case-growing-traffic/).

### Denormalizing (precomputed columns/tables)
- **What it solves:** replaces expensive joins/aggregations at read time with a
  ready-made answer maintained at write time.
- **Why it's not the first option here:** it trades read cost for write complexity and
  consistency risk — machinery you don't need when an index turns the query sub-ms
  anyway.
- **When it IS the right call:** genuinely expensive aggregations over large data read
  frequently (dashboard counters, leaderboards) where indexes can't help further —
  often as a materialized view first.

### A bigger server
- **What it solves:** more RAM keeps more of the table in cache; faster disks scan
  quicker. Zero code changes.
- **Why it's not the first option here:** a seq scan is O(n) on any hardware — doubling
  the server buys one more doubling of data. You're renting time, expensively.
- **When it IS the right call:** as a stopgap during a fire, or when the working set
  genuinely outgrows RAM *after* queries are efficient
  ([Traffic is growing](/playbooks/backend-data/case-growing-traffic/)).

## How to measure before and after

1. **Endpoint latency:** `curl -w "%{time_total}" …` or your APM's p50/p95 — the number
   the user feels.
2. **Query count per request:** ORM query logging on for one request. 100+ queries for
   one list = N+1, found.
3. **Per-query:** `EXPLAIN ANALYZE <query>` — look for `Seq Scan` on big tables,
   estimated vs actual row mismatches, and the actual-time totals. In Postgres,
   `pg_stat_statements` ranks queries by total time across all traffic — start at the
   top.

Re-measure after each fix; keep the EXPLAIN output in the PR description.

## Signals you need something else

- Fast queries, but the same ones run thousands of times per minute →
  [You read the same data constantly](/playbooks/backend-data/case-repeated-reads/).
- The endpoint is slow because it does heavy work inline (PDF, email, resize) →
  [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/).
- Everything is indexed and single requests are fast, but the server melts under
  concurrency → [Traffic is growing](/playbooks/backend-data/case-growing-traffic/).
- The response is fast but huge, and the client processes it slowly →
  [Crossing two lists is slow](/playbooks/algorithms/case-lookup-in-loops/).

## Related resources

- [Backend & Data fundamentals: indexes and query plans](/playbooks/backend-data/fundamentals/)
- Postgres — [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [Use The Index, Luke — Paging](https://use-the-index-luke.com/no-offset): why keyset beats OFFSET, in depth
