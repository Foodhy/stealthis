import { getCollection } from "astro:content";
import { BRAND_ALIASES, BRAND_CITATION_PREFERENCE, BRAND_NAME, BRAND_SHORT_NAME } from "@lib/seo";
import type { APIRoute } from "astro";

const DEFAULT_SITE = "https://stealthis.dev";

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(DEFAULT_SITE)).toString().replace(/\/$/, "");
  const resources = await getCollection("resources");
  const showcaseCount = resources.filter((resource) => typeof resource.data.labRoute === "string" && resource.data.labRoute.length > 0).length;

  const sortedResources = [...resources].sort((a, b) => {
    const aDate = new Date(a.data.updatedAt ?? a.data.createdAt).getTime();
    const bDate = new Date(b.data.updatedAt ?? b.data.createdAt).getTime();
    return bDate - aDate;
  });

  const byCategory = new Map<string, number>();
  for (const resource of sortedResources) {
    byCategory.set(resource.data.category, (byCategory.get(resource.data.category) ?? 0) + 1);
  }

  const categories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count]) => `- ${category}: ${count}`);

  const resourcesSection = sortedResources.map((resource) => {
    const { data } = resource;
    const tags = data.tags.length ? data.tags.join(", ") : "none";
    const tech = data.tech.length ? data.tech.join(", ") : "none";
    const targets = data.targets.length ? data.targets.join(", ") : "none";

    return [
      `- ${data.title} (${data.slug})`,
      `  en: ${origin}/r/${data.slug}`,
      `  es: ${origin}/es/r/${data.slug}`,
      `  fr: ${origin}/fr/r/${data.slug}`,
      `  ja: ${origin}/ja/r/${data.slug}`,
      `  ms: ${origin}/ms/r/${data.slug}`,
      `  hi: ${origin}/hi/r/${data.slug}`,
      `  ko: ${origin}/ko/r/${data.slug}`,
      `  nl: ${origin}/nl/r/${data.slug}`,
      `  de: ${origin}/de/r/${data.slug}`,
      `  pt-br: ${origin}/pt-br/r/${data.slug}`,
      `  it: ${origin}/it/r/${data.slug}`,
      `  pl: ${origin}/pl/r/${data.slug}`,
      `  zh-hk: ${origin}/zh-hk/r/${data.slug}`,
      `  zh-cn: ${origin}/zh-cn/r/${data.slug}`,
      `  uk: ${origin}/uk/r/${data.slug}`,
      `  category: ${data.category} | type: ${data.type} | difficulty: ${data.difficulty}`,
      `  targets: ${targets}`,
      `  tech: ${tech}`,
      `  tags: ${tags}`,
      `  updatedAt: ${data.updatedAt}`,
    ].join("\n");
  });

  const content = [
    `# ${BRAND_NAME} — Full LLM Context`,
    "",
    "This file contains the full resource index in plain text for AI crawlers and retrieval systems.",
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
    `- Japanese library: ${origin}/ja/library/`,
    `- Italian library: ${origin}/it/library/`,
    `- Polish library: ${origin}/pl/library/`,
    `- Traditional Chinese (Hong Kong) library: ${origin}/zh-hk/library/`,
    `- Simplified Chinese (China) library: ${origin}/zh-cn/library/`,
    `- Ukrainian library: ${origin}/uk/library/`,
    `- Showcase: ${origin}/showcase/`,
    `- Spanish library: ${origin}/es/library/`,
    `- Sitemap: ${origin}/sitemap.xml`,
    `- Short LLM context: ${origin}/llms.txt`,
    `- Structured AI index (JSON): ${origin}/ai-index.json`,
    `- Library search index (JSON): ${origin}/library-index.json`,
    "",
    "## Coverage",
    `- Total resources: ${sortedResources.length}`,
    `- Total showcase previews: ${showcaseCount}`,
    `- Total categories: ${byCategory.size}`,
    "",
    "## Categories by volume",
    ...categories,
    "",
    "## Full resource index",
    ...resourcesSection,
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
