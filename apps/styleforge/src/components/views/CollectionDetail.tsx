import { useState, useMemo } from "react";
import type { StyleForgeCollectionGroup, CollectionResource } from "../../lib/styleforge/collections";

interface Props {
  collection: StyleForgeCollectionGroup;
  onBack: () => void;
  onCompare: (a: CollectionResource, b: CollectionResource) => void;
  onPreview: (resource: CollectionResource) => void;
}

const TYPE_ICONS: Record<string, string> = {
  component: "widgets",
  page: "web",
  animation: "animation",
  pattern: "pattern",
  prompt: "psychology",
  schema: "storage",
  skill: "school",
  "mcp-server": "dns",
  boilerplate: "code",
  architecture: "account_tree",
};

const LAB_BASE_URL = import.meta.env.DEV ? "http://localhost:4323" : "https://lab.stealthis.dev";

export function CollectionDetail({ collection, onBack, onCompare, onPreview }: Props) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [previewResource, setPreviewResource] = useState<CollectionResource | null>(null);

  const types = useMemo(() => {
    const typeMap = new Map<string, number>();
    for (const r of collection.resources) {
      typeMap.set(r.type, (typeMap.get(r.type) ?? 0) + 1);
    }
    return [...typeMap.entries()].sort((a, b) => b[1] - a[1]);
  }, [collection]);

  const filtered = useMemo(() => {
    let items = collection.resources;
    if (selectedType) {
      items = items.filter((r) => r.type === selectedType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return items;
  }, [collection, search, selectedType]);

  const toggleSelect = (slug: string) => {
    setSelectedResources((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else if (next.size < 2) next.add(slug);
      return next;
    });
  };

  const handleCompare = () => {
    const selected = collection.resources.filter((r) => selectedResources.has(r.slug));
    if (selected.length === 2) {
      onCompare(selected[0], selected[1]);
    }
  };

  const current = previewResource;

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ background: "var(--sf-surface)" }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-[rgba(13,185,242,0.1)] pb-8 mb-4">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="sf-preview-win-icon-btn"
              onClick={onBack}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="inline-flex items-center px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-wider">
              {collection.source === "explicit" ? "Curated Collection" : "Category Collection"}
            </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-100 m-0">
            {collection.name}
          </h2>
          <p className="text-sm text-slate-400">{collection.description}</p>
          <div className="flex gap-6 text-sm text-slate-400 mt-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">inventory_2</span>
              <span>{collection.itemCount} resources</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">category</span>
              <span>{types.length} types</span>
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div
          className="w-full lg:w-72 p-5 rounded-xl space-y-4"
          style={{ background: "rgba(34,63,73,0.4)", border: "1px solid rgba(13,185,242,0.1)" }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
              Resource Distribution
            </span>
          </div>
          {types.slice(0, 5).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-sm" style={{ color: "var(--sf-primary)" }}>
                {TYPE_ICONS[type] ?? "circle"}
              </span>
              <span className="flex-1">{type}</span>
              <span className="font-bold text-slate-300">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="sf-search-wrap flex-1" style={{ maxWidth: "24rem" }}>
          <span className="material-symbols-outlined">search</span>
          <input
            className="sf-search-input"
            placeholder="Search in collection..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className={`sf-pill-btn ${!selectedType ? "is-active" : ""}`}
            onClick={() => setSelectedType(null)}
          >
            All ({collection.itemCount})
          </button>
          {types.map(([type, count]) => (
            <button
              key={type}
              type="button"
              className={`sf-pill-btn ${selectedType === type ? "is-active" : ""}`}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
            >
              {type} ({count})
            </button>
          ))}
        </div>
        {selectedResources.size === 2 && (
          <button type="button" className="sf-cta-btn" onClick={handleCompare}>
            <span className="material-symbols-outlined">compare</span>
            Compare Selected
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Resource list */}
        <div className={current ? "col-span-12 lg:col-span-4 space-y-2" : "col-span-12"}>
          <div className={current ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
            {filtered.map((resource) => {
              const isSelected = selectedResources.has(resource.slug);
              return (
                <div
                  key={resource.slug}
                  className={`sf-comp-tile ${isSelected ? "is-active" : ""}`}
                  style={{ alignItems: current ? "center" : "flex-start", padding: "1rem", cursor: "pointer" }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <button
                      type="button"
                      className="shrink-0 w-5 h-5 rounded border flex items-center justify-center"
                      style={{
                        borderColor: isSelected ? "var(--sf-primary)" : "rgba(100,116,139,0.5)",
                        background: isSelected ? "var(--sf-primary-dim)" : "transparent",
                      }}
                      onClick={(e) => { e.stopPropagation(); toggleSelect(resource.slug); }}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[10px] text-primary">check</span>
                      )}
                    </button>
                    <div
                      className="sf-comp-tile-icon shrink-0"
                      style={{ width: "2rem", height: "2rem" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        {TYPE_ICONS[resource.type] ?? "circle"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => { setPreviewResource(resource); onPreview(resource); }}>
                      <h4 className="text-sm font-bold text-slate-100 truncate">{resource.title}</h4>
                      {!current && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{resource.description}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase shrink-0">
                      {resource.type}
                    </span>
                  </div>
                  {!current && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pl-10">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/60 text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
              No resources match your search.
            </div>
          )}
        </div>

        {/* Preview panel */}
        {current && (
          <div className="col-span-12 lg:col-span-8">
            <div className="sf-preview-window">
              <div className="sf-preview-win-bar">
                <div className="flex items-center gap-4">
                  <div className="sf-preview-win-dots">
                    <i /><i /><i />
                  </div>
                  <span className="sf-preview-win-title">{current.title}</span>
                </div>
                <div className="sf-preview-win-actions">
                  {current.labRoute && (
                    <a
                      href={`${LAB_BASE_URL}${current.labRoute}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sf-preview-win-btn"
                    >
                      Open in Lab
                    </a>
                  )}
                  <button
                    type="button"
                    className="sf-preview-win-icon-btn"
                    onClick={() => setPreviewResource(null)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="sf-preview-win-canvas">
                <div className="max-w-3xl mx-auto w-full space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100">{current.title}</h3>
                    <p className="text-sm text-slate-400">{current.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</span>
                      <p className="text-sm text-slate-300">{current.category}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Difficulty</span>
                      <p className="text-sm text-slate-300 capitalize">{current.difficulty}</p>
                    </div>
                  </div>

                  {current.tech.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tech Stack</span>
                      <div className="flex flex-wrap gap-2">
                        {current.tech.map((t) => (
                          <span key={t} className="px-2 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {current.targets.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Targets</span>
                      <div className="flex flex-wrap gap-2">
                        {current.targets.map((t) => (
                          <span key={t} className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {current.tags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {current.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/60 text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {current.labRoute && (
                    <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2 text-primary text-sm font-bold mb-2">
                        <span className="material-symbols-outlined">science</span>
                        Live Preview Available
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        This resource has an interactive demo in the Lab.
                      </p>
                      <a
                        href={`${LAB_BASE_URL}${current.labRoute}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sf-cta-btn inline-flex"
                      >
                        Open in Lab
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
