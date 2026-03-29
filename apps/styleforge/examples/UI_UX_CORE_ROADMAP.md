# StyleForge Core UI/UX Improvement Roadmap

> Last updated: 2026-03-07
> Scope: `apps/styleforge/examples/*` + the current `StyleForgeStudio` experience in `apps/styleforge/src/components/StyleForgeStudio.tsx`

## Purpose

This document defines the phased plan to improve the core UI and UX of StyleForge using the four standalone example pages as the target product direction.

It does **not** define advanced functionality, backend behavior, or secondary product ideas. The immediate goal is to improve the core surfaces, make the interface more coherent, and establish a stronger bridge between the live single-screen `StyleForgeStudio` and a future multi-page product.

`apps/styleforge/examples/information.md` remains the lightweight index of example screens. This file is the operational roadmap for improving them.

## Current-State Audit

### 1) Live `StyleForgeStudio`

The current live app in `apps/styleforge/src/components/StyleForgeStudio.tsx` already has a strong foundation:

- a premium dark visual direction,
- a left admin-style sidebar,
- a workflow progress tracker,
- reference selection,
- constraint selection,
- draft review,
- jobs and generated kit output.

However, it is still a single long studio page. The flow is functional, but the information density is high, the layout is vertically stacked, and the product does not yet expose dedicated collection-focused surfaces such as overview, detail, comparison, or search/discovery.

### 2) Example pages

The four example HTML files define the intended future direction:

- `apps/styleforge/examples/CollectionOverview.html`
- `apps/styleforge/examples/CollectionDetail.html`
- `apps/styleforge/examples/ComparisonScreen.html`
- `apps/styleforge/examples/Search&Discovery.html`

They already communicate the right product ambition, but they are not yet a coherent system:

- navigation patterns differ from screen to screen,
- progress language is inconsistent,
- page headers and metadata hierarchy shift too much,
- card structures and glass panel treatments vary,
- route relationships are implied rather than clearly designed,
- some screens feel like polished concepts rather than production-ready core product surfaces.

### 3) `information.md`

`apps/styleforge/examples/information.md` currently works as a concise screen list, but it does not explain:

- how the screens relate to the live product,
- what should be improved first,
- which UI issues are core versus future scope,
- how the four pages should converge into one product system.

## Product Mapping

The future core StyleForge product should be organized around four primary surfaces:

- `Collection Overview` -> conceptual route: `/collections`
- `Collection Detail` -> conceptual route: `/collections/:id`
- `Comparison` -> conceptual route: `/compare`
- `Search & Discovery` -> conceptual route: `/search`

These are the core product surfaces for the next UI/UX pass. Non-core functionality should be deferred until these surfaces have a shared shell, clear hierarchy, and stable interaction patterns.

## Deferred For Later

The following areas are intentionally out of scope for this roadmap:

- advanced automation workflows,
- collaboration features,
- durable backend or project history systems,
- expanded job orchestration,
- secondary admin utilities,
- implementation of every future interaction shown in the mocks.

If a feature does not improve the clarity, cohesion, or usability of the four core screens, it should wait.

## Phase 1: Unify the Core Shell

### Current critique

Across the four HTML examples, the shell is not yet systemized:

- sidebars use different navigation models,
- headers vary in density and control placement,
- progress appears in different forms depending on the screen,
- spacing and panel rhythm are inconsistent,
- glass surfaces, border treatments, and glow intensity are not standardized,
- typography hierarchy changes from page to page.

The live `StyleForgeStudio` already provides a more grounded premium shell than some of the examples, so the examples should converge toward that level of discipline instead of drifting further into concept-only styling.

### Target UX direction

Define one shared StyleForge shell for all future screens:

- a stable left navigation rail or sidebar,
- a consistent top header zone,
- repeatable page title and metadata treatment,
- shared dark premium surface language,
- one clear visual grammar for borders, glow, shadow, blur, spacing, and typography.

### Core improvements

- Standardize sidebar width, icon treatment, active states, and section grouping.
- Standardize header layout, including breadcrumbs, page title, contextual metadata, and primary actions.
- Normalize spacing scale, panel padding, card corner radius, and border opacity.
- Reduce decorative variation that makes screens feel disconnected.
- Reuse the strongest visual cues from the live `StyleForgeStudio` stepper and shell instead of inventing a new shell per page.

### Closure criterion

All four example pages can be described as belonging to the same product without explanation, and the shell no longer changes its structure or visual language from screen to screen.

## Phase 2: Clarify Information Architecture

### Current critique

The example set implies a multi-page product, but the navigation logic is still weak:

- it is not always obvious how a user moves from overview to detail,
- comparison feels adjacent but not clearly connected,
- search feels powerful but not fully integrated into the collection workflow,
- page titles, breadcrumbs, and section labels do not yet create a reliable mental model.

### Target UX direction

Make the relationship between screens obvious and predictable:

- overview is the browsing and entry surface,
- detail is the inspection and organization surface,
- comparison is the evaluation surface,
- search is the discovery and retrieval surface.

### Core improvements

- Standardize breadcrumb patterns across all core screens.
- Use page titles that describe the user task, not just the visual concept.
- Define one placement pattern for primary actions, secondary actions, and filters.
- Clarify when users are browsing collections versus inspecting components inside a collection.
- Keep the roadmap centered on primary journeys instead of future add-ons.

### Closure criterion

A first-time user can understand how the four core screens relate to one another and can predict where to go next without relying on extra explanation.

## Phase 3: Improve Each Core Screen

### `Collection Overview`

#### Current critique

`CollectionOverview.html` has a strong premium card grid, but card hierarchy is still too visual-first:

