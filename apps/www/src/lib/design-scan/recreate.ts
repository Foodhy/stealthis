/**
 * Fase 5 — vestir los recursos del catálogo con los tokens de la página escaneada.
 *
 * Un snippet del catálogo trae sus propios colores, su tipografía y sus radios.
 * Pegarlo tal cual no recrea nada: se parece al catálogo, no al sitio. Aquí se
 * sustituyen sus valores por los tokens extraídos, con el mismo criterio de
 * roles que usó la extracción — el fondo dominante del snippet pasa a ser
 * nuestra superficie, su texto dominante nuestro `on-surface`, y su acento
 * nuestro `primary`.
 *
 * Se sustituyen valores concretos y no se aplica una capa de overrides a lo
 * bruto: un `!important` sobre todo dejaría el snippet plano y sin jerarquía.
 */

import { byFrequency, countBy, normalizeColor, readDeclarations, toPx } from "./css";
import { contrastRatio } from "./export";
import { type FontMode, SYSTEM_SANS, fontStack } from "./fonts";
import type { Frontmatter } from "./tokens";

/** Distancia entre dos colores en RGB. Suficiente para elegir el más parecido. */
function colorDistance(a: string, b: string): number {
  const parse = (hex: string) => {
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return m ? [1, 2, 3].map((i) => Number.parseInt(m[i], 16)) : null;
  };
  const ca = parse(a);
  const cb = parse(b);
  if (!ca || !cb) return Number.POSITIVE_INFINITY;
  return Math.sqrt((ca[0] - cb[0]) ** 2 + (ca[1] - cb[1]) ** 2 + (ca[2] - cb[2]) ** 2);
}

export type TokenPalette = {
  surface?: string;
  onSurface?: string;
  primary?: string;
  outline?: string;
  all: string[];
};

