export const RESOURCE_COLLECTION_IDS = [
  "saas",
  "motion",
  "hero",
  "cards",
  "dashboard",
  "remotion",
  "effects",
  "mobile-nav",
  "charts",
  "restaurant",
  "clinic",
  "gym",
  "salon",
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
  {
    id: "mobile-nav",
    titleKey: "collection.mobile-nav.title",
    descriptionKey: "collection.mobile-nav.desc",
    accentToken: "collection-mobile-nav",
    order: 8,
  },
  {
    id: "charts",
    titleKey: "collection.charts.title",
    descriptionKey: "collection.charts.desc",
    accentToken: "collection-charts",
    order: 9,
  },
  {
    id: "restaurant",
    titleKey: "collection.restaurant.title",
    descriptionKey: "collection.restaurant.desc",
    accentToken: "collection-restaurant",
    order: 10,
  },
  {
    id: "clinic",
    titleKey: "collection.clinic.title",
    descriptionKey: "collection.clinic.desc",
    accentToken: "collection-clinic",
    order: 11,
  },
  {
    id: "gym",
    titleKey: "collection.gym.title",
    descriptionKey: "collection.gym.desc",
    accentToken: "collection-gym",
    order: 12,
  },
  {
    id: "salon",
    titleKey: "collection.salon.title",
    descriptionKey: "collection.salon.desc",
    accentToken: "collection-salon",
    order: 13,
  },
];

export const libraryCollectionIdsSet = new Set<ResourceCollection>(RESOURCE_COLLECTION_IDS);

export function isResourceCollection(value: string): value is ResourceCollection {
  return libraryCollectionIdsSet.has(value as ResourceCollection);
}
