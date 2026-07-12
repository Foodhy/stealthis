import { join } from "node:path";
import { readSnippet } from "@schema";
import type { CompleteChallenge } from "@schema";
import { fillTemplate } from "./complete-segments";
import { buildSrcdoc, parseSrcdocFragments } from "./sandbox";

const contentDir = join(process.cwd(), "..", "..", "packages", "content");

export function loadResourceHtml(resourceSlug: string): string | null {
  const html = readSnippet(contentDir, resourceSlug, "html");
  return html || null;
}

export function buildResourcePreviewSrcdoc(resourceSlug: string): string | null {
  const html = loadResourceHtml(resourceSlug);
  if (!html) return null;
  const css = readSnippet(contentDir, resourceSlug, "style") ?? "";
  const js = readSnippet(contentDir, resourceSlug, "script") ?? "";
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1]! : html;
  return buildSrcdoc(body, { css, js });
}

export function buildCompletePreviewSrcdoc(
  challenge: CompleteChallenge,
  blankValues: Record<string, string>,
  resourceHtml?: string | null
): string | null {
  const filled = fillTemplate(challenge.template, blankValues, "");
  const lang = challenge.template.trim().startsWith("<") ? "html" : "css";

  if (resourceHtml) {
    const bodyMatch = resourceHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1]! : resourceHtml;
    const headExtra = lang === "css" ? `<style>${filled}</style>` : "";
    return buildSrcdoc(`${headExtra}${body}`);
  }

  if (lang === "html" || filled.includes("<")) {
    const fragments = parseSrcdocFragments(filled);
    return buildSrcdoc(fragments.html, { css: fragments.css, js: fragments.js });
  }

  return buildSrcdoc("", { css: filled });
}

export function buildBrokenPreviewSrcdoc(
  challenge: CompleteChallenge,
  resourceHtml?: string | null
): string | null {
  const brokenValues: Record<string, string> = {};
  for (const key of Object.keys(challenge.answers)) {
    brokenValues[key] = "/* missing */";
  }
  return buildCompletePreviewSrcdoc(challenge, brokenValues, resourceHtml);
}
