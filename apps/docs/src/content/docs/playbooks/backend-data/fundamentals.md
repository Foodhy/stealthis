---
title: "How the Database Executes Your Query — Fundamentals"
description: "What actually happens between your SQL and the rows coming back: sequential scans vs B-tree indexes, query plans, and how to read EXPLAIN. Base for the backend & data cases."
sidebar:
  label: "Fundamentals"
  order: 0
playbook:
  area: "backend-data"
  type: "fundamentals"
  covers: ["query-execution", "btree-indexes", "query-plans", "explain-analyze", "n-plus-one"]
---

## What it is and why it affects you

When you run `SELECT * FROM orders WHERE user_id = 42`, the database has exactly two
fundamental ways to find those rows:

1. **Sequential scan** — read the whole table, keep matching rows. Cost: **O(n)** in
   rows, and worse, O(n) in *disk pages read*.
2. **Index scan** — walk a **B-tree** (a sorted tree structure maintained alongside the
   table) down to the matching entries, then fetch just those rows. Cost:
   **O(log n + k)** for k matches.

With 10M orders, that's the difference between reading ~10M rows and reading ~3–4 tree
levels plus your handful of rows: hundreds of ms (or seconds) vs sub-millisecond. Every
"my endpoint got slow as the table grew" story is some version of this table.

The database chooses between these with a **query planner**: it estimates costs using
statistics about your data and picks the cheapest plan. Your job is rarely to outsmart
it — it's to (a) give it the indexes it needs, and (b) check what it actually chose
with `EXPLAIN`.

## The mental model

A B-tree index is a sorted, balanced tree over the values of one or more columns:

```
                        [ 500 | 2000 ]
                       /       |       \
              [100|300]   [800|1500]   [3000|5000]
              /   |   \    …                 …
        leaf pages: sorted values → pointers to table rows
```

- **Lookup** (`WHERE user_id = 42`): walk root → leaf. ~3–4 page reads even at millions
  of rows — that's O(log n) with a huge branching factor.
- **Range** (`WHERE created_at > '2026-01-01'`): find the start leaf, then read leaves
  left-to-right — the leaves are linked and sorted.
- **Order** (`ORDER BY created_at DESC LIMIT 10`): the index is *already sorted* — read
  the last 10 entries, done. No sort at all.

What indexes cost: every `INSERT`/`UPDATE` also updates each index (write
amplification), and each index takes disk/cache space. That's why you index the columns
your queries filter/join/sort by — not everything.

Watch both access paths hunt the same row:

<script src="/playbooks-demos.js"></script>

<pb-btree></pb-btree>

Two multiplication traps sit on top of this model:

- **N+1 queries:** one query for the list, then one query *per row* for its relations.
  100 rows = 101 round trips. Each may be fast; the sum (and the latency per round
  trip) is your slow endpoint.
- **OFFSET pagination:** `OFFSET 100000 LIMIT 20` *walks and discards* 100,000 rows
  first — O(offset) per page. Keyset pagination (`WHERE id > $last LIMIT 20`) uses the
  index and stays O(log n) on any page.

## Reference table

**Access methods (Postgres names; every serious DB has equivalents):**

| Plan node | What it does | Cost shape | You want it when |
| --- | --- | --- | --- |
| Seq Scan | reads the whole table | O(n) | small tables, or queries matching most rows |
| Index Scan | B-tree walk → fetch rows | O(log n + k) | selective filters, sorts, joins |
| Index Only Scan | answer entirely from the index | O(log n + k), no table visits | the index covers all selected columns |
| Bitmap Index Scan | index → bitmap of pages → bulk fetch | between the two | medium-selectivity filters |
| Nested Loop / Hash Join / Merge Join | join strategies | n·m / n+m / sorted merge | the planner picks — verify with EXPLAIN |

**What a B-tree index can accelerate:**

| Query shape | Index helps? |
| --- | --- |
| `WHERE col = x`, `IN`, range (`<`, `>`, `BETWEEN`) | Yes |
| `WHERE col LIKE 'abc%'` | Yes (prefix) |
| `WHERE col LIKE '%abc'` / `ILIKE '%abc%'` | No — needs trigram/full-text index |
| `WHERE fn(col) = x` | No — unless you index `fn(col)` (expression index) |
| `ORDER BY col LIMIT k` | Yes — reads k entries, no sort |
| Composite `(a, b)`: filter on `a` or `a AND b` | Yes; filter on `b` alone: no (column order matters) |

## How this connects to the cases

- [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/) — "one request
  takes seconds" → N+1s, missing indexes, OFFSET, over-fetching
- [You read the same data constantly](/playbooks/backend-data/case-repeated-reads/) —
  "the same query runs thousands of times" → cache layers and their staleness trade-offs
- [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/) — "reports/emails
  /exports make requests time out" → background jobs and queues
- [Traffic is growing](/playbooks/backend-data/case-growing-traffic/) — "what do I scale,
  and in which order" → measure first, then vertical vs horizontal

## Primary sources

- [Postgres docs — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) — how to read query plans, from the source.
- [Postgres docs — Indexes](https://www.postgresql.org/docs/current/indexes.html) — index types, composite indexes, expression indexes, partial indexes.
- [Use The Index, Luke](https://use-the-index-luke.com/) — Markus Winand's free book on B-tree indexing across databases; the best deep treatment of why column order and expressions matter.
- [Postgres docs — Row Estimation](https://www.postgresql.org/docs/current/planner-stats.html) — how the planner's statistics drive plan choice (why `ANALYZE` matters).
