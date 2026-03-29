import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  adapter: node({ mode: "standalone" }),
  site: "https://vibe.stealthis.dev",
  server: { port: 4330 },
  integrations: [react(), tailwind({ applyBaseStyles: false })],
});
