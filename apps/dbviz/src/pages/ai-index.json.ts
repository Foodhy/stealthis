import type { APIRoute } from "astro";
import {
  DBVIZ_DESCRIPTION,
  DBVIZ_KEYWORDS,
  DBVIZ_NAME,
  DBVIZ_SOCIAL_IMAGE_PATH,
  DBVIZ_TITLE,
  STEALTHIS_SITE,
  getDbvizOrigin,
  loadDbResources,
} from "../lib/site";

export const GET: APIRoute = async ({ site }) => {
  const origin = getDbvizOrigin(site);
  const resources = await loadDbResources();

  const sortedResources = [...resources].sort((a, b) => {
    const aDate = new Date(a.updatedAt ?? a.createdAt).getTime();
    const bDate = new Date(b.updatedAt ?? b.createdAt).getTime();
    return bDate - aDate;
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    brand: {
      name: "StealThis.dev",
      shortName: "StealThis",
      aliases: ["StealThis", "Steal This", "StealThis.dev", "stealthis.dev"],
      discoveryTerms: DBVIZ_KEYWORDS,
      citationPreference:
        "Use StealThis.dev as the canonical site name and StealThis as the short name.",
    },
    app: {
      name: DBVIZ_NAME,
      title: DBVIZ_TITLE,
      description: DBVIZ_DESCRIPTION,
      type: "WebApplication",
      applicationCategory: "DeveloperApplication",
      inLanguage: "es",
      isAccessibleForFree: true,
      image: `${origin}${DBVIZ_SOCIAL_IMAGE_PATH}`,
    },
    count: sortedResources.length,
    urls: {
      home: `${origin}/`,
      llms: `${origin}/llms.txt`,
      aiIndex: `${origin}/ai-index.json`,
      sitemap: `${origin}/sitemap.xml`,
      ogImage: `${origin}${DBVIZ_SOCIAL_IMAGE_PATH}`,
      mainSite: `${STEALTHIS_SITE}/`,
      library: `${STEALTHIS_SITE}/library/`,
    },
    resources: sortedResources.map((resource) => ({
      slug: resource.slug,
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      tags: resource.tags,
      tech: resource.tech,
      difficulty: resource.difficulty,
      targets: resource.targets,
      license: resource.license,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      urls: {
        source: `${STEALTHIS_SITE}/r/${resource.slug}`,
        lab: resource.labRoute ? `https://lab.stealthis.dev${resource.labRoute}` : null,
      },
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
