#!/usr/bin/env node
/**
 * Generates an HTML page with "Create Pen" buttons for one or more resources.
 * Opens CodePen with all code pre-filled — just click, save, and copy the URL.
 *
 * Usage:
 *   node scripts/codepen/prefill-from-resource.mjs <slug1> [slug2] [slug3] ...
 *   node scripts/codepen/prefill-from-resource.mjs --batch lgc-48-photography-portfolio lgc-24-ai-portfolio lgc-31-uxui-portfolio
 *
 * Opens a local HTML page in your browser with one-click buttons.
 *
 * Docs: https://blog.codepen.io/documentation/prefill/
 */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, "../../packages/content");

const slugs = process.argv.slice(2).filter((s) => s !== "--batch");
if (slugs.length === 0) {
  console.error("Usage: node scripts/codepen/prefill-from-resource.mjs <slug1> [slug2] ...");
  process.exit(1);
}

function readSnippet(resourceDir, filename) {
  const filePath = path.join(resourceDir, filename);
  return existsSync(filePath) ? readFileSync(filePath, "utf-8").trim() : "";
}

function buildPrefill(slug) {
  const snippetsDir = path.join(CONTENT_DIR, `resources/${slug}/snippets`);
  if (!existsSync(snippetsDir)) {
    console.error(`Resource not found: ${slug}`);
    return null;
  }

  const html = readSnippet(snippetsDir, "html.html");
  const css = readSnippet(snippetsDir, "style.css");
  const js = readSnippet(snippetsDir, "script.js");

  // Extract <head> content
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch ? headMatch[1] : "";

  // Extract content between <body> tags
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1].trim() : html;

  // Extract inline <style> blocks from body
  const inlineStyles = [];
  const htmlCleaned = bodyContent.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, content) => {
    inlineStyles.push(content.trim());
    return "";
  });

  // Remove local <script src="*.js"> tags (JS content goes in the JS panel)
  const htmlFinal = htmlCleaned.replace(/<script[^>]*\bsrc=["'][^"']*\.js["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");

  // Also extract <style> from <head>
  headContent.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, content) => {
    inlineStyles.push(content.trim());
    return "";
  });

  const fullCss = [css, ...inlineStyles].filter(Boolean).join("\n\n");

  // Extract external CSS links (fonts, etc.)
  const cssExternal = [];
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(headContent)) !== null) {
    const href = linkMatch[1];
    if (href.startsWith("http") && !href.includes("style.css")) {
      cssExternal.push(href);
    }
  }

  // Parse import map and rewrite bare import specifiers → full CDN URLs
  // so the JS works as an ES module in CodePen without needing an import map
  let transformedJs = js;
  let useModule = false;
  const importMapMatch = html.match(
    /<script[^>]*type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (importMapMatch && /\bimport\s/.test(js)) {
    try {
      const importMap = JSON.parse(importMapMatch[1]);
      if (importMap.imports) {
        useModule = true;
        // Sort by key length descending so longer prefixes match first
        const entries = Object.entries(importMap.imports)
          .sort(([a], [b]) => b.length - a.length);
        for (const [specifier, url] of entries) {
          const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          if (specifier.endsWith("/")) {
            // Prefix mapping: 'three/addons/foo' → full CDN URL
            transformedJs = transformedJs.replace(
              new RegExp(`(from\\s+['"])${escaped}`, "g"),
              `$1${url}`,
            );
          } else {
            // Exact mapping: 'three' → 'https://esm.sh/three@0.171.0'
            transformedJs = transformedJs.replace(
              new RegExp(`(from\\s+['"])${escaped}(['"])`, "g"),
              `$1${url}$2`,
            );
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Read title from frontmatter
  const mdxPath = path.join(CONTENT_DIR, `resources/${slug}/index.mdx`);
  let title = slug;
  if (existsSync(mdxPath)) {
    const mdx = readFileSync(mdxPath, "utf-8");
    const titleMatch = mdx.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) title = titleMatch[1];
  }

  return {
    slug,
    prefill: {
      title: `${title} — stealthis.dev`,
      description: `Source: https://stealthis.dev/r/${slug}`,
      html: htmlFinal.trim(),
      css: fullCss,
      js: transformedJs,
      css_external: cssExternal.join(";"),
      ...(useModule && { js_module: true }),
      editors: "111",
      layout: "top",
    },
  };
}

const items = slugs.map(buildPrefill).filter(Boolean);

if (items.length === 0) {
  console.error("No valid resources found.");
  process.exit(1);
}

// Generate HTML page with forms
const formsHtml = items
  .map(({ slug, prefill }) => {
    const dataValue = JSON.stringify(prefill)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `
    <div style="margin:20px 0;padding:20px;border:1px solid #333;border-radius:12px;background:#1a1a2e">
      <h2 style="margin:0 0 8px;color:#e2e8f0">${prefill.title}</h2>
      <p style="margin:0 0 16px;color:#64748b;font-size:14px">${slug}</p>
      <form action="https://codepen.io/pen/define" method="POST" target="_blank">
        <input type="hidden" name="data" value="${dataValue}">
        <button type="submit" style="
          padding:10px 24px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:white;
          border:none;
          border-radius:8px;
          font-size:15px;
          font-weight:600;
          cursor:pointer;
        ">
          Create Pen on CodePen →
        </button>
      </form>
      <p style="margin:8px 0 0;color:#475569;font-size:12px">
        After saving, copy the pen URL and add it to the resource frontmatter.
      </p>
    </div>`;
  })
  .join("\n");

const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Create CodePens — StealThis</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; background: #0f0f23; color: #e2e8f0; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #64748b; margin-bottom: 32px; }
  </style>
</head>
<body>
  <h1>Create CodePens</h1>
  <p class="subtitle">Click each button to create a pre-filled pen. Save it on CodePen, then copy the URL back to the resource frontmatter.</p>
  ${formsHtml}
</body>
</html>`;

const outPath = path.resolve(__dirname, "codepen-prefill.html");
writeFileSync(outPath, pageHtml);
console.log(`✦ Generated ${outPath}`);
console.log(`  ${items.length} pen(s) ready to create.`);

// Try to open in browser
try {
  if (process.platform === "darwin") {
    execSync(`open "${outPath}"`);
  } else if (process.platform === "linux") {
    execSync(`xdg-open "${outPath}"`);
  }
  console.log("  Opened in browser.");
} catch {
  console.log("  Open the file in your browser to create the pens.");
}
