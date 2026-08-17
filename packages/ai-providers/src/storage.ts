// ─── Versioned localStorage persistence for the provider config ──────────────
//
// The three apps that stored this config (dbviz, prompt-designer, styleforge)
// each wrote a bare JSON blob with no version field. That works right up to the
// first time the shape changes, and then it fails silently: a stale object is
// read back, spread into state, and the user loses their key with no error.
//
// So the payload carries a version and every read goes through a migration
// step. Reading an unknown or future version falls back to defaults rather
// than trusting a shape we do not understand.

import { PROVIDER_DEFAULTS } from "./client";
import type { AiProvider, AiProviderConfig } from "./client";

/** Current payload version. Bump when the stored shape changes. */
export const CONFIG_VERSION = 1;

export type StoredConfig = AiProviderConfig & { version: number };

export type StorageOptions = {
  /** Where to write. Defaults to `<app>-ai-provider-v1`. */
  key: string;
  /**
   * Unversioned keys written before this package existed. They are read once,
   * migrated forward, and left untouched — deleting someone's old config on
   * upgrade is not a migration, it is data loss on a bet.
   */
  legacyKeys?: string[];
};

export function defaultConfig(): AiProviderConfig {
  return {
    provider: "ollama",
    baseUrl: PROVIDER_DEFAULTS.ollama.baseUrl,
    apiKey: "",
    model: "",
  };
}

const PROVIDERS: AiProvider[] = ["ollama", "openai", "claude", "gemini"];

/**
 * Coerces whatever came out of storage into a usable config. Anything missing
 * or of the wrong type falls back to its default instead of propagating
 * `undefined` into a fetch call.
 */
function coerce(raw: unknown): AiProviderConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const provider = PROVIDERS.includes(o.provider as AiProvider)
    ? (o.provider as AiProvider)
    : "ollama";

  return {
    provider,
    baseUrl:
      typeof o.baseUrl === "string" && o.baseUrl ? o.baseUrl : PROVIDER_DEFAULTS[provider].baseUrl,
    apiKey: typeof o.apiKey === "string" ? o.apiKey : "",
    model: typeof o.model === "string" ? o.model : "",
  };
}

/** Reads a JSON value from localStorage, tolerating every way it can fail. */
function readJson(key: string): unknown {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Migrates a stored payload to the current version.
 *
 * v0 (unversioned) → v1: same fields, so only the version is added. The step
 * exists so the next shape change has somewhere to live.
 */
function migrate(raw: unknown): AiProviderConfig | null {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!o) return null;

  const version = typeof o.version === "number" ? o.version : 0;

  // A payload from a newer build: do not guess at its shape.
  if (version > CONFIG_VERSION) return null;

  return coerce(o);
}

export function loadProviderConfig(options: StorageOptions): AiProviderConfig {
  const current = migrate(readJson(options.key));
  if (current) return current;

  for (const legacy of options.legacyKeys ?? []) {
    const migrated = migrate(readJson(legacy));
    if (migrated) {
      // Write it forward so the next read hits the versioned key, but leave the
      // old one in place: if the user rolls back, their config is still there.
      saveProviderConfig(options, migrated);
      return migrated;
    }
  }

  return defaultConfig();
}

export function saveProviderConfig(options: StorageOptions, config: AiProviderConfig): void {
  try {
    const payload: StoredConfig = { ...config, version: CONFIG_VERSION };
    globalThis.localStorage?.setItem(options.key, JSON.stringify(payload));
  } catch {
    // Storage full, disabled, or private mode. Losing the saved preference is
    // survivable; throwing here would take the settings panel down with it.
  }
}
