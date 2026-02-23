#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RESOURCES_DIR = path.join(ROOT, "packages/content/resources");
const TODAY = "2026-02-21";

const SOURCES = [
  {
    key: "libs-gen",
    prefix: "lg",
    root: path.resolve(ROOT, "../libs-gen"),
    registry: "demos/registry/demos.json",
  },
  {
    key: "libs-genclaude",
    prefix: "lgc",
    root: path.resolve(ROOT, "../libs-genclaude"),
    registry: "demos/registry.json",
  },
];

const SPECIFIER_REWRITE_MAP = new Map([
  // Legacy libs-gen CDN imports -> local import-map specifiers.
  ["https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js", "three"],
  [
    "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js",
    "three/addons/postprocessing/EffectComposer.js",
  ],
  [
    "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/RenderPass.js",
    "three/addons/postprocessing/RenderPass.js",
  ],
  [
    "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js",
    "three/addons/postprocessing/UnrealBloomPass.js",
  ],
]);

const LOCAL_IMPORT_MAP = {
  imports: {
    gsap: "/vendor/gsap/index.js",
    "gsap/ScrollTrigger": "/vendor/gsap/ScrollTrigger.js",
    "gsap/SplitText": "/vendor/gsap/SplitText.js",
    "gsap/Flip": "/vendor/gsap/Flip.js",
    "gsap/ScrambleTextPlugin": "/vendor/gsap/ScrambleTextPlugin.js",
    "gsap/TextPlugin": "/vendor/gsap/TextPlugin.js",
    "gsap/all": "/vendor/gsap/all.js",
    "gsap/": "/vendor/gsap/",
    lenis: "/vendor/lenis/dist/lenis.mjs",
    three: "/vendor/three/build/three.module.js",
    "three/addons/": "/vendor/three/examples/jsm/",
  },
};

const LENIS_CSS_SHIM = `
html.lenis,
html.lenis body {
  height: auto;
}

.lenis:not(.lenis-autoToggle).lenis-stopped {
  overflow: clip;
}

.lenis [data-lenis-prevent],
.lenis [data-lenis-prevent-wheel],
.lenis [data-lenis-prevent-touch] {
  overscroll-behavior: contain;
}

.lenis.lenis-smooth iframe {
  pointer-events: none;
}

.lenis.lenis-autoToggle {
  transition-property: overflow;
  transition-duration: 1ms;
  transition-behavior: allow-discrete;
}
`.trim();

const SHARED_STUBS = {
  initCursorSystem: `
function initCursorSystem() {
  return { setEnabled() {}, destroy() {} };
}
`.trim(),
  initSpotlightOverlay: `
function initSpotlightOverlay() {
  return { setEnabled() {}, destroy() {} };
}
`.trim(),
  initSectionTransitionOrchestrator: `
function initSectionTransitionOrchestrator() {
  return { destroy() {} };
}
`.trim(),
  createTimelineDebugger: `
function createTimelineDebugger() {
  return { log() {}, destroy() {} };
}
`.trim(),
  initPerformanceMonitor: `
function initPerformanceMonitor() {
  return {
    onUpdate() {
      return () => {};
    },
    destroy() {},
  };
}
`.trim(),
  applyLowPowerClass: `
function applyLowPowerClass() {
  return { enabled: false, reasons: [] };
}
`.trim(),
  createCleanupRegistry: `
function createCleanupRegistry() {
  const callbacks = [];
  return {
    add(fn) {
      if (typeof fn === "function") callbacks.push(fn);
    },
    run() {
      for (const fn of callbacks.splice(0)) {
        try {
          fn();
        } catch {}
      }
    },
  };
}
`.trim(),
  initSoundReactiveHooks: `
async function initSoundReactiveHooks() {
  return {
    supported: false,
    reason: "shared module unavailable in imported version",
    getLevel() {
      return 0;
    },
    destroy() {},
  };
}
`.trim(),
};

const COMPAT_MOTION_SNIPPET = `
if (!window.MotionPreference) {
  const __mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const __listeners = new Set();

  const MotionPreference = {
    prefersReducedMotion() {
      return __mql.matches;
    },
    setOverride(value) {
      const reduced = Boolean(value);
      document.documentElement.classList.toggle("reduced-motion", reduced);
      window.dispatchEvent(new CustomEvent("motion-preference", { detail: { reduced } }));
      for (const listener of __listeners) {
        try {
          listener({ reduced, override: reduced, systemReduced: __mql.matches });
        } catch {}
      }
    },
    onChange(listener) {
      __listeners.add(listener);
      try {
        listener({
          reduced: __mql.matches,
          override: null,
          systemReduced: __mql.matches,
        });
      } catch {}
      return () => __listeners.delete(listener);
    },
    getState() {
      return { reduced: __mql.matches, override: null, systemReduced: __mql.matches };
    },
  };

  window.MotionPreference = MotionPreference;
}
`.trim();

main();

