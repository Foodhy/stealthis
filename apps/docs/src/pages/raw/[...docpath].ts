import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";

const DOCS_DIR = path.resolve(process.cwd(), "src/content/docs");

const walkDocs = (dir: string, relativeDir = ""): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const docSlugs: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      docSlugs.push(...walkDocs(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const withoutExt = relativePath.replace(/\.mdx$/, "");
      docSlugs.push(withoutExt.replace(/\\/g, "/"));
    }
  }

  return docSlugs;
};

const DOC_SLUGS =
  existsSync(DOCS_DIR) && statSync(DOCS_DIR).isDirectory() ? walkDocs(DOCS_DIR).sort() : ["index"];

export const getStaticPaths: GetStaticPaths = async () => {
  return DOC_SLUGS.map((slug) => ({
    params: {
      docpath: slug,
    },
  }));
};

const normalizeDocPath = (value: string | undefined): string | null => {
  if (!value) return null;

  const normalized = value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\\/g, "/");

  if (!normalized || normalized.includes("..")) return null;
  return normalized;
};

export const GET: APIRoute = async ({ params, url }) => {
  const requestedFormat = url.searchParams.get("format");

  if (requestedFormat && requestedFormat !== "md") {
    return new Response(
      JSON.stringify(
        {
          error: "Unsupported format. Use ?format=md",
          supported: ["md"],
        },
        null,
        2
      ),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const rawDocPath = normalizeDocPath(params.docpath);
  if (!rawDocPath) {
    return new Response("Doc path is required.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const filePath = path.join(DOCS_DIR, `${rawDocPath}.mdx`);
  if (!existsSync(filePath)) {
    return new Response("Doc not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const content = readFileSync(filePath, "utf-8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-StealThis-Doc": rawDocPath,
    },
  });
};
