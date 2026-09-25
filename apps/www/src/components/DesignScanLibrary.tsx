/**
 * Escaneos guardados en este navegador: abrir, borrar, exportar, importar.
 */

import type { ScanListItem } from "@lib/design-scan/store";
import { useRef, useState } from "react";

export default function DesignScanLibrary({
  scans,
  activeId,
  onOpen,
  onDelete,
  onExport,
  onImportFile,
  onNewScan,
  importError,
}: {
  scans: ScanListItem[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onImportFile: (file: File) => void;
  onNewScan: () => void;
  importError?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
            Saved scans
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Stored in this browser. Export a scan as JSON to share it; import adds it to your list.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImporting(true);
                onImportFile(file);
                setImporting(false);
              }
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-slate-200 transition-colors hover:border-white/30 disabled:opacity-40"
          >
            Import
          </button>
          <button
            type="button"
            onClick={onNewScan}
            className="rounded-lg border border-brand-400/50 bg-brand-500/10 px-3 py-1.5 text-[11px] font-medium text-brand-100 transition-colors hover:border-brand-400"
          >
            New scan
          </button>
        </div>
      </div>

      {importError && (
        <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {importError}
        </p>
      )}

      {scans.length === 0 ? (
        <p className="text-[11px] text-slate-600">No scans yet — paste a URL above and scan.</p>
      ) : (
        <ul className="space-y-1.5">
          {scans.map((scan) => {
            const active = scan.id === activeId;
            return (
              <li
                key={scan.id}
                className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 ${
                  active
                    ? "border-brand-400/40 bg-brand-500/[0.08]"
                    : "border-white/[0.06] bg-black/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onOpen(scan.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm text-slate-200">{scan.hostname}</span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">
                    {scan.url}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] text-slate-600">
                    <span>{scan.progress}</span>
                    <span>{new Date(scan.updatedAt).toLocaleString()}</span>
                  </span>
                </button>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onExport(scan.id)}
                    className="rounded border border-white/10 px-2 py-1 text-[10px] text-slate-300 transition-colors hover:border-white/25"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(scan.id)}
                    className="rounded border border-white/10 px-2 py-1 text-[10px] text-slate-400 transition-colors hover:border-rose-500/40 hover:text-rose-300"
                    aria-label={`Delete scan of ${scan.hostname}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
