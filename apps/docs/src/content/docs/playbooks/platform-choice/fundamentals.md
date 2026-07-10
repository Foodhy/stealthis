---
title: "Choosing a Platform — Fundamentals"
description: "The decision criteria that actually settle web vs PWA vs hybrid vs native — team, time, budget, native requirements, SEO, offline — and a matrix to weigh them."
sidebar:
  label: "Fundamentals"
  order: 0
playbook:
  area: "platform-choice"
  type: "fundamentals"
  covers: ["decision-criteria", "web-pwa-hybrid-native", "cost-of-each-platform", "decision-matrix"]
---

## What it is and why it affects you

"Should this be a web app or a native app?" is the most expensive question in a
project, because it's answered *first*, on the least information, and reversing it later
costs a rewrite. It's also the question most often answered for the wrong reasons:
what the team just read about, what a competitor did, or what sounds most serious in a
pitch.

The honest framing: platforms are **cost/capability trade-offs**, and the right one
falls out of your *constraints* — not out of the technology's merits in the abstract.
A choice that's correct for a 2-person startup validating an idea is wrong for a
50-person company with proven mobile demand, *for the same product*.

## The mental model

Four options on a spectrum of **reach vs capability vs cost**:

```
             ← cheaper, wider reach          deeper device integration, costlier →

   WEB ──────────── PWA ──────────── HYBRID ─────────────── NATIVE
   (site/app         (web + install,   (one JS/dart codebase   (Swift/Kotlin
    in browser)       offline cache,    compiled into real      per platform)
                      push*)            apps: RN/Flutter)
   1 codebase        1 codebase        ~1.2 codebases          2 codebases
   deploy in         deploy in         app-store review        app-store review
   seconds           seconds           days                    days
   URL = distribution              …plus stores            stores only
```

The questions that actually decide it, in the order that eliminates fastest:

1. **Do you need device capabilities the web can't reach?** Deep Bluetooth/HealthKit,
   background geolocation, widgets, watch/TV — genuinely native territory. Camera,
   basic push, GPS-in-foreground, payments: the web has them ([web.dev —
   capabilities](https://web.dev/explore/progressive-web-apps)). Most apps that "need
   native" need three features, and two are available in the browser.
2. **Do users discover you by search / links?** SEO and shareable URLs = web presence
   is non-negotiable. An app store is a *destination*, not a discovery channel.
3. **What's your team, honestly?** 3 web devs choosing native means learning two
   platforms while building the product. Hybrid exists to spend web skills on mobile.
4. **How fast must you iterate?** Web deploys in minutes with no gatekeeper. Stores
   add review cycles (days) and stragglers on old versions — a real tax while you're
   still finding product-market fit.
5. **Offline as a hard requirement?** Possible on web (service workers), first-class in
   hybrid/native → [It must work offline](/playbooks/mobile-native/case-offline-sync/).

Notice what's *not* on the list: raw performance. For typical CRUD/content apps, all
four options are fast enough that architecture, not platform, decides the feel
(see [Mobile & Native fundamentals](/playbooks/mobile-native/fundamentals/) for where
that stops being true — games, heavy media, custom rendering).

## Reference table

| Criterion | Web | PWA | Hybrid (RN/Flutter) | Native |
| --- | --- | --- | --- | --- |
| Codebases to build & maintain | 1 | 1 | ~1 (+ native edges) | 2 |
| Team skills needed | web | web (+ SW) | web/dart + mobile basics | Swift + Kotlin |
| Deploy/iterate | minutes | minutes | store review | store review |
| Discovery | URL/SEO | URL/SEO + installable | stores | stores |
| Offline | limited-to-good | good | good | best |
| Push notifications | good (iOS: install to Home Screen first) | good | full | full |
| Deep device APIs | narrow | narrow | wide via modules | everything, day one |
| Home-screen presence | no | yes | yes | yes |
| Typical relative cost of v1 | 1× | ~1.1× | ~1.5× | ~2.5× |

(Cost multipliers are order-of-magnitude honesty, not quotes — the point is the *shape*:
native's cost is a second codebase forever, not a one-time fee.)

Explore the trade-offs interactively:

<script src="/playbooks-demos.js"></script>

<pb-spectrum></pb-spectrum>

## How this connects to the cases

- [Web, PWA, hybrid or native?](/playbooks/platform-choice/case-new-product/) — "I'm
  starting a product and need to pick" — the criteria above turned into a decision tree
  with real situations
- [An internal tool or dashboard](/playbooks/platform-choice/case-internal-tool/) —
  "it's for our own team" — how known users, controlled devices, and zero marketing
  flip every default

## Primary sources

- [web.dev — Progressive Web Apps](https://web.dev/explore/progressive-web-apps) — what the web platform can actually do today (offline, install, push), from the Chrome team.
- [MDN — Progressive web apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) — vendor-neutral PWA reference, including iOS caveats.
- [React Native docs — Core concepts](https://reactnative.dev/docs/intro-react-native-components) — what hybrid actually is: real native views driven by JS, not a webview.
- [Apple — App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — the gatekeeping you sign up for with any store distribution; read 4.2 (minimum functionality) before betting on a thin app.
