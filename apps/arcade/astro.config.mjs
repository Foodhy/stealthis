import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://arcade.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4329 },
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
