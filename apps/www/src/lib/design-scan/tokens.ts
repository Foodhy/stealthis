/**
 * Fase 2 — del CSS capturado al frontmatter de DESIGN.md.
 *
 * Determinista y sin modelo: aquí solo se cuenta, se normaliza y se agrupa.
 * El porqué de cada token lo escribe la fase de prosa, con el modelo.
 *
 * Implementa el mapeo de DESIGN_MD.md § 4. Dos reglas mandan sobre el resto:
 *
 *  · Si la página ya nombró sus tokens en `--variables`, se respetan sus
 *    nombres. Nadie va a nombrar mejor esa paleta que quien la diseñó.
 *  · Lo que no se pueda extraer va a `omitted` con su motivo, nunca inventado.
 *    Un `rounded` fabricado para una página sin esquinas redondeadas es una
 *    mentira que se propaga a todo lo que se genere después.
 */

import {
  type Declaration,
  byFrequency,
  countBy,
  luminance,
  normalizeColor,
  px,
  readDeclarations,
  readRootVariables,
  toPx,
} from "./css";

export type Typography = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: string;
};

export type OmittedSection = { section: string; reason: string };

/** El frontmatter de DESIGN.md, con la forma exacta de la spec (alpha). */
export type Frontmatter = {
  version: string;
  name: string;
  description?: string;
  omitted?: OmittedSection[];
  colors?: Record<string, string>;
  typography?: Record<string, Typography>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string>;
};

export type CaptureInput = {
  finalUrl: string;
  html: string;
  inlineStyles: string[];
  stylesheets: { url: string; css: string }[];
};

/** Versión del formato que escribimos. La spec está en alpha. */
const SPEC_VERSION = "alpha";

const COLOR_PROPS = new Set([
  "color",
  "background-color",
  "background",
  "border-color",
  "border-top-color",
  "border-bottom-color",
  "border-left-color",
  "border-right-color",
  "outline-color",
  "fill",
  "stroke",
]);

/** Todo el CSS de la captura, junto: inline primero, que suele ser el tema. */
function allCss(capture: CaptureInput): string {
  return [...capture.inlineStyles, ...capture.stylesheets.map((s) => s.css)].join("\n");
}

/** Nombre del design system a partir del dominio: `stealthis.dev` → `Stealthis`. */
function nameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0] ?? host;
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return "Captured design system";
  }
}

// ─── colors ──────────────────────────────────────────────────────────────────

/**
 * Los `--*` del :root que son colores se toman con su nombre. Es la fuente de
 * mayor calidad: la página ya hizo el trabajo de nombrar su paleta.
 */
const INTERNAL_VAR = /^--(tw|chakra|mui|mantine|radix|next|nuxt|ion)-/;

function colorsFromVariables(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of readRootVariables(css)) {
    // Las variables internas de un framework no son la paleta de la marca:
    // --tw-ring-color no dice nada sobre el diseño de la página.
    if (INTERNAL_VAR.test(name)) continue;
    const color = normalizeColor(value);
    if (!color) continue;
    const token = name
      .replace(/^--/, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    if (token) out[token] = color;
  }
  return out;
}

/**
 * Sin variables, se deducen roles por función: el color de más área es la
 * superficie, el texto dominante sobre ella es `on-surface`, y el acento es el
 * color vivo más usado. La spec exige `primary` como mínimo.
 */
