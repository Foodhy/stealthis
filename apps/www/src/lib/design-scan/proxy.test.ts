import { beforeEach, describe, expect, test } from "bun:test";
import {
  DEFAULT_PROXY_URL,
  clearProxyUrl,
  loadProxyUrl,
  normalizeProxyUrl,
  saveProxyUrl,
} from "./proxy";

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

describe("normalizar la URL del worker", () => {
  test("la barra final sobra", () => {
    expect(normalizeProxyUrl("http://localhost:8799/")).toBe("http://localhost:8799");
    expect(normalizeProxyUrl("  http://localhost:8799  ")).toBe("http://localhost:8799");
  });

  test("se conserva la ruta si el worker vive bajo un prefijo", () => {
    expect(normalizeProxyUrl("https://api.ejemplo.com/scan/")).toBe("https://api.ejemplo.com/scan");
  });

  test("solo http y https", () => {
    expect(normalizeProxyUrl("file:///tmp/x")).toBeNull();
    expect(normalizeProxyUrl("ftp://ejemplo.com")).toBeNull();
  });

  test("lo que no es una URL se rechaza en vez de guardarse roto", () => {
    expect(normalizeProxyUrl("localhost:8799")).toBeNull();
    expect(normalizeProxyUrl("")).toBeNull();
    expect(normalizeProxyUrl("   ")).toBeNull();
  });
});

describe("guardar y leer", () => {
  test("sin nada guardado manda el valor por defecto", () => {
    expect(loadProxyUrl()).toBe(DEFAULT_PROXY_URL);
  });

  test("lo guardado manda sobre el valor por defecto", () => {
    saveProxyUrl("https://mi-worker.ejemplo.dev");
    expect(loadProxyUrl()).toBe("https://mi-worker.ejemplo.dev");
  });

  test("restablecer vuelve al valor por defecto", () => {
    saveProxyUrl("https://mi-worker.ejemplo.dev");
    clearProxyUrl();
    expect(loadProxyUrl()).toBe(DEFAULT_PROXY_URL);
  });

  test("una versión desconocida se ignora en vez de interpretarse", () => {
    store.set("design-scan-proxy-v1", JSON.stringify({ version: 99, url: "https://x.dev" }));
    expect(loadProxyUrl()).toBe(DEFAULT_PROXY_URL);
  });

  test("basura guardada no revienta", () => {
    store.set("design-scan-proxy-v1", "{roto");
    expect(loadProxyUrl()).toBe(DEFAULT_PROXY_URL);
  });

  test("una URL guardada inservible cae al valor por defecto", () => {
    store.set("design-scan-proxy-v1", JSON.stringify({ version: 1, url: "no-es-una-url" }));
    expect(loadProxyUrl()).toBe(DEFAULT_PROXY_URL);
  });
});
