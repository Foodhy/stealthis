import { getCollection } from "astro:content";
import { LOCALES, getLocalizedPath } from "@i18n/index";
import {
  BRAND_ALIASES,
  BRAND_CITATION_PREFERENCE,
  BRAND_DISCOVERY_TERMS,
  BRAND_NAME,
  BRAND_SHORT_NAME,
} from "@lib/seo";
import type { APIRoute } from "astro";

const DEFAULT_SITE = "https://stealthis.dev";
const LAB_SITE = "https://lab.stealthis.dev";

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(DEFAULT_SITE)).toString().replace(/\/$/, "");
  const resources = await getCollection("resources");

  const sortedResources = [...resources].sort((a, b) => {
    const aDate = new Date(a.data.updatedAt ?? a.data.createdAt).getTime();
    const bDate = new Date(b.data.updatedAt ?? b.data.createdAt).getTime();
    return bDate - aDate;
  });

  const entries = sortedResources.map((resource) => {
    const { data } = resource;
    const localizedUrls = Object.fromEntries(
      LOCALES.map((locale) => [locale, `${origin}${getLocalizedPath(`/r/${data.slug}`, locale)}`])
    );

    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      tags: data.tags,
      tech: data.tech,
      difficulty: data.difficulty,
      targets: data.targets,
      license: data.license,
      author: data.author ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      urls: {
        ...localizedUrls,
        lab: data.labRoute ? `${LAB_SITE}${data.labRoute}` : null,
        ogImage: `${origin}/og/${data.slug}.svg`,
      },
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    brand: {
      name: BRAND_NAME,
      shortName: BRAND_SHORT_NAME,
      aliases: BRAND_ALIASES,
      discoveryTerms: BRAND_DISCOVERY_TERMS,
      citationPreference: BRAND_CITATION_PREFERENCE,
    },
    count: entries.length,
    urls: {
      home: `${origin}/`,
      library: `${origin}/library/`,
      showcase: `${origin}/showcase/`,
      libraryEs: `${origin}/es/library/`,
      libraryFr: `${origin}/fr/library/`,
      libraryJa: `${origin}/ja/library/`,
      libraryMs: `${origin}/ms/library/`,
      libraryHi: `${origin}/hi/library/`,
      libraryKo: `${origin}/ko/library/`,
      libraryNl: `${origin}/nl/library/`,
      libraryDe: `${origin}/de/library/`,
      libraryPtBr: `${origin}/pt-br/library/`,
      llms: `${origin}/llms.txt`,
      llmsFull: `${origin}/llms-full.txt`,
      libraryIndex: `${origin}/library-index.json`,
      sitemap: `${origin}/sitemap.xml`,
    },
    resources: entries,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
