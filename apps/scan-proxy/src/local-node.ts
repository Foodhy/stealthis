/**
 * Misma app local, entry para el bundle Node (sin depender de Bun en runtime).
 */

import { serve } from "@hono/node-server";
import { createApp } from "./app";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT ?? 8799);

const app = createApp({ local: true });

serve({ fetch: app.fetch, hostname: HOST, port: PORT }, (info) => {
  console.log(
    `stealthis capture helper listening on http://${HOST}:${info.port}\nLeave this terminal open while you use Design Scan. Ctrl+C to stop.`
  );
});
