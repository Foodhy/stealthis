import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://docs.stealthis.dev",
  adapter: cloudflare(),
  server: { port: 4322 },
  integrations: [
    starlight({
      title: "StealThis.dev",
      description: "Documentation for StealThis.dev — the open-source web resource library.",
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
