/**
 * Lectura del CSS capturado.
 *
 * No usamos un parser de CSS completo a propósito: el objetivo no es entender
 * la cascada, es contar qué valores usa la página y con qué frecuencia. Un
 * parser real traería una dependencia grande para un problema que aquí es de
 * recuento.
 *
 * Lo que sí importa es normalizar: `#FFF`, `#ffffff`, `rgb(255,255,255)` y
 * `white` son el mismo color, y si no se unifican salen cuatro tokens donde
 * hay uno.
 */

/** Una declaración `propiedad: valor` encontrada en alguna regla. */
export type Declaration = { property: string; value: string };

/** Quita comentarios y at-rules que no aportan declaraciones útiles. */
function stripNoise(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@(import|charset|namespace)[^;]*;/gi, "");
}

/**
 * Todas las declaraciones del CSS, incluidas las de dentro de media queries.
 * Se leen en crudo: quién las aplica no importa para contar.
 */
export function readDeclarations(css: string): Declaration[] {
  const out: Declaration[] = [];
  const clean = stripNoise(css);

  // Cada bloque entre llaves. Las anidadas (@media) se recorren igual porque
  // sus reglas internas también encajan con este patrón.
  for (const block of clean.matchAll(/\{([^{}]*)\}/g)) {
    for (const raw of block[1].split(";")) {
      const colon = raw.indexOf(":");
      if (colon === -1) continue;
      const property = raw.slice(0, colon).trim().toLowerCase();
      const value = raw.slice(colon + 1).trim();
      if (property && value) out.push({ property, value });
    }
  }
  return out;
}

/** Las custom properties del :root — la fuente de mayor calidad de la página. */
export function readRootVariables(css: string): Map<string, string> {
  const vars = new Map<string, string>();
  const clean = stripNoise(css);

  for (const block of clean.matchAll(/:root[^{]*\{([^{}]*)\}/gi)) {
    for (const raw of block[1].split(";")) {
      const colon = raw.indexOf(":");
      if (colon === -1) continue;
      const name = raw.slice(0, colon).trim();
      const value = raw.slice(colon + 1).trim();
      if (name.startsWith("--") && value) vars.set(name, value);
    }
  }
  return vars;
}

// ─── Colores ─────────────────────────────────────────────────────────────────

const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  navy: "#000080",
  teal: "#008080",
  olive: "#808000",
  purple: "#800080",
  maroon: "#800000",
  lime: "#00ff00",
  aqua: "#00ffff",
  cyan: "#00ffff",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  yellow: "#ffff00",
  orange: "#ffa500",
};

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const hex2 = (n: number) => clamp255(n).toString(16).padStart(2, "0");

/**
 * Lleva un color CSS a `#rrggbb`. Devuelve null si no es un color o si es
 * transparente/heredado, que no son valores de paleta.
 *
 * Los colores con alfa se conservan como el original: aplanarlos contra un
 * fondo que no conocemos inventaría un color que la página no usa.
 */
export function normalizeColor(input: string): string | null {
  const v = input.trim().toLowerCase();
  if (!v) return null;
  if (["transparent", "inherit", "currentcolor", "initial", "unset", "none", "auto"].includes(v))
    return null;

  if (NAMED[v]) return NAMED[v];

  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{8}$/.test(v)) return v.slice(0, 7); // se descarta el alfa
  if (/^#[0-9a-f]{4}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;

  const rgb = v.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const nums = parts.slice(0, 3).map((p) => {
      const n = Number.parseFloat(p);
      return p.endsWith("%") ? (n / 100) * 255 : n;
    });
    if (nums.some(Number.isNaN)) return null;
    return `#${hex2(nums[0])}${hex2(nums[1])}${hex2(nums[2])}`;
  }

  const hsl = v.match(/^hsla?\(([^)]+)\)$/);
  if (hsl) {
    const parts = hsl[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const h = Number.parseFloat(parts[0]);
    const s = Number.parseFloat(parts[1]) / 100;
    const l = Number.parseFloat(parts[2]) / 100;
    if ([h, s, l].some(Number.isNaN)) return null;
    return hslToHex(h, s, l);
  }

  // oklch(), lab(), color-mix()… se dejan tal cual: la spec acepta cualquier
  // color CSS válido, y convertirlos a mano seria inventar precisión.
  if (/^(oklch|oklab|lch|lab|color-mix|color)\(/.test(v)) return v;

  return null;
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = l - c / 2;
  return `#${hex2((r1 + m) * 255)}${hex2((g1 + m) * 255)}${hex2((b1 + m) * 255)}`;
}

/** Luminancia relativa (WCAG), para decidir qué es fondo y qué es texto. */
export function luminance(hex: string): number {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return 0.5; // formato exótico: no arriesgamos una decisión
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const n = Number.parseInt(m[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

// ─── Dimensiones ─────────────────────────────────────────────────────────────

/**
 * Convierte una longitud CSS a px cuando se puede. `rem`/`em` se asumen a 16px:
 * es el valor por defecto del navegador y, sin renderizar la página, cualquier
 * otra cosa sería adivinar.
 */
export function toPx(value: string): number | null {
  const v = value.trim().toLowerCase();
  const m = v.match(/^(-?\d*\.?\d+)(px|rem|em)?$/);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  if (!m[2]) return n === 0 ? 0 : null; // un número suelto solo vale si es 0
  return m[2] === "px" ? n : n * 16;
}

/** Formatea px como dimensión de la spec, que solo admite px, em y rem. */
export function px(n: number): string {
  return `${Math.round(n * 100) / 100}px`;
}

/** Cuenta apariciones y devuelve los valores ordenados por frecuencia. */
export function countBy<T>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return counts;
}

export function byFrequency<T>(counts: Map<T, number>): T[] {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
}
