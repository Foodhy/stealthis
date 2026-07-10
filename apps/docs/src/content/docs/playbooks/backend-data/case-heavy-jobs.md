---
title: "Heavy tasks block your requests"
description: "Emails, PDFs, exports, image processing running inside the request handler make endpoints time out. Respond first, work after — from a simple async fire-off to a real job queue."
sidebar:
  label: "Heavy jobs block requests"
playbook:
  area: "backend-data"
  situation: "Requests do heavy work inline (emails, reports, media processing) and time out or block other traffic"
  symptoms: ["endpoint times out on big inputs", "signup slow because email sending is inline", "one export request degrades the whole API", "work lost when a request dies"]
  recommendation: "job-queue-respond-now-work-later"
  complexity_before: "request latency = response + heavy work"
  complexity_after: "request latency = enqueue (~ms); work runs in workers with retries"
  alternatives: ["fire-and-forget-async", "node-worker-threads", "scheduled-batch", "keep-inline"]
---

## The situation

Signup sends a welcome email, and signup takes 3 seconds. The export endpoint builds a
CSV of 200k rows, and sometimes the request times out at 30s — the user retries, now two
exports run. While a big report generates, the rest of the API gets sluggish. The work
itself succeeds… when the request survives long enough.

## Diagnosis: why it happens

The request–response cycle is being used as a work scheduler, and it's a terrible one:

- **The client waits for work it doesn't need to wait for.** The user needs "export
  started", not the export, to unblock their next click.
- **Timeouts turn long work into lost work.** HTTP timeouts (client, proxy, platform)
  are seconds; the work is minutes. A dropped connection can kill the job mid-flight
  with no retry and no record.
- **Heavy work competes with light work.** CPU-bound work inside Node blocks the event
  loop for *every* concurrent request (see
  [Runtime fundamentals](/playbooks/runtime/fundamentals/)); even I/O-heavy work hogs
  DB connections and memory that the fast endpoints need.
- **No retry semantics.** A failed email mid-request means… what? A 500 for a signup
  that actually succeeded?

The structural fix: **acknowledge now, do the work outside the request lifecycle.**

## Recommendation: a job queue

Enqueue a job (milliseconds), respond immediately, and let worker processes consume the
queue with retries, backoff, and persistence.

**Before** — the user waits for the email; a timeout loses it:
```ts
app.post('/signup', async (req, res) => {
  const user = await createUser(req.body)
  await sendWelcomeEmail(user)        // 2.5s of someone else's SMTP latency
  await generateAvatarThumbnails(user) // CPU work in the API process
  res.json({ user })
})
```

**After** — with BullMQ (Redis-backed; Sidekiq/Celery/etc. are the same shape):
```ts
// api.ts
app.post('/signup', async (req, res) => {
  const user = await createUser(req.body)
  await emailQueue.add('welcome', { userId: user.id },
    { attempts: 5, backoff: { type: 'exponential', delay: 30_000 } })
  await mediaQueue.add('avatar-thumbs', { userId: user.id })
  res.json({ user })                  // ~50ms total
})

// worker.ts — separate process; scale independently of the API
new Worker('email', async (job) => {
  await sendWelcomeEmail(await getUser(job.data.userId))
})
```

What the queue buys beyond latency: **retries with backoff** (SMTP hiccup ≠ lost
email), **persistence** (deploys and crashes don't lose accepted work), **isolation**
(heavy work can't starve the API), and **backpressure** (1,000 export requests become a
queue, not 1,000 concurrent exports). For long jobs, expose status: respond
`202 { jobId }`, offer `GET /jobs/:id`, or notify when done.

**When does it matter?** Two honest triggers: work slower than ~500ms that the response
doesn't depend on (emails, webhooks, analytics), and *any* work that can exceed ~10s
(exports, media, reports) — that one's not about UX but about surviving timeouts.
Everything under ~200ms inline: leave it alone.

## Discarded alternatives (and when they ARE the right call)

### Fire-and-forget (`sendEmail().catch(log)` without awaiting)
- **What it solves:** the latency, in one line — respond without waiting.
- **Why it's not the first option here:** the work now lives *nowhere*. Process
  restarts (deploys!) silently kill in-flight work; failures have no retry; you can't
  see the backlog. Serverless makes it worse: the runtime may freeze right after the
  response.
- **When it IS the right call:** genuinely losable work — analytics pings, cache
  warming, log shipping. Fine there; never for "must happen" work like emails or
  billing.

### `worker_threads` in the API process
- **What it solves:** CPU-bound work stops blocking the event loop — requests stay
  responsive during the computation.
- **Why it's not the first option here:** solves the *blocking*, not the *lifecycle* —
  no retries, no persistence, still dies with the request/process, still competes for
  the API box's CPU and memory.
- **When it IS the right call:** the response *needs* the result synchronously and it's
  CPU-heavy but bounded (~0.5–5s) — image resize on upload where the client waits for
  the URL → [A CPU-bound task blocks everything](/playbooks/runtime/case-blocking-cpu/).

### Scheduled batch (cron)
- **What it solves:** work that doesn't belong to any request at all — nightly digests,
  cleanup, reconciliation. Dead simple to operate.
- **Why it's not the first option here:** latency = the schedule interval. "Your export
  will begin within the hour" is rarely the UX you meant.
- **When it IS the right call:** periodic work by nature, or aggregations over many
  users where batching beats per-event processing. Often *pairs* with a queue: cron
  enqueues, workers process.

### Keeping it inline (and raising the timeout)
- **What it solves:** no new infrastructure; strict synchronous semantics — when the
  response arrives, the work *is* done.
- **Why it's not the first option here:** raising timeouts is raising how long a user
  stares at a spinner and how much work a dropped connection destroys. It scales
  exactly until the work grows again.
- **When it IS the right call:** the client genuinely can't proceed without the result
  and the work is bounded ~1–3s (payment authorization at checkout). Make the endpoint
  fast instead → [Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/).

## How to measure before and after

- **Endpoint latency:** p95 of the enqueueing endpoint before/after — 3,000ms → ~50ms
  is the expected shape.
- **Reliability:** count work lost during a deploy before (emails that never sent) vs
  after (jobs that waited in Redis). This is the metric that justifies the queue to
  non-engineers.
- **Queue health after:** every queue needs three numbers watched — depth (growing
  forever = workers can't keep up), job failure rate, and job age (oldest waiting job).
  BullMQ exposes all three; dashboard them from day one.

## Signals you need something else

- The queue depth grows without bound → you need more workers or faster jobs — scale
  workers horizontally ([Traffic is growing](/playbooks/backend-data/case-growing-traffic/)).
- Jobs are heavy *queries*, not heavy compute → fix the query first
  ([Your endpoint is slow](/playbooks/backend-data/case-slow-endpoint/)).
- The "job" is really the same expensive read repeated → cache it
  ([You read the same data constantly](/playbooks/backend-data/case-repeated-reads/)).
- Results must reach the browser when ready → add a notification channel (polling the
  job status endpoint is fine; WebSockets/SSE when polling gets heavy).

## Related resources

- [Backend & Data fundamentals](/playbooks/backend-data/fundamentals/)
- [Runtime fundamentals: the event loop](/playbooks/runtime/fundamentals/) — why inline CPU work stalls every request in the process
- [BullMQ docs](https://docs.bullmq.io/): the standard Redis-backed queue for Node
- MDN — [HTTP 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202): the status code that means "enqueued, not done"
