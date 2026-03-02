import { getCollection } from "astro:content";
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
      `  category: ${data.category} | type: ${data.type} | difficulty: ${data.difficulty}`,
      `  targets: ${targets}`,
      `  tech: ${tech}`,
      `  tags: ${tags}`,
      `  updatedAt: ${data.updatedAt}`,
    ].join("\n");
  });

  const content = [
    "# StealThis.dev — Full LLM Context",
    "",
    "This file contains the full resource index in plain text for AI crawlers and retrieval systems.",
    "",
    "## Canonical links",
    `- Main site: ${origin}/`,
    `- Library: ${origin}/library/`,
    `- Showcase: ${origin}/showcase/`,
    `- Spanish library: ${origin}/es/library/`,
    `- Sitemap: ${origin}/sitemap.xml`,
    `- Short LLM context: ${origin}/llms.txt`,
    `- Structured AI index (JSON): ${origin}/ai-index.json`,
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
