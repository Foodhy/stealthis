import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

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
