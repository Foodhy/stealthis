import type { CollectionResource } from "../../lib/styleforge/collections";

interface Props {
  resourceA: CollectionResource;
  resourceB: CollectionResource;
  onBack: () => void;
}

const PROPERTY_ROWS: { key: keyof CollectionResource; label: string; icon: string }[] = [
  { key: "category", label: "Category", icon: "category" },
  { key: "type", label: "Type", icon: "label" },
  { key: "difficulty", label: "Difficulty", icon: "speed" },
];

export function ComparisonScreen({ resourceA, resourceB, onBack }: Props) {
  const differs = (key: keyof CollectionResource) =>
    JSON.stringify(resourceA[key]) !== JSON.stringify(resourceB[key]);

  const sharedTags = resourceA.tags.filter((t) => resourceB.tags.includes(t));
  const uniqueTagsA = resourceA.tags.filter((t) => !resourceB.tags.includes(t));
  const uniqueTagsB = resourceB.tags.filter((t) => !resourceA.tags.includes(t));

  const sharedTech = resourceA.tech.filter((t) => resourceB.tech.includes(t));
  const uniqueTechA = resourceA.tech.filter((t) => !resourceB.tech.includes(t));
  const uniqueTechB = resourceB.tech.filter((t) => !resourceA.tech.includes(t));

  const totalProps = PROPERTY_ROWS.length + 2; // +tags, +tech
  const matchingProps =
    PROPERTY_ROWS.filter((p) => !differs(p.key)).length +
    (uniqueTagsA.length === 0 && uniqueTagsB.length === 0 ? 1 : 0) +
    (uniqueTechA.length === 0 && uniqueTechB.length === 0 ? 1 : 0);
  const similarityPct = Math.round((matchingProps / totalProps) * 100);

  return (
    <div
      className="flex-1 overflow-hidden"
      style={{ background: "var(--sf-surface)", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(13,185,242,0.1)] bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button type="button" className="sf-preview-win-icon-btn" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="text-xs text-primary font-bold uppercase tracking-wider">
              Compare Resources
            </span>
            <span className="text-slate-100 font-semibold text-sm">
              {resourceA.title} vs {resourceB.title}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">contrast</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                  Similarity Score
                </p>
                <p className="text-2xl font-bold text-slate-100">{similarityPct}%</p>
              </div>
            </div>
            <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">
                  Shared Tags
                </p>
                <p className="text-sm font-bold text-slate-100 line-clamp-2">
                  {sharedTags.length > 0 ? sharedTags.join(", ") : "None in common"}
                </p>
              </div>
            </div>
            <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-2xl">info</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">
                  Shared Tech
                </p>
                <p className="text-sm font-bold text-slate-100 line-clamp-2">
                  {sharedTech.length > 0 ? sharedTech.join(", ") : "No overlap"}
                </p>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="glass-effect rounded-2xl overflow-hidden border border-primary/10 bg-[rgba(16,30,34,0.45)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/20 bg-slate-900/60">
                  <th className="p-4 w-1/4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Property
                  </th>
                  <th className="p-4 w-[37.5%] border-l border-primary/10">
                    <span className="block text-[10px] text-primary uppercase font-bold tracking-widest">
                      Resource A
                    </span>
                    <span className="block text-sm font-bold text-slate-100 mt-0.5">
                      {resourceA.title}
                    </span>
                  </th>
                  <th className="p-4 w-[37.5%] border-l border-primary/10 bg-primary/5">
                    <span className="block text-[10px] text-indigo-400 uppercase font-bold tracking-widest">
                      Resource B
                    </span>
                    <span className="block text-sm font-bold text-slate-100 mt-0.5">
                      {resourceB.title}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {PROPERTY_ROWS.map(({ key, label, icon }) => {
                  const isDiff = differs(key);
                  return (
                    <tr
                      key={key}
                      className="border-b border-primary/5 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-4 font-semibold text-slate-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 text-sm">
                          {icon}
                        </span>
                        {label}
                      </td>
                      <td className="p-4 border-l border-primary/10 text-slate-300 capitalize">
                        {String(resourceA[key]).replace(/-/g, " ")}
                      </td>
                      <td
                        className={`p-4 border-l border-primary/10 capitalize ${isDiff ? "bg-amber-500/5 text-amber-200" : "text-slate-300"}`}
                      >
                        {String(resourceB[key]).replace(/-/g, " ")}
                        {isDiff && (
                          <span
                            className="material-symbols-outlined ml-2 text-amber-500 text-sm float-right"
                            title="Different"
                          >
                            assignment_late
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Tags row */}
                <tr className="border-b border-primary/5 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-sm">sell</span>
                    Tags
                  </td>
                  <td className="p-4 border-l border-primary/10">
                    <div className="flex flex-wrap gap-1">
                      {resourceA.tags.map((t) => (
                        <span
                          key={t}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            sharedTags.includes(t)
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 border-l border-primary/10">
                    <div className="flex flex-wrap gap-1">
                      {resourceB.tags.map((t) => (
                        <span
                          key={t}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            sharedTags.includes(t)
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* Tech row */}
                <tr className="border-b border-primary/5 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-sm">code</span>
                    Tech Stack
                  </td>
                  <td className="p-4 border-l border-primary/10">
                    <div className="flex flex-wrap gap-1">
                      {resourceA.tech.map((t) => (
                        <span
                          key={t}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            sharedTech.includes(t)
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                      {resourceA.tech.length === 0 && (
                        <span className="text-xs text-slate-600 italic">none</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 border-l border-primary/10">
                    <div className="flex flex-wrap gap-1">
                      {resourceB.tech.map((t) => (
                        <span
                          key={t}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            sharedTech.includes(t)
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                      {resourceB.tech.length === 0 && (
                        <span className="text-xs text-slate-600 italic">none</span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Targets row */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-sm">
                      devices
                    </span>
                    Targets
                  </td>
                  <td className="p-4 border-l border-primary/10">
                    <div className="flex flex-wrap gap-1">
                      {resourceA.targets.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          {t}
                        </span>
                      ))}
                      {resourceA.targets.length === 0 && (
                        <span className="text-xs text-slate-600 italic">none</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 border-l border-primary/10">
                    <div className="flex flex-wrap gap-1">
                      {resourceB.targets.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          {t}
                        </span>
                      ))}
                      {resourceB.targets.length === 0 && (
                        <span className="text-xs text-slate-600 italic">none</span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
