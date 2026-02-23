import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

const DEFAULT_SITE = "https://stealthis.dev";
const STATIC_PATHS = ["/", "/library/", "/es/", "/es/library/", "/llms.txt"];

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(DEFAULT_SITE)).toString().replace(/\/$/, "");
  const resources = await getCollection("resources");

  const urls: Array<{ loc: string; lastmod?: string }> = STATIC_PATHS.map((path) => ({
    loc: `${origin}${path}`,
  }));

  for (const resource of resources) {
    const lastmod = formatDate(resource.data.updatedAt ?? resource.data.createdAt);
    urls.push({ loc: `${origin}/r/${resource.data.slug}`, lastmod });
    urls.push({ loc: `${origin}/es/r/${resource.data.slug}`, lastmod });
  }

  const body = urls
    .map(
      ({ loc, lastmod }) =>
        `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
