/**
 * Design Scan — pega la URL de una página y obtén su design system.
 *
 * Campo de URL, selector de modelo y el pipeline por fases. De las cinco fases
 * solo `capture` está construida; las demás las levantan STL-027 a STL-031 y
 * hasta entonces el motor las marca como no disponibles en vez de fingir.
 *
 * Todo vive en el navegador: la clave de API y lo capturado se quedan en
 * localStorage, nada pasa por un servidor nuestro salvo el proxy de captura,
 * que existe solo porque el CORS no deja leer un sitio ajeno desde la página.
 */

import DesignScanExport from "@components/DesignScanExport";
import DesignScanMatches from "@components/DesignScanMatches";
import DesignScanPhases from "@components/DesignScanPhases";
import DesignScanRecreate from "@components/DesignScanRecreate";
import DesignScanTokens from "@components/DesignScanTokens";
import { type PhaseRegistry, resumeOrStart, retryPhase, runScan } from "@lib/design-scan/engine";
import { toCssVariables } from "@lib/design-scan/export";
import { type MatchResult, matchComponents } from "@lib/design-scan/mcp";
import { type ProseResult, renderBody, runProsePhase } from "@lib/design-scan/prose";
import {
  DEFAULT_PROXY_URL,
  type ProxyStatus,
  clearProxyUrl,
  loadProxyUrl,
  normalizeProxyUrl,
  pingProxy,
  saveProxyUrl,
} from "@lib/design-scan/proxy";
import { frontmatterToYaml, toDesignMd } from "@lib/design-scan/serialize";
import { clearRun, loadRun } from "@lib/design-scan/store";
import { type CaptureInput, type Frontmatter, extractFrontmatter } from "@lib/design-scan/tokens";
import type { PhaseId, RunState } from "@lib/design-scan/types";
import {
  type AiModel,
  type AiProvider,
  type AiProviderConfig,
  PROVIDER_DEFAULTS,
  listModels,
  loadProviderConfig,
  saveProviderConfig,
} from "@stealthis/ai-providers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Clave versionada desde el día uno. Sin `legacyKeys`: esta página es nueva. */
const PROVIDER_STORAGE = { key: "design-scan-ai-provider-v1" };

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

/**
 * La captura es la fase 1 del pipeline. Su persistencia ya no vive aquí: la
 * lleva el motor de fases junto con la del resto, bajo una sola clave
 * versionada, para que recargar a mitad de un escaneo no pierda nada.
 */
