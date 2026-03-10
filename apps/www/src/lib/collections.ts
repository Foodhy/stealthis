export const RESOURCE_COLLECTION_IDS = [
  "saas",
  "motion",
  "hero",
  "cards",
  "dashboard",
  "remotion",
  "effects",
] as const;

export type ResourceCollection = (typeof RESOURCE_COLLECTION_IDS)[number];
export type CollectionFilterValue = ResourceCollection | "all";

export const ALL_COLLECTION_FILTER_VALUE: CollectionFilterValue = "all";

export interface LibraryCollection {
  id: ResourceCollection;
  titleKey: `collection.${ResourceCollection}.title`;
  descriptionKey: `collection.${ResourceCollection}.desc`;
  accentToken: string;
  order: number;
}

export const libraryCollections: LibraryCollection[] = [
  {
    id: "saas",
    titleKey: "collection.saas.title",
    descriptionKey: "collection.saas.desc",
    accentToken: "collection-saas",
    order: 1,
  },
  {
    id: "motion",
    titleKey: "collection.motion.title",
    descriptionKey: "collection.motion.desc",
    accentToken: "collection-motion",
    order: 2,
  },
  {
    id: "hero",
    titleKey: "collection.hero.title",
    descriptionKey: "collection.hero.desc",
    accentToken: "collection-hero",
    order: 3,
  },
  {
    id: "cards",
    titleKey: "collection.cards.title",
    descriptionKey: "collection.cards.desc",
    accentToken: "collection-cards",
    order: 4,
  },
  {
    id: "dashboard",
    titleKey: "collection.dashboard.title",
    descriptionKey: "collection.dashboard.desc",
    accentToken: "collection-dashboard",
    order: 5,
  },
  {
    id: "remotion",
    titleKey: "collection.remotion.title",
    descriptionKey: "collection.remotion.desc",
    accentToken: "collection-remotion",
    order: 6,
  },
  {
    id: "effects",
    titleKey: "collection.effects.title",
    descriptionKey: "collection.effects.desc",
    accentToken: "collection-effects",
    order: 7,
  },
];

export const libraryCollectionIdsSet = new Set<ResourceCollection>(RESOURCE_COLLECTION_IDS);

export function isResourceCollection(value: string): value is ResourceCollection {
  return libraryCollectionIdsSet.has(value as ResourceCollection);
}
