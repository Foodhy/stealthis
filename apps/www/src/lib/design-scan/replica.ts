/**
 * La réplica simple de la página.
 *
 * Es el paso que faltaba. Antes se pasaba del DESIGN.md directo a buscar
 * componentes en el catálogo, y el resultado eran recursos ajenos —una cita
 * dental, un feed de fotos— pintados con la paleta del sitio. Eso no recrea
 * nada.
 *
 * Aquí el modelo reconstruye la PÁGINA: su navegación, su titular, sus
 * secciones, con los tokens extraídos. No busca ser idéntica al píxel; busca
 * ser reconocible, y servir de base para lo que venga después.
 *
 * Su prompt es propio y distinto del de la prosa, porque el trabajo es otro:
 * allí se pedía criterio escrito, aquí se pide maquetación.
 */

import { type ChatMessage, chat } from "@stealthis/ai-providers";
import type { AiProviderConfig } from "@stealthis/ai-providers";
import type { MatchResult } from "./mcp";
import { stripMcpSnippetHeader } from "@lib/codepen-prefill";
import { applyTokens } from "./recreate";
import type { PageStructure } from "./structure";
import type { Frontmatter } from "./tokens";
import type { Brief } from "./types";

export type Replica = {
  html: string;
  css: string;
  /** Lo que se limpió de la respuesta del modelo, para poder enseñarlo. */
  stripped: string[];
};

export type CatalogPiece = {
  role: string;
  slug: string;
  html: string;
  css: string;
};

const SYSTEM = `You compose a polished rebuild of a web page from its design system and stealthis catalog snippets.

You are given: CSS variable names from DESIGN.md, the page structure (nav, headline, sections, form controls), re-skinned HTML/CSS fragments from the catalog (one per matched role), and optional notes from the person asking.

What is expected:
- Compose header, main, and footer for THAT page: same navigation labels, same headline, same sections in order, real copy from the structure — never lorem ipsum.
- Where catalog snippets are provided for a role (search-field, button-primary, nav-link, etc.), embed or adapt that markup inside the layout. Do not ignore them.
- Where a role has no snippet, build minimal semantic markup styled with the tokens.
- Use only CSS variables: var(--color-primary), var(--text-headline-lg), var(--spacing-lg), var(--radius-md). Never hardcode colours, font sizes, or radii.
- Semantic HTML: header, nav, main, section, footer. Use grid/flex for alignment and consistent spacing rhythm.
- Aim for a professional, recognizable layout — tight spacing, clear hierarchy, balanced whitespace — not a wireframe.

Hard rules:
- No <script> and no inline event handlers.
- No external URLs: no images, fonts, or stylesheets. Logos/images: a sized block with neutral surface colour and optional initials text — not a solid primary-colour rectangle.
- No <html>, <head>, or <body> wrapper: body content only.
- Plain CSS only in the JSON css field. Merge snippet styles with layout styles; prefix snippet selectors if needed to avoid clashes.

Answer with JSON only, no markdown fence:
{ "html": "<header>…</header><main>…</main><footer>…</footer>", "css": "header { … }" }`;

/** Resume la estructura para el prompt, sin volcar el HTML entero. */
function describeStructure(structure: PageStructure): string {
  const lines: string[] = [];
  if (structure.headline) lines.push(`Headline (h1): ${structure.headline}`);
  if (structure.nav.length) lines.push(`Navigation: ${structure.nav.join(" · ")}`);
  if (structure.submitLabels.length) {
    lines.push(`Buttons / submits: ${structure.submitLabels.join(" · ")}`);
  }

  if (structure.sections.length) {
    lines.push("Sections, in order:");
    for (const s of structure.sections) {
      const repeated = s.repeated >= 2 ? ` — ${s.repeated} repeated blocks inside` : "";
      lines.push(`  h${s.level}: ${s.heading}${repeated}`);
      if (s.excerpt) lines.push(`      text: ${s.excerpt.slice(0, 160)}`);
    }
  }

  if (structure.formFields.length) lines.push(`Form fields: ${structure.formFields.join(", ")}`);
  if (structure.hasFooter) lines.push("The page has a footer.");
  return lines.join("\n");
}

/** Los nombres de variables CSS que el modelo puede usar, sacados del propio DESIGN.md. */
function listVariables(front: Frontmatter): string {
  const names: string[] = [];
  for (const name of Object.keys(front.colors ?? {})) names.push(`--color-${name}`);
  for (const name of Object.keys(front.typography ?? {})) names.push(`--text-${name}`);
  for (const name of Object.keys(front.rounded ?? {})) names.push(`--radius-${name}`);
  for (const name of Object.keys(front.spacing ?? {})) names.push(`--spacing-${name}`);
  return names.join(", ");
}

function describeCatalogPieces(pieces: CatalogPiece[]): string {
  if (!pieces.length) {
    return "No catalog snippets matched — build all UI from tokens and structure.";
  }
  const blocks: string[] = ["Catalog snippets (re-skinned with this site's tokens):"];
  for (const piece of pieces) {
    blocks.push(
      "",
      `Role: ${piece.role} (resource: ${piece.slug})`,
      "HTML:",
      piece.html.slice(0, 2200),
      "CSS:",
      piece.css.slice(0, 2200)
    );
  }
  return blocks.join("\n");
}

/** Snippets del catálogo ya revestidos, listos para componer la página. */
export function catalogPiecesFromMatch(front: Frontmatter, match: MatchResult): CatalogPiece[] {
  const pieces: CatalogPiece[] = [];
  for (const row of match.matches) {
    const slug = row.candidates[0]?.slug;
    if (!slug) continue;
    const raw = match.snippets[slug];
    if (!raw?.html) continue;
    const html = stripMcpSnippetHeader(raw.html);
    const rawCss = stripMcpSnippetHeader(raw.css ?? "");
    const skinned = applyTokens(rawCss, front);
    pieces.push({
      role: row.component,
      slug,
      html,
      css: skinned.css,
    });
  }
  return pieces;
}

