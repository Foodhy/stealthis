/**
 * De dónde salen los nombres para la fase de emparejado con el catálogo.
 *
 * Antes bastaba con tirar un error si brief, estructura y prosa venían vacíos.
 * Eso cortaba el pipeline en páginas SPA o cuando el modelo no devolvía un bloque
 * `components` válido. Aquí se encadenan fuentes y, al final, heurísticas.
 */

import { detectComponents } from "./prose";
import { type PageStructure, readStructure } from "./structure";

export type ComponentNameSource = "brief" | "structure" | "prose" | "detected" | "defaults";

export type ResolvedComponentNames = {
  names: string[];
  source: ComponentNameSource;
  /** Aviso para la UI cuando no hubo detección fiable. */
  note?: string;
};

export type ResolveComponentNamesInput = {
  briefComponents: string[];
  html?: string;
  structure?: PageStructure;
  proseComponents?: Record<string, unknown>;
};

function unique(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function fallbackFromHtml(html: string): string[] {
  const names: string[] = [];
  if (
    /<(?:button|input)\b/i.test(html) ||
    /<a\b[^>]*class="[^"]*\b(btn|button|cta)\b/i.test(html)
  ) {
    names.push("button-primary");
  }
  if (/<input\b/i.test(html)) names.push("input-field");
  if (/<h1\b/i.test(html)) names.push("hero");
  if (/<nav\b/i.test(html) || (html.match(/<a\b/gi)?.length ?? 0) >= 3) names.push("nav-link");
  if (/<footer\b/i.test(html)) names.push("footer");
  if (names.length === 0) return ["button-primary", "card"];
  if (!names.includes("card")) names.push("card");
  return unique(names).slice(0, 8);
}

export function resolveComponentNames(input: ResolveComponentNamesInput): ResolvedComponentNames {
  const fromBrief = unique(input.briefComponents);
  if (fromBrief.length) return { names: fromBrief, source: "brief" };

  const structure = input.structure ?? (input.html ? readStructure(input.html) : undefined);
  const fromStructure = unique(structure?.components.map((c) => c.name) ?? []);
  if (fromStructure.length) return { names: fromStructure, source: "structure" };

  const fromProse = unique(Object.keys(input.proseComponents ?? {}));
  if (fromProse.length) return { names: fromProse, source: "prose" };

  const html = input.html ?? "";
  const detected = unique(detectComponents(html));
  if (detected.length) {
    return {
      names: detected,
      source: "detected",
      note: "No components were listed in your brief; matching from simple HTML heuristics.",
    };
  }

  const defaults = fallbackFromHtml(html);
  return {
    names: defaults,
    source: "defaults",
    note:
      structure?.warnings?.[0] ??
      "No components were detected in the capture; matching a small default set so later phases can continue.",
  };
}