- collection status is weak,
- metadata is secondary and easy to miss,
- scanning collections at speed is harder than it should be,
- the page does not yet clearly distinguish collection health, ownership, type, and item density.

#### Target UX direction

Make overview a fast scanning and selection surface for collections.

#### Core improvements

- Strengthen title, summary, item count, and status hierarchy.
- Make ownership, freshness, and type easier to read.
- Create a clearer difference between primary collection cards and secondary metadata.
- Improve filtering, sorting, and quick comparison entry points.

### `Collection Detail`

#### Current critique

`CollectionDetail.html` has the right core idea, but the hierarchy between collection metadata, preview, `Base Components`, and `Page Components` is still uneven:

- the large preview competes with supporting content,
- expand/collapse behavior is implied more than designed,
- some areas feel like isolated panels rather than part of one collection narrative.

#### Target UX direction

Make detail the canonical screen for understanding one collection as a system.

#### Core improvements

- Establish a stronger relationship between collection metadata and the hero preview.
- Define a clearer hierarchy between `Base Components` and `Page Components`.
- Make expand/collapse states explicit and repeatable.
- Improve panel grouping so the page reads as one system rather than multiple unrelated widgets.

### `Comparison`

#### Current critique

`ComparisonScreen.html` already frames a useful side-by-side workflow, but it still needs stronger usability:

- repeated information can become visually noisy,
- the difference between sticky labels and compared values needs refinement,
- collapsible groups are implied but not yet systemized,
- emphasis of differences versus shared values can be stronger.

#### Target UX direction

Make comparison a precise evaluation tool rather than only a visual showcase.

#### Core improvements

- Improve row rhythm and alignment across compared columns.
- Make collapsible token/component groups clearer.
- Strengthen sticky labels and comparison anchors.
- Use contrast and emphasis more carefully so differences stand out without clutter.

### `Search & Discovery`

#### Current critique

`Search&Discovery.html` looks rich and promising, but result semantics need work:

- it is not always obvious whether a result is a collection or an individual component,
- breadcrumb relationships are present but not yet fully reliable,
- filter chips are expressive but not yet clearly structured as a system,
- the search page risks becoming visually impressive before it becomes operationally clear.

#### Target UX direction

Make search a high-clarity discovery surface that supports both collection retrieval and component retrieval.

#### Core improvements

- Differentiate collection results from component results immediately.
- Strengthen breadcrumb and parent-child relationships.
- Clarify filter groupings and active filter state.
- Ensure result cards support fast scanning, not just visual appeal.

### Closure criterion

Each of the four screens has a clear role, a stronger task-driven hierarchy, and visible improvements in clarity, scanning speed, and relationship design.

## Phase 4: Standardize Elements and UX States

### Current critique

The examples include many strong visual elements, but they are not yet a reusable interface system. Several components solve the same problem in slightly different ways.

### Target UX direction

Define a shared layer of reusable UI elements and core states that all four pages can rely on.

### Core improvements

- Standardize cards, chips, badges, filter controls, preview panels, compare rows, section toggles, and search results.
- Define consistent states for:
  - default,
  - hover,
  - active,
  - selected,
  - collapsed,
  - loading,
  - empty,
  - no-results,
  - error-lite placeholders.
- Set accessibility expectations for:
  - contrast,
  - focus visibility,
  - keyboard flow,
  - readable density,
  - reduced decorative noise.

### Closure criterion

The core screens share a common UI vocabulary, and each repeated pattern behaves and looks consistent enough to be treated as part of one design system.

## Phase 5: Converge the Mocks Toward the Real Product

### Current critique

Today there is a gap between the shipped `StyleForgeStudio` and the example pages:

- the live product is single-screen and workflow-oriented,
- the examples are multi-page and collection-oriented,
- the bridge between these two product shapes is not yet documented.

### Target UX direction

Use the examples as the future target while keeping the implementation sequence grounded in the current product.

### Core improvements

- Map the live studio shell, stepper, and generator language into the multi-page future structure.
- Preserve the best parts of the current product: premium dark shell, clear workflow steps, reference-driven logic.
- Implement the visual and structural convergence in a minimal order:
  - shared shell first,
  - collection overview and detail second,
  - comparison and search third.
- Defer richer functionality until the core UI/UX foundation is stable.

### Closure criterion

There is a documented and credible path from the current single-screen `StyleForgeStudio` to the future multi-page product, with the shell and core screens prioritized before advanced behavior.

## Shared Interface Layer To Make Explicit

The examples should be treated as one shared design system for future implementation. The following layers should be explicitly aligned across screens:

- navigation shell,
- page headers,
- progress language,
- card system,
- filters and search controls,
- preview areas,
- collection-to-component relationship patterns.

## Validation Checklist

The roadmap is complete only if it satisfies all of the following:

- Names all five phases in order.
- Gives a closure criterion for every phase.
- Explicitly references:
  - `apps/styleforge/examples/information.md`
  - `apps/styleforge/examples/CollectionOverview.html`
  - `apps/styleforge/examples/CollectionDetail.html`
  - `apps/styleforge/examples/ComparisonScreen.html`
  - `apps/styleforge/examples/Search&Discovery.html`
  - `apps/styleforge/src/components/StyleForgeStudio.tsx`
- Includes current critique, target UX direction, and core improvements for each of the four example screens.
- Keeps advanced functionality deferred and prioritizes shell, hierarchy, clarity, and reusable elements first.

## Assumptions

- The roadmap is written in English because the example pages and `information.md` already use English naming.
- `information.md` remains a lightweight example index rather than becoming the roadmap itself.
- The examples are design targets for the real product, but not yet production code.
- The current priority is the core UI/UX foundation, not advanced workflows.