/** Saca de nuestro frontmatter los cuatro roles que hacen falta para revestir. */
export function paletteOf(front: Frontmatter): TokenPalette {
  const colors = front.colors ?? {};
  const values = Object.values(colors).filter((c) => /^#[0-9a-f]{6}$/i.test(c));

  const pick = (...names: string[]) => names.map((n) => colors[n]).find(Boolean);

  return {
    surface: pick("surface", "background", "bg", "base"),
    onSurface: pick("on-surface", "text", "foreground", "on-background"),
    primary: pick("primary", "accent", "brand"),
    outline: pick("outline", "border", "divider"),
    all: values,
  };
}

/**
 * Los colores del snippet, clasificados por el papel que juegan en él. Es la
 * misma lectura que hace la extracción, aplicada al recurso en vez de a la
 * página: así el reemplazo respeta la función de cada color y no solo su tono.
 */
function snippetRoles(css: string): { background?: string; text?: string; accent?: string } {
  const backgrounds: string[] = [];
  const texts: string[] = [];

  for (const { property, value } of readDeclarations(css)) {
    const color = normalizeColor(value) ?? normalizeColor(value.split(/\s+/)[0] ?? "");
    if (!color || !/^#[0-9a-f]{6}$/i.test(color)) continue;
    if (property.startsWith("background")) backgrounds.push(color);
    else if (property === "color") texts.push(color);
  }

  const background = byFrequency(countBy(backgrounds))[0];
  const text = byFrequency(countBy(texts))[0];

  // El acento es el fondo SATURADO más usado que no sea el dominante: el botón
  // de acción, no el telón de fondo. Sin exigir saturación, el fondo oscuro de
  // un modal se llevaba el papel de acento y acababa pintado del color de
  // marca, que es justo lo contrario de lo que hace ese color.
  const accent = background
    ? byFrequency(countBy(backgrounds)).find(
        (c) => colorDistance(c, background) > 60 && isSaturated(c)
      )
    : undefined;

  return {
    ...(background ? { background } : {}),
    ...(text ? { text } : {}),
    ...(accent ? { accent } : {}),
  };
}

/** Un gris, un blanco o un negro tienen los tres canales casi iguales. */
function isSaturated(hex: string): boolean {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return false;
  const [r, g, b] = [1, 2, 3].map((i) => Number.parseInt(m[i], 16));
  return Math.max(r, g, b) - Math.min(r, g, b) > 40;
}

export type RecreateResult = {
  css: string;
  /** Qué se cambió por qué, para poder enseñarlo en vez de que parezca magia. */
  swaps: { from: string; to: string; reason: string }[];
};

/** Sustituye colores, familia tipográfica y radios del snippet por los nuestros. */
export function applyTokens(
  snippetCss: string,
  front: Frontmatter,
  fontMode: FontMode = "system"
): RecreateResult {
  const palette = paletteOf(front);
  const roles = snippetRoles(snippetCss);
  const swaps: RecreateResult["swaps"] = [];

  const mapping = new Map<string, { to: string; reason: string }>();

  const assign = (from: string | undefined, to: string | undefined, reason: string) => {
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) return;
    if (mapping.has(from.toLowerCase())) return;
    mapping.set(from.toLowerCase(), { to, reason });
  };

  assign(roles.background, palette.surface, "dominant background → surface");
  assign(roles.text, palette.onSurface, "dominant text colour → on-surface");
  assign(roles.accent, palette.primary, "accent → primary");

  let css = snippetCss;

  // Primero los roles, que son los que dan el parecido.
  for (const [from, { to, reason }] of mapping) {
    const before = css;
    css = replaceColor(css, from, to);
    if (css !== before) swaps.push({ from, to, reason });
  }

  // El resto de colores van al token más cercano, para que no quede una mezcla
  // de la paleta del catálogo con la nuestra.
  if (palette.all.length > 0) {
    for (const color of collectColors(css)) {
      if (mapping.has(color.toLowerCase())) continue;
      if (palette.all.some((c) => c.toLowerCase() === color.toLowerCase())) continue;

      const nearest = palette.all.reduce((best, candidate) =>
        colorDistance(color, candidate) < colorDistance(color, best) ? candidate : best
      );
      const before = css;
      css = replaceColor(css, color, nearest);
      if (css !== before) swaps.push({ from: color, to: nearest, reason: "nearest token colour" });
    }
  }

  // Tipografía: una sola familia, la que domine en la página escaneada, y
  // SIEMPRE con pila de respaldo. Sustituirla por el nombre desnudo dejaba el
  // snippet en el serif inicial del navegador cuando la fuente no está
  // instalada — que es casi siempre, porque el iframe no descarga nada.
  const family = Object.values(front.typography ?? {}).find((t) => t.fontFamily)?.fontFamily;
  if (family) {
    const stack = fontStack(family, fontMode);
    const before = css;
    css = css.replace(/font-family\s*:\s*[^;}]+/gi, `font-family: ${stack}`);
    if (css !== before)
      swaps.push({
        from: "font-family",
        to: fontMode === "system" ? `system stack (${family} is not loaded)` : family,
        reason: "typography of the scanned site",
      });
  }

  // Radios: cada uno al escalón más cercano de nuestra escala.
  const radii = Object.values(front.rounded ?? {})
    .map((r) => ({ raw: r, px: toPx(r) }))
    .filter((r): r is { raw: string; px: number } => r.px !== null);

  if (radii.length > 0) {
    const full = front.rounded?.full;

    css = css.replace(/border-radius\s*:\s*([^;}]+)/gi, (match, value: string) => {
      const raw = value.trim();

      // Una píldora tiene que seguir siendo una píldora. Por distancia
      // numérica, 999px acabaría en 12px — más cerca, y completamente mal.
      if (/^(50%|100%)$/.test(raw) || (toPx(raw) ?? 0) >= 500)
        return `border-radius: ${full ?? "9999px"}`;

      const px = toPx(raw);
      if (px === null) return match;
      const nearest = radii.reduce((best, r) =>
        Math.abs(r.px - px) < Math.abs(best.px - px) ? r : best
      );
      return `border-radius: ${nearest.raw}`;
    });
  }

  css = enforcePreviewContrast(css, palette);

  return { css, swaps };
}

const MIN_TEXT_CONTRAST = 4.5;

