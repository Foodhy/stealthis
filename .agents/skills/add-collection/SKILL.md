---
name: add-collection
description: Introduce a new Library collection ID with schema, i18n, Collection Explorer card, and docs catalog row. Use when adding industry verticals or curated resource groups like gym, clinic, restaurant.
metadata:
  tags: collections, schema, i18n, library, docs
---

# Add Collection

Collections group resources in the Library Collection Explorer (e.g. `gym`, `clinic`, `restaurant`). Resources join via `collections: [my-collection]` in frontmatter or heuristics in `resource-collections.ts`.

## When to use

- New industry vertical or themed bundle in the Library
- Curated filter preset users browse as a first-class collection
- ROADMAP phase delivering a vertical (Restaurant, Salon, Real Estate, …)

## Wiring checklist (all five required)

### 1. Schema enum

`packages/schema/src/schema.ts` — add to `ResourceCollectionSchema`:

```ts
z.enum([..., "my-collection"])
```

Also update `packages/schema/src/types.ts` if types are duplicated there.

### 2. Astro content config

`apps/www/src/content/config.ts` — mirror the enum in the content collection schema.

### 3. Collection Explorer card

`apps/www/src/lib/collections.ts` — add an entry:

```ts
{
  id: "my-collection",
  titleKey: "collection.my-collection.title",
  descKey: "collection.my-collection.desc",
  accentToken: "emerald", // match existing accent tokens
  order: 50,
}
```

### 4. i18n labels

`apps/www/src/i18n/index.ts` — for each locale block:

```ts
"collection.my-collection.title": "My Collection",
"collection.my-collection.desc": "Short description for the explorer card.",
```

### 5. Docs catalog

`apps/docs/src/content/docs/collections.mdx` — add a row to the **All collections** table (ID, title, purpose, link).

For **industry verticals**, also add a row in `apps/docs/src/content/docs/choose-your-path.mdx`.

## Optional: auto-join heuristics

`apps/www/src/lib/resource-collections.ts` — extend heuristics so resources auto-join the collection from `tags`/`title` without explicit `collections:` frontmatter.

## Assign resources

In resource frontmatter:

```yaml
collections: [my-collection]
```

## Verify

```bash
bun run lint
bun run build:www
bun run build:docs
```

- Library Collection Explorer shows the new card
- Filtering by collection returns assigned resources
- Docs: `http://localhost:4322/collections/`

## Related

- Resource authoring: [`content-authoring`](../content-authoring/SKILL.md)
- Batch vertical builds: `PHASE-WORKFLOW.md`
- Heuristics file: `apps/www/src/lib/resource-collections.ts`
