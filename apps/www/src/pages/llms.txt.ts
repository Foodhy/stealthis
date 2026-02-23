import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

const DEFAULT_SITE = "https://stealthis.dev";

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(DEFAULT_SITE)).toString().replace(/\/$/, "");
  const resources = await getCollection("resources");

  const categoryCounts = new Map<string, number>();
  for (const resource of resources) {
    categoryCounts.set(
      resource.data.category,
      (categoryCounts.get(resource.data.category) ?? 0) + 1
    );
  }

  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => `- ${category}: ${count}`);

  const recentResources = [...resources]
    .sort((a, b) => new Date(b.data.updatedAt).getTime() - new Date(a.data.updatedAt).getTime())
    .slice(0, 20)
    .map(
      (resource) =>
        `- ${resource.data.title} (${resource.data.slug}) — ${origin}/r/${resource.data.slug}`
    );

  const content = [
    "# StealThis.dev — LLM Context",
    "",
    "StealThis.dev is an open-source library of reusable web resources.",
    "",
    "## Canonical links",
    `- Main site: ${origin}/`,
    `- Library: ${origin}/library/`,
    `- Spanish library: ${origin}/es/library/`,
    "- Docs: https://docs.stealthis.dev/",
    "- Docs llms.txt: https://docs.stealthis.dev/llms.txt",
    "- MCP Server: https://mcp.stealthis.dev/mcp",
    "- Lab demos: https://lab.stealthis.dev/",
    "",
    "## Resource URL pattern",
    `- English: ${origin}/r/<slug>`,
    `- Spanish: ${origin}/es/r/<slug>`,
    "",
    "## Coverage",
    `- Total resources: ${resources.length}`,
    `- Total categories: ${categoryCounts.size}`,
    "",
    "## Categories by volume",
    ...topCategories,
    "",
    "## Recently updated resources",
    ...recentResources,
    "",
    "## License",
    "- All resources are MIT unless explicitly noted otherwise in resource metadata.",
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
