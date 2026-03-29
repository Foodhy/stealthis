import type { APIRoute } from "astro";
import {
  DBVIZ_DESCRIPTION,
  DBVIZ_NAME,
  DBVIZ_TITLE,
  STEALTHIS_SITE,
  getDbvizOrigin,
  loadDbResources,
} from "../lib/site";

export const GET: APIRoute = async ({ site }) => {
  const origin = getDbvizOrigin(site);
  const resources = await loadDbResources();

  const recentExamples = [...resources]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    )
    .slice(0, 12)
    .map(
      (resource) => `- ${resource.title} (${resource.slug}) — ${STEALTHIS_SITE}/r/${resource.slug}`
    );

  const content = [
    `# ${DBVIZ_NAME} — LLM Context`,
    "",
    `${DBVIZ_TITLE} is a browser-based SQL schema visualizer and ERD editor by StealThis.dev.`,
    DBVIZ_DESCRIPTION,
    "",
    "## Canonical links",
    `- App: ${origin}/`,
    `- Sitemap: ${origin}/sitemap.xml`,
    `- Structured AI index: ${origin}/ai-index.json`,
    `- Main site: ${STEALTHIS_SITE}/`,
    `- Library: ${STEALTHIS_SITE}/library/`,
    "",
    "## Core capabilities",
    "- Design relational schemas and inspect SQL structure.",
    "- Visualize entity relationships as ERD diagrams.",
    "- Explore starter database schemas for common product domains.",
    "- Review seed data, migrations, and example queries when available.",
    "",
    "## Coverage",
    `- Total schema examples: ${resources.length}`,
    "",
    "## Recent schema examples",
    ...recentExamples,
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
