/**
 * Frontmatter → texto DESIGN.md.
 *
 * Se escribe el YAML a mano en vez de traer una librería: la forma que
 * emitimos es cerrada y la conocemos entera (cadenas, números, mapas de un
 * nivel y una lista de objetos planos). Una dependencia nueva tendría que
 * pasar el cooldown de tres días de `bunfig.toml` para resolver un problema
 * que aquí cabe en cuarenta líneas.
 *
 * Lo que sí hay que hacer bien es el entrecomillado: un `#0b1020` sin comillas
 * es un comentario en YAML, y un color se convertiría en nada.
 */

import type { Frontmatter, Typography } from "./tokens";

/** Cita cuando el valor podría leerse como otra cosa al volver a parsearlo. */
function scalar(value: string | number): string {
  if (typeof value === "number") return String(value);

  const needsQuotes =
    value === "" ||
    /^[#&*!|>%@`?-]/.test(value) || // # abre comentario, - abre lista…
    /^(yes|no|true|false|null|~|on|off)$/i.test(value) ||
    /^-?\d*\.?\d+$/.test(value) || // un número disfrazado de cadena
    /[:{}[\],'"\n]/.test(value) ||
    value !== value.trim();

  if (!needsQuotes) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Una clave de YAML: se cita si tiene algo que no sea un identificador. */
function key(name: string): string {
  return /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(name) ? name : `"${name.replace(/"/g, '\\"')}"`;
}

function typographyBlock(name: string, typo: Typography, indent: string): string[] {
  const lines = [`${indent}${key(name)}:`];
  const inner = `${indent}  `;
  // El orden es el de la spec: familia, tamaño, peso, interlineado, tracking.
  if (typo.fontFamily) lines.push(`${inner}fontFamily: ${scalar(typo.fontFamily)}`);
  if (typo.fontSize) lines.push(`${inner}fontSize: ${scalar(typo.fontSize)}`);
  if (typo.fontWeight !== undefined) lines.push(`${inner}fontWeight: ${typo.fontWeight}`);
  if (typo.lineHeight !== undefined) lines.push(`${inner}lineHeight: ${scalar(typo.lineHeight)}`);
  if (typo.letterSpacing) lines.push(`${inner}letterSpacing: ${scalar(typo.letterSpacing)}`);
  return lines;
}

function mapBlock(name: string, map: Record<string, string>): string[] {
  const lines = [`${name}:`];
  for (const [k, v] of Object.entries(map)) lines.push(`  ${key(k)}: ${scalar(v)}`);
  return lines;
}

/** Solo el bloque YAML, sin los `---`. Útil para enseñarlo en pantalla. */
export function frontmatterToYaml(front: Frontmatter): string {
  const lines: string[] = [];

  lines.push(`version: ${scalar(front.version)}`);
  lines.push(`name: ${scalar(front.name)}`);
  if (front.description) lines.push(`description: ${scalar(front.description)}`);

  if (front.omitted?.length) {
    lines.push("omitted:");
    for (const o of front.omitted) {
      lines.push(`  - section: ${scalar(o.section)}`);
      lines.push(`    reason: ${scalar(o.reason)}`);
    }
  }

  if (front.colors) lines.push(...mapBlock("colors", front.colors));

  if (front.typography) {
    lines.push("typography:");
    for (const [name, typo] of Object.entries(front.typography))
      lines.push(...typographyBlock(name, typo, "  "));
  }

  if (front.rounded) lines.push(...mapBlock("rounded", front.rounded));
  if (front.spacing) lines.push(...mapBlock("spacing", front.spacing));

  return lines.join("\n");
}

/**
 * El archivo entero. El cuerpo lo escribe la fase de prosa; hasta entonces se
 * emiten las secciones de la spec vacías con una nota, para que el archivo sea
 * válido y se vea qué falta, en vez de fingir que está completo.
 */
export function toDesignMd(front: Frontmatter, body?: string): string {
  const yaml = frontmatterToYaml(front);
  const prose = body ?? placeholderBody();
  return `---\n${yaml}\n---\n\n${prose}\n`;
}

function placeholderBody(): string {
  const sections = [
    "Overview",
    "Colors",
    "Typography",
    "Layout",
    "Elevation & Depth",
    "Shapes",
    "Components",
    "Do's and Don'ts",
  ];
  const note = "_Not written yet — the prose phase fills this in._";
  return sections.map((s) => `## ${s}\n\n${note}`).join("\n\n");
}