async function captureRunner(url: string, proxyUrl: string): Promise<Capture> {
  const res = await fetch(`${proxyUrl}/capture?url=${encodeURIComponent(url)}`);
  let body: Capture | { error: string };
  try {
    body = (await res.json()) as Capture | { error: string };
  } catch {
    throw new Error(`The proxy responded ${res.status} with something that is not JSON.`);
  }
  if (!res.ok || "error" in body) {
    throw new Error("error" in body ? body.error : `The proxy responded ${res.status}.`);
  }
  return body;
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
  const [run, setRun] = useState<RunState | null>(null);
  const [busy, setBusy] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const [proxyUrl, setProxyUrl] = useState(DEFAULT_PROXY_URL);
  const [proxyDraft, setProxyDraft] = useState(DEFAULT_PROXY_URL);
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus>("unknown");
  const [proxyOpen, setProxyOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // localStorage no existe hasta que el componente monta en el cliente.
  useEffect(() => {
    setConfig(loadProviderConfig(PROVIDER_STORAGE));
    const savedProxy = loadProxyUrl();
    setProxyUrl(savedProxy);
    setProxyDraft(savedProxy);
    const saved = loadRun();
    if (saved) {
      setRun(saved);
      setUrl(saved.url);
    }
  }, []);

  // Comprobar que el worker responde ANTES de escanear: si no, la fase 1 falla
  // y el usuario no sabe si el problema es la URL que pegó o el worker.
  useEffect(() => {
    let cancelled = false;
    setProxyStatus("checking");
    pingProxy(proxyUrl).then((r) => {
      if (!cancelled) setProxyStatus(r.ok ? "up" : "down");
    });
    return () => {
      cancelled = true;
    };
  }, [proxyUrl]);

  const applyProxy = useCallback(() => {
    const normalized = normalizeProxyUrl(proxyDraft);
    if (!normalized) {
      setProxyStatus("down");
      return;
    }
    saveProxyUrl(normalized);
    setProxyUrl(normalized);
    setProxyDraft(normalized);
  }, [proxyDraft]);

  const resetProxy = useCallback(() => {
    clearProxyUrl();
    setProxyUrl(DEFAULT_PROXY_URL);
    setProxyDraft(DEFAULT_PROXY_URL);
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

  /**
   * `capture` y `tokens` están construidas. Las tres siguientes las levantan
   * STL-028 a STL-031; hasta entonces el motor las marca `unavailable` y para
   * ahí, en vez de fingir que pasaron.
   */
  const registry: PhaseRegistry = useMemo(
    () => ({
      capture: (ctx) => captureRunner(ctx.url, proxyUrl),
      tokens: async (ctx) => {
        const cap = ctx.outputs.capture as CaptureInput | undefined;
        if (!cap) throw new Error("No capture to read the CSS from.");
        return extractFrontmatter(cap);
      },
      prose: async (ctx) => {
        const cap = ctx.outputs.capture as CaptureInput | undefined;
        const front = ctx.outputs.tokens as Frontmatter | undefined;
        if (!cap || !front) throw new Error("The tokens phase has to run first.");
        if (!config) throw new Error("No model configured.");
        return runProsePhase({
          front,
          html: cap.html,
          url: ctx.url,
          config,
          ...(ctx.signal ? { signal: ctx.signal } : {}),
        });
      },
      recreate: async (ctx) => {
        // No hay nada que calcular aquí: los snippets ya están descargados y el
        // revestido es determinista. La fase existe para que el pipeline se
        // cierre entero y quede constancia de qué se recreó.
        const m = ctx.outputs.components as MatchResult | undefined;
        if (!m) throw new Error("The catalog matching has to run first.");
        const withMarkup = m.matches.filter((x) => {
          const slug = x.candidates[0]?.slug;
          return slug ? Boolean(m.snippets[slug]?.html) : false;
        });
        return { recreated: withMarkup.map((x) => x.component) };
      },
      components: async (ctx) => {
        const prosa = ctx.outputs.prose as ProseResult | undefined;
        if (!prosa) throw new Error("The prose phase has to run first.");
        const names = Object.keys(prosa.components);
        if (names.length === 0) throw new Error("No components to match against the catalog.");
        return matchComponents(names, { ...(ctx.signal ? { signal: ctx.signal } : {}) });
      },
    }),
    [config, proxyUrl]
  );

  const execute = useCallback(
    async (start: RunState) => {
      setBusy(true);
      setStorageWarning("");
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await runScan(start, registry, {
          onChange: setRun,
          onStorageProblem: setStorageWarning,
          signal: controller.signal,
          // Un solo intento en las fases que llaman al modelo: reintentar sola
          // una llamada que paga el usuario le duplica la factura sin avisar.
          // El botón Retry sigue estando para cuando él lo decida.
          maxAttempts: { prose: 1 },
        });
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [registry]
  );

  const startScan = useCallback(() => {
    const target = normalizeUrl(url);
    if (!target) {
      setUrlError("That URL does not parse. Try something like example.com");
      return;
    }
    setUrlError("");
    // resumeOrStart es lo que hace que volver a darle no repita lo ya hecho.
    void execute(resumeOrStart(target));
  }, [url, execute]);

  const onRetry = useCallback(
    (id: PhaseId) => {
      if (!run) return;
      void execute(retryPhase(run, id));
    },
    [run, execute]
  );

  const discard = useCallback(() => {
    abortRef.current?.abort();
    clearRun();
    setRun(null);
    setStorageWarning("");
  }, []);

  const capture = (run?.phases.capture.output ?? null) as Capture | null;
  const frontmatter = (run?.phases.tokens.output ?? null) as Frontmatter | null;
  const prose = (run?.phases.prose.output ?? null) as ProseResult | null;
  const matches = (run?.phases.components.output ?? null) as MatchResult | null;

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
                if (e.key === "Enter" && !busy) startScan();
              }}
              placeholder="https://example.com"
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-brand-400"
            />
            <button
              type="button"
              onClick={startScan}
              disabled={busy || !url.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Scanning…" : run ? "Resume scan" : "Scan"}
            </button>
          </div>

          {urlError && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {urlError}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-xs text-slate-500">
              Captured through a worker of ours, because the browser cannot read a third-party site.
            </p>

            <button
              type="button"
              onClick={() => setProxyOpen(!proxyOpen)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-400 transition-colors hover:border-white/25"
              aria-expanded={proxyOpen}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  proxyStatus === "up"
                    ? "bg-emerald-400"
                    : proxyStatus === "checking"
                      ? "animate-pulse bg-amber-400"
                      : proxyStatus === "down"
                        ? "bg-rose-400"
                        : "bg-slate-600"
                }`}
                aria-hidden="true"
              />
              <span className="font-mono">{proxyUrl.replace(/^https?:\/\//, "")}</span>
              <span className="text-slate-600">{proxyOpen ? "\u25b4" : "\u25be"}</span>
            </button>
          </div>

          {proxyOpen && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3">
              <label
                htmlFor="scan-proxy"
                className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"
              >
                Capture worker
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="scan-proxy"
                  type="url"
                  value={proxyDraft}
                  onChange={(e) => setProxyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyProxy();
                  }}
                  placeholder={DEFAULT_PROXY_URL}
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-brand-400"
                />
                <button
                  type="button"
                  onClick={applyProxy}
                  disabled={proxyDraft.trim() === proxyUrl}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Use this one
                </button>
                {proxyUrl !== DEFAULT_PROXY_URL && (
                  <button
                    type="button"
                    onClick={resetProxy}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-white/25"
                  >
                    Reset
                  </button>
                )}
              </div>

              <p className="mt-2 text-[11px] text-slate-500">
                {proxyStatus === "up" && (
                  <span className="text-emerald-300">Responding. Ready to capture.</span>
                )}
                {proxyStatus === "checking" && "Checking\u2026"}
                {proxyStatus === "down" && (
                  <span className="text-rose-300">
                    Not responding. Start it with{" "}
                    <code className="font-mono">bun run dev:scan-proxy</code>, or point this at
                    another instance.
                  </span>
                )}
                {proxyStatus === "unknown" && "Not checked yet."}
              </p>

              <p className="mt-1.5 text-[11px] text-slate-600">
                Saved in this browser. Any worker serving the same /capture endpoint works — your
                own deployment, a colleague's, or a different port.
              </p>
            </div>
          )}
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
                onClick={discard}
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

            {run?.updatedAt && (
              <p className="mt-4 text-[11px] text-slate-500">
                Saved in this browser on {new Date(run.updatedAt).toLocaleString()}. Reloading the
                page does not lose it.
              </p>
            )}
          </div>
        )}

        {run && (
          <section>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
              Phases
            </h2>
            <DesignScanPhases run={run} busy={busy} onRetry={onRetry} />
          </section>
        )}

        {frontmatter && (
          <DesignScanTokens
            front={frontmatter}
            prose={prose}
            yaml={frontmatterToYaml(frontmatter, prose?.components)}
            designMd={toDesignMd(
              frontmatter,
              prose ? renderBody(prose.sections) : undefined,
              prose?.components
            )}
          />
        )}

        {matches && frontmatter && (
          <DesignScanRecreate
            front={frontmatter}
            matches={matches}
            tokensCss={toCssVariables(frontmatter)}
          />
        )}

        {matches && <DesignScanMatches result={matches} />}

        {frontmatter && (
          <DesignScanExport
            front={frontmatter}
            components={prose?.components ?? {}}
            designMd={toDesignMd(
              frontmatter,
              prose ? renderBody(prose.sections) : undefined,
              prose?.components
            )}
          />
        )}

        {storageWarning && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            {storageWarning} The scan keeps running, but it will not survive a reload.
          </p>
        )}
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