export function buildReplicaPrompt(
  front: Frontmatter,
  structure: PageStructure,
  brief: Brief,
  body: string,
  catalogPieces: CatalogPiece[] = []
): ChatMessage[] {
  const parts = [
    `Site: ${front.name}`,
    "",
    "Available CSS variables (these exist; nothing else does):",
    listVariables(front),
    "",
    "Structure read from the page's own markup:",
    describeStructure(structure),
    "",
    describeCatalogPieces(catalogPieces),
  ];

  // La prosa del DESIGN.md es el criterio de la marca: sin ella, la réplica
  // tendría los colores correctos y ninguna razón para usarlos como los usa.
  if (body.trim()) {
    parts.push("", "Design rationale from the DESIGN.md:", body.slice(0, 2500));
  }

  // Lo que pidió el usuario va AL FINAL y marcado como prioritario: es lo único
  // del prompt que viene de una persona y no de una máquina leyendo HTML.
  if (brief.notes.trim()) {
    parts.push(
      "",
      "The person asking for this said — follow it over your own judgement:",
      brief.notes
    );
  }
  if (brief.reference.trim()) {
    parts.push("", "They also pasted this as a reference:", brief.reference.slice(0, 3000));
  }

  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: parts.join("\n") },
  ];
}

/** Extrae el JSON aunque venga envuelto en explicaciones o en un fence. */
export function parseReplicaResponse(raw: string): { html: string; css: string } {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? raw).trim();

  const attempt = (text: string) => {
    const parsed = JSON.parse(text) as { html?: unknown; css?: unknown };
    return {
      html: typeof parsed.html === "string" ? parsed.html : "",
      css: typeof parsed.css === "string" ? parsed.css : "",
    };
  };

  try {
    return attempt(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("The model did not return JSON.");
    return attempt(candidate.slice(start, end + 1));
  }
}

/**
 * Limpia lo que no debe llegar al iframe y anota qué se quitó.
 *
 * Aunque la vista previa vaya en un `sandbox=""`, esto no es defensa duplicada
 * por gusto: el HTML y el CSS se pueden copiar y pegar en un proyecto de verdad,
 * y ahí ya no hay sandbox que los contenga.
 */
export function sanitize(html: string, css: string): Replica {
  const stripped: string[] = [];

  let cleanHtml = html;
  const scripts = cleanHtml.match(/<script[\s\S]*?<\/script>/gi)?.length ?? 0;
  if (scripts) {
    cleanHtml = cleanHtml.replace(/<script[\s\S]*?<\/script>/gi, "");
    stripped.push(`${scripts} <script> block(s)`);
  }

  const handlers = cleanHtml.match(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi)?.length ?? 0;
  if (handlers) {
    cleanHtml = cleanHtml.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "");
    stripped.push(`${handlers} inline event handler(s)`);
  }

  // Un recurso externo delataría al visitante y rompería el aislamiento.
  const externalSrc =
    cleanHtml.match(/\s(?:src|href)\s*=\s*("|')https?:\/\/[^"']*\1/gi)?.length ?? 0;
  if (externalSrc) {
    cleanHtml = cleanHtml.replace(/\s(src|href)\s*=\s*("|')https?:\/\/[^"']*\2/gi, ' $1="#"');
    stripped.push(`${externalSrc} external URL(s) in the markup`);
  }

  // El envoltorio se quita si el modelo lo mandó a pesar de la instrucción.
  cleanHtml = cleanHtml
    .replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "")
    .replace(/<!doctype[^>]*>/gi, "")
    .trim();

  let cleanCss = css;
  const imports = cleanCss.match(/@import[^;]*;/gi)?.length ?? 0;
  if (imports) {
    cleanCss = cleanCss.replace(/@import[^;]*;/gi, "");
    stripped.push(`${imports} @import rule(s)`);
  }

  const urls = cleanCss.match(/url\(\s*['"]?https?:\/\/[^)]*\)/gi)?.length ?? 0;
  if (urls) {
    cleanCss = cleanCss.replace(/url\(\s*['"]?https?:\/\/[^)]*\)/gi, "none");
    stripped.push(`${urls} external url() in the CSS`);
  }

  return { html: cleanHtml, css: cleanCss.trim(), stripped };
}

export type ReplicaInput = {
  front: Frontmatter;
  structure: PageStructure;
  brief: Brief;
  /** El cuerpo en prosa del DESIGN.md, si la fase anterior lo produjo. */
  designBody: string;
  catalogPieces?: CatalogPiece[];
  config: AiProviderConfig;
  signal?: AbortSignal;
};

export async function runReplicaPhase(input: ReplicaInput): Promise<Replica> {
  if (!input.config.model) throw new Error("Pick a model first — this phase needs one.");
  if (input.config.provider !== "ollama" && !input.config.apiKey)
    throw new Error("This provider needs an API key before the phase can run.");

  const answer = await chat({
    config: input.config,
    messages: buildReplicaPrompt(
      input.front,
      input.structure,
      input.brief,
      input.designBody,
      input.catalogPieces ?? []
    ),
    ...(input.signal ? { signal: input.signal } : {}),
  });

  if (!answer.trim()) throw new Error("The model returned an empty response.");

  const { html, css } = parseReplicaResponse(answer);
  if (!html.trim()) throw new Error("The model returned no markup for the page.");

  return sanitize(html, css);
}
