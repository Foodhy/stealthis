import { useState, useEffect, useRef } from "react";
import type { CollectionResource } from "../../lib/styleforge/collections";

interface Props {
  onSelectResource: (resource: CollectionResource) => void;
}

interface SearchResponse {
  query: string;
  filters: { type?: string; category?: string };
  results: CollectionResource[];
  total: number;
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

const POPULAR_SEARCHES = ["button", "modal", "dashboard", "animation", "form", "navigation", "card", "glassmorphism"];
const TYPE_OPTIONS = ["component", "page", "animation", "pattern", "prompt", "schema"];
const CATEGORY_OPTIONS = [
  "ui-components",
  "web-animations",
  "patterns",
  "pages",
  "web-pages",
  "design-styles",
  "prompts",
  "remotion",
  "database-schemas",
];

export function SearchDiscovery({ onSelectResource }: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [results, setResults] = useState<CollectionResource[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = async (q: string, type: string | null, category: string | null) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      if (category) params.set("category", category);

      const resp = await fetch(`/api/styleforge/collections?${params.toString()}`);
      if (!resp.ok) throw new Error("Search failed");
      const data = (await resp.json()) as SearchResponse;
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.trim() || typeFilter || categoryFilter) {
        doSearch(query, typeFilter, categoryFilter);
      } else {
        setHasSearched(false);
        setResults([]);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, typeFilter, categoryFilter]);

  const sorted = sortBy === "name"
    ? [...results].sort((a, b) => a.title.localeCompare(b.title))
    : results;

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header / Search */}
        <div className="flex flex-col items-center justify-center py-10 space-y-6 border-b border-[rgba(13,185,242,0.1)]">
          <h2 className="text-3xl font-bold text-slate-100">Search & Discovery</h2>
          <p className="text-slate-400 text-sm max-w-lg text-center">
            Find specific components, tokens, or entire collections from the repository.
          </p>
          <div className="sf-search-wrap" style={{ maxWidth: "40rem", width: "100%" }}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
              search
            </span>
            <input
              className="sf-search-input py-4 pl-14 text-base"
              placeholder="E.g., 'primary button', 'dark mode palette', 'admin layout'..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3 flex-wrap justify-center mt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2 flex items-center">
              Popular:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:text-primary hover:border-primary/50 transition-colors capitalize"
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters */}
          <div className="w-64 shrink-0 space-y-6 hidden lg:block">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</h4>
              <div className="space-y-2">
                {TYPE_OPTIONS.map((type) => {
                  const isChecked = typeFilter === type;
                  return (
                    <label key={type} className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                      <button
                        type="button"
                        className="w-4 h-4 rounded border flex items-center justify-center"
                        style={{
                          borderColor: isChecked ? "var(--sf-primary)" : "rgba(100,116,139,0.5)",
                          background: isChecked ? "var(--sf-primary-dim)" : "rgb(30,41,59)",
                        }}
                        onClick={() => setTypeFilter(isChecked ? null : type)}
                      >
                        {isChecked && (
                          <span className="material-symbols-outlined text-[10px] text-primary">check</span>
                        )}
                      </button>
                      <span className="group-hover:text-slate-100 capitalize">{type}s</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</h4>
              <div className="space-y-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isChecked = categoryFilter === cat;
                  return (
                    <label key={cat} className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                      <button
                        type="button"
                        className="w-4 h-4 rounded border flex items-center justify-center"
                        style={{
                          borderColor: isChecked ? "var(--sf-primary)" : "rgba(100,116,139,0.5)",
                          background: isChecked ? "var(--sf-primary-dim)" : "rgb(30,41,59)",
                        }}
                        onClick={() => setCategoryFilter(isChecked ? null : cat)}
                      >
                        {isChecked && (
                          <span className="material-symbols-outlined text-[10px] text-primary">check</span>
                        )}
                      </button>
                      <span className="group-hover:text-slate-100">{cat.replace(/-/g, " ")}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {(typeFilter || categoryFilter) && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => { setTypeFilter(null); setCategoryFilter(null); }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 space-y-6">
            {hasSearched && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">
                  {isLoading ? "Searching..." : `${total} Results found`}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Sort by:</span>
                  <select
                    className="bg-slate-800 border-none rounded text-sm text-slate-200 py-1 pl-2 pr-8 focus:ring-1 focus:ring-primary outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "relevance" | "name")}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            )}

            {hasSearched && !isLoading && sorted.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((resource) => (
                  <button
                    key={resource.slug}
                    type="button"
                    className="sf-comp-tile text-left"
                    style={{ alignItems: "flex-start", padding: "1.25rem" }}
                    onClick={() => onSelectResource(resource)}
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <div
                        className="sf-comp-tile-icon"
                        style={{ width: "2.5rem", height: "2.5rem" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          {TYPE_ICONS[resource.type] ?? "circle"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                        {resource.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mb-1">{resource.title}</h4>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{resource.description}</p>
                    <div className="mt-auto pt-3 border-t border-[rgba(13,185,242,0.1)] w-full flex justify-between items-center">
                      <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold capitalize">
                        {resource.category.replace(/-/g, " ")}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">visibility</span> Preview
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {hasSearched && !isLoading && sorted.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <span className="material-symbols-outlined text-5xl mb-3 block">search_off</span>
                <p className="text-lg font-semibold mb-1">No results found</p>
                <p className="text-sm">Try different keywords or adjust your filters.</p>
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-16 text-slate-500">
                <span className="material-symbols-outlined text-5xl mb-3 block">manage_search</span>
                <p className="text-lg font-semibold mb-1">Start searching</p>
                <p className="text-sm">Type a query or click a popular search above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