function main() {
  let created = 0;
  let updated = 0;
  let withLabRoute = 0;

  for (const source of SOURCES) {
    const registryPath = path.join(source.root, source.registry);
    const entries = JSON.parse(readFileSync(registryPath, "utf8"));

    for (const entry of entries) {
      const demoDir = path.join(source.root, "demos", entry.id);
      const htmlPath = path.join(demoDir, "index.html");
      const cssPath = path.join(demoDir, "styles.css");
      const jsPath = path.join(demoDir, "main.js");

      if (!existsSync(htmlPath) || !existsSync(cssPath) || !existsSync(jsPath)) {
        console.warn(`[skip] Missing snippet files for ${source.key}:${entry.id}`);
        continue;
      }

      const rawHtml = readFileSync(htmlPath, "utf8");
      const rawCss = readFileSync(cssPath, "utf8");
      const rawJs = readFileSync(jsPath, "utf8");

      const rewrite = rewriteScript(rawJs);
      const isModule = /^\s*import\s/m.test(rewrite.script);
      const html = rewriteHtml(rawHtml, isModule, rewrite.needsLenisCssShim);
      const css = rawCss.replace(/\r\n/g, "\n");

      const slug = `${source.prefix}-${entry.id}`;
      const mapped = mapCategoryAndType(source.key, entry);
      const difficulty = normalizeDifficulty(entry.difficulty);
      const tech = normalizeTech(entry.tech);
      const tags = buildTags(source.key, entry.id, tech, mapped.category);
      const description = sanitizeText(
        source.key === "libs-genclaude" ? entry.description : entry.notes
      );
      const notes = sanitizeText(entry.notes || entry.description || "");
      const resourceDir = path.join(RESOURCES_DIR, slug);
      const snippetsDir = path.join(resourceDir, "snippets");
      const hadExisting = existsSync(resourceDir);
      const labRoute = `/${mapped.category}/${slug}`;

      mkdirSync(snippetsDir, { recursive: true });
      writeFileSync(
        path.join(resourceDir, "index.mdx"),
        buildMdx({
          slug,
          title: `${entry.title}`,
          description: description || `Imported example from ${source.key}: ${entry.title}.`,
          category: mapped.category,
          type: mapped.type,
          tags,
          tech,
          difficulty,
          targets: ["html"],
          labRoute,
          source: source.key,
          sourceId: entry.id,
          notes,
        })
      );
      writeFileSync(path.join(snippetsDir, "html.html"), html);
      writeFileSync(path.join(snippetsDir, "style.css"), css);
      writeFileSync(path.join(snippetsDir, "script.js"), rewrite.script);

      if (hadExisting) {
        updated += 1;
      } else {
        created += 1;
      }
      withLabRoute += 1;
    }
  }

  console.log(`[import] created: ${created}, updated: ${updated}, lab routes: ${withLabRoute}`);
}

