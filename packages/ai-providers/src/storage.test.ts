import { beforeEach, describe, expect, test } from "bun:test";
import { CONFIG_VERSION, loadProviderConfig, saveProviderConfig } from "./storage";

const KEY = "dbviz-ai-provider-v1";
const LEGACY = "dbviz-ai-provider";
const opts = { key: KEY, legacyKeys: [LEGACY] };

// localStorage de mentira: bun test corre en Node, no en el navegador.
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

describe("migración desde la clave sin versionar", () => {
  test("lee la config vieja de dbviz y no pierde la clave del usuario", () => {
    // Exactamente lo que dbviz escribía antes: sin campo version.
    store.set(
      LEGACY,
      JSON.stringify({
        provider: "claude",
        baseUrl: "https://api.anthropic.com",
        apiKey: "sk-ant-secreta",
        model: "claude-sonnet-4-6",
      })
    );

    const cfg = loadProviderConfig(opts);

    expect(cfg.provider).toBe("claude");
    expect(cfg.apiKey).toBe("sk-ant-secreta");
    expect(cfg.model).toBe("claude-sonnet-4-6");
  });

  test("la reescribe en la clave versionada", () => {
    store.set(LEGACY, JSON.stringify({ provider: "openai", apiKey: "sk-1", model: "gpt-4o" }));
    loadProviderConfig(opts);

    const escrito = JSON.parse(store.get(KEY) ?? "{}");
    expect(escrito.version).toBe(CONFIG_VERSION);
    expect(escrito.apiKey).toBe("sk-1");
  });

  test("NO borra la clave vieja: si se hace rollback, la config sigue ahí", () => {
    store.set(LEGACY, JSON.stringify({ provider: "openai", apiKey: "sk-1", model: "gpt-4o" }));
    loadProviderConfig(opts);
    expect(store.has(LEGACY)).toBe(true);
  });

  test("la versionada manda sobre la vieja", () => {
    store.set(LEGACY, JSON.stringify({ provider: "openai", apiKey: "vieja", model: "gpt-4o" }));
    store.set(KEY, JSON.stringify({ version: 1, provider: "gemini", apiKey: "nueva", model: "g" }));

    expect(loadProviderConfig(opts).apiKey).toBe("nueva");
  });
});

describe("entradas rotas", () => {
  test("sin nada guardado devuelve los valores por defecto", () => {
    const cfg = loadProviderConfig(opts);
    expect(cfg.provider).toBe("ollama");
    expect(cfg.baseUrl).toBe("http://localhost:11434");
    expect(cfg.apiKey).toBe("");
  });

  test("JSON corrupto no revienta", () => {
    store.set(KEY, "{no es json");
    expect(loadProviderConfig(opts).provider).toBe("ollama");
  });

  test("un proveedor desconocido cae a ollama en vez de colarse a un fetch", () => {
    store.set(KEY, JSON.stringify({ version: 1, provider: "skynet", apiKey: "x" }));
    expect(loadProviderConfig(opts).provider).toBe("ollama");
  });

  test("campos ausentes se rellenan, no quedan undefined", () => {
    store.set(KEY, JSON.stringify({ version: 1, provider: "claude" }));
    const cfg = loadProviderConfig(opts);
    expect(cfg.baseUrl).toBe("https://api.anthropic.com");
    expect(cfg.apiKey).toBe("");
    expect(cfg.model).toBe("");
  });

  test("una versión futura no se interpreta a ciegas", () => {
    store.set(KEY, JSON.stringify({ version: 99, provider: "claude", apiKey: "x" }));
    // Se ignora y se vuelve a los valores por defecto: preferimos que el usuario
    // reintroduzca la clave a que un build viejo malinterprete un formato nuevo.
    expect(loadProviderConfig(opts).apiKey).toBe("");
  });
});

describe("guardar", () => {
  test("siempre sella la versión", () => {
    saveProviderConfig(opts, {
      provider: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com",
      apiKey: "k",
      model: "gemini-2.0-flash",
    });
    expect(JSON.parse(store.get(KEY) ?? "{}").version).toBe(CONFIG_VERSION);
  });

  test("ida y vuelta", () => {
    const cfg = {
      provider: "openai" as const,
      baseUrl: "https://api.openai.com",
      apiKey: "sk-x",
      model: "gpt-4o",
    };
    saveProviderConfig(opts, cfg);
    expect(loadProviderConfig(opts)).toEqual(cfg);
  });
});
