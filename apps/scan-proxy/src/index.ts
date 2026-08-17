/**
 * scan-proxy — captura la URL que pega el usuario en Design Scan.
 *
 * Existe porque apps/www es un build estático (el paso de build borra
 * _worker.js), así que no puede hospedar endpoints, y el navegador no puede
 * fetchear un sitio ajeno por CORS.
 *
 * Va aparte de apps/mcp a propósito: el worker del catálogo no debe tener
 * dentro un fetcher de URL arbitraria.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { CaptureError, LIMITS, capture } from "./capture";

type Bindings = {
  /** Rate limiter nativo de Cloudflare, declarado en wrangler.toml. */
  CAPTURE_LIMIT?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
};

const app = new Hono<{ Bindings: Bindings }>();

/**
 * CORS cerrado. Nunca "*": este endpoint gasta cuota y sale a internet en
 * nombre de quien lo llame, así que solo lo llama nuestra propia página.
 */
const ALLOWED_ORIGINS = [
  "https://stealthis.dev",
  "https://www.stealthis.dev",
  "http://localhost:4321", // apps/www en desarrollo
  "http://127.0.0.1:4321",
];

app.use(
  "/*",
  cors({
    origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : null),
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["content-type"],
    maxAge: 86_400,
  })
);

app.get("/", (c) =>
  c.json({
    name: "stealthis-scan-proxy",
    purpose: "Captures the HTML and CSS of a public URL for Design Scan.",
    endpoints: { capture: "/capture?url=<url>" },
    limits: LIMITS,
  })
);

app.get("/capture", async (c) => {
  const target = c.req.query("url");
  if (!target) return c.json({ error: "Missing the url parameter." }, 400);

  // Rate limit por IP. Si el binding no está (dev local sin configurar), se
  // sigue sin él: mejor un aviso en la respuesta que un endpoint caído.
  const ip = c.req.header("cf-connecting-ip") ?? "desconocida";
  let rateLimited = false;
  if (c.env.CAPTURE_LIMIT) {
    const { success } = await c.env.CAPTURE_LIMIT.limit({ key: ip });
    if (!success) rateLimited = true;
  }
  if (rateLimited)
    return c.json({ error: "Too many captures in a row. Wait a moment." }, 429);

  try {
    const result = await capture(target);
    return c.json(result, 200, { "cache-control": "no-store" });
  } catch (err) {
    if (err instanceof CaptureError) return c.json({ error: err.message }, err.status as 400);
    if (err instanceof Error && err.name === "TimeoutError")
      return c.json({ error: "The page took too long to respond." }, 504);
    return c.json({ error: "The page could not be captured." }, 502);
  }
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
