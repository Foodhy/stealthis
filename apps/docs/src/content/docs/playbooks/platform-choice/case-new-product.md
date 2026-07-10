---
title: "Web, PWA, hybrid or native for your new product?"
description: "A decision tree driven by constraints — device APIs, discovery, team, iteration speed — not by technology preferences. With the situations where each discarded option wins."
sidebar:
  label: "Web, PWA, hybrid or native?"
playbook:
  area: "platform-choice"
  situation: "Starting a product and deciding where it should live: browser, installable web, cross-platform app, or per-platform native"
  symptoms: ["team split between 'we need an app' and 'just ship a website'", "budget for one platform, pressure for three", "unsure if app-store presence is required", "afraid of choosing wrong and rewriting"]
  recommendation: "web-first-unless-a-hard-constraint-forces-otherwise"
  complexity_before: "n/a"
  complexity_after: "n/a"
  alternatives: ["pwa", "hybrid-rn-flutter", "native", "web-plus-native-later"]
---

## The situation

You're starting a product. Someone on the team says "users expect an app"; someone else
says "we can't afford three codebases". You have a small team, a budget measured in
months, and a product hypothesis that is — statistically speaking — going to change.
The decision feels enormous because reversing it later means a rewrite.

## Diagnosis: why it happens

The decision gets hard when it's framed as *which technology is best* — that question
has no answer, so debates run on vibes ("native feels premium", "the web is dying",
neither is data). Framed as *which constraints do we actually have*, most of the debate
evaporates, because the eliminating questions
(see [Platform fundamentals](/playbooks/platform-choice/fundamentals/)) have factual
answers for your product:

1. Does it need device capabilities the web can't reach?
2. Is discovery by search/links or by app store?
3. What does the team already know?
4. How fast do you need to iterate while finding product-market fit?
5. Is offline a *hard* requirement (not a nice-to-have)?

One more that gets missed: **you're choosing for the validation phase, not forever.**
The platform for testing a hypothesis with 500 users and the platform for serving a
proven product to 500k can be different — and the second decision will be made with
real usage data instead of guesses.

## Recommendation: web first, unless a hard constraint forces otherwise

Walk the tree top-down; the first hard constraint you hit decides. "Hard" means the
product is pointless without it — be strict, most constraints are soft when pressed.

```
Does the core product require device APIs the web can't reach
(background location, BLE/HealthKit, widgets, watch)?
├─ YES → does one codebase have to cover both platforms with a web-skilled team?
│        ├─ YES → HYBRID (React Native / Flutter)
│        └─ NO (deep platform work, native team available) → NATIVE
└─ NO → is discovery primarily search/links, or is iteration speed critical (pre-PMF)?
         ├─ YES (almost every B2B/SaaS/content/commerce product) → WEB
         │      └─ users return daily / want home-screen presence / offline-light?
         │             → add PWA on top (same codebase, +install/offline/push)
         └─ Store presence is itself a business requirement (credibility in your
            market, consumer expectations) → HYBRID now, or WEB + wrap later
```

Why web is the default and not just a preference: one codebase, deploys in minutes with
no review gate, URLs make every marketing channel work, and every user on every device
is reachable today. While the product is still changing weekly, those properties
compound; store review cycles and version stragglers tax exactly the thing you need
most — iteration.

The PWA step is cheap insurance: a manifest + service worker turns the same web app
into something installable with offline caching and push — read the
[iOS caveats](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) first
(install flow is manual, some APIs limited) so you promise the right things.

**When does it matter?** If you're pre-product-market-fit, the cost of choosing "too
web" is a later migration with real data in hand; the cost of choosing "too native" is
burning your runway on two codebases for a hypothesis. The asymmetry is the argument.

## Discarded alternatives (and when they ARE the right call)

### PWA as the primary bet
- **What it solves:** installability, offline, push — app-like presence from one web
  codebase with web iteration speed.
- **Why it's not the first option here:** it's an *enhancement*, not a starting
  decision — you get there by shipping web first. Betting the product on PWA-specific
  capabilities runs into iOS's limits (no store presence by default, capped storage,
  manual install flow).
- **When it IS the right call:** web products with daily-return usage (dashboards,
  tools, chat) where home-screen presence and offline tolerance measurably help →
  the tree's PWA branch. See also
  [It must work offline](/playbooks/mobile-native/case-offline-sync/) before promising
  offline.

### Hybrid (React Native / Flutter) from day one
- **What it solves:** real apps in both stores from ~one codebase, using skills a web
  team mostly has; native modules cover most device APIs.
- **Why it's not the first option here:** you inherit the store tax (review cycles,
  versions in the wild) and a mobile build/release pipeline while still iterating on
  the hypothesis — and you give up URLs/SEO as your distribution.
- **When it IS the right call:** the product is *inherently* mobile (camera-first,
  location-first, notification-driven) so a browser version makes no sense — and you
  need iOS + Android with a small team. Then hybrid is the sweet spot, and the
  [mobile-native area](/playbooks/mobile-native/fundamentals/) is your next read.

### Native (Swift + Kotlin) from day one
- **What it solves:** everything the platforms offer, day one — deepest APIs, best
  performance ceiling, platform-perfect UI.
- **Why it's not the first option here:** two codebases, two specialized skill sets,
  every feature built twice, behind store review — the maximum-cost option pointed at
  a hypothesis that will change. Most products never hit the constraints that require
  it.
- **When it IS the right call:** the product *is* the platform integration (watch
  apps, advanced camera/AR, background health/location), performance-critical
  rendering (games), or you're post-PMF with proven mobile demand and the team to
  sustain two codebases.

### Web now + native later ("decide when it hurts")
- **What it solves:** it's not really an alternative — it's the recommendation's
  honest long game. Ship web, learn, add mobile when data demands it.
- **Why it flags caution:** "later" means some rework (the web app won't share UI code
  with RN; API and business logic carry over). Budget emotionally for that instead of
  pretending the first choice was forever.
- **When it IS the right call:** almost always — this is how most successful products
  actually sequenced it.

## How to measure before and after

Platform choices are measured in weeks and users, not milliseconds:

- **Before deciding:** write the five constraint answers down as falsifiable claims
  ("60% of our users will come from search", "we need background location"). A claim
  nobody can defend with evidence is not a constraint — strike it.
- **Validating the choice:** time-to-first-release, releases shipped per month
  (iteration speed was the point), and — if you went web — mobile-browser usage share
  and add-to-home-screen rate: those numbers *are* the business case for the future
  app, or the proof you never needed one.
- **Revisit trigger:** a written condition, e.g. "if 40%+ of weekly actives are on
  mobile web and retention lags desktop by 20%+, we scope the app." A revisit date
  beats a permanent debate.

## Signals you need something else

- The product is an internal tool, not a public product → different defaults entirely
  ([An internal tool or dashboard](/playbooks/platform-choice/case-internal-tool/)).
- You chose hybrid/native and animations or lists stutter →
  [Mobile & Native fundamentals](/playbooks/mobile-native/fundamentals/).
- You chose web and mobile-web performance is the complaint →
  [Frontend performance fundamentals](/playbooks/frontend-performance/fundamentals/).
- Offline came back as a hard requirement →
  [It must work offline](/playbooks/mobile-native/case-offline-sync/).

## Related resources

- [Platform fundamentals: the decision criteria](/playbooks/platform-choice/fundamentals/)
- web.dev — [Progressive Web Apps](https://web.dev/explore/progressive-web-apps): what the web can do before you leave it
- React Native — [environment setup](https://reactnative.dev/docs/environment-setup): what the hybrid pipeline actually involves, before you commit to it
