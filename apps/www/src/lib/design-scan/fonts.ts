/**
 * Qué fuente se usa en las vistas previas.
 *
 * El problema que resuelve: el iframe no carga recursos externos a propósito, y
 * el CSS extraído pide la familia de la página a secas — `font-family: Fraunces`.
 * Si esa fuente no está instalada, el navegador no cae en una sans legible: cae
 * en su valor inicial, que es un serif estrecho. El texto queda apretado y feo,
 * y parece un fallo de la herramienta cuando en realidad es una fuente que falta.
 *
 * De ahí dos cosas: TODA familia se emite con pila de respaldo, y la vista previa
 * arranca con una pila del sistema que se ve bien siempre. Usar la fuente
 * original es una elección explícita, porque puede no estar disponible.
 */

/** Se ve bien en cualquier máquina, sin descargar nada. */
export const SYSTEM_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Respaldo con serifa, para cuando la página original es claramente serif. */
export const SYSTEM_SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

export const SYSTEM_MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

export type FontMode = "system" | "extracted";

const SERIF_HINT = /(serif|georgia|garamond|times|playfair|fraunces|merriweather|lora|cormorant)/i;
const MONO_HINT = /(mono|consolas|menlo|courier|code)/i;

/** La pila del sistema que mejor imita a esa familia, por si no está disponible. */
export function fallbackFor(family: string): string {
  if (MONO_HINT.test(family)) return SYSTEM_MONO;
  // El nombre delata la clase: una serif con respaldo sans cambia la página entera.
  if (SERIF_HINT.test(family)) return SYSTEM_SERIF;
  return SYSTEM_SANS;
}

/** Cita el nombre si lleva espacios, como exige CSS. */
function quote(family: string): string {
  const clean = family.trim().replace(/^["']|["']$/g, "");
  return /[\s]/.test(clean) ? `"${clean}"` : clean;
}

/**
 * La declaración completa. En modo `system` la familia original no se pide
 * siquiera: así el texto se ve igual de bien haya o no fuentes instaladas.
 */
export function fontStack(family: string | undefined, mode: FontMode): string {
  if (!family) return SYSTEM_SANS;
  if (mode === "system") return fallbackFor(family);
  return `${quote(family)}, ${fallbackFor(family)}`;
}

/**
 * ¿Está esa fuente disponible en este navegador?
 *
 * Sirve para decirlo antes de que el usuario vea el texto roto y crea que la
 * herramienta falla. Sin `document.fonts` no se puede saber, y entonces no se
 * afirma nada.
 */
export function isFontAvailable(family: string): boolean | null {
  const fonts = (globalThis as { document?: { fonts?: FontFaceSet } }).document?.fonts;
  if (!fonts || typeof fonts.check !== "function") return null;
  try {
    return fonts.check(`16px ${quote(family)}`);
  } catch {
    return null;
  }
}

/**
 * La URL de Google Fonts para esa familia.
 *
 * Cargarla es una petición a un tercero desde la vista previa, así que NO se
 * hace nunca por iniciativa nuestra: solo si el usuario lo pide, y sabiendo que
 * eso sale a internet.
 */
export function googleFontsUrl(family: string): string {
  const name = family.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%2B/g, "+")}&display=swap`;
}
