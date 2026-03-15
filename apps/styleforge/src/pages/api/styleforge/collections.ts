import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildCollections, searchResources } from "../../../lib/styleforge/collections";

export const GET: APIRoute = async ({ url }) => {
  const resources = await getCollection("resources");
  const query = url.searchParams.get("q") ?? "";
  const type = url.searchParams.get("type") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;

  if (query || type || category) {
    const results = searchResources(resources, query, { type, category });
    return new Response(
      JSON.stringify({ query, filters: { type, category }, results, total: results.length }),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=120",
        },
      },
    );
  }

  const collections = buildCollections(resources);

  return new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      explicit: collections.explicit,
      byCategory: collections.byCategory,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
};
