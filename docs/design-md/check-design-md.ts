/**
 * STL-022 — comprobador del mapeo de DESIGN.md.
 *
 * NO es el parser de produccion. Ese lo escribe STL-027 dentro de la app; este
 * script solo existe para demostrar que el mapeo descrito en DESIGN_MD.md se
 * sostiene contra archivos DESIGN.md reales, y para volver a comprobarlo cuando
 * la spec suba de version (esta en alpha).
 *
 * Comprueba cuatro cosas:
 *   1. El frontmatter se lee entero y encaja en la forma de la spec.
 *   2. Las secciones del cuerpo se detectan, con sus alias, orden y duplicados.
 *   3. Las referencias {grupo.token} resuelven.
 *   4. Round-trip: lo que leemos se vuelve a escribir sin perder ninguna clave.
 *
 * Cero dependencias: el YAML lo parsea Bun. Sale con codigo 1 si algo falla.
 *
 *   bun run docs/design-md/check-design-md.ts docs/design-md/fixtures/*.md
 */

import { readFileSync } from "node:fs";
import { basename } from "node:path";

const YAML = {
  load: (s: string) => Bun.YAML.parse(s),
  dump: (o: unknown) => Bun.YAML.stringify(o),
};

// ── Spec, transcrita de docs/spec.md @ 9bf8eae ─────────────────────────

const SECTIONS: { canonical: string; aliases: string[] }[] = [
  { canonical: "Overview", aliases: ["Brand & Style"] },
  { canonical: "Colors", aliases: [] },
  { canonical: "Typography", aliases: [] },
  { canonical: "Layout", aliases: ["Layout & Spacing"] },
  { canonical: "Elevation & Depth", aliases: ["Elevation"] },
  { canonical: "Shapes", aliases: [] },
  { canonical: "Components", aliases: [] },
  { canonical: "Do's and Don'ts", aliases: ["Dos and Don'ts", "Do’s and Don’ts"] },
];

const TOKEN_GROUPS = ["colors", "typography", "rounded", "spacing", "components"] as const;
const TYPO_PROPS: readonly string[] = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "fontFeature",
  "fontVariation",
];
const COMPONENT_PROPS: readonly string[] = [
  "backgroundColor",
  "textColor",
  "typography",
  "rounded",
  "padding",
  "size",
  "height",
  "width",
];

const DIMENSION = /^-?\d*\.?\d+(px|em|rem)$/;
const COLOR =
  /^(#[0-9a-f]{3,8}|transparent|currentColor|(rgb|rgba|hsl|hsla|hwb|oklch|oklab|lch|lab|color-mix)\(.*\)|[a-z]+)$/i;
const REF = /^\{([a-zA-Z0-9_.-]+)\}$/;

type Finding = { level: "error" | "warn"; msg: string };
/** El frontmatter de un DESIGN.md es YAML arbitrario: se navega, no se tipa. */
type Dict = Record<string, unknown>;

const asDict = (v: unknown): Dict => (v && typeof v === "object" ? (v as Dict) : {});

// ── 1 + 2. Partir el archivo ───────────────────────────────────────────

function split(raw: string) {
  if (!raw.startsWith("---\n")) return { fm: null, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { fm: null, body: raw };
  return { fm: raw.slice(4, end), body: raw.slice(end + 4) };
}

function readSections(body: string, f: Finding[]) {
  const heads = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1].trim());
  const seen = new Set<string>();
  const order: number[] = [];

  for (const h of heads) {
    if (seen.has(h)) f.push({ level: "error", msg: `seccion duplicada: "${h}"` });
    seen.add(h);
    const i = SECTIONS.findIndex(
      (s) =>
        s.canonical.toLowerCase() === h.toLowerCase() ||
        s.aliases.some((a) => a.toLowerCase() === h.toLowerCase())
    );
    if (i === -1) continue; // desconocida: se preserva, no es error (spec § Consumer Behavior)
    order.push(i);
  }
  for (let i = 1; i < order.length; i++) {
    if (order[i] < order[i - 1]) {
      f.push({
        level: "error",
        msg: `orden de secciones: "${SECTIONS[order[i]].canonical}" va antes que "${SECTIONS[order[i - 1]].canonical}"`,
      });
      break;
    }
  }
  return { headings: heads, known: order.map((i) => SECTIONS[i].canonical) };
}

// ── 3. Validar tokens y resolver referencias ───────────────────────────

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? o : asDict(o)[k]), obj);
}

function checkTokens(fm: Dict, f: Finding[]) {
  let refs = 0;
  let broken = 0;

  const resolve = (v: unknown, where: string) => {
    if (typeof v !== "string") return;
    const m = v.match(REF);
    if (!m) return;
    refs++;
    if (get(fm, m[1]) === undefined) {
      broken++;
      f.push({ level: "error", msg: `referencia rota ${v} en ${where}` });
    }
  };

  for (const [name, val] of Object.entries(asDict(fm.colors))) {
    resolve(val, `colors.${name}`);
    if (typeof val === "string" && !REF.test(val) && !COLOR.test(val))
      f.push({ level: "warn", msg: `colors.${name}: "${val}" no parece un color CSS` });
  }

  for (const [name, t] of Object.entries(asDict(fm.typography))) {
    const typo = asDict(t);
    for (const p of Object.keys(typo))
      if (!TYPO_PROPS.includes(p))
        f.push({ level: "warn", msg: `typography.${name}: propiedad desconocida "${p}"` });
    if (typo.fontSize && !DIMENSION.test(String(typo.fontSize)))
      f.push({
        level: "warn",
        msg: `typography.${name}.fontSize: "${typo.fontSize}" no es px/em/rem`,
      });
  }

  for (const [lvl, v] of Object.entries(asDict(fm.rounded)))
    if (typeof v === "string" && !DIMENSION.test(v) && v !== "9999px")
      f.push({ level: "warn", msg: `rounded.${lvl}: "${v}" no es una dimension` });

  for (const [comp, props] of Object.entries(asDict(fm.components)))
    for (const [p, v] of Object.entries(asDict(props))) {
      resolve(v, `components.${comp}.${p}`);
      if (!COMPONENT_PROPS.includes(p))
        f.push({ level: "warn", msg: `components.${comp}: propiedad desconocida "${p}"` });
    }

  return { refs, broken };
}

