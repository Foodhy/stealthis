import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

type OgProps = {
  slug: string;
  title: string;
  description: string;
  category: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  "web-animations": "Web Animations",
  "web-pages": "Web Pages",
  "ui-components": "UI Components",
  patterns: "Patterns",
  components: "Components",
  pages: "Pages",
  prompts: "Prompts",
  skills: "Skills",
  "mcp-servers": "MCP Servers",
  plugins: "Plugins",
  architectures: "Architectures",
  boilerplates: "Boilerplates",
  remotion: "Remotion",
  "database-schemas": "Database Schemas",
};

const CATEGORY_COLORS: Record<string, string> = {
  "web-animations": "#67b7ff",
  "web-pages": "#7f8fff",
  "ui-components": "#59d4ff",
  patterns: "#8b6dff",
  components: "#5ec9ff",
  pages: "#97a2ff",
  prompts: "#67d3ff",
  skills: "#77b4ff",
  "mcp-servers": "#6f94ff",
  plugins: "#6f94ff",
  architectures: "#8f84ff",
  boilerplates: "#52c0ff",
  remotion: "#53a5ff",
  "database-schemas": "#22d3ee",
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const truncate = (value: string, maxChars: number) =>
  value.length > maxChars ? `${value.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…` : value;

const wrapText = (value: string, maxChars: number, maxLines: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }

  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = truncate(lines[maxLines - 1], maxChars - 1);
  }
  return lines.slice(0, maxLines);
};

export async function getStaticPaths() {
  const resources = await getCollection("resources");

  return resources.map((resource) => ({
    params: { slug: resource.data.slug },
    props: {
      slug: resource.data.slug,
      title: resource.data.title,
      description: resource.data.description,
      category: resource.data.category,
    } satisfies OgProps,
  }));
}

export const GET: APIRoute = async ({ props, params }) => {
  const resource = props as OgProps | undefined;
  if (!resource) {
    return new Response(`Not found: ${params.slug ?? "unknown"}`, { status: 404 });
  }

  const accent = CATEGORY_COLORS[resource.category] ?? "#67b7ff";
  const categoryLabel = CATEGORY_LABELS[resource.category] ?? resource.category;
  const titleLines = wrapText(truncate(resource.title, 96), 32, 3);
  const descriptionLines = wrapText(truncate(resource.description, 170), 56, 2);

  const titleSvg = titleLines
    .map((line, index) => `<tspan x="72" y="${208 + index * 74}">${escapeXml(line)}</tspan>`)
    .join("");
  const descriptionSvg = descriptionLines
    .map((line, index) => `<tspan x="72" y="${468 + index * 36}">${escapeXml(line)}</tspan>`)
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(resource.title)} preview">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#020617" />
      <stop offset="1" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="line" x1="72" y1="590" x2="1128" y2="590" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${accent}" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.08" />
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1040 160) rotate(140) scale(420 320)">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.28" />
      <stop offset="1" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1040" cy="160" r="280" fill="url(#glow)" filter="url(#blur)" />
  <circle cx="1068" cy="206" r="118" stroke="${accent}" stroke-opacity="0.5" stroke-width="2" />
  <circle cx="1068" cy="206" r="68" stroke="${accent}" stroke-opacity="0.35" stroke-width="2" />
  <path d="M72 590H1128" stroke="url(#line)" stroke-width="2" />

  <rect x="72" y="64" width="192" height="38" rx="19" fill="${accent}" fill-opacity="0.16" />
  <text x="96" y="89" fill="${accent}" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600">Resource</text>
  <text x="72" y="134" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="500">${escapeXml(categoryLabel)}</text>

  <text fill="#F8FAFC" font-family="Inter, system-ui, sans-serif" font-size="64" font-weight="800" letter-spacing="-1.6">
    ${titleSvg}
  </text>

  <text fill="#CBD5E1" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="500" letter-spacing="-0.2">
    ${descriptionSvg}
  </text>

  <text x="72" y="560" fill="#64748B" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="21">${escapeXml(resource.slug)}</text>
  <text x="1036" y="560" text-anchor="end" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="600">stealthis.dev</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
