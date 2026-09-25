/**
 * El esqueleto real de la página capturada.
 *
 * Sustituye a las doce expresiones regulares que había en `prose.ts`, que
 * miraban si el HTML contenía la palabra "card" o una etiqueta `<table>` y de
 * ahí deducían componentes. Con eso, Google salía con un `table-cell` y Foodhy
 * con un `pillar-tag` inventado, y el catálogo devolvía recursos ajenos.
 *
 * Aquí se lee lo que la página TIENE: su navegación, su titular, sus secciones
 * y cuántos bloques repetidos hay en cada una. Los componentes salen de esa
 * evidencia, con un recuento detrás, no de una palabra suelta en un atributo.
 *
 * Límite que hay que decir en voz alta: esto es el HTML que devuelve el
 * servidor, sin ejecutar JavaScript. En una aplicación que se pinta en el
 * cliente vendrá casi vacío, y entonces la estructura será pobre — hay que
 * avisarlo, no rellenarlo a base de suposiciones.
 */

export type Section = {
  /** El encabezado que abre la sección, si tiene uno. */
  heading: string;
  level: 1 | 2 | 3;
  /** Cuántos bloques hermanos repetidos se ven dentro (tarjetas, items…). */
  repeated: number;
  /** Un poco del texto, para que el modelo sepa de qué habla la sección. */
  excerpt: string;
};

export type DeducedComponent = { name: string; evidence: string };

export type PageStructure = {
  title: string;
  /** El h1, que casi siempre es la promesa principal de la página. */
  headline: string;
  /** Enlaces de la navegación principal, en su orden. */
  nav: string[];
  sections: Section[];
  /** Campos de formulario encontrados, por tipo. */
  formFields: string[];
  /** Textos de botones submit o `<button>` visibles. */
  submitLabels: string[];
  hasFooter: boolean;
  /** Componentes deducidos de la evidencia, con su recuento. */
  components: DeducedComponent[];
  /** Lo que no se pudo leer, para decirlo en pantalla. */
  warnings: string[];
};

const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

function firstMatch(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? stripTags(m[1] ?? "") : "";
}

function readLinksInBlock(block: string, labels: string[]): void {
  for (const a of block.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = stripTags(a[1]);
    // Un enlace sin texto es un logo o un icono: no es una entrada de menú.
    if (text && text.length <= 40 && !labels.includes(text)) labels.push(text);
  }
}

/** Los textos de los enlaces del primer `<nav>`, cabecera, o bloque superior del body. */
export function readNav(html: string): string[] {
  const labels: string[] = [];

  const navBlock = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i)?.[1];
  if (navBlock) readLinksInBlock(navBlock, labels);

  const headerBlock = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i)?.[1];
  if (headerBlock) readLinksInBlock(headerBlock, labels);

  // Google y sitios similares suelen poner enlaces sueltos al inicio del body.
  if (labels.length < 2) {
    const bodyStart = html.match(/<body\b[^>]*>([\s\S]{0,4000})/i)?.[1] ?? "";
    readLinksInBlock(bodyStart, labels);
  }

  return labels.slice(0, 12);
}

