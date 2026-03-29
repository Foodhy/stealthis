import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "../lib/workspace-context";
import {
  type AiProvider,
  PROVIDER_DEFAULTS,
  loadProviderConfig,
  saveProviderConfig,
} from "../lib/ai-providers";

type OAuthStatus = {
  loggedIn: boolean;
  email?: string;
  expired?: boolean;
  hasCodexCli?: boolean;
};

function ChatGptOAuthSection() {
  const [status, setStatus] = useState<OAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });
      const data = (await res.json()) as OAuthStatus;
      setStatus(data);
      setError("");
    } catch {
      setStatus({ loggedIn: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSync = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-codex" }),
      });
      if (res.ok) {
        await checkStatus();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to sync");
      }
    } catch {
      setError("Failed to sync");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      if (res.ok) {
        await checkStatus();
      } else {
        setError("Refresh failed. Run 'codex' to re-authenticate.");
      }
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/auth/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setStatus({ loggedIn: false });
    } catch {
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p className="text-[10px] text-slate-500">Checking OAuth status...</p>;
  }

  if (status?.loggedIn) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400">Signed in via ChatGPT</p>
            {status.email && <p className="mt-0.5 text-[10px] text-slate-400">{status.email}</p>}
            {status.expired && <p className="mt-0.5 text-[10px] text-amber-400">Token expired</p>}
          </div>
          <div className="flex gap-1.5">
            {status.expired && (
              <button
                onClick={handleRefresh}
                disabled={actionLoading}
                className="rounded bg-amber-600/30 px-2 py-1 text-[10px] font-medium text-amber-300 hover:bg-amber-600/50 disabled:opacity-40"
              >
                Refresh
              </button>
            )}
            <button
              onClick={handleSync}
              disabled={actionLoading}
              className="rounded bg-white/6 px-2 py-1 text-[10px] font-medium text-slate-400 hover:bg-white/10 disabled:opacity-40"
              title="Re-sync tokens from Codex CLI"
            >
              Sync
            </button>
            <button
              onClick={handleLogout}
              disabled={actionLoading}
              className="rounded bg-red-600/20 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-600/40 disabled:opacity-40"
            >
              Sign out
            </button>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-slate-500">
          Uses your ChatGPT Plus subscription. No API key needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
        <p className="text-xs font-medium text-slate-300">How to connect ChatGPT</p>
        <ol className="mt-2 space-y-1 text-[10px] text-slate-400">
          <li>
            1. Install the Codex CLI:{" "}
            <code className="rounded bg-white/6 px-1 text-slate-300">npm i -g @openai/codex</code>
          </li>
          <li>
            2. Run <code className="rounded bg-white/6 px-1 text-slate-300">codex</code> and sign in
            with your ChatGPT account
          </li>
          <li>3. Click "Sync from Codex CLI" below</li>
        </ol>
      </div>

      <button
        onClick={handleSync}
        disabled={actionLoading}
        className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
      >
        {actionLoading ? "Syncing..." : "Sync from Codex CLI"}
      </button>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      <p className="text-[10px] text-slate-500">
        Vibe reads your ChatGPT tokens from{" "}
        <code className="text-slate-400">~/.codex/auth.json</code> and auto-refreshes them.
      </p>
    </div>
  );
}

export default function SettingsPanel() {
  const { dispatch } = useWorkspace();

  const [cfg, setCfg] = useState(loadProviderConfig);

  function update(patch: Partial<typeof cfg>) {
    setCfg((prev) => {
      const next = { ...prev, ...patch };
      saveProviderConfig(next);
      (window as any).__vibeAiConfig = next;
      return next;
    });
  }

  const provider = cfg.provider;
  const defaults = PROVIDER_DEFAULTS[provider];
  const needsApiKey = provider !== "ollama" && provider !== "openai-codex";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-white/8 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
          <h2 className="text-sm font-medium text-slate-200">Provider Settings</h2>
          <button
            onClick={() => dispatch({ type: "SET_SETTINGS_OPEN", payload: false })}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Provider tabs */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-300">Provider</label>
            <div className="flex flex-wrap rounded-md border border-white/8">
              {(Object.keys(PROVIDER_DEFAULTS) as AiProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    update({
                      provider: p,
                      baseUrl: PROVIDER_DEFAULTS[p].baseUrl,
                      apiKey: p === "ollama" || p === "openai-codex" ? "" : cfg.apiKey,
                      model: "",
                    })
                  }
                  className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    provider === p
                      ? "bg-vibe-600/20 text-vibe-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {PROVIDER_DEFAULTS[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* ChatGPT OAuth section */}
          {provider === "openai-codex" && <ChatGptOAuthSection />}

          {/* Base URL (not for ChatGPT OAuth) */}
          {provider !== "openai-codex" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Base URL</label>
              <input
                value={cfg.baseUrl}
                onChange={(e) => update({ baseUrl: e.target.value })}
                placeholder={defaults.baseUrl}
                className="w-full rounded-lg border border-white/8 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-vibe-500/50"
              />
            </div>
          )}

          {/* API Key */}
          {needsApiKey && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">API Key</label>
              <input
                value={cfg.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder={
                  provider === "openai" ? "sk-..." : provider === "claude" ? "sk-ant-..." : "AI..."
                }
                type="password"
                className="w-full rounded-lg border border-white/8 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-vibe-500/50"
              />
              {defaults.keyUrl && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Get your key at{" "}
                  <span className="text-slate-400">{defaults.keyUrl.replace("https://", "")}</span>
                </p>
              )}
            </div>
          )}

          {provider === "ollama" && (
            <p className="text-[10px] text-slate-500">
              Ollama runs locally — no API key needed. Make sure Ollama is running.
            </p>
          )}

          <p className="text-[10px] text-slate-500">
            {provider === "openai-codex"
              ? "OAuth tokens are stored server-side in ~/.vibe/"
              : "Settings are stored in your browser's localStorage."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/8 px-5 py-3">
          <button
            onClick={() => dispatch({ type: "SET_SETTINGS_OPEN", payload: false })}
            className="rounded-lg bg-vibe-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-vibe-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
