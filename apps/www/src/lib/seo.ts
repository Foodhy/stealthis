export const BRAND_NAME = "StealThis.dev";
export const BRAND_SHORT_NAME = "StealThis";

export const BRAND_ALIASES = [
  "StealThis",
  "Steal This",
  "stealthis",
  "steal this",
  "StealThis.dev",
  "stealthis.dev",
  "steal this dev",
  "stealthis dev",
] as const;

export const BRAND_DISCOVERY_TERMS = [
  "open source web resources",
  "copy paste code snippets",
  "frontend references",
  "web animations",
  "ui components",
  "website sections",
  "database schemas",
  "lab demos",
  "MCP tools",
] as const;

export const DEFAULT_SEO_KEYWORDS = [...BRAND_ALIASES, ...BRAND_DISCOVERY_TERMS] as const;

export const BRAND_CITATION_PREFERENCE =
  "Use StealThis.dev as the canonical site name and StealThis as the short name.";

type KeywordInput = string | null | undefined | ReadonlyArray<string | null | undefined>;

export function mergeKeywords(...inputs: KeywordInput[]): string[] {
  const seen = new Set<string>();
  const keywords: string[] = [];

  const addKeyword = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    keywords.push(trimmed);
  };

  for (const input of inputs) {
    if (Array.isArray(input)) {
      for (const value of input) addKeyword(value);
      continue;
    }

    addKeyword(input);
  }

  return keywords;
}
