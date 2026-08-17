/**
 * Qué componentes del DESIGN.md cubre el catálogo de stealthis, y cuáles no.
 *
 * Lo no cubierto se enseña igual de claro que lo cubierto: saber que el
 * catálogo no tiene un equivalente es información útil, y esconderlo detrás de
 * un recurso mediocre haría que la recreación de STL-031 pareciera completa
 * cuando no lo está.
 */

import type { MatchResult } from "@lib/design-scan/mcp";

export default function DesignScanMatches({ result }: { result: MatchResult }) {
  const covered = result.matches.filter((m) => m.candidates.length > 0);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400">
          Catalog matches
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {covered.length} of {result.matches.length} components have a resource in the stealthis
          catalog.
        </p>
      </div>

      <ul className="space-y-2">
        {result.matches.map((match) => {
          const best = match.candidates[0];

          return (
            <li
              key={match.component}
              className="rounded-lg border border-white/[0.06] bg-black/20 p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-300">{match.component}</span>
                {best ? (
                  <span className="font-mono text-[10px] text-slate-600">
                    searched “{match.query}”
                  </span>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
                    not covered
                  </span>
                )}
              </div>

              {best ? (
                <ul className="mt-2 space-y-1">
                  {match.candidates.map((candidate, index) => (
                    <li key={candidate.slug} className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          index === 0 ? "bg-emerald-400" : "bg-slate-700"
                        }`}
                        aria-hidden="true"
                      />
                      <a
                        href={candidate.resourceUrl ?? `https://stealthis.dev/r/${candidate.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`min-w-0 truncate font-mono text-[11px] hover:underline ${
                          index === 0 ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {candidate.slug}
                      </a>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-slate-600">
                        {candidate.category} · {candidate.score}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-slate-600">
                  {match.uncovered} — better to say so than to dress up a resource that does not
                  fit.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
