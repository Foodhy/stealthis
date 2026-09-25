/**
 * La lista de fases: en cuál va el escaneo y qué produjo cada una.
 *
 * Se separa de DesignScan.tsx porque esa ya carga con el selector de modelo y
 * la captura; mezclar aquí el pintado del pipeline dejaría un archivo que nadie
 * quiere abrir.
 */

import type { PhaseId, PhaseState, RunState } from "@lib/design-scan/types";
import { PHASE_LABELS, PHASE_ORDER } from "@lib/design-scan/types";

const STATUS_STYLE: Record<PhaseState["status"], { dot: string; label: string; text: string }> = {
  pending: { dot: "bg-slate-600", label: "Pending", text: "text-slate-500" },
  running: { dot: "bg-brand-400 animate-pulse", label: "Running…", text: "text-brand-200" },
  done: { dot: "bg-emerald-400", label: "Done", text: "text-emerald-300" },
  error: { dot: "bg-rose-400", label: "Failed", text: "text-rose-300" },
  waiting: { dot: "bg-brand-400", label: "Waiting for you", text: "text-brand-200" },
  unavailable: { dot: "bg-slate-700", label: "Not built yet", text: "text-slate-600" },
};

/** Resumen de una línea de lo que produjo la fase. Sin volcar el objeto entero. */
function describeOutput(id: PhaseId, output: unknown): string | null {
  if (output === undefined || output === null) return null;

  if (id === "capture" && typeof output === "object") {
    const c = output as { html?: string; stylesheets?: unknown[]; inlineStyles?: unknown[] };
    const kb = ((c.html?.length ?? 0) / 1024).toFixed(1);
    return `${kb} KB of HTML · ${c.stylesheets?.length ?? 0} sheets · ${c.inlineStyles?.length ?? 0} inline`;
  }

  if (id === "tokens" && typeof output === "object") {
    // "8 keys" no dice nada. Lo que importa es cuánto se extrajo de cada grupo,
    // y qué se dejó fuera a propósito.
    const f = output as {
      colors?: object;
      typography?: object;
      rounded?: object;
      spacing?: object;
      omitted?: { section: string }[];
    };
    const parts = [
      `${Object.keys(f.colors ?? {}).length} colors`,
      `${Object.keys(f.typography ?? {}).length} type levels`,
      `${Object.keys(f.rounded ?? {}).length} radii`,
      `${Object.keys(f.spacing ?? {}).length} spacing steps`,
    ];
    const omitted = (f.omitted ?? []).map((o) => o.section).join(", ");
    return `${parts.join(" · ")}${omitted ? ` — omitted: ${omitted}` : ""}`;
  }

  if (id === "components" && typeof output === "object") {
    const m = output as {
      matches?: unknown[];
      uncovered?: unknown[];
      snippets?: object;
      progress?: { index: number; total: number; component: string };
    };
    const total = m.matches?.length ?? 0;
    const sin = m.uncovered?.length ?? 0;
    const progress = m.progress;
    const progressLine = progress
      ? ` · matching ${progress.index + 1}/${progress.total} · ${progress.component}`
      : "";
    return `${total - sin} of ${total} matched · ${Object.keys(m.snippets ?? {}).length} snippets fetched${
      sin ? ` · ${sin} not covered` : ""
    }${progressLine}`;
  }

  if (id === "recreate" && typeof output === "object") {
    const r = output as { recreated?: unknown[] };
    return `${r.recreated?.length ?? 0} blocks re-skinned with the extracted tokens`;
  }

  if (Array.isArray(output)) return `${output.length} items`;
  if (typeof output === "string") return `${output.length} characters`;
  if (typeof output === "object") return `${Object.keys(output as object).length} keys`;
  return String(output);
}

export default function DesignScanPhases({
  run,
  busy,
  onRetry,
}: {
  run: RunState;
  busy: boolean;
  onRetry: (id: PhaseId) => void;
}) {
  return (
    <ol className="space-y-2">
      {PHASE_ORDER.map((id, index) => {
        const phase = run.phases[id];
        const style = STATUS_STYLE[phase.status];
        const summary = describeOutput(id, phase.output);

        return (
          <li
            key={id}
            className={`rounded-xl border p-4 transition-colors ${
              phase.status === "running"
                ? "border-brand-400/40 bg-brand-500/[0.06]"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium text-slate-100">
                    <span className="mr-2 font-mono text-[10px] text-slate-600">{index + 1}</span>
                    {PHASE_LABELS[id].title}
                  </h3>
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${style.text}`}>
                    {style.label}
                    {phase.attempts > 1 && phase.status !== "done"
                      ? ` · try ${phase.attempts}`
                      : ""}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {PHASE_LABELS[id].blurb}
                </p>

                {summary && (
                  <p className="mt-2 font-mono text-[11px] text-slate-300">→ {summary}</p>
                )}

                {phase.status === "error" && (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-200">
                      {phase.error}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRetry(id)}
                      disabled={busy}
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] text-slate-200 transition-colors hover:border-white/30 disabled:opacity-40"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {phase.status === "waiting" && (
                  <p className="mt-2 text-[11px] text-brand-200/80">
                    The scan stops here until you answer — see the panel below.
                  </p>
                )}

                {phase.status === "unavailable" && (
                  <p className="mt-2 text-[11px] text-slate-600">
                    Arrives in a later task; the scan stops here rather than pretending it ran.
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
