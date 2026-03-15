import type { APIRoute } from "astro";
import { getDbvizOrigin } from "../lib/site";

export const GET: APIRoute = ({ site }) => {
  const origin = getDbvizOrigin(site);
  const urls = [`${origin}/`, `${origin}/llms.txt`, `${origin}/ai-index.json`];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
