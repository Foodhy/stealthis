/**
 * De dónde sale el worker de captura.
 *
 * El helper corre en la máquina del usuario (loopback). stealthis.dev no
 * hospeda el proxy en producción.
 *
 * Orden: lo guardado > PUBLIC_SCAN_PROXY_URL > 127.0.0.1:8799.
 */

const ENV_URL = import.meta.env.PUBLIC_SCAN_PROXY_URL as string | undefined;

export const DEFAULT_PROXY_URL = ENV_URL ?? "http://127.0.0.1:8799";

const STORAGE_KEY = "design-scan-proxy-v1";

/** Ruta estática del script Node empaquetado (servido por www). */
export const LOCAL_PROXY_SCRIPT_PATH = "/design-scan/local-proxy.mjs";

type Stored = { version: 1; url: string };

/** Quita la barra final y valida. Devuelve null si no es una URL usable. */
export function normalizeProxyUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
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
    /* sin almacenamiento */
  }
}

export function clearProxyUrl(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    /* nada */
  }
}

export type ProxyStatus = "unknown" | "checking" | "up" | "down";

export function isLoopbackProxy(url: string): boolean {
  const normalized = normalizeProxyUrl(url);
  if (!normalized) return false;
  try {
    const { hostname } = new URL(normalized);
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}

/** Comando para usuarios que visitan stealthis.dev (Node 18+). */
export function captureStartCommand(siteOrigin = "https://stealthis.dev"): string {
  const base = siteOrigin.replace(/\/$/, "");
  return `curl -fsSL ${base}${LOCAL_PROXY_SCRIPT_PATH} -o /tmp/stealthis-capture.mjs && node /tmp/stealthis-capture.mjs`;
}

export const DEV_CAPTURE_START_COMMAND = "bun run --filter @stealthis/scan-proxy serve";

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

/** Solo el helper local expone POST /shutdown. */
export async function shutdownProxy(url: string): Promise<boolean> {
  if (!isLoopbackProxy(url)) return false;
  try {
    const res = await fetch(`${url}/shutdown`, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}
