import {
  RESOURCE_COLLECTION_IDS,
  type ResourceCollection,
  isResourceCollection,
} from "@lib/collections";

interface ResourceCollectionCandidate {
  category?: string;
  title?: string;
  tags?: string[];
  collections?: string[];
}

const DASHBOARD_HINTS = new Set(["dashboard", "admin", "data-viz"]);
const CARD_HINTS = new Set(["card", "cards"]);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveResourceCollections(
  resource: ResourceCollectionCandidate
): ResourceCollection[] {
  const resolved = new Set<ResourceCollection>();
  const normalizedTags = new Set((resource.tags ?? []).map((tag) => normalize(tag)));
  const normalizedTitle = normalize(resource.title ?? "");
  const normalizedCategory = normalize(resource.category ?? "");

  for (const id of resource.collections ?? []) {
    const normalized = normalize(id);
    if (isResourceCollection(normalized)) {
      resolved.add(normalized);
    }
  }

  if (normalizedTags.has("saas")) {
    resolved.add("saas");
  }

  if (normalizedCategory === "web-animations") {
    resolved.add("motion");
  }

  if (normalizedCategory === "remotion") {
    resolved.add("remotion");
  }

  if (normalizedTags.has("hero") || normalizedTitle.includes("hero")) {
    resolved.add("hero");
  }

  if (
    [...CARD_HINTS].some((token) => normalizedTags.has(token)) ||
    normalizedTitle.includes("card")
  ) {
    resolved.add("cards");
  }

  if (
    [...DASHBOARD_HINTS].some((token) => normalizedTags.has(token)) ||
    normalizedTitle.includes("dashboard")
  ) {
    resolved.add("dashboard");
  }

  return RESOURCE_COLLECTION_IDS.filter((id) => resolved.has(id));
}
