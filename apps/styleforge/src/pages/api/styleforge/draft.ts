import { StyleForgeDraftSchema, type StyleForgeReference } from "@stealthis/schema/styleforge";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateStyleForgeDraft } from "../../../lib/styleforge/generator";
import {
  curateStyleForgeReferences,
  indexReferencesBySlug,
} from "../../../lib/styleforge/references";
import { jsonError, jsonResponse, parseDraftBody, parseJsonRequestBody } from "./_shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await parseJsonRequestBody(request);
    const { selection, llm } = parseDraftBody(body);

    const resources = await getCollection("resources");
    const curated = curateStyleForgeReferences(resources);
    const allReferences = [...curated.pages, ...curated.components];
    const referencesBySlug = indexReferencesBySlug(allReferences);

    const pageReferences: StyleForgeReference[] = selection.pageReferenceSlugs
      .map((slug) => referencesBySlug.get(slug))
      .filter((reference): reference is StyleForgeReference => Boolean(reference));

    const componentReferences: StyleForgeReference[] = selection.componentReferenceSlugs
      .map((slug) => referencesBySlug.get(slug))
      .filter((reference): reference is StyleForgeReference => Boolean(reference));

    const missingPageReferences = selection.pageReferenceSlugs.filter(
      (slug) => !pageReferences.some((reference) => reference.slug === slug)
    );
    const missingComponentReferences = selection.componentReferenceSlugs.filter(
      (slug) => !componentReferences.some((reference) => reference.slug === slug)
    );

    const result = await generateStyleForgeDraft(
      {
        selection,
        pageReferences,
        componentReferences,
      },
      llm
    );

    const warnings = [...result.draft.warnings];
    if (missingPageReferences.length > 0) {
      warnings.push(`Missing page references ignored: ${missingPageReferences.join(", ")}`);
    }
    if (missingComponentReferences.length > 0) {
      warnings.push(`Missing component references ignored: ${missingComponentReferences.join(", ")}`);
    }

    const draft = StyleForgeDraftSchema.parse({
      ...result.draft,
      warnings,
    });

    return jsonResponse({
      ok: true,
      mode: result.mode,
      draft,
      references: {
        pages: pageReferences,
        components: componentReferences,
      },
    });
  } catch (error) {
    return jsonError(error, 400);
  }
};
