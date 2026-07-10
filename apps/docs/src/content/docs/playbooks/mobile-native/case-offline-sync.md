---
title: "Your app must work offline"
description: "Offline isn't a feature, it's an architecture: local-first reads, a queue of pending mutations, and a conflict policy you choose on purpose. Scoped honestly — most apps need offline-tolerant, not offline-first."
sidebar:
  label: "It must work offline"
playbook:
  area: "mobile-native"
  situation: "The app must remain usable without connectivity — reading data and capturing changes that sync later"
  symptoms: ["spinners and errors the moment connectivity drops", "field teams in warehouses/rural areas losing work", "changes lost when a request fails mid-flight", "PM asks 'can it work offline?' late in the project"]
  recommendation: "local-reads-plus-mutation-queue"
  complexity_before: "every screen blocks on the network"
  complexity_after: "reads from local store; writes queued and synced with a defined conflict policy"
  alternatives: ["http-cache-tolerance", "sync-engine", "crdts", "require-connectivity"]
---

## The situation

Field inspectors fill out reports in buildings without signal. Or your delivery app's
users ride through dead zones and every screen becomes a spinner. Worst case: someone
fills a long form, taps save, the request fails, and the work is *gone*. "Just make it
work offline" enters the backlog as if it were a toggle.

## Diagnosis: why it happens

The app was built **online-first**: the server is the only source of truth, every read
is a fetch, every write is a request that either lands or errors. Connectivity is
assumed; its absence is handled as an *error state* — which is exactly what users
experience.

Offline support inverts the architecture, and it decomposes into three problems of
very different difficulty:

1. **Reading offline** (easy): keep data in a local store; render from it always;
   refresh it from the network when possible.
2. **Writing offline** (medium): capture mutations locally, apply them optimistically,
   queue them, replay when back online — surviving app restarts in between.
3. **Conflicts** (hard, and *unavoidable* the moment two writers exist): the same
   record edited offline by two people syncs later — someone's change must win, merge,
   or be surfaced. There is no default that makes this go away; not choosing a policy
   just means the policy is "whoever syncs last silently destroys the other's work".

Scope honestly before building: **offline-tolerant** (survive minutes of dead zone
without losing work) is far cheaper than **offline-first** (fully functional for days).
Most apps that ask for the second need the first.

## Recommendation: local reads + a mutation queue + an explicit conflict policy

**Reads: render from the local store, always.** The network updates the store, not the
screen. The cheap version of this is a persisted query cache:

```tsx
// TanStack Query + persistence: cached reads survive restarts and dead zones
const client = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } },
})
persistQueryClient({ queryClient: client, persister: asyncStoragePersister })
```

For richer needs (querying, relations, large datasets), a real local DB — SQLite
(expo-sqlite / op-sqlite), WatermelonDB, RxDB.

**Writes: queue, apply optimistically, replay.**

**Before** — connectivity failure = lost work:
```ts
async function saveReport(report: Report) {
  await api.post('/reports', report) // throws offline; form state evaporates
}
```

**After** — the queue is the write path (not a fallback), persisted locally:
```ts
async function saveReport(report: Report) {
  await db.reports.put({ ...report, _status: 'pending' }) // local truth, UI updates now
  await outbox.add({ op: 'upsert', entity: 'report', data: report, ts: Date.now() })
  void flushOutbox() // fire-and-forget; also runs on connectivity regain & app start
}

async function flushOutbox() {
  for (const m of await outbox.oldestFirst()) {
    try {
      await api.post('/sync', m)                    // server applies + resolves conflicts
      await db.reports.markSynced(m.data.id)
      await outbox.remove(m.id)
    } catch (e) {
      if (isConflict(e)) await handleConflict(m, e.serverVersion) // policy, not accident
      else break // still offline — retry later, order preserved
    }
  }
}
```

**Conflicts: pick the policy per entity, on purpose.**
- **Last-write-wins** — acceptable for single-user data or low-stakes fields; make it
  *per-field* if updates touch different fields.
- **Server-side merge** — server applies domain rules (a completed inspection can't be
  reopened by a stale edit).
- **Surface to the user** — for high-stakes collisions: "this report changed while you
  were offline" with both versions. Costly UX; reserve it for where it's worth it.

Design sync as **idempotent** (client-generated IDs, upserts) — retries after ambiguous
failures then become harmless.

Play with the outbox — create reports offline, then reconnect:

<script src="/playbooks-demos.js"></script>

