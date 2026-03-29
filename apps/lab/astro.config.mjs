import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import { fileURLToPath } from "node:url";

export default defineConfig({
  output: "static",
  site: "https://lab.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4323 },
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    resolve: {
      alias: {
        "@content": fileURLToPath(new URL("../../packages/content", import.meta.url)),
        "@schema": fileURLToPath(new URL("../../packages/schema/src", import.meta.url)),
      },
    },
  },
});
