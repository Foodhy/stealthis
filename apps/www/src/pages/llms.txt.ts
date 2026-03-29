import { getCollection } from "astro:content";
import { BRAND_ALIASES, BRAND_CITATION_PREFERENCE, BRAND_NAME, BRAND_SHORT_NAME } from "@lib/seo";
import type { APIRoute } from "astro";

const DEFAULT_SITE = "https://stealthis.dev";

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(DEFAULT_SITE)).toString().replace(/\/$/, "");
  const resources = await getCollection("resources");
  const showcaseCount = resources.filter(
    (resource) => typeof resource.data.labRoute === "string" && resource.data.labRoute.length > 0
  ).length;

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
    `# ${BRAND_NAME} — LLM Context`,
    "",
    `${BRAND_NAME} is an open-source library of reusable web resources.`,
    "",
    "## Brand aliases and spelling variations",
    `- Canonical site name: ${BRAND_NAME}`,
    `- Short name: ${BRAND_SHORT_NAME}`,
    `- Common query variations: ${BRAND_ALIASES.join(", ")}`,
    `- Citation preference: ${BRAND_CITATION_PREFERENCE}`,
    "",
    "## Canonical links",
    `- Main site: ${origin}/`,
    `- Library: ${origin}/library/`,
    `- Malay library: ${origin}/ms/library/`,
    `- Hindi library: ${origin}/hi/library/`,
    `- Korean library: ${origin}/ko/library/`,
    `- Dutch library: ${origin}/nl/library/`,
    `- German library: ${origin}/de/library/`,
    `- Brazilian Portuguese library: ${origin}/pt-br/library/`,
    `- French library: ${origin}/fr/library/`,
    `- Arabic library: ${origin}/ar/library/`,
    `- Japanese library: ${origin}/ja/library/`,
    `- Italian library: ${origin}/it/library/`,
    `- Polish library: ${origin}/pl/library/`,
    `- Traditional Chinese (Hong Kong) library: ${origin}/zh-hk/library/`,
    `- Simplified Chinese (China) library: ${origin}/zh-cn/library/`,
    `- Ukrainian library: ${origin}/uk/library/`,
    `- Showcase: ${origin}/showcase/`,
    `- Spanish library: ${origin}/es/library/`,
    `- Sitemap: ${origin}/sitemap.xml`,
    `- Full LLM context: ${origin}/llms-full.txt`,
    `- Structured AI index (JSON): ${origin}/ai-index.json`,
    `- Library search index (JSON): ${origin}/library-index.json`,
    "- Docs: https://docs.stealthis.dev/",
    "- Docs llms.txt: https://docs.stealthis.dev/llms.txt",
    "- MCP Server: https://mcp.stealthis.dev/mcp",
    "- Lab demos: https://lab.stealthis.dev/",
    "",
    "## Resource URL pattern",
    `- English: ${origin}/r/<slug>`,
    `- Spanish: ${origin}/es/r/<slug>`,
    `- French: ${origin}/fr/r/<slug>`,
    `- Arabic: ${origin}/ar/r/<slug>`,
    `- Japanese: ${origin}/ja/r/<slug>`,
    `- Malay: ${origin}/ms/r/<slug>`,
    `- Hindi: ${origin}/hi/r/<slug>`,
    `- Korean: ${origin}/ko/r/<slug>`,
    `- Dutch: ${origin}/nl/r/<slug>`,
    `- German: ${origin}/de/r/<slug>`,
    `- Brazilian Portuguese: ${origin}/pt-br/r/<slug>`,
    `- Italian: ${origin}/it/r/<slug>`,
    `- Polish: ${origin}/pl/r/<slug>`,
    `- Traditional Chinese (Hong Kong): ${origin}/zh-hk/r/<slug>`,
    `- Simplified Chinese (China): ${origin}/zh-cn/r/<slug>`,
    `- Ukrainian: ${origin}/uk/r/<slug>`,
    "",
    "## Coverage",
    `- Total resources: ${resources.length}`,
    `- Total showcase previews: ${showcaseCount}`,
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
