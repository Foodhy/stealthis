import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { StyleForgeReference } from "@stealthis/schema/styleforge";
import { createStyleForgeKit } from "../../../lib/styleforge/kit";
import {
  curateStyleForgeReferences,
  indexReferencesBySlug,
} from "../../../lib/styleforge/references";
import { jsonError, jsonResponse, parseFinalizeBody, parseJsonRequestBody } from "./_shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await parseJsonRequestBody(request);
    const { selection, draft } = parseFinalizeBody(body);

    const resources = await getCollection("resources");
    const curated = curateStyleForgeReferences(resources);
    const allReferences = [...curated.pages, ...curated.components];
    const referencesBySlug = indexReferencesBySlug(allReferences);

    const sourceReferences = [...selection.pageReferenceSlugs, ...selection.componentReferenceSlugs]
      .map((slug) => referencesBySlug.get(slug))
      .filter((reference): reference is StyleForgeReference => Boolean(reference));

    const kit = createStyleForgeKit({
      draft,
      selection,
      sourceReferences,
    });

    return jsonResponse({
      ok: true,
      kit,
    });
  } catch (error) {
    return jsonError(error, 400);
  }
};
