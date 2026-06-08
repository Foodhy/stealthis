import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getResourceSearchTechTokens } from "@lib/resource-tech";

export const GET: APIRoute = async () => {
  const resources = await getCollection("resources");

  const payload = {
    resources: resources.map((r) => {
      const searchTechTokens = getResourceSearchTechTokens(r);
      // Recommendation topics: include each alternative's name so searching for a
      // specific tool (e.g. "lovable", "stripe", "opencv") surfaces the topic.
      const optionNames = Array.isArray(r.data.options)
        ? r.data.options.map((o: { name: string }) => o.name)
        : [];
      const rawSearchText = [
        r.data.title,
        r.data.description,
        ...(Array.isArray(r.data.tags) ? r.data.tags : []),
        ...optionNames,
        ...searchTechTokens,
      ].join(" ");

      return {
        slug: r.data.slug,
        title: r.data.title,
        description: r.data.description,
        category: r.data.category,
        type: r.data.type,
        difficulty: r.data.difficulty,
        tags: r.data.tags || [],
        tech: r.data.tech || [],
        targets: r.data.targets || [],
        labRoute: r.data.labRoute || null,
        author: r.data.author?.name || null,
        collections: r.data.collections || [],
        searchText: rawSearchText,
      };
    }),
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
