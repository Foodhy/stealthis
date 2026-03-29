import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { CONSTRAINT_PRESETS } from "../../../lib/styleforge/presets";
import { curateStyleForgeReferences } from "../../../lib/styleforge/references";

export const GET: APIRoute = async () => {
  const resources = await getCollection("resources");
  const curated = curateStyleForgeReferences(resources);

  return new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      pages: curated.pages,
      components: curated.components,
      constraintPresets: CONSTRAINT_PRESETS,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    }
  );
};
