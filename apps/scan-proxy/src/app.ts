/**
 * Hono app compartida entre el Worker (Cloudflare) y el helper local.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { CaptureError, LIMITS, capture } from "./capture";

export const ALLOWED_ORIGINS = [
  "https://stealthis.dev",
  "https://www.stealthis.dev",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
];

type Bindings = {
  CAPTURE_LIMIT?: { limit: (o: { key: string }) => Promise<{ success: boolean }> };
};

export type ScanProxyOptions = {
  /** Helper local: permite POST /shutdown y CORS para Private Network Access. */
  local?: boolean;
};

export function createApp(options: ScanProxyOptions = {}) {
  const { local = false } = options;
  const app = new Hono<{ Bindings: Bindings }>();

  app.use(
    "/*",
    cors({
      origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : null),
      allowMethods: local ? ["GET", "POST", "OPTIONS"] : ["GET", "OPTIONS"],
      allowHeaders: ["content-type"],
      maxAge: 86_400,
    })
  );

  if (local) {
    app.use("/*", async (c, next) => {
      await next();
      c.res.headers.set("Access-Control-Allow-Private-Network", "true");
    });
  }

  app.get("/", (c) =>
    c.json({
      name: "stealthis-scan-proxy",
      purpose: "Captures the HTML and CSS of a public URL for Design Scan.",
      endpoints: {
        capture: "/capture?url=<url>",
        ...(local ? { shutdown: "POST /shutdown" } : {}),
      },
      limits: LIMITS,
      local,
    })
  );

  app.get("/capture", async (c) => {
    const target = c.req.query("url");
    if (!target) return c.json({ error: "Missing the url parameter." }, 400);

    const ip = c.req.header("cf-connecting-ip") ?? "local";
    let rateLimited = false;
    if (c.env.CAPTURE_LIMIT) {
      const { success } = await c.env.CAPTURE_LIMIT.limit({ key: ip });
      if (!success) rateLimited = true;
    }
    if (rateLimited) return c.json({ error: "Too many captures in a row. Wait a moment." }, 429);

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

  if (local) {
    app.post("/shutdown", (c) => {
      setTimeout(() => process.exit(0), 50);
      return c.json({ ok: true, message: "Shutting down." });
    });
  }

  app.notFound((c) => c.json({ error: "Not found" }, 404));

  return app;
}