function sanitizeText(value) {
  if (!value) return "";
  return String(value).replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

function normalizeTech(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeDifficulty(value) {
  if (value === "easy" || value === "med" || value === "hard") return value;
  if (value === "beginner") return "easy";
  if (value === "intermediate") return "med";
  if (value === "advanced") return "hard";
  return "med";
}

function mapCategoryAndType(sourceKey, entry) {
  if (sourceKey === "libs-genclaude") {
    switch (entry.category) {
      case "scroll":
      case "3d":
        return { category: "web-animations", type: "animation" };
      case "transitions":
      case "css-canvas":
        return { category: "patterns", type: "pattern" };
      case "pages":
        return { category: "pages", type: "page" };
      default:
        return { category: "patterns", type: "pattern" };
    }
  }

  const id = String(entry.id || "");
  if (id.includes("concept-")) return { category: "pages", type: "page" };
  if (
    id.includes("view-transition") ||
    id.includes("interaction") ||
    id.includes("webcam") ||
    id.includes("midi") ||
    id.includes("webgpu") ||
    id.includes("multiplayer") ||
    id.includes("shader-playground") ||
    id.includes("mouse-light-magnetic")
  ) {
    return { category: "patterns", type: "pattern" };
  }
  return { category: "web-animations", type: "animation" };
}

function buildTags(sourceKey, id, tech, mappedCategory) {
  const sourceTag =
    sourceKey === "libs-genclaude" ? "imported-libs-genclaude" : "imported-libs-gen";
  const normalizedIdTokens = String(id)
    .replace(/^[0-9]+-/, "")
    .split("-")
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token && !/^[0-9]+$/.test(token));
  const techTags = tech.map((token) =>
    token
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
  return [...new Set([sourceTag, mappedCategory, ...normalizedIdTokens, ...techTags])]
    .filter(Boolean)
    .slice(0, 20);
}

function rewriteHtml(input, isModule, needsLenisCssShim = false) {
  let html = input.replace(/\r\n/g, "\n");
  const scriptTag = isModule
    ? '<script type="module" src="script.js"></script>'
    : '<script src="script.js"></script>';

  html = html.replace(/<link[^>]+href=["'][^"']*shared\/[^"']+["'][^>]*>\s*/gi, "");
  html = html.replace(/<script[^>]+src=["'][^"']*shared\/[^"']+["'][^>]*>\s*<\/script>\s*/gi, "");

  html = html.replace(/href=(['"])(?:\.\/)?styles\.css\1/gi, 'href="style.css"');
  html = html.replace(/href=(['"])(?:\.\/)?style\.css\1/gi, 'href="style.css"');

  let replacedMain = false;
  html = html.replace(/<script\b[^>]*\bsrc=(['"])(?:\.\/)?main\.js\1[^>]*>\s*<\/script>/gi, () => {
    replacedMain = true;
    return scriptTag;
  });

  if (!replacedMain && !/src=(['"])(?:\.\/)?script\.js\1/i.test(html)) {
    html = html.replace(/<\/body>/i, `  ${scriptTag}\n</body>`);
  }

  if (isModule && !/<script[^>]*type=["']importmap["'][^>]*>/i.test(html)) {
    const importMapTag = `<script type="importmap">${JSON.stringify(LOCAL_IMPORT_MAP)}</script>`;
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `  ${importMapTag}\n</head>`);
    } else {
      html = `${importMapTag}\n${html}`;
    }
  }

  if (needsLenisCssShim && !/html\.lenis[\s,]/i.test(html)) {
    const lenisStyleTag = `<style>${LENIS_CSS_SHIM}</style>`;
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `  ${lenisStyleTag}\n</head>`);
    } else {
      html = `${lenisStyleTag}\n${html}`;
    }
  }

  return html;
}

function rewriteScript(input) {
  let script = input.replace(/\r\n/g, "\n");
  const needsLenisCssShim = /^\s*import\s+['"]lenis\/dist\/lenis\.css['"];\s*$/m.test(script);

  let needsInitDemoShellShim = false;
  let needsPrefersReducedMotionShim = false;
  const neededSharedStubs = new Set();

  script = script.replace(
    /^\s*import\s+\{\s*initDemoShell\s*\}\s+from\s+['"]\/shared\/demo-shell\.js['"];\s*$/gm,
    () => {
      needsInitDemoShellShim = true;
      return "";
    }
  );

  script = script.replace(
    /^\s*import\s+\{\s*prefersReducedMotion\s*\}\s+from\s+['"]\/shared\/a11y\.js['"];\s*$/gm,
    () => {
      needsPrefersReducedMotionShim = true;
      return "";
    }
  );

  script = script.replace(
    /^\s*import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]\.\.\/\.\.\/shared\/[^'"]+['"];\s*$/gm,
    (_match, names) => {
      for (const part of String(names).split(",")) {
        const name = part.trim();
        if (name) neededSharedStubs.add(name);
      }
      return "";
    }
  );

  script = script.replace(
    /import\(\s*["']\.\.\/\.\.\/shared\/interaction\/sound-reactive-hooks\.js["']\s*\)/g,
    "Promise.resolve({ initSoundReactiveHooks })"
  );

  script = script.replace(/^\s*import\s+['"]lenis\/dist\/lenis\.css['"];\s*$/gm, "");

  script = script.replace(/from\s+(['"])([^'"]+)\1/g, (match, quote, specifier) => {
    const mapped = SPECIFIER_REWRITE_MAP.get(specifier);
    if (!mapped) return match;
    return `from ${quote}${mapped}${quote}`;
  });

  const preludeParts = [COMPAT_MOTION_SNIPPET];
  if (needsPrefersReducedMotionShim) {
    preludeParts.push(
      `
function prefersReducedMotion() {
  return window.MotionPreference.prefersReducedMotion();
}
`.trim()
    );
  }
  if (needsInitDemoShellShim) {
    preludeParts.push(
      `
function initDemoShell() {
  // No-op shim in imported standalone snippets.
}
`.trim()
    );
  }

  for (const name of neededSharedStubs) {
    if (SHARED_STUBS[name]) {
      preludeParts.push(SHARED_STUBS[name]);
      continue;
    }
    preludeParts.push(
      `
function ${name}() {
  return {
    destroy() {},
    setEnabled() {},
    add() {},
    run() {},
    onUpdate() {
      return () => {};
    },
    log() {},
  };
}
`.trim()
    );
  }

  script = `${preludeParts.join("\n\n")}\n\n${script.trim()}\n`;
  return { script, needsLenisCssShim };
}

function buildMdx({
  slug,
  title,
  description,
  category,
  type,
  tags,
  tech,
  difficulty,
  targets,
  labRoute,
  source,
  sourceId,
  notes,
}) {
  const body = notes || "Imported and adapted from the source demo.";
  return `---
slug: ${slug}
title: ${toQuoted(title)}
description: ${toQuoted(description)}
category: ${category}
type: ${type}
tags: ${toInlineArray(tags)}
tech: ${toInlineArray(tech)}
difficulty: ${difficulty}
targets: ${toInlineArray(targets)}
labRoute: ${labRoute}
license: MIT
createdAt: ${TODAY}
updatedAt: ${TODAY}
---

## ${title}

${description}

### Source

- Repository: \`${source}\`
- Original demo id: \`${sourceId}\`

### Notes

${body}
`;
}

function toInlineArray(values) {
  return `[${values.map((value) => toQuoted(value)).join(", ")}]`;
}

function toQuoted(value) {
  return JSON.stringify(String(value));
}
