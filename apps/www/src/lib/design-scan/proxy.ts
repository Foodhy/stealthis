/**
 * De dónde sale el worker de captura.
 *
 * Estaba quemado en el componente, así que cambiar de puerto obligaba a
 * recompilar. Ahora manda lo que elija la persona, y el valor por defecto solo
 * se usa hasta que toque algo.
 *
 * El orden es: lo guardado > PUBLIC_SCAN_PROXY_URL > el local de desarrollo.
 */

const ENV_URL = import.meta.env.PUBLIC_SCAN_PROXY_URL as string | undefined;

export const DEFAULT_PROXY_URL =
  ENV_URL ?? (import.meta.env.DEV ? "http://localhost:8799" : "https://scan-proxy.stealthis.dev");

const STORAGE_KEY = "design-scan-proxy-v1";

type Stored = { version: 1; url: string };

/** Quita la barra final y valida. Devuelve null si no es una URL usable. */
export function normalizeProxyUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    // Solo http/https: un `file://` aquí no significa nada.
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin + (url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, ""));
  } catch {
    return null;
  }
}

export function loadProxyUrl(): string {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROXY_URL;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed.version !== 1) return DEFAULT_PROXY_URL;
    return normalizeProxyUrl(parsed.url) ?? DEFAULT_PROXY_URL;
  } catch {
    return DEFAULT_PROXY_URL;
  }
}

export function saveProxyUrl(url: string): void {
  try {
    const payload: Stored = { version: 1, url };
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Sin almacenamiento se sigue usando en memoria; solo no sobrevive a la recarga.
  }
}

export function clearProxyUrl(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    /* nada que hacer */
  }
}

export type ProxyStatus = "unknown" | "checking" | "up" | "down";

/**
 * Llama a la raíz del worker, que es su ficha de identidad. Sirve para decir
 * "está vivo" antes de escanear, en vez de que el usuario lo descubra cuando
 * la fase 1 falle.
 */
export async function pingProxy(
  url: string,
  signal?: AbortSignal
): Promise<{ ok: boolean; name?: string }> {
  try {
    const res = await fetch(`${url}/`, {
      signal: signal ?? AbortSignal.timeout(4000),
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json()) as { name?: string };
    return { ok: true, ...(body.name ? { name: body.name } : {}) };
  } catch {
    return { ok: false };
  }
}
