import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://build.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4324 },
  integrations: [react(), tailwind({ applyBaseStyles: false })],
});
