/**
 * Helper local para Design Scan — escucha solo en loopback.
 *
 * Los usuarios lo arrancan en su máquina; stealthis.dev no hospeda el proxy.
 */

import { createApp } from "./app";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT ?? 8799);

const app = createApp({ local: true });

const server = Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch: app.fetch,
});

console.log(
  `stealthis capture helper listening on http://${HOST}:${server.port}\nLeave this terminal open while you use Design Scan. Ctrl+C to stop.`
);
