import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  site: "https://styleforge.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4326 },
  integrations: [mdx(), react(), tailwind({ applyBaseStyles: false })],
});
