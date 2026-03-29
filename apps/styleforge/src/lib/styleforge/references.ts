import type { CollectionEntry } from "astro:content";
import type { StyleForgeReference } from "@stealthis/schema/styleforge";

const PAGE_CATEGORIES = new Set(["pages", "web-pages"]);
const COMPONENT_CATEGORIES = new Set(["ui-components", "patterns"]);

function toReference(entry: CollectionEntry<"resources">): StyleForgeReference {
  return {
    slug: entry.data.slug,
    title: entry.data.title,
    description: entry.data.description,
    category: entry.data.category,
    tags: entry.data.tags,
    tech: entry.data.tech,
    labRoute: entry.data.labRoute ?? null,
  };
}

export function curateStyleForgeReferences(resources: CollectionEntry<"resources">[]): {
  pages: StyleForgeReference[];
  components: StyleForgeReference[];
} {
  const sorted = [...resources].sort((a, b) => {
    const aDate = new Date(a.data.updatedAt ?? a.data.createdAt).getTime();
    const bDate = new Date(b.data.updatedAt ?? b.data.createdAt).getTime();
    return bDate - aDate;
  });

  const pages = sorted
    .filter((resource) => PAGE_CATEGORIES.has(resource.data.category))
    .map(toReference)
    .slice(0, 40);

  const components = sorted
    .filter((resource) => COMPONENT_CATEGORIES.has(resource.data.category))
    .map(toReference)
    .slice(0, 60);

  return { pages, components };
}

export function indexReferencesBySlug(
  references: StyleForgeReference[]
): Map<string, StyleForgeReference> {
  return new Map(references.map((reference) => [reference.slug, reference]));
}
