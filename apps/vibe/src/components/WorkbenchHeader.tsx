import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "../lib/workspace-context";
import {
  type AiProvider,
  type AiModel,
  PROVIDER_DEFAULTS,
  listModels,
  loadProviderConfig,
  saveProviderConfig,
  isVisionModel,
} from "../lib/ai-providers";
import type { AppMode } from "../lib/types";

/* ── Custom model dropdown ─────────────────────────────────────────────────── */

function ModelDropdown({
  models,
  selected,
  loading,
  onSelect,
}: {
  models: AiModel[];
  selected: string;
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const current = models.find((m) => m.id === selected);
  const label = loading
    ? "Loading..."
    : current
      ? current.name
      : models.length === 0
        ? "No models"
        : "Select model";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !loading && setOpen((v) => !v)}
        disabled={loading}
        className="flex max-w-[220px] items-center gap-1.5 rounded border border-white/8 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-white/14 disabled:opacity-40"
      >
        {current?.vision && <span className="text-[10px]">👁</span>}
        <span className="truncate">{label}</span>
        <span className="ml-1 text-[8px] text-slate-500">▼</span>
      </button>

      {open && models.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-72 min-w-[240px] overflow-y-auto rounded-lg border border-white/10 bg-slate-900 py-1 shadow-xl shadow-black/40">
          {models.map((m) => {
            const isSelected = m.id === selected;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelect(m.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-vibe-600/15 text-vibe-300"
                    : "text-slate-300 hover:bg-white/6"
                }`}
              >
                <span className="w-4 shrink-0 text-center text-[10px] text-vibe-400">
                  {isSelected ? "✓" : ""}
                </span>
                {m.vision && (
                  <span className="shrink-0 text-[10px]" title="Vision">👁</span>
                )}
                <span className="truncate">{m.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WorkbenchHeader() {
  const { state, dispatch } = useWorkspace();

  // Provider config from localStorage
  const [providerCfg, setProviderCfg] = useState(loadProviderConfig);
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState(providerCfg.model);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState("");

  function updateCfg(patch: Partial<typeof providerCfg>) {
    setProviderCfg((prev) => {
      const next = { ...prev, ...patch };
      saveProviderConfig(next);
      return next;
    });
  }

  const currentModel = useMemo(() => {
    return models.find((m) => m.id === selectedModel);
  }, [models, selectedModel]);

  const hasVision = currentModel?.vision ?? isVisionModel(selectedModel);

  // Expose selected model to chat hook via a global ref
  useEffect(() => {
    (window as any).__vibeAiConfig = {
      ...providerCfg,
      model: selectedModel,
    };
  }, [providerCfg, selectedModel]);

  // Load models when provider/key changes
  const loadModels = useCallback(async () => {
    setLoadingModels(true);
    setError("");
    try {
      const result = await listModels({
        provider: providerCfg.provider,
        baseUrl: providerCfg.baseUrl,
        apiKey: providerCfg.apiKey,
      });
      setModels(result);
      if (result.length > 0 && !result.some((m) => m.id === selectedModel)) {
        const firstModel = result[0].id;
        setSelectedModel(firstModel);
        updateCfg({ model: firstModel });
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load models");
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [providerCfg.provider, providerCfg.baseUrl, providerCfg.apiKey]);

  useEffect(() => {
    loadModels();
  }, [providerCfg.provider, providerCfg.apiKey]);

  const modes: AppMode[] = ["plan", "execute"];

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-4 py-2">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-vibe-400">Vibe</h1>

        {/* Mode toggle */}
        <div className="flex rounded-md border border-white/8">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => dispatch({ type: "SET_MODE", payload: m })}
              className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                state.mode === m
                  ? "bg-vibe-600/20 text-vibe-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">{state.config.name}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Provider selector */}
        <div className="flex rounded-md border border-white/8">
          {(Object.keys(PROVIDER_DEFAULTS) as AiProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                updateCfg({
                  provider: p,
                  baseUrl: PROVIDER_DEFAULTS[p].baseUrl,
                  apiKey: p === "ollama" || p === "openai-codex" ? "" : providerCfg.apiKey,
                  model: "",
                });
                setModels([]);
                setSelectedModel("");
              }}
              className={`px-2 py-1 text-[10px] font-medium transition-colors ${
                providerCfg.provider === p
                  ? "bg-vibe-600/20 text-vibe-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {PROVIDER_DEFAULTS[p].label}
            </button>
          ))}
        </div>

        {/* Model selector */}
        <ModelDropdown
          models={models}
          selected={selectedModel}
          loading={loadingModels}
          onSelect={(id) => {
            setSelectedModel(id);
            updateCfg({ model: id });
          }}
        />

        {/* Vision indicator */}
        {hasVision && (
          <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400" title="Vision supported">
            Vision
          </span>
        )}

        {/* Refresh models */}
        <button
          onClick={loadModels}
          disabled={loadingModels}
          className="rounded border border-white/8 px-1.5 py-1 text-[10px] text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-40"
          title="Reload models"
        >
          ↻
        </button>

        {/* Settings */}
        <button
          onClick={() => dispatch({ type: "SET_SETTINGS_OPEN", payload: true })}
          className="rounded border border-white/8 px-2 py-1 text-xs text-slate-400 transition-colors hover:text-slate-200"
          title="Provider settings (API key, base URL)"
        >
          ⚙
        </button>

        {/* Terminal toggle */}
        <button
          onClick={() => dispatch({ type: "TERMINAL_SET_VISIBLE", payload: !state.terminalVisible })}
          className={`rounded border px-2 py-1 text-xs transition-colors ${
            state.terminalVisible
              ? "border-vibe-500/40 text-vibe-300"
              : "border-white/8 text-slate-400 hover:text-slate-200"
          }`}
        >
          Terminal
        </button>

        {/* Project path */}
        {state.projectPath && (
          <span className="rounded border border-white/8 px-2 py-1 text-xs text-slate-400" title={state.projectPath}>
            {state.projectPath.split("/").slice(-2).join("/")}
          </span>
        )}

        {/* Theme */}
        <button
          onClick={() => dispatch({ type: "SET_THEME", payload: state.theme === "dark" ? "light" : "dark" })}
          className="rounded border border-white/8 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
        >
          {state.theme === "dark" ? "Light" : "Dark"}
        </button>

        {/* Projects */}
        <button
          onClick={() => dispatch({ type: "SET_CONFIGURED", payload: false })}
          className="rounded border border-white/8 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
        >
          Projects
        </button>
      </div>

      {/* Error bar */}
      {error && (
        <div className="w-full rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300">
          {error}
        </div>
      )}
    </header>
  );
}