// ── 4. Round-trip: ninguna clave se pierde ─────────────────────────────

function keyPaths(o: unknown, prefix = ""): string[] {
  if (o === null || typeof o !== "object") return [prefix];
  if (Array.isArray(o)) return o.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`));
  return Object.entries(o).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

function roundTrip(fm: Dict) {
  const again = YAML.load(YAML.dump(fm));
  const before = new Set(keyPaths(fm));
  const after = new Set(keyPaths(again));
  return {
    before: before.size,
    lost: [...before].filter((k) => !after.has(k)),
    gained: [...after].filter((k) => !before.has(k)),
  };
}

// ── Export de prueba: variables CSS, que es lo que STL-031 necesita ────

function toCssVars(fm: Dict) {
  const out: string[] = [];
  for (const [n, v] of Object.entries(asDict(fm.colors))) out.push(`  --color-${n}: ${v};`);
  for (const [n, v] of Object.entries(asDict(fm.rounded))) out.push(`  --rounded-${n}: ${v};`);
  for (const [n, v] of Object.entries(asDict(fm.spacing))) out.push(`  --spacing-${n}: ${v};`);
  for (const [n, t] of Object.entries(asDict(fm.typography))) {
    const typo = asDict(t);
    if (typo.fontFamily) out.push(`  --font-${n}: ${typo.fontFamily};`);
    if (typo.fontSize) out.push(`  --text-${n}: ${typo.fontSize};`);
  }
  return `:root {\n${out.join("\n")}\n}`;
}

// ── Runner ─────────────────────────────────────────────────────────────

/** Fixtures que la spec obliga a rechazar: si NO fallan, el comprobador esta mal. */
const DEBEN_FALLAR = new Set(["OUT_OF_ORDER.md"]);

let failed = 0;
let inesperados = 0;
for (const file of process.argv.slice(2)) {
  const raw = readFileSync(file, "utf-8");
  const f: Finding[] = [];
  const { fm: fmRaw, body } = split(raw);

  console.log(`\n━━ ${basename(file)}`);

  if (!fmRaw) {
    console.log("   frontmatter: AUSENTE (la spec lo permite: es opcional)");
  }
  const fm: Dict = fmRaw ? asDict(YAML.load(fmRaw)) : {};

  const groups = TOKEN_GROUPS.filter((g) => fm[g]).map(
    (g) => `${g}:${Object.keys(asDict(fm[g])).length}`
  );
  console.log(`   version=${fm.version ?? "—"}  name=${fm.name ?? "—"}`);
  console.log(`   grupos: ${groups.join("  ") || "ninguno"}`);

  const { headings, known } = readSections(body, f);
  console.log(`   secciones: ${known.length}/8 conocidas de ${headings.length} encabezados`);

  const { refs, broken } = checkTokens(fm, f);
  console.log(`   referencias: ${refs} (${broken} rotas)`);

  if (fmRaw) {
    const rt = roundTrip(fm);
    const ok = rt.lost.length === 0 && rt.gained.length === 0;
    console.log(
      `   round-trip: ${rt.before} claves, ${ok ? "sin perdidas" : `PERDIDAS ${rt.lost.length}`}`
    );
    if (!ok) {
      failed++;
      console.log(`     perdidas: ${rt.lost.slice(0, 5).join(", ")}`);
    }
    const css = toCssVars(fm);
    console.log(`   css vars generadas: ${css.split("\n").length - 2}`);
  }

  const errs = f.filter((x) => x.level === "error");
  const warns = f.filter((x) => x.level === "warn");
  const debeFallar = DEBEN_FALLAR.has(basename(file));

  if (errs.length) {
    failed++;
    for (const e of errs) console.log(`   ERROR  ${e.msg}`);
    if (debeFallar) console.log("   → esperado: este fixture existe para fallar");
    else inesperados++;
  } else if (debeFallar) {
    inesperados++;
    console.log("   ERROR  deberia haber fallado y no fallo — el comprobador no lo detecta");
  }

  if (warns.length) {
    console.log(`   avisos: ${warns.length}`);
    for (const w of warns.slice(0, 4)) console.log(`     · ${w.msg}`);
  }
  if (!errs.length && !warns.length && !debeFallar) console.log("   limpio");
}

console.log(
  `\n${inesperados === 0 ? "TODO OK" : `${inesperados} archivo(s) con fallos inesperados`}` +
    ` (${failed} con errores, de los cuales ${failed - inesperados} esperados)`
);
process.exit(inesperados === 0 ? 0 : 1);