/**
 * Tras el mapeo por tokens, algunos grises del catálogo acaban demasiado cerca
 * del surface oscuro de la página escaneada. Corregimos solo `color:` y fondos
 * sólidos para que la vista previa siga siendo legible.
 */
function enforcePreviewContrast(css: string, palette: TokenPalette): string {
  const surface = palette.surface;
  const onSurface = palette.onSurface;
  if (!surface || !onSurface) return css;

  let out = css.replace(/(?<![a-z-])color\s*:\s*(#[0-9a-fA-F]{3,8})\b/gi, (match, hex: string) => {
    const normalized = normalizeColor(hex);
    if (!normalized || !/^#[0-9a-f]{6}$/i.test(normalized)) return match;
    if (contrastRatio(normalized, surface) >= MIN_TEXT_CONTRAST) return match;
    return match.replace(hex, onSurface);
  });

  out = out.replace(
    /(?:background-color|background)\s*:\s*(#[0-9a-fA-F]{3,8})\b/gi,
    (match, hex: string) => {
      const normalized = normalizeColor(hex);
      if (!normalized || !/^#[0-9a-f]{6}$/i.test(normalized)) return match;
      if (contrastRatio(normalized, onSurface) >= MIN_TEXT_CONTRAST) return match;
      return match.replace(hex, surface);
    }
  );

  return out;
}

/** Todos los colores hex que aparecen en el CSS, normalizados. */
function collectColors(css: string): string[] {
  const found = new Set<string>();
  for (const match of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const color = normalizeColor(match[0]);
    if (color && /^#[0-9a-f]{6}$/i.test(color)) found.add(color);
  }
  return [...found];
}

/** Reemplaza un color en todas sus formas de escritura (#abc, #aabbcc, mayúsculas). */
function replaceColor(css: string, from: string, to: string): string {
  const short = from.match(/^#(.)\1(.)\2(.)\3$/i);
  const forms = new Set([from, from.toUpperCase()]);
  if (short) forms.add(`#${short[1]}${short[2]}${short[3]}`);

  let out = css;
  for (const form of forms) {
    out = out.split(form).join(to);
    out = out.split(form.toUpperCase()).join(to);
  }
  return out;
}

/**
 * El documento que va dentro del iframe.
 *
 * El `[hidden] { display: none !important }` no es decorativo: es el bug número
 * uno de los snippets del repo (203 de 2127 recursos lo tenían). El atributo
 * `hidden` solo aplica `display: none` desde la hoja del navegador, con la
 * especificidad más baja que existe, así que en cuanto el CSS del recurso le da
 * un `display` al overlay, este aparece abierto y no hay forma de cerrarlo.
 * Como aquí no cargamos el JS del snippet, sin esta línea cada modal del
 * catálogo saldría abierto tapando la vista previa.
 */
export function buildPreviewDocument(options: {
  html: string;
  css: string;
  tokensCss: string;
  /** Pila tipográfica base del documento. Sin esto, el navegador pone serif. */
  baseFont?: string;
  /**
   * Hoja de una fuente externa. Solo se pasa si el usuario lo ha pedido a
   * propósito: es una petición a un tercero desde la vista previa.
   */
  fontHref?: string;
}): string {
  const fontLink = options.fontHref ? `<link rel="stylesheet" href="${options.fontHref}">` : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${fontLink}
<style>
/* Restaura la semántica de [hidden] por encima de cualquier regla del recurso. */
[hidden] { display: none !important; }

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  padding: 24px;
  background: var(--color-surface, #ffffff);
  color: var(--color-on-surface, #111827);
  /* La base tipográfica va aquí y no en el recurso: sin ella, todo lo que no
     declare familia hereda el serif inicial del navegador y el texto se lee
     mal. Es el fallo que hacía parecer roto lo que solo era una fuente que
     falta. */
  font-family: ${options.baseFont ?? SYSTEM_SANS};
  line-height: 1.5;
}
</style>
<style>
${options.tokensCss}
</style>
<style>
${options.css}
</style>
</head>
<body>
${options.html}
</body>
</html>`;
}
