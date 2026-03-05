import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://dbviz.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4327 },
  integrations: [react(), tailwind({ applyBaseStyles: false })],
});
