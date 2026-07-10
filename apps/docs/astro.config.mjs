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
          label: "Playbooks",
          badge: "New",
          items: [
            { label: "Start Here", link: "/playbooks/" },
            { label: "Algorithms & Data Structures", autogenerate: { directory: "playbooks/algorithms" } },
            { label: "Runtime & Concurrency", autogenerate: { directory: "playbooks/runtime" } },
            { label: "Frontend Performance", autogenerate: { directory: "playbooks/frontend-performance" } },
            { label: "Backend & Data", autogenerate: { directory: "playbooks/backend-data" } },
            { label: "Platform Choice", autogenerate: { directory: "playbooks/platform-choice" } },
            { label: "Mobile & Native", autogenerate: { directory: "playbooks/mobile-native" } },
          ],
        },
        {
          label: "Library Guide",
          badge: "New",
          items: [
            { label: "Choose Your Path", link: "/choose-your-path/", badge: "New" },
            { label: "Recommendations", link: "/recommendations/", badge: "New" },
            { label: "Collections", link: "/collections/", badge: "New" },
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
