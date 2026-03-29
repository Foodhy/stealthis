import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { LOCALES, getLocalizedPath } from "@i18n/index";

const DEFAULT_SITE = "https://stealthis.dev";
const LOCALIZED_BASE_PATHS = ["/", "/library/", "/showcase/", "/changelog"];
const STATIC_PATHS = [
  ...new Set(
    LOCALIZED_BASE_PATHS.flatMap((path) => LOCALES.map((locale) => getLocalizedPath(path, locale)))
  ),
  "/llms.txt",
  "/llms-full.txt",
  "/ai-index.json",
  "/library-index.json",
];

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
    for (const locale of LOCALES) {
      urls.push({
        loc: `${origin}${getLocalizedPath(`/r/${resource.data.slug}`, locale)}`,
        lastmod,
      });
    }
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