function colorsByRole(decls: Declaration[]): Record<string, string> {
  const backgrounds: string[] = [];
  const texts: string[] = [];
  const borders: string[] = [];

  for (const { property, value } of decls) {
    if (!COLOR_PROPS.has(property)) continue;
    // Primero el valor entero: `color-mix(in srgb, a, b)` lleva espacios dentro
    // y partirlo por el primer hueco produce el fragmento "color-mix(in".
    // Solo si eso no es un color se prueba con la primera palabra, que es el
    // caso de atajos como `background: #fff url(x.png) no-repeat`.
    const color = normalizeColor(value) ?? normalizeColor(value.split(/\s+/)[0] ?? "");
    if (!color) continue;
    if (property.startsWith("background")) backgrounds.push(color);
    else if (property.includes("border") || property.includes("outline")) borders.push(color);
    else texts.push(color);
  }

  const out: Record<string, string> = {};
  const topBackground = byFrequency(countBy(backgrounds))[0];
  const topText = byFrequency(countBy(texts))[0];
  const topBorder = byFrequency(countBy(borders))[0];

  if (topBackground) out.surface = topBackground;
  if (topText) out["on-surface"] = topText;
  if (topBorder) out.outline = topBorder;

  // `primary`: el color más usado que no sea ni el fondo ni el texto base, y
  // que no sea un gris. Un acento es lo que distingue a la marca.
  const candidates = byFrequency(countBy([...texts, ...backgrounds])).filter(
    (c) => c !== topBackground && c !== topText && isColorful(c)
  );
  const primary = candidates[0] ?? topText ?? topBackground;
  if (primary) out.primary = primary;

  return out;
}

/** Un gris tiene los tres canales casi iguales; no sirve como acento. */
function isColorful(hex: string): boolean {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return true; // oklch y compañía: se asume que son deliberados
  const [r, g, b] = [1, 2, 3].map((i) => Number.parseInt(m[i], 16));
  return Math.max(r, g, b) - Math.min(r, g, b) > 24;
}

// ─── typography ──────────────────────────────────────────────────────────────

const HEADING_SELECTORS = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * Un nivel por combinación distinta de familia + tamaño + peso, nombrado con
 * la convención semántica de la spec y ordenado de mayor a menor.
 *
 * La spec dice que lo normal son 9-15 niveles. Si una página usa 40 tamaños
 * distintos, volcarlos todos no sería su design system: sería su ruido.
 */
function extractTypography(css: string, decls: Declaration[]): Record<string, Typography> {
  const combos = new Map<string, { typo: Typography; count: number; size: number }>();

  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = rule[2];
    const size = body.match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i)?.[1]?.trim();
    if (!size) continue;
    const sizePx = toPx(size);
    if (sizePx === null || sizePx <= 0) continue;

    const family = body.match(/(?:^|;)\s*font-family\s*:\s*([^;]+)/i)?.[1]?.trim();
    const weight = body.match(/(?:^|;)\s*font-weight\s*:\s*([^;]+)/i)?.[1]?.trim();
    const lh = body.match(/(?:^|;)\s*line-height\s*:\s*([^;]+)/i)?.[1]?.trim();
    const ls = body.match(/(?:^|;)\s*letter-spacing\s*:\s*([^;]+)/i)?.[1]?.trim();

    const typo: Typography = { fontSize: px(sizePx) };
    if (family) typo.fontFamily = firstFamily(family);
    const weightNum = weight ? namedWeight(weight) : null;
    if (weightNum) typo.fontWeight = weightNum;
    if (lh) {
      const unitless = Number.parseFloat(lh);
      // Sin unidad es un multiplicador, que es lo que la spec recomienda.
      if (/^\d*\.?\d+$/.test(lh) && !Number.isNaN(unitless)) typo.lineHeight = unitless;
      else {
        const lhPx = toPx(lh);
        if (lhPx !== null) typo.lineHeight = px(lhPx);
      }
    }
    if (ls && ls !== "normal") typo.letterSpacing = ls;

    const key = `${typo.fontFamily ?? ""}|${typo.fontSize}|${typo.fontWeight ?? ""}`;
    const found = combos.get(key);
    // Un selector de encabezado pesa más que una regla suelta: es señal de que
    // ese nivel es parte de la jerarquía, no un caso aislado.
    const weightOfEvidence = HEADING_SELECTORS.some((h) =>
      new RegExp(`(^|[\\s,>+~])${h}([\\s,{:.]|$)`, "i").test(rule[1])
    )
      ? 10
      : 1;

    if (found) found.count += weightOfEvidence;
    else combos.set(key, { typo, count: weightOfEvidence, size: sizePx });
  }

  void decls;

  const ordered = [...combos.values()].sort((a, b) => b.size - a.size);
  if (ordered.length === 0) return {};

  return nameTypographyLevels(ordered.map((c) => c.typo));
}

