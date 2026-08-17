/**
 * Captura de una página: su HTML y todas las hojas de estilo que enlaza.
 *
 * Todo lo que sale a la red pasa por aquí, y todo lo que sale a la red tiene
 * techo: tamaño, tiempo y número de peticiones. Un worker sin techos es una
 * factura ajena esperando a que alguien pegue la URL de un archivo de 2 GB.
 */

import { checkUrlShape, resolvesToPublicAddress } from "./guard";

export const LIMITS = {
  /** Techo del HTML de la página. */
  htmlBytes: 2_000_000,
  /** Techo de cada hoja de estilo. */
  cssBytes: 1_000_000,
  /** Techo de todo lo capturado junto: lo que acaba en localStorage. */
  totalBytes: 8_000_000,
  /** Tiempo por petición. */
  requestMs: 8_000,
  /** Hojas de estilo que se siguen; el resto se listan sin descargar. */
  maxStylesheets: 20,
  /** Saltos de redirección permitidos, cada uno revalidado. */
  maxRedirects: 4,
} as const;

export type Stylesheet = {
  url: string;
  /** Vacío si no se descargó: el motivo va en `skipped`. */
  css: string;
  bytes: number;
  skipped?: string;
};

export type Capture = {
  requestedUrl: string;
  /** URL final tras las redirecciones. Puede no ser la pedida. */
  finalUrl: string;
  html: string;
  inlineStyles: string[];
  stylesheets: Stylesheet[];
  bytes: number;
  notes: string[];
};

export class CaptureError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

/**
 * Lee el cuerpo cortando en `max` bytes. No vale con mirar content-length: es
 * una promesa del servidor remoto, no un hecho, y puede mentir o no venir.
 */
async function readCapped(res: Response, max: number): Promise<{ text: string; cut: boolean }> {
  const body = res.body;
  if (!body) return { text: "", cut: false };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let cut = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    if (size + value.length > max) {
      chunks.push(value.slice(0, max - size));
      size = max;
      cut = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
    size += value.length;
  }

  const joined = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    joined.set(c, at);
    at += c.length;
  }
  // Sin `fatal`: el HTML ajeno puede venir mal codificado, y un byte suelto no
  // debe tumbar la captura entera.
  return { text: new TextDecoder().decode(joined), cut };
}

/**
 * fetch que valida CADA salto. `redirect: "manual"` es lo que permite mirar el
 * Location antes de seguirlo: con `follow`, el runtime saltaría a la IP de
 * metadatos sin preguntarnos.
 */
async function guardedFetch(startUrl: URL, accept: string): Promise<Response> {
  let url = startUrl;

  for (let hop = 0; hop <= LIMITS.maxRedirects; hop++) {
    const shape = checkUrlShape(url.toString());
    if (!shape.ok) throw new CaptureError(shape.reason, 400);

    const dns = await resolvesToPublicAddress(shape.url.hostname, LIMITS.requestMs);
    if (dns && !dns.ok) throw new CaptureError(dns.reason, 400);

    const res = await fetch(shape.url.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(LIMITS.requestMs),
      headers: {
        accept,
        // Identificarse es lo correcto: quien reciba la petición debe poder
        // saber quién la hizo y bloquearla si no la quiere.
        "user-agent": "stealthis-design-scan/1.0 (+https://stealthis.dev)",
        "accept-language": "en;q=0.9",
      },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new CaptureError("Redirección sin destino.", 502);
      if (hop === LIMITS.maxRedirects) throw new CaptureError("Demasiadas redirecciones.", 502);
      url = new URL(location, url); // relativa o absoluta, ambas valen
      continue;
    }

    return res;
  }

  throw new CaptureError("Demasiadas redirecciones.", 502);
}

/** `href` de los <link rel="stylesheet">, resueltos a absoluto. */
function findStylesheetHrefs(html: string, base: URL): string[] {
  const out: string[] = [];
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    const el = tag[0];
    const rel = el.match(/\brel\s*=\s*["']?([^"'>\s]+)/i)?.[1]?.toLowerCase();
    if (!rel?.split(/\s+/).includes("stylesheet")) continue;
    const href = el.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    try {
      const abs = new URL(href, base).toString();
      if (!out.includes(abs)) out.push(abs);
    } catch {
      // href inservible: se ignora, no es motivo para tumbar la captura
    }
  }
  return out;
}

/** CSS escrito dentro del HTML, que en muchos sitios es donde está el tema. */
function findInlineStyles(html: string): string[] {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean);
}

export async function capture(target: string): Promise<Capture> {
  const shape = checkUrlShape(target);
  if (!shape.ok) throw new CaptureError(shape.reason, 400);

  const notes: string[] = [];
  const res = await guardedFetch(shape.url, "text/html,application/xhtml+xml");

  if (!res.ok) throw new CaptureError(`La página respondió ${res.status}.`, 502);

  const type = res.headers.get("content-type") ?? "";
  if (type && !/text\/html|application\/xhtml/i.test(type))
    throw new CaptureError(`La URL no devuelve HTML sino ${type.split(";")[0]}.`, 415);

  const finalUrl = new URL(res.url || shape.url.toString());
  const { text: html, cut } = await readCapped(res, LIMITS.htmlBytes);
  if (cut) notes.push(`El HTML se cortó en ${LIMITS.htmlBytes} bytes.`);

  let bytes = html.length;
  const inlineStyles = findInlineStyles(html);
  for (const s of inlineStyles) bytes += s.length;

  const hrefs = findStylesheetHrefs(html, finalUrl);
  const stylesheets: Stylesheet[] = [];

  if (hrefs.length > LIMITS.maxStylesheets)
    notes.push(
      `La página enlaza ${hrefs.length} hojas de estilo; se descargaron las primeras ${LIMITS.maxStylesheets}.`
    );

  for (const [i, href] of hrefs.entries()) {
    if (i >= LIMITS.maxStylesheets) {
      stylesheets.push({ url: href, css: "", bytes: 0, skipped: "fuera del límite de hojas" });
      continue;
    }
    if (bytes >= LIMITS.totalBytes) {
      stylesheets.push({ url: href, css: "", bytes: 0, skipped: "límite total alcanzado" });
      continue;
    }

    try {
      const sheetRes = await guardedFetch(new URL(href), "text/css,*/*;q=0.1");
      if (!sheetRes.ok) {
        stylesheets.push({ url: href, css: "", bytes: 0, skipped: `respondió ${sheetRes.status}` });
        continue;
      }
      const room = Math.min(LIMITS.cssBytes, LIMITS.totalBytes - bytes);
      const sheet = await readCapped(sheetRes, room);
      bytes += sheet.text.length;
      stylesheets.push({
        url: href,
        css: sheet.text,
        bytes: sheet.text.length,
        ...(sheet.cut ? { skipped: "cortada por tamaño" } : {}),
      });
    } catch (err) {
      // Una hoja que falla no tumba la captura entera: se anota y se sigue.
      stylesheets.push({
        url: href,
        css: "",
        bytes: 0,
        skipped: err instanceof CaptureError ? err.message : "no se pudo descargar",
      });
    }
  }

  return {
    requestedUrl: target,
    finalUrl: finalUrl.toString(),
    html,
    inlineStyles,
    stylesheets,
    bytes,
    notes,
  };
}