<pb-outbox></pb-outbox>

**When does it matter?** Users in genuinely disconnected contexts (field work,
travel, emerging-market networks) or any form whose loss costs real work: yes, and
from the start — retrofitting inverts the whole data layer. An office dashboard: a
persisted read cache plus request retry is plenty. Don't build a sync engine for
subway tunnels.

## Discarded alternatives (and when they ARE the right call)

### HTTP caching + retry-on-reconnect ("offline tolerance")
- **What it solves:** stale-while-offline reads and survival of brief dead zones,
  nearly for free with a persisted query cache and automatic retries.
- **Why it's not the first option here:** it doesn't capture *writes* — the lost-form
  problem, which is usually the actual complaint, stays unsolved.
- **When it IS the right call:** read-mostly apps with incidental offline (news,
  dashboards, catalogs). It's also step one of the full recommendation — start here
  and add the outbox only if writes need it.

### A sync engine / BaaS (WatermelonDB sync, PowerSync, Replicache, Firebase/Supabase offline)
- **What it solves:** the entire hard part — queueing, retries, ordering, much of
  conflict handling — as a product instead of your code.
- **Why it's not the first option here:** it constrains your backend (sync protocol,
  data model, sometimes the DB itself) and couples your offline story to a vendor.
  For one queue of one entity type, it's a lot of machinery.
- **When it IS the right call:** offline is *core* to the product across many
  entities, or you need multi-device sync anyway. Building that by hand is months —
  buy it. Evaluate against your existing backend first.

### CRDTs (conflict-free replicated data types)
- **What it solves:** mathematically guaranteed convergence without a coordinator —
  concurrent edits merge automatically. The real-deal answer for collaborative
  documents (Yjs, Automerge).
- **Why it's not the first option here:** heavy machinery for record-oriented business
  data, where "merge both edits" is often *not* the desired semantics (two inspectors
  editing one report may need review, not a merge). Library, storage format, and
  mental model all follow.
- **When it IS the right call:** collaborative editing of shared documents/canvases —
  where concurrent edits are the normal case, not the exception.

### Requiring connectivity (and saying so)
- **What it solves:** the entire complexity class — one source of truth, no sync, no
  conflicts. A good "no network" screen plus form-state preservation in memory is a
  day of work.
- **Why it's not the first option here:** the case's premise is users who *are*
  offline; a nicer error doesn't file their report.
- **When it IS the right call:** inherently online actions (payments, live data),
  office-network internal tools
  ([An internal tool or dashboard](/playbooks/platform-choice/case-internal-tool/)),
  or products whose users demonstrably always have signal. Never lose typed form
  state, though — that's table stakes either way.

## How to measure before and after

Offline correctness is tested, not profiled:

- **The airplane-mode gauntlet:** airplane mode on → browse (reads should render) →
  create/edit (should apply instantly) → **kill the app** → reopen (pending changes
  still there?) → connectivity on (queue flushes? server state correct?). Automate
  what you can; run the rest before every release.
- **The conflict drill:** two devices, same record, both offline, conflicting edits,
  reconnect both in either order. The outcome should match your written policy — if
  you can't predict it, users are already losing data quietly.
- **Production signals:** outbox depth and age (pending mutations should drain after
  reconnect), sync failure rate, and conflict frequency — if conflicts are common,
  your policy deserves more investment than you gave it.

## Signals you need something else

- Sync payloads grow huge and slow → you're syncing whole datasets instead of deltas;
  that's the point where a sync engine earns its cost.
- Multiple users routinely edit the same records live → you're drifting into
  collaboration territory → CRDTs or real-time presence, a different architecture.
- The offline data is large and list rendering degrades →
  [Long lists on mobile](/playbooks/mobile-native/case-long-lists-mobile/).
- Server-side sync endpoints get slow as the outboxes of many devices land at once →
  [Heavy jobs block requests](/playbooks/backend-data/case-heavy-jobs/) and
  [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

## Related resources

- [Mobile fundamentals: threads and the bridge](/playbooks/mobile-native/fundamentals/)
- [Platform choice: web, PWA, hybrid or native?](/playbooks/platform-choice/case-new-product/) — offline requirements feed the platform decision
- MDN — [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API): the web's offline layer, if your surface is a PWA
- [WatermelonDB — Sync](https://watermelondb.dev/docs/Sync/Intro): a documented, production-grade sync protocol worth reading even if you roll your own
- [TanStack Query — persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient): the cheap 80% for read-mostly apps
