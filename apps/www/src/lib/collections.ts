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
  "realestate",
  "editorial",
  "comics",
  "music",
  "wiki",
  "patterns",
  "web3",
  "gamedev",
  "storybook",
  "travel",
  "portfolio",
  "ecommerce",
  "science",
  "cookbook",
  "museum",
] as const;

export type ResourceCollection = (typeof RESOURCE_COLLECTION_IDS)[number];
export type CollectionFilterValue = ResourceCollection | "all";

export const ALL_COLLECTION_FILTER_VALUE: CollectionFilterValue = "all";

/** Industry vertical collections — show a "New" badge in the library explorer. */
export const NEW_LIBRARY_COLLECTION_IDS = [
  "restaurant",
  "clinic",
  "gym",
  "salon",
  "realestate",
  "editorial",
  "comics",
  "music",
  "wiki",
  "patterns",
  "web3",
  "gamedev",
  "storybook",
  "travel",
  "portfolio",
  "ecommerce",
  "science",
  "cookbook",
  "museum",
] as const satisfies readonly ResourceCollection[];

const newLibraryCollectionIdsSet = new Set<ResourceCollection>(NEW_LIBRARY_COLLECTION_IDS);

export function isNewLibraryCollection(id: ResourceCollection): boolean {
  return newLibraryCollectionIdsSet.has(id);
}

export const IS_NEW_RECOMMENDATIONS_SECTION = true;

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
  {
    id: "realestate",
    titleKey: "collection.realestate.title",
    descriptionKey: "collection.realestate.desc",
    accentToken: "collection-realestate",
    order: 14,
  },
  {
    id: "editorial",
    titleKey: "collection.editorial.title",
    descriptionKey: "collection.editorial.desc",
    accentToken: "collection-editorial",
    order: 15,
  },
  {
    id: "comics",
    titleKey: "collection.comics.title",
    descriptionKey: "collection.comics.desc",
    accentToken: "collection-comics",
    order: 16,
  },
  {
    id: "music",
    titleKey: "collection.music.title",
    descriptionKey: "collection.music.desc",
    accentToken: "collection-music",
    order: 17,
  },
  {
    id: "wiki",
    titleKey: "collection.wiki.title",
    descriptionKey: "collection.wiki.desc",
    accentToken: "collection-wiki",
    order: 18,
  },
  {
    id: "patterns",
    titleKey: "collection.patterns.title",
    descriptionKey: "collection.patterns.desc",
    accentToken: "collection-patterns",
    order: 19,
  },
  {
    id: "web3",
    titleKey: "collection.web3.title",
    descriptionKey: "collection.web3.desc",
    accentToken: "collection-web3",
    order: 20,
  },
  {
    id: "gamedev",
    titleKey: "collection.gamedev.title",
    descriptionKey: "collection.gamedev.desc",
    accentToken: "collection-gamedev",
    order: 21,
  },
  {
    id: "storybook",
    titleKey: "collection.storybook.title",
    descriptionKey: "collection.storybook.desc",
    accentToken: "collection-storybook",
    order: 22,
  },
  {
    id: "travel",
    titleKey: "collection.travel.title",
    descriptionKey: "collection.travel.desc",
    accentToken: "collection-travel",
    order: 23,
  },
  {
    id: "portfolio",
    titleKey: "collection.portfolio.title",
    descriptionKey: "collection.portfolio.desc",
    accentToken: "collection-portfolio",
    order: 24,
  },
  {
    id: "ecommerce",
    titleKey: "collection.ecommerce.title",
    descriptionKey: "collection.ecommerce.desc",
    accentToken: "collection-ecommerce",
    order: 25,
  },
  {
    id: "science",
    titleKey: "collection.science.title",
    descriptionKey: "collection.science.desc",
    accentToken: "collection-science",
    order: 26,
  },
  {
    id: "cookbook",
    titleKey: "collection.cookbook.title",
    descriptionKey: "collection.cookbook.desc",
    accentToken: "collection-cookbook",
    order: 27,
  },
  {
    id: "museum",
    titleKey: "collection.museum.title",
    descriptionKey: "collection.museum.desc",
    accentToken: "collection-museum",
    order: 28,
  },
];

export const libraryCollectionIdsSet = new Set<ResourceCollection>(RESOURCE_COLLECTION_IDS);

export function isResourceCollection(value: string): value is ResourceCollection {
  return libraryCollectionIdsSet.has(value as ResourceCollection);
}
