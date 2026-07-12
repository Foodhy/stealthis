import { type Highlighter, createHighlighter } from "shiki";

const THEME = "github-dark-dimmed";
const LANGS = ["css", "html", "javascript", "tsx", "json", "typescript"] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

function stripCodeWrapper(html: string): string {
  const match = html.match(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/i);
  return match ? match[1] : html;
}

export function detectCodeLang(source: string): string {
  const trimmed = source.trim();
  if (trimmed.startsWith("<") || trimmed.includes("<!doctype")) return "html";
  if (trimmed.includes("function ") || trimmed.includes("const ") || trimmed.includes("=>"))
    return "javascript";
  return "css";
}

export async function highlightToInnerHtml(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  const safeLang = LANGS.includes(lang as (typeof LANGS)[number]) ? lang : "css";
  const html = hl.codeToHtml(code, { lang: safeLang, theme: THEME });
  return stripCodeWrapper(html);
}

export async function highlightLine(code: string, lang: string): Promise<string> {
  return highlightToInnerHtml(code.length > 0 ? code : " ", lang);
}

export type CompleteBlank = { key: string; size: number };

import { splitTemplate, type TemplateSegment } from "./complete-segments";

export type RenderedSegment =
  | { type: "code"; html: string }
  | { type: "blank"; key: string };

/** Highlight a fill-in template as alternating code + blank slots (no Shiki on blanks). */
export async function renderSegmentedTemplate(
  template: string,
  lang?: string
): Promise<{ segments: RenderedSegment[]; lang: string }> {
  const resolvedLang = lang ?? detectCodeLang(template);
  const parts = splitTemplate(template);
  const segments: RenderedSegment[] = [];

  for (const part of parts) {
    if (part.type === "blank") {
      segments.push({ type: "blank", key: part.key });
    } else if (part.text.length > 0) {
      const html = await highlightToInnerHtml(part.text, resolvedLang);
      segments.push({ type: "code", html });
    }
  }

  return { segments, lang: resolvedLang };
}

/** @deprecated Use renderSegmentedTemplate — Shiki splits placeholder tokens. */
export async function highlightCompleteTemplate(
  template: string,
  blanks: CompleteBlank[],
  lang?: string
): Promise<string> {
  const resolvedLang = lang ?? detectCodeLang(template);
  const phToKey = new Map<string, string>();
  const phToSize = new Map<string, number>();

  let prepared = template;
  blanks.forEach((blank, i) => {
    const ph = `arcadeBlank${i}`;
    phToKey.set(ph, blank.key);
    phToSize.set(ph, blank.size);
    prepared = prepared.replace(new RegExp(`\\{\\{${blank.key}\\}\\}`, "g"), ph);
  });

  let html = await highlightToInnerHtml(prepared, resolvedLang);

  for (const [ph, key] of phToKey) {
    const size = phToSize.get(ph) ?? 8;
    const input = `<input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" class="complete-blank" data-blank-key="${key}" size="${size}" />`;
    // Shiki may wrap the placeholder in one or more spans — replace contiguous ph text.
    html = html.replace(new RegExp(ph, "g"), input);
  }

  return html;
}

/** Full block with pre/code wrapper for identify challenges. */
export async function highlightCodeBlock(code: string, lang?: string): Promise<string> {
  const resolvedLang = lang ?? detectCodeLang(code);
  const hl = await getHighlighter();
  const safeLang = LANGS.includes(resolvedLang as (typeof LANGS)[number]) ? resolvedLang : "css";
  return hl.codeToHtml(code, { lang: safeLang, theme: THEME });
}
