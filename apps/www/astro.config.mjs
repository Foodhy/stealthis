import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://stealthis.dev",
  adapter: cloudflare(),
  integrations: [mdx(), react(), tailwind({ applyBaseStyles: false })],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: false,
    },
  },
  vite: {
    resolve: {
      alias: {
        "@content": fileURLToPath(new URL("../../packages/content", import.meta.url)),
        "@schema": fileURLToPath(new URL("../../packages/schema/src", import.meta.url)),
        "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@i18n": fileURLToPath(new URL("./src/i18n", import.meta.url)),
        "@remotion-app": fileURLToPath(new URL("../remotion/src", import.meta.url)),
      },
    },
  },
});
