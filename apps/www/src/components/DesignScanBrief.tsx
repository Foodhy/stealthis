/**
 * La pausa: el punto donde el usuario entra en el pipeline.
 *
 * Va después de la prosa y antes de la réplica, y no es opcional: hasta que
 * alguien conteste, el escaneo se queda esperando. Antes el pipeline corría las
 * siete fases de golpe y el resultado no se podía dirigir; esta pantalla es lo
 * que lo arregla.
 *
 * Cuatro cosas se pueden aportar aquí, y cada una tapa un agujero distinto:
 * instrucciones libres, qué componentes generar de verdad, qué recurso del
 * catálogo usar para cada uno, y markup de referencia.
 */

import { searchCatalog } from "@lib/design-scan/mcp";
import type { CatalogEntry } from "@lib/design-scan/mcp";
import type { DeducedComponent, PageStructure } from "@lib/design-scan/structure";
import type { Brief } from "@lib/design-scan/types";
import { useCallback, useEffect, useState } from "react";

export default function DesignScanBrief({
  structure,
  initial,
  busy,
  onContinue,
}: {
  structure: PageStructure | null;
  initial: Brief;
  busy: boolean;
  onContinue: (brief: Brief) => void;
}) {
  const proposed: DeducedComponent[] = structure?.components ?? [];

  const [notes, setNotes] = useState(initial.notes);
  const [reference, setReference] = useState(initial.reference);
  const [chosen, setChosen] = useState<string[]>(
    initial.components.length ? initial.components : proposed.map((c) => c.name)
  );
  const [pinned, setPinned] = useState<Record<string, string>>(initial.pinned);
  const [extra, setExtra] = useState("");

  // Buscador del catálogo, para fijar un recurso en vez de dejarlo al ranking.
  const [pinningFor, setPinningFor] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogEntry[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    // Se espera a que pare de escribir: cada tecla no merece una petición.
    const timer = setTimeout(() => {
      setSearching(true);
      searchCatalog(query.trim())
        .then((r) => setResults(r.slice(0, 8)))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const toggle = useCallback((name: string) => {
    setChosen((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }, []);

  const addExtra = useCallback(() => {
    const name = extra.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    setChosen((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setExtra("");
  }, [extra]);

  const evidenceOf = (name: string) => proposed.find((c) => c.name === name)?.evidence;

  return (
    <section className="rounded-xl border border-brand-400/40 bg-brand-500/[0.06] p-5">
      <div className="mb-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-200">
          Your turn — the scan is waiting
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          The DESIGN.md is done. Say what matters before the page gets rebuilt; everything below is
          optional, and this survives a reload.
        </p>
      </div>

      {structure && structure.warnings.length > 0 && (
        <ul className="mb-4 space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3">
          {structure.warnings.map((w) => (
            <li key={w} className="text-[11px] text-amber-200/80">
              · {w}
            </li>
          ))}
        </ul>
      )}

      {/* ── Lo que se leyó de la página ───────────────────────── */}
      {structure && structure.sections.length > 0 && (
        <details className="mb-4 rounded-lg border border-white/[0.06] bg-black/20 p-3">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
            What was read from the page ({structure.sections.length} sections)
          </summary>
          <ul className="mt-2 space-y-1">
            {structure.sections.map((s) => (
              <li key={s.heading} className="flex gap-2 text-[11px] text-slate-400">
                <span className="font-mono text-slate-600">h{s.level}</span>
                <span className="min-w-0 flex-1 truncate">{s.heading}</span>
                {s.repeated >= 2 && <span className="font-mono text-slate-600">×{s.repeated}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* ── 1. Instrucciones ─────────────────────────────────── */}
      <div className="mb-4">
        <label
          htmlFor="brief-notes"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"
        >
          Notes for the model
        </label>
        <textarea
          id="brief-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="The hero has two buttons. Keep the nav sticky. Add a testimonials section."
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none focus:border-brand-400"
        />
      </div>

      {/* ── 2. Qué componentes ───────────────────────────────── */}
      <div className="mb-4">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
          Components to build ({chosen.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[...new Set([...proposed.map((c) => c.name), ...chosen])].map((name) => {
            const on = chosen.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                title={evidenceOf(name) ?? "added by you"}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  on
                    ? "border-brand-400/60 bg-brand-500/10 text-white"
                    : "border-white/10 text-slate-500 line-through hover:border-white/25"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addExtra();
              }
            }}
            placeholder="add one the page did not show"
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-slate-200 outline-none focus:border-brand-400"
          />
          <button
            type="button"
            onClick={addExtra}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:border-white/30"
          >
            Add
          </button>
        </div>

        <p className="mt-1.5 text-[11px] text-slate-600">
          Each one was proposed because of something in the markup — hover to see what. Click to
          drop the ones that make no sense.
        </p>
      </div>

      {/* ── 3. Fijar recursos del catálogo ───────────────────── */}
      <div className="mb-4 rounded-lg border border-white/[0.06] bg-black/20 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
          Pin a catalog resource
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={pinningFor}
            onChange={(e) => setPinningFor(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[11px] text-slate-200 outline-none focus:border-brand-400"
          >
            <option value="">for which component…</option>
            {chosen.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!pinningFor}
            placeholder={pinningFor ? "search the stealthis catalog…" : "pick a component first"}
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-slate-200 outline-none focus:border-brand-400 disabled:opacity-40"
          />
        </div>

        {searching && <p className="mt-2 text-[11px] text-slate-500">Searching…</p>}

        {results.length > 0 && pinningFor && (
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto">
            {results.map((r) => (
              <li key={r.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setPinned((prev) => ({ ...prev, [pinningFor]: r.slug }));
                    setQuery("");
                    setResults([]);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-300">
                    {r.slug}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-600">
                    {r.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {Object.keys(pinned).length > 0 && (
          <ul className="mt-2 space-y-1">
            {Object.entries(pinned).map(([component, slug]) => (
              <li key={component} className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-slate-400">{component}</span>
                <span className="text-slate-700">→</span>
                <span className="min-w-0 flex-1 truncate font-mono text-emerald-300">{slug}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPinned((prev) => {
                      const next = { ...prev };
                      delete next[component];
                      return next;
                    })
                  }
                  className="text-slate-500 transition-colors hover:text-rose-300"
                  aria-label={`unpin ${component}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 text-[11px] text-slate-600">
          A pinned resource is used as-is, without going through the automatic ranking.
        </p>
      </div>

      {/* ── 4. Referencia ────────────────────────────────────── */}
      <div className="mb-4">
        <label
          htmlFor="brief-reference"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"
        >
          Reference markup (optional)
        </label>
        <textarea
          id="brief-reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          rows={3}
          placeholder="<section class='hero'>…</section>"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-slate-200 outline-none focus:border-brand-400"
        />
      </div>

      <button
        type="button"
        onClick={() => onContinue({ notes, components: chosen, pinned, reference })}
        disabled={busy}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Working…" : "Rebuild the page"}
      </button>

      <p className="mt-2 text-[11px] text-slate-600">
        You can leave everything empty and continue; the scan will just use what it read on its own.
      </p>
    </section>
  );
}
