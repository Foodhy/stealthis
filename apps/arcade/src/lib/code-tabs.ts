import { join } from "node:path";
import { loadChallenges, readSnippet } from "@schema";
import type { ChallengeMetaOutput } from "@schema";
import { detectCodeLang } from "./highlight";
import { parseSrcdocFragments } from "./sandbox";
export interface CodeTab {
  id: string;
  label: string;
  code: string;
  lang: string;
}

const contentDir = join(process.cwd(), "..", "..", "packages", "content");

export async function loadResourceCodeTabs(resourceSlug: string): Promise<CodeTab[]> {
  const tabs: CodeTab[] = [];
  const html = readSnippet(contentDir, resourceSlug, "html");
  const css = readSnippet(contentDir, resourceSlug, "style");
  const js = readSnippet(contentDir, resourceSlug, "script");
  if (html) tabs.push({ id: "html", label: "HTML", code: html, lang: "html" });
  if (css) tabs.push({ id: "css", label: "CSS", code: css, lang: "css" });
  if (js) tabs.push({ id: "js", label: "JS", code: js, lang: "javascript" });
  return tabs;
}

export function codeTabsFromInline(source: string, lang = "html"): CodeTab[] {
  const fragments = parseSrcdocFragments(source);
  const tabs: CodeTab[] = [];
  if (fragments.html) tabs.push({ id: "html", label: "HTML", code: fragments.html, lang: "html" });
  if (fragments.css) tabs.push({ id: "css", label: "CSS", code: fragments.css, lang: "css" });
  if (fragments.js) tabs.push({ id: "js", label: "JS", code: fragments.js, lang: "javascript" });
  if (tabs.length === 0 && source) tabs.push({ id: "code", label: "Code", code: source, lang });
  return tabs;
}

export async function codeTabsForChallenge(challenge: ChallengeMetaOutput): Promise<CodeTab[]> {
  if (challenge.resourceSlug) {
    const resourceTabs = await loadResourceCodeTabs(challenge.resourceSlug);
    if (resourceTabs.length > 0) return resourceTabs;
  }

  if (challenge.type === "fix") {
    return codeTabsFromInline(challenge.solution);
  }
  if (challenge.type === "complete") {
    const lang = detectCodeLang(challenge.template);
    const filled = challenge.template.replace(
      /\{\{(BLANK_[A-Za-z0-9_]+)\}\}/g,
      (_, key: string) => challenge.answers[key] ?? key
    );
    return [{ id: "solution", label: "Solution", code: filled, lang }];
  }
  if (challenge.type === "identify") {
    return [{ id: "code", label: "Code", code: challenge.code, lang: "css" }];
  }
  return [];
}

export async function getPublishedChallenges(): Promise<ChallengeMetaOutput[]> {
  const all = await loadChallenges(contentDir);
  return all.filter((c) => c.quality === "published");
}