function hasSearchField(html: string): { yes: boolean; evidence: string } {
  for (const input of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = input[0];
    const type = tag.match(/type\s*=\s*["']?([a-z-]+)/i)?.[1]?.toLowerCase() ?? "text";
    const name = tag.match(/name\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
    const role = tag.match(/role\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
    const aria = tag.match(/aria-label\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
    if (type === "search" || name === "q" || role === "searchbox" || aria.includes("search")) {
      return { yes: true, evidence: `search input (${type || "text"}, name=${name || "?"})` };
    }
  }
  if (/role\s*=\s*["']search["']/i.test(html)) {
    return { yes: true, evidence: 'element with role="search"' };
  }
  return { yes: false, evidence: "" };
}

function readSubmitLabels(html: string): string[] {
  const labels: string[] = [];
  for (const input of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = input[0];
    const type = tag.match(/type\s*=\s*["']?([a-z-]+)/i)?.[1]?.toLowerCase() ?? "text";
    if (type !== "submit" && type !== "button") continue;
    const value =
      tag.match(/value\s*=\s*["']([^"']+)["']/i)?.[1] ??
      tag.match(/aria-label\s*=\s*["']([^"']+)["']/i)?.[1] ??
      "";
    const text = stripTags(value);
    if (text && !labels.includes(text)) labels.push(text);
  }
  for (const btn of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
    const text = stripTags(btn[1]);
    if (text && text.length <= 48 && !labels.includes(text)) labels.push(text);
  }
  return labels.slice(0, 8);
}

function hasLogoInHeader(html: string): boolean {
  const block =
    html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i)?.[1] ??
    html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ??
    html.slice(0, 2500);
  return /<img\b/i.test(block) || /<svg\b/i.test(block);
}

function looksLikeHero(html: string, headline: string): boolean {
  if (!headline) return false;
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1) return false;
  const after = html.slice((h1.index ?? 0) + h1[0].length, (h1.index ?? 0) + h1[0].length + 1200);
  const hasParagraph = /<p\b/i.test(after);
  const hasCta =
    /<button\b/i.test(after) ||
    /<a\b[^>]*class="[^"]*\b(btn|button|cta)\b/i.test(after) ||
    /<input\b[^>]*type\s*=\s*["']?submit/i.test(after);
  return hasParagraph || hasCta;
}

/**
 * Cuántos hermanos repetidos hay en un trozo de HTML. Es lo que distingue una
 * rejilla de tarjetas de un párrafo: no la palabra "card", sino la repetición.
 */
function countRepeated(fragment: string): number {
  const counts = new Map<string, number>();

  for (const el of fragment.matchAll(/<(article|li|div)\b([^>]*)>/gi)) {
    const cls = el[2].match(/class\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    if (!cls) continue;
    // La primera clase basta como firma: los hermanos de una rejilla la comparten.
    const signature = `${el[1].toLowerCase()}.${cls.trim().split(/\s+/)[0]}`;
    counts.set(signature, (counts.get(signature) ?? 0) + 1);
  }

  let most = 0;
  for (const n of counts.values()) most = Math.max(most, n);
  return most;
}

export function readSections(html: string): Section[] {
  const sections: Section[] = [];

  // Se parte por encabezados: es como está organizada cualquier página, y no
  // depende de que use <section>, <div> o lo que sea.
  const headings = [...html.matchAll(/<h([123])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];

  for (const [index, h] of headings.entries()) {
    const heading = stripTags(h[2]);
    if (!heading) continue;

    const start = (h.index ?? 0) + h[0].length;
    const end = headings[index + 1]?.index ?? Math.min(html.length, start + 6000);
    const body = html.slice(start, end);

    sections.push({
      heading,
      level: Number(h[1]) as 1 | 2 | 3,
      repeated: countRepeated(body),
      excerpt: stripTags(body).slice(0, 220),
    });
  }

  return sections.slice(0, 20);
}

function readFormFields(html: string): string[] {
  const fields: string[] = [];
  for (const input of html.matchAll(/<input\b[^>]*>/gi)) {
    const type = input[0].match(/type\s*=\s*["']?([a-z-]+)/i)?.[1]?.toLowerCase() ?? "text";
    if (["hidden", "submit", "button", "image"].includes(type)) continue;
    if (!fields.includes(type)) fields.push(type);
  }
  if (/<textarea\b/i.test(html) && !fields.includes("textarea")) fields.push("textarea");
  if (/<select\b/i.test(html) && !fields.includes("select")) fields.push("select");
  return fields;
}

/**
 * Los componentes que la página justifica, cada uno con la evidencia que lo
 * respalda. La evidencia se enseña en pantalla: así se ve POR QUÉ se propone
 * cada uno, y se puede quitar el que no venga a cuento.
 */
function deduceComponents(
  html: string,
  sections: Section[],
  fields: string[],
  headline: string,
  nav: string[],
  submitLabels: string[]
): DeducedComponent[] {
  const out: DeducedComponent[] = [];
  const add = (name: string, evidence: string) => {
    if (!out.some((c) => c.name === name)) out.push({ name, evidence });
  };

  const search = hasSearchField(html);
  if (search.yes) add("search-field", search.evidence);

  const submitCount = [...html.matchAll(/<input\b[^>]*type\s*=\s*["']?submit/gi)].length;
  const buttons = [...html.matchAll(/<button\b/gi)].length;
  const ctaLinks = [...html.matchAll(/<a\b[^>]*class="[^"]*\b(btn|button|cta)\b/gi)].length;
  const ctaTotal = buttons + ctaLinks + submitCount;
  if (ctaTotal > 0) {
    const labelHint = submitLabels.length
      ? ` — e.g. "${submitLabels.slice(0, 3).join('", "')}"`
      : "";
    add(
      "button-primary",
      `${buttons} <button>, ${submitCount} submit input(s), ${ctaLinks} link(s) styled as a button${labelHint}`
    );
  }
  if (ctaTotal > 2) add("button-secondary", "more than two distinct calls to action");

  if (nav.length >= 2) {
    add("nav-link", `${nav.length} navigation links: ${nav.slice(0, 6).join(", ")}`);
  }

  if (hasLogoInHeader(html)) add("logo", "logo image or SVG in the header area");

  if (looksLikeHero(html, headline)) {
    add("hero", `headline “${headline.slice(0, 60)}” with supporting copy or CTAs nearby`);
  }

  const grid = sections.find((s) => s.repeated >= 3);
  if (grid) add("card", `${grid.repeated} repeated blocks under “${grid.heading}”`);

  for (const field of fields) {
    if (field === "textarea") add("textarea", "the page has a <textarea>");
    else if (field === "select") add("select", "the page has a <select>");
    else if (field === "email") add("email-field", "the page has an email input");
    else if (field === "checkbox") add("checkbox", "the page has checkbox inputs");
    else if (field === "radio") add("radio-group", "the page has radio inputs");
    else if (field === "password") add("password-field", "the page has a password input");
  }
  const genericFields = fields.filter(
    (f) => !["textarea", "select", "email", "checkbox", "radio", "password"].includes(f)
  );
  if (genericFields.length && !search.yes) {
    add("input-field", `form fields: ${genericFields.join(", ")}`);
  }

  if (/<footer\b/i.test(html)) add("footer", "the page has a <footer>");
  if (/role=["']?dialog/i.test(html)) add("modal", 'an element with role="dialog"');

  return out.slice(0, 16);
}

export function readStructure(html: string): PageStructure {
  const warnings: string[] = [];
  const text = stripTags(html);

  const nav = readNav(html);
  const sections = readSections(html);
  const formFields = readFormFields(html);
  const submitLabels = readSubmitLabels(html);
  const headline = firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);

  // El aviso que importa: si el servidor devuelve un cascarón, lo que sigue
  // será pobre y hay que decirlo en vez de disimularlo.
  if (text.length < 400)
    warnings.push(
      "The server returned almost no text — this page is probably rendered by JavaScript, so the structure below is thin."
    );
  if (sections.length === 0) warnings.push("No headings found, so no sections could be read.");
  if (nav.length === 0) warnings.push("No navigation links found.");

  return {
    title: firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
    headline,
    nav,
    sections,
    formFields,
    submitLabels,
    hasFooter: /<footer\b/i.test(html),
    components: deduceComponents(html, sections, formFields, headline, nav, submitLabels),
    warnings,
  };
}