/** `Inter, system-ui, sans-serif` → `Inter`. El resto es la pila de respaldo. */
function firstFamily(value: string): string {
  return value
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
}

function namedWeight(value: string): number | null {
  const named: Record<string, number> = {
    normal: 400,
    bold: 700,
    lighter: 300,
    bolder: 800,
  };
  if (named[value.toLowerCase()]) return named[value.toLowerCase()];
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Nombres de la spec, repartidos por tamaño: los grandes son display/headline,
 * el cuerpo alrededor de 16px, y los pequeños label. Se cortan en 12 niveles.
 */
function nameTypographyLevels(levels: Typography[]): Record<string, Typography> {
  // El nombre sale del tamaño, no del puesto en la lista: 16px es `body-md` en
  // cualquier design system, y llamarlo `body-lg` porque resulta ser el mayor
  // de su familia haría que el mismo tamaño cambiase de nombre según la página.
  const nameForSize = (sizePx: number): string => {
    if (sizePx >= 48) return "display-lg";
    if (sizePx >= 40) return "display-md";
    if (sizePx >= 32) return "headline-lg";
    if (sizePx >= 24) return "headline-md";
    if (sizePx >= 20) return "headline-sm";
    if (sizePx >= 17) return "body-lg";
    if (sizePx >= 15) return "body-md";
    if (sizePx >= 13) return "body-sm";
    if (sizePx >= 11) return "label-md";
    return "label-sm";
  };

  /** Dos niveles del mismo tamaño se distinguen por peso, que es lo que los separa. */
  const weightSuffix = (weight?: number): string => {
    if (weight === undefined) return "alt";
    if (weight >= 600) return "strong";
    if (weight <= 300) return "light";
    return "alt";
  };

  const out: Record<string, Typography> = {};
  const used = new Set<string>();

  // Máximo doce niveles: la spec dice que lo normal son 9-15, y de una página
  // real salen decenas de tamaños que son ruido, no jerarquía.
  for (const typo of levels.slice(0, 12)) {
    const sizePx = toPx(typo.fontSize ?? "") ?? 0;
    const base = nameForSize(sizePx);
    let name = base;
    if (used.has(name)) name = `${base}-${weightSuffix(typo.fontWeight)}`;
    let n = 2;
    while (used.has(name)) name = `${base}-${weightSuffix(typo.fontWeight)}-${n++}`;
    used.add(name);
    out[name] = typo;
  }
  return out;
}

// ─── rounded ─────────────────────────────────────────────────────────────────

function extractRounded(decls: Declaration[]): Record<string, string> {
  const radii: number[] = [];
  let hasFull = false;

  for (const { property, value } of decls) {
    if (!property.startsWith("border-radius") && !property.endsWith("-radius")) continue;
    for (const part of value.split(/[\s/]+/)) {
      if (part === "50%" || part === "9999px" || part === "100%") {
        hasFull = true;
        continue;
      }
      const n = toPx(part);
      if (n !== null && n > 0) radii.push(n);
    }
  }

  const unique = [...new Set(radii)].sort((a, b) => a - b);
  if (unique.length === 0) return hasFull ? { full: "9999px" } : {};

  // De la escala real de la página se toman hasta cinco escalones repartidos,
  // no todos los valores: `rounded` es una escala, no un inventario.
  const names = ["sm", "md", "lg", "xl", "2xl"];
  const step = Math.max(1, Math.ceil(unique.length / names.length));
  const out: Record<string, string> = {};
  let i = 0;
  for (let at = 0; at < unique.length && i < names.length; at += step) {
    out[names[i++]] = px(unique[at]);
  }
  if (hasFull) out.full = "9999px";
  return out;
}

// ─── spacing ─────────────────────────────────────────────────────────────────

const SPACING_PROPS = /^(margin|padding|gap|row-gap|column-gap)(-(top|right|bottom|left))?$/;

/**
 * Se busca la unidad base — el divisor común aparente de los espaciados, casi
 * siempre 4 u 8px — y se construye la escala sobre ella. Volcar cada valor
 * suelto daría cincuenta tokens que nadie puede usar.
 */
function extractSpacing(decls: Declaration[]): Record<string, string> {
  const values: number[] = [];

  for (const { property, value } of decls) {
    if (!SPACING_PROPS.test(property)) continue;
    for (const part of value.split(/\s+/)) {
      const n = toPx(part);
      if (n !== null && n > 0 && n <= 256) values.push(n);
    }
  }

  if (values.length === 0) return {};

  const base = guessBaseUnit(values);
  const scale: Record<string, number> = {
    xs: base,
    sm: base * 2,
    md: base * 3,
    lg: base * 5,
    xl: base * 8,
  };

  const out: Record<string, string> = { base: px(base) };
  for (const [name, n] of Object.entries(scale)) out[name] = px(n);
  return out;
}

/** El divisor de 8, 4 o 2 que explica más valores de la página. */
function guessBaseUnit(values: number[]): number {
  const whole = values.filter((v) => Number.isInteger(v));
  if (whole.length === 0) return 8;

  // Se recorre de mayor a menor y se para en el primero que explique la mayoría
  // de los valores. Bajar a 2 solo porque divide a más números daría siempre 2,
  // que es la escala más inútil posible: 2px no es el ritmo de ninguna página.
  for (const candidate of [8, 4, 2]) {
    const hits = whole.filter((v) => v % candidate === 0).length;
    if (hits / whole.length >= 0.6) return candidate;
  }
  return 8;
}

// ─── el frontmatter completo ────────────────────────────────────────────────

export function extractFrontmatter(capture: CaptureInput): Frontmatter {
  const css = allCss(capture);
  const decls = readDeclarations(css);

  // Las dos fuentes se suman: los nombres de la página son mejores, pero rara
  // vez cubren los roles (superficie, texto, borde) que necesita la spec.
  const fromVars = colorsFromVariables(css);
  const fromRoles = colorsByRole(decls);
  const colors: Record<string, string> = { ...fromRoles, ...fromVars };

  // La spec exige al menos `primary`. Si no salió de las variables, se elige el
  // color con más contraste contra la superficie, que es lo que la página usa
  // para destacar.
  if (Object.keys(colors).length > 0 && !colors.primary) {
    const surface = colors.surface ?? colors.background ?? "#ffffff";
    const surfaceL = luminance(surface);
    const primary = Object.entries(colors)
      .filter(([, hex]) => hex !== surface)
      .sort(
        (a, b) => Math.abs(luminance(b[1]) - surfaceL) - Math.abs(luminance(a[1]) - surfaceL)
      )[0];
    if (primary) colors.primary = primary[1];
  }

  const typography = extractTypography(css, decls);
  const rounded = extractRounded(decls);
  const spacing = extractSpacing(decls);

  const omitted: OmittedSection[] = [];
  const front: Frontmatter = {
    version: SPEC_VERSION,
    name: nameFromUrl(capture.finalUrl),
    description: `Design system extracted from ${capture.finalUrl}`,
  };

  if (Object.keys(colors).length) front.colors = colors;
  else
    omitted.push({ section: "colors", reason: "No colour declarations found in the captured CSS" });

  if (Object.keys(typography).length) front.typography = typography;
  else omitted.push({ section: "typography", reason: "No font-size declarations found" });

  if (Object.keys(rounded).length) front.rounded = rounded;
  else omitted.push({ section: "rounded", reason: "The page does not round any corners" });

  if (Object.keys(spacing).length) front.spacing = spacing;
  else omitted.push({ section: "spacing", reason: "No spacing declarations found" });

  // `components` lo llena la fase de prosa, con el modelo. Declararlo vacío
  // aquí seria decir que la página no tiene componentes, que es falso.
  omitted.push({ section: "components", reason: "Filled in by the prose phase" });

  front.omitted = omitted;
  return front;
}
