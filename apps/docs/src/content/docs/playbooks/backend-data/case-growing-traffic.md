---
title: "Traffic is growing and things are getting slow"
description: "Before buying servers: find the actual bottleneck. Vertical vs horizontal scaling, why stateless matters, rate limiting — and the order in which to spend effort."
sidebar:
  label: "Traffic is growing"
playbook:
  area: "backend-data"
  situation: "Load is increasing and latency/error rates are creeping up; you're unsure what to scale first"
  symptoms: ["p95 latency rises at peak hours", "sporadic 5xx under load", "DB CPU near 100%", "one instance and afraid to touch it"]
  recommendation: "measure-fix-waste-then-scale-deliberately"
  complexity_before: "unknown bottleneck, scaling by guesswork"
  complexity_after: "known bottleneck; capacity added where it's actually needed"
  alternatives: ["vertical-scaling", "horizontal-scaling", "read-replicas", "microservices"]
---

## The situation

The app was fine at 100 users. Now, at peak hours, pages take longer, a few requests
error out, and the database CPU graph is flirting with 100%. Growth is good news — but
you're one traffic spike away from an outage, and everyone has a different opinion
about what to buy: a bigger server? More servers? Kubernetes? Microservices?

## Diagnosis: why it happens

A system under load degrades at its **narrowest point** — one resource saturates while
everything else idles. Scaling anything *other* than that resource does nothing. So the
first move is never to scale; it's to identify the bottleneck:

- **DB CPU high, app CPU low** (the most common): usually inefficient queries burning
  cycles — which is *waste*, not capacity. A missing index consumes hardware like real
  load does.
- **App CPU high, DB relaxed:** compute in your handlers (rendering, serialization,
  crypto, inline heavy work).
- **Both low but latency climbs:** contention — connection pool exhausted, event loop
  blocked ([Runtime fundamentals](/playbooks/runtime/fundamentals/)), or an external
  API slowing everyone down.
- **Traffic isn't even legitimate:** one buggy client retrying in a loop, or a scraper,
  can be half your load.

The cheapest capacity is the load you stop wasting: fixing an N+1 endpoint or caching a
hot read often buys 5–10× headroom for the cost of a code review — an order of
magnitude cheaper than any scaling.

## Recommendation: fix waste first, then scale deliberately

**Step 1 — eliminate waste (usually 1 week, usually enough for a while):**
top queries by total time via `pg_stat_statements` → fix N+1s and add indexes
([Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)) → cache the
hottest reads ([You read the same data constantly](/playbooks/backend-data/case-repeated-reads/))
→ move heavy inline work to jobs ([Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/)).

**Step 2 — rate limiting** (before more capacity, not after): protects against the
buggy client and makes load *bounded* so capacity planning means something.

```ts
// per-client token bucket at the edge or app entry
import { RateLimiterRedis } from 'rate-limiter-flexible'
const limiter = new RateLimiterRedis({ storeClient: redis, points: 100, duration: 60 })

app.use(async (req, res, next) => {
  try { await limiter.consume(req.ip); next() }
  catch { res.status(429).set('Retry-After', '30').end() }
})
```

**Step 3 — scale what's actually saturated:**
- **App tier:** make it **stateless** (sessions in Redis/JWT, uploads in object
  storage, no local files or in-memory session state), then run N instances behind a
  load balancer. Stateless is the property that makes horizontal scaling *possible* —
  it's the real work; adding instances afterwards is configuration.
- **DB tier:** vertical first (bigger instance — RAM keeps the working set cached),
  then read replicas when efficient reads still saturate the primary. Sharded/
  distributed writes are far, far later — most businesses never get there.

**When does it matter?** Honest thresholds: a single modern box handles hundreds of
requests/sec for a typical CRUD app *with efficient queries* — don't architect for
Google's load at 10 req/s. Act when p95 degrades at peak, when any resource sits above
~70–80% sustained, or before a known traffic event. Not because the instance count
feels unimpressive.

## Discarded alternatives (and when they ARE the right call)

### Vertical scaling as the whole strategy ("just upgrade the instance")
- **What it solves:** instant capacity, zero code changes, no distributed-systems
  problems. Genuinely underrated.
- **Why it's not the first option here:** scaling *waste* rents hardware to run bad
  queries; and a single box is still a single point of failure with a hard ceiling.
- **When it IS the right call:** the DB (vertical is *the* first move for databases),
  and as a stopgap during incidents. Cheap up to the point where instance prices go
  exponential.

### Horizontal scaling immediately ("just add instances")
- **What it solves:** near-unbounded app-tier capacity plus redundancy — the load
  balancer routes around dead instances.
- **Why it's not the first option here:** if the *DB* is the bottleneck (it usually
  is), more app instances add load to the saturated tier and make things worse. And it
  requires statelessness first.
- **When it IS the right call:** the app tier is genuinely CPU/memory-bound with an
  efficient DB behind it, or you need redundancy. This is the standard end-state —
  after steps 1–2.

### Read replicas
- **What it solves:** read-heavy load spread across DB copies; the primary keeps
  writes.
- **Why it's not the first option here:** replication lag becomes an application
  concern (read-your-own-writes: a user saves, reloads from a replica, sees old data);
  inefficient queries just saturate N boxes instead of one.
- **When it IS the right call:** queries efficient, workload read-dominated
  (10:1+), primary genuinely at its vertical ceiling. Route only lag-tolerant reads to
  replicas.

### Microservices ("we need to break up the monolith to scale")
- **What it solves:** *organizational* scaling — independent deploys and ownership for
  many teams — plus independent scaling of truly divergent workloads.
- **Why it's not the first option here:** it multiplies operational surface (network
  calls, distributed failures, tracing, N deploy pipelines) and solves a problem you
  don't have at one-team scale. A monolith on N identical instances scales horizontally
  just fine.
- **When it IS the right call:** team count, not request count — multiple teams
  blocking each other's deploys, or one component with wildly different resource needs
  (the ML inference service). Extract that one thing; don't shatter the app.

## How to measure before and after

- **The three golden numbers, per endpoint:** p95 latency, error rate, throughput
  (req/s). Watch them at peak vs off-peak — degradation-at-peak is the bottleneck's
  signature.
- **Resource saturation:** CPU, RAM, connections on app *and* DB tiers separately —
  the whole diagnosis lives in which one saturates first
  (`pg_stat_activity` for connections, any APM for the rest).
- **Load-test before the traffic arrives:** k6/autocannon against staging at 2–5×
  current peak. Finding your ceiling on a Tuesday afternoon beats finding it on launch
  day.
- After each change, re-run the same measurement. If p95 didn't move, the bottleneck
  wasn't where you thought — measure again, don't stack more fixes.

## Signals you need something else

- One endpoint dominates the slowness at any load →
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).
- Load is dominated by repeated identical reads →
  [You read the same data constantly](/playbooks/backend-data/case-repeated-reads/).
- Spikes come from heavy work inside requests →
  [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/).
- Node instances at low CPU but unresponsive → event loop blocked, not capacity →
  [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/).

## Related resources

- [Backend & Data fundamentals](/playbooks/backend-data/fundamentals/)
- Postgres — [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html): find where DB time actually goes
- [The Twelve-Factor App — Processes](https://12factor.net/processes): the canonical statement of why stateless processes scale
- [k6](https://k6.io/docs/): load testing you can run before production does it for you
