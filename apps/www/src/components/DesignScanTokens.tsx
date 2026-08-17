/**
 * El frontmatter extraído, con los colores y la tipografía pintados con sus
 * propios valores.
 *
 * Una tabla de hex no dice nada; un cuadrado del color sí. Y ver la escala
 * tipográfica renderizada es lo único que delata rápido si la extracción se
 * equivocó de familia o de tamaño.
 */

import type { Frontmatter } from "@lib/design-scan/tokens";
import { useState } from "react";

export default function DesignScanTokens({
  front,
  yaml,
  designMd,
}: {
  front: Frontmatter;
  yaml: string;
  designMd: string;
}) {
  const [tab, setTab] = useState<"preview" | "yaml">("preview");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(designMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el texto sigue visible en la pestaña YAML.
    }
  };

  const colors = Object.entries(front.colors ?? {});
  const typography = Object.entries(front.typography ?? {});

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
            DESIGN.md front matter
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {front.name} · {colors.length} colors · {typography.length} type levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {(["preview", "yaml"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-[11px] transition-colors ${
                  tab === t ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "preview" ? "Preview" : "YAML"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-slate-200 transition-colors hover:border-white/30"
          >
            {copied ? "Copied" : "Copy DESIGN.md"}
          </button>
        </div>
      </div>

      {tab === "yaml" ? (
        <pre className="max-h-96 overflow-auto rounded-lg border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-slate-300">
          {yaml}
        </pre>
      ) : (
        <div className="space-y-5">
          {colors.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Colors
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.slice(0, 48).map(([name, value]) => (
                  <div key={name} className="w-28" title={`${name}: ${value}`}>
                    <div
                      className="h-10 rounded-md border border-white/10"
                      style={{ background: value }}
                    />
                    <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{name}</p>
                    <p className="truncate font-mono text-[10px] text-slate-600">{value}</p>
                  </div>
                ))}
              </div>
              {colors.length > 48 && (
                <p className="mt-2 text-[11px] text-slate-500">
                  and {colors.length - 48} more — all of them are in the YAML.
                </p>
              )}
            </div>
          )}

          {typography.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Typography
              </h3>
              <ul className="space-y-2">
                {typography.map(([name, t]) => (
                  <li
                    key={name}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-white/[0.06] border-b pb-2 last:border-0"
                  >
                    <span
                      className="min-w-0 truncate text-slate-100"
                      style={{
                        fontFamily: t.fontFamily,
                        // Se topa a 28px para que un display de 84px no rompa
                        // la lista; el valor real va al lado.
                        fontSize: `min(${t.fontSize ?? "16px"}, 28px)`,
                        fontWeight: t.fontWeight,
                        letterSpacing: t.letterSpacing,
                      }}
                    >
                      {name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {[t.fontFamily, t.fontSize, t.fontWeight, t.letterSpacing]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {front.omitted && front.omitted.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Omitted on purpose
              </h3>
              <ul className="space-y-1 text-[11px] text-slate-500">
                {front.omitted.map((o) => (
                  <li key={o.section}>
                    <span className="font-mono text-slate-400">{o.section}</span> — {o.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
