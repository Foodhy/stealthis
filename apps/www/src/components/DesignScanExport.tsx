/**
 * Descargas y aviso de contraste.
 *
 * El DESIGN.md es el entregable principal; los cuatro formatos derivados están
 * para que el design system se pueda usar sin volver a escribirlo a mano.
 *
 * El aviso de contraste va aquí y no escondido en un informe: el linter oficial
 * valida WCAG AA en cada par de fondo y texto, y un sistema que no lo cumple es
 * justo lo que hay que ver antes de llevárselo a un proyecto.
 */

import { EXPORT_TARGETS, checkContrast } from "@lib/design-scan/export";
import type { Components } from "@lib/design-scan/serialize";
import type { Frontmatter } from "@lib/design-scan/tokens";
import { useMemo, useState } from "react";

/** Descarga sin salir de la página ni pasar por ningún servidor. */
function download(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Sin esto el blob se queda en memoria hasta que se cierre la pestaña.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DesignScanExport({
  front,
  components,
  designMd,
}: {
  front: Frontmatter;
  components: Components;
  designMd: string;
}) {
  const [justDownloaded, setJustDownloaded] = useState("");

  const findings = useMemo(() => checkContrast(front, components), [front, components]);
  const failing = findings.filter((f) => !f.passesAA);

  const grab = (id: string, filename: string, mime: string, content: string) => {
    download(filename, mime, content);
    setJustDownloaded(id);
    setTimeout(() => setJustDownloaded(""), 1500);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">Export</h2>
      <p className="mt-1 text-xs text-slate-500">
        Everything is generated in your browser. Nothing is uploaded.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => grab("designmd", "DESIGN.md", "text/markdown", designMd)}
          className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-400"
        >
          {justDownloaded === "designmd" ? "Downloaded" : "DESIGN.md"}
        </button>

        {EXPORT_TARGETS.map((target) => (
          <button
            key={target.id}
            type="button"
            onClick={() => grab(target.id, target.filename, target.mime, target.build(front))}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 transition-colors hover:border-white/30"
            title={target.filename}
          >
            {justDownloaded === target.id ? "Downloaded" : target.label}
          </button>
        ))}
      </div>

      {/* ── Contraste ─────────────────────────────────────────── */}
      {findings.length > 0 && (
        <div className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Contrast (WCAG AA)
          </h3>

          {failing.length === 0 ? (
            <p className="mt-1.5 text-[11px] text-emerald-300">
              All {findings.length} checkable pairs pass AA.
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-rose-300">
              {failing.length} of {findings.length} pairs are below the 4.5:1 AA threshold for
              normal text.
            </p>
          )}

          <ul className="mt-2 space-y-1">
            {findings.map((f) => (
              <li
                key={f.component}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-1.5"
              >
                <span
                  className="grid h-6 w-10 shrink-0 place-items-center rounded border border-white/10 text-[10px]"
                  style={{ background: f.background, color: f.text }}
                >
                  Aa
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-400">
                  {f.component}
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    f.passesAA
                      ? "text-emerald-300"
                      : f.passesAALarge
                        ? "text-amber-300"
                        : "text-rose-300"
                  }`}
                >
                  {f.ratio.toFixed(2)}:1
                  {!f.passesAA && (f.passesAALarge ? " · large text only" : " · fails AA")}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-[11px] text-slate-600">
            Pairs using translucent or wide-gamut colours are not listed: their contrast cannot be
            computed without rendering the page, and guessing would be worse than staying quiet.
          </p>
        </div>
      )}
    </section>
  );
}
