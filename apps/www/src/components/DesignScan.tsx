/**
 * Design Scan — pega la URL de una página y obtén su design system.
 *
 * Esta es la cáscara (STL-025): campo de URL, selector de modelo y la llamada
 * al worker de captura. El motor de fases lo añade STL-026, la extracción de
 * tokens STL-027 y el resto de las fases van detrás.
 *
 * Todo vive en el navegador: la clave de API y lo capturado se quedan en
 * localStorage, nada pasa por un servidor nuestro salvo el proxy de captura,
 * que existe solo porque el CORS no deja leer un sitio ajeno desde la página.
 */

import {
  type AiModel,
  type AiProvider,
  type AiProviderConfig,
  PROVIDER_DEFAULTS,
  listModels,
  loadProviderConfig,
  saveProviderConfig,
} from "@stealthis/ai-providers";
import { useCallback, useEffect, useMemo, useState } from "react";

/** Clave versionada desde el día uno. Sin `legacyKeys`: esta página es nueva. */
const PROVIDER_STORAGE = { key: "design-scan-ai-provider-v1" };
const CAPTURE_STORAGE_KEY = "design-scan-capture-v1";

/**
 * El worker de captura. En desarrollo apunta al `wrangler dev` local; en
 * producción, a lo que diga PUBLIC_SCAN_PROXY_URL. Se resuelve en el navegador
 * porque www es un build estático y no hay servidor donde leer variables.
 */
const SCAN_PROXY_URL =
  import.meta.env.PUBLIC_SCAN_PROXY_URL ??
  (import.meta.env.DEV ? "http://localhost:8799" : "https://scan-proxy.stealthis.dev");

type Stylesheet = { url: string; css: string; bytes: number; skipped?: string };

type Capture = {
  requestedUrl: string;
  finalUrl: string;
  html: string;
  inlineStyles: string[];
  stylesheets: Stylesheet[];
  bytes: number;
  notes: string[];
};

type StoredCapture = { version: 1; capturedAt: string; capture: Capture };

