import { readFileSync } from "node:fs";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { findResourcePreview } from "@lib/resource-preview";

type PreviewProps = {
  absolutePath: string;
  mime: string;
};

export async function getStaticPaths() {
  const resources = await getCollection("resources");

  return resources
    .map((resource) => {
      const preview = findResourcePreview(resource.data.slug);
      if (!preview) return null;

      return {
        params: {
          slug: resource.data.slug,
          ext: preview.ext,
        },
        props: {
          absolutePath: preview.absolutePath,
          mime: preview.mime,
        } satisfies PreviewProps,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

export const GET: APIRoute = ({ props }) => {
  const preview = props as PreviewProps | undefined;
  if (!preview) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = readFileSync(preview.absolutePath);
  return new Response(bytes, {
    headers: {
      "Content-Type": preview.mime,
      "Cache-Control": "public, max-age=3600",
    },
  });
};
