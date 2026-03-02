import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath } from "node:url";

export default defineConfig({
  output: "static",
  site: "https://docs.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4322 },
  integrations: [
    starlight({
      title: "StealThis.dev",
      description:
        "Official StealThis.dev docs: setup, integrations, MCP server usage, resource format, and AI agent workflows.",
      head: [
        {
          tag: "meta",
          attrs: { property: "og:image", content: "https://docs.stealthis.dev/og/docs.webp" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:image", content: "https://docs.stealthis.dev/og/docs.webp" },
        },
      ],
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/Foodhy/stealthis",
      },
      customCss: ["./src/styles/custom.css"],
      components: {
        Hero: "./src/components/Hero.astro",
      },
      sidebar: [
        {
          label: "Get Started",
          items: [
            { label: "Getting Started", link: "/getting-started/" },
            { label: "How to Integrate", link: "/integrate/" },
            { label: "Resource Format", link: "/resource-format/" },
          ],
        },
        {
          label: "Guides & Standards",
          items: [
            { label: "LLM Context", link: "/llm/" },
            { label: "AGENTS", link: "/agents/" },
            { label: "MCP Server", link: "/mcp-server/" },
            { label: "Skills", link: "/skills/" },
            { label: "A2A", link: "/a2a/" },
          ],
        },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@content": fileURLToPath(new URL("../../packages/content", import.meta.url)),
      },
    },
  },
});