function loadCapture(): StoredCapture | null {
  try {
    const raw = localStorage.getItem(CAPTURE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCapture;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function saveCapture(capture: Capture) {
  try {
    const payload: StoredCapture = {
      version: 1,
      capturedAt: new Date().toISOString(),
      capture,
    };
    localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Cuota llena: la captura sigue en memoria, solo no sobrevive a la recarga.
  }
}

/** Añade https:// si el usuario pegó el dominio a secas. */
function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

export default function DesignScan() {
  const [config, setConfig] = useState<AiProviderConfig | null>(null);
  const [models, setModels] = useState<AiModel[]>([]);
  const [modelsError, setModelsError] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);

  const [url, setUrl] = useState("");
  const [capture, setCapture] = useState<Capture | null>(null);
  const [capturedAt, setCapturedAt] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState("");

  // localStorage no existe hasta que el componente monta en el cliente.
  useEffect(() => {
    setConfig(loadProviderConfig(PROVIDER_STORAGE));
    const stored = loadCapture();
    if (stored) {
      setCapture(stored.capture);
      setCapturedAt(stored.capturedAt);
      setUrl(stored.capture.requestedUrl);
    }
  }, []);

  const patchConfig = useCallback((patch: Partial<AiProviderConfig>) => {
    setConfig((prev) => {
      const base = prev ?? loadProviderConfig(PROVIDER_STORAGE);
      const next = { ...base, ...patch };
      saveProviderConfig(PROVIDER_STORAGE, next);
      return next;
    });
  }, []);

  const pickProvider = useCallback(
    (provider: AiProvider) => {
      // Cambiar de proveedor invalida el modelo y la clave: son de otro sitio.
      patchConfig({
        provider,
        baseUrl: PROVIDER_DEFAULTS[provider].baseUrl,
        apiKey: "",
        model: "",
      });
      setModels([]);
      setModelsError("");
    },
    [patchConfig]
  );

  const fetchModels = useCallback(async () => {
    if (!config) return;
    setLoadingModels(true);
    setModelsError("");
    try {
      const list = await listModels(config);
      setModels(list);
      if (list.length && !list.some((m) => m.id === config.model))
        patchConfig({ model: list[0].id });
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : "Could not load the models.");
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [config, patchConfig]);

  const runCapture = useCallback(async () => {
    const target = normalizeUrl(url);
    if (!target) {
      setCaptureError("That URL does not parse. Try something like example.com");
      return;
    }

    setCapturing(true);
    setCaptureError("");
    try {
      const res = await fetch(`${SCAN_PROXY_URL}/capture?url=${encodeURIComponent(target)}`);
      const body = (await res.json()) as Capture | { error: string };

      if (!res.ok || "error" in body) {
        setCaptureError("error" in body ? body.error : `The proxy responded ${res.status}.`);
        return;
      }

      setCapture(body);
      setCapturedAt(new Date().toISOString());
      saveCapture(body);
    } catch {
      setCaptureError(`Could not reach the capture proxy (${SCAN_PROXY_URL}). Is it running?`);
    } finally {
      setCapturing(false);
    }
  }, [url]);

  const clearCapture = useCallback(() => {
    setCapture(null);
    setCapturedAt("");
    setCaptureError("");
    try {
      localStorage.removeItem(CAPTURE_STORAGE_KEY);
    } catch {
      /* nada que hacer */
    }
  }, []);

  const cssBytes = useMemo(() => {
    if (!capture) return 0;
    return (
      capture.inlineStyles.reduce((n, s) => n + s.length, 0) +
      capture.stylesheets.reduce((n, s) => n + s.bytes, 0)
    );
  }, [capture]);

  const needsKey = config ? config.provider !== "ollama" : false;
  const ready = Boolean(config?.model) && (!needsKey || Boolean(config?.apiKey));

  if (!config) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ── Captura ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <label
            htmlFor="scan-url"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400"
          >
            Page URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="scan-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !capturing) runCapture();
              }}
              placeholder="https://example.com"
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-brand-400"
            />
            <button
              type="button"
              onClick={runCapture}
              disabled={capturing || !url.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {capturing ? "Capturing…" : "Capture"}
            </button>
          </div>

          {captureError && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {captureError}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            The capture runs through our own worker because the browser cannot read a third-party
            site. Public URLs only.
          </p>
        </div>

        {capture && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
                  Captured
                </h2>
                <p className="truncate text-sm text-slate-200">{capture.finalUrl}</p>
              </div>
              <button
                type="button"
                onClick={clearCapture}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/25"
              >
                Discard
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["HTML", kb(capture.html.length)],
                ["CSS", kb(cssBytes)],
                ["Sheets", String(capture.stylesheets.length)],
                ["Inline", String(capture.inlineStyles.length)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-100">{value}</dd>
                </div>
              ))}
            </dl>

            {capture.stylesheets.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {capture.stylesheets.map((sheet) => (
                  <li
                    key={sheet.url}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
                  >
                    <span className="truncate font-mono text-[11px] text-slate-400">
                      {sheet.url}
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[10px] ${
                        sheet.skipped ? "text-amber-300" : "text-slate-500"
                      }`}
                    >
                      {sheet.skipped ?? kb(sheet.bytes)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {capture.notes.length > 0 && (
              <ul className="mt-4 space-y-1 text-xs text-amber-200/80">
                {capture.notes.map((note) => (
                  <li key={note}>· {note}</li>
                ))}
              </ul>
            )}

            {capturedAt && (
              <p className="mt-4 text-[11px] text-slate-500">
                Saved in this browser on {new Date(capturedAt).toLocaleString()}. Reloading the page
                does not lose it.
              </p>
            )}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-white/10 p-5 text-xs text-slate-500">
          The remaining phases — extracting the tokens, writing the DESIGN.md and recreating the
          elements from the catalog — arrive in STL-026 through STL-031. This screen already has the
          capture and the model working.
        </div>
      </div>

      {/* ── Modelo ──────────────────────────────────────────── */}
      <aside className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
            Model
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            The key is stored in this browser only and sent straight to the provider.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PROVIDER_DEFAULTS) as AiProvider[]).map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => pickProvider(provider)}
              className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                config.provider === provider
                  ? "border-brand-400/60 bg-brand-500/10 text-white"
                  : "border-white/10 text-slate-400 hover:border-white/25"
              }`}
            >
              {PROVIDER_DEFAULTS[provider].label}
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="scan-base-url"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"
          >
            Base URL
          </label>
          <input
            id="scan-base-url"
            type="url"
            value={config.baseUrl}
            onChange={(e) => patchConfig({ baseUrl: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-brand-400"
          />
        </div>

        {needsKey && (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="scan-api-key"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"
              >
                API key
              </label>
              {PROVIDER_DEFAULTS[config.provider].keyUrl && (
                <a
                  href={PROVIDER_DEFAULTS[config.provider].keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-brand-300 hover:text-brand-200"
                >
                  get a key ↗
                </a>
              )}
            </div>
            <input
              id="scan-api-key"
              type="password"
              value={config.apiKey}
              onChange={(e) => patchConfig({ apiKey: e.target.value })}
              placeholder="sk-…"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-brand-400"
            />
          </div>
        )}

        <button
          type="button"
          onClick={fetchModels}
          disabled={loadingModels || (needsKey && !config.apiKey)}
          className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loadingModels ? "Loading…" : "Load models"}
        </button>

        {modelsError && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
            {modelsError}
          </p>
        )}

        {models.length > 0 && (
          <div>
            <label
              htmlFor="scan-model"
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"
            >
              Model
            </label>
            <select
              id="scan-model"
              value={config.model}
              onChange={(e) => patchConfig({ model: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none focus:border-brand-400"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <p
          className={`rounded-lg border px-3 py-2 text-[11px] ${
            ready
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-white/10 bg-black/20 text-slate-400"
          }`}
        >
          {ready
            ? `Ready: ${PROVIDER_DEFAULTS[config.provider].label} · ${config.model}`
            : "Pick a provider, key and model for the AI phases."}
        </p>
      </aside>
    </div>
  );
}
