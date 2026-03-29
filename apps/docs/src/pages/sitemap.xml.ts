import type { APIRoute } from "astro";

const DEFAULT_SITE = "https://docs.stealthis.dev";

const DOC_PATHS = [
  "/",
  "/getting-started/",
  "/integrate/",
  "/resource-format/",
  "/llm/",
  "/agents/",
  "/mcp-server/",
  "/skills/",
  "/a2a/",
  "/llms.txt",
  "/raw/index",
  "/raw/getting-started",
  "/raw/integrate",
  "/raw/resource-format",
  "/raw/llm",
  "/raw/agents",
  "/raw/mcp-server",
  "/raw/skills",
  "/raw/a2a",
];

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(DEFAULT_SITE)).toString().replace(/\/$/, "");
  const body = DOC_PATHS.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
