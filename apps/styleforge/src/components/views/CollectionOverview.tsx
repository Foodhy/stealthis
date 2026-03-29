import { useState, useMemo } from "react";
import type { StyleForgeCollectionGroup, CollectionResource } from "../../lib/styleforge/collections";

interface Props {
  explicit: StyleForgeCollectionGroup[];
  byCategory: StyleForgeCollectionGroup[];
  onSelectCollection: (collection: StyleForgeCollectionGroup) => void;
  onNewCollection: () => void;
}

const ICON_MAP: Record<string, string> = {
  "cat-ui-components": "widgets",
  "cat-web-animations": "animation",
  "cat-patterns": "pattern",
  "cat-pages": "web",
  "cat-web-pages": "language",
  "cat-design-styles": "palette",
  "cat-prompts": "psychology",
  "cat-remotion": "movie",
  "cat-database-schemas": "storage",
  "cat-components": "view_module",
  "cat-ultra-high-definition-pages": "4k",
  saas: "cloud",
  motion: "slow_motion_video",
  hero: "landscape",
  cards: "view_agenda",
  dashboard: "dashboard",
  remotion: "videocam",
  effects: "auto_awesome",
};

export function CollectionOverview({ explicit, byCategory, onSelectCollection, onNewCollection }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"items" | "name">("items");
  const [showExplicit, setShowExplicit] = useState(true);

  const allCollections = useMemo(() => {
    const combined = [...explicit, ...byCategory];
    let filtered = combined;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = combined.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered.sort((a, b) => b.itemCount - a.itemCount);
    }
    return filtered;
  }, [explicit, byCategory, search, sortBy]);

  const explicitCollections = allCollections.filter((c) => c.source === "explicit");
  const categoryCollections = allCollections.filter((c) => c.source === "category");

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="sf-controls-bar">
          <div className="sf-search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input
              className="sf-search-input"
              placeholder="Search collections..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sf-controls-actions">
            <button
              type="button"
              className={`sf-pill-btn ${showExplicit ? "is-active" : ""}`}
              onClick={() => setShowExplicit(!showExplicit)}
            >
              <span className="material-symbols-outlined">filter_list</span>
              <span>{showExplicit ? "All" : "Categories Only"}</span>
            </button>
            <button
              type="button"
              className="sf-pill-btn"
              onClick={() => setSortBy(sortBy === "items" ? "name" : "items")}
            >
              <span className="material-symbols-outlined">sort</span>
              <span>{sortBy === "items" ? "By Size" : "A-Z"}</span>
            </button>
            <button type="button" className="sf-cta-btn ml-auto md:ml-0" onClick={onNewCollection}>
              <span className="material-symbols-outlined">add</span>
              <span>New Collection</span>
            </button>
          </div>
        </div>

        {/* Explicit Collections */}
        {showExplicit && explicitCollections.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Curated Collections ({explicitCollections.length})
            </h3>
            <div className="sf-coll-grid">
              {explicitCollections.map((coll) => (
                <CollectionCard
                  key={coll.id}
                  collection={coll}
                  onClick={() => onSelectCollection(coll)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Collections */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            By Category ({categoryCollections.length})
          </h3>
          <div className="sf-coll-grid">
            {categoryCollections.map((coll) => (
              <CollectionCard
                key={coll.id}
                collection={coll}
                onClick={() => onSelectCollection(coll)}
              />
            ))}
            {/* New collection card */}
            <button type="button" className="sf-coll-new-card" onClick={onNewCollection}>
              <div className="sf-coll-new-icon">
                <span className="material-symbols-outlined text-2xl">add_circle</span>
              </div>
              <span className="sf-coll-new-label">Create New Collection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({
  collection,
  onClick,
}: {
  collection: StyleForgeCollectionGroup;
  onClick: () => void;
}) {
  const icon = ICON_MAP[collection.id] ?? "folder";
  const topTags = collection.tags.slice(0, 4);
  const sourceBadge = collection.source === "explicit" ? "Curated" : "Category";

  return (
    <button type="button" className="sf-coll-card text-left" onClick={onClick}>
      <div className="sf-coll-thumb" style={{ background: "var(--sf-surface-mid)" }}>
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "3rem", color: "var(--sf-primary)", opacity: 0.6 }}
          >
            {icon}
          </span>
        </div>
        <div className="sf-coll-cat-badge">{sourceBadge}</div>
      </div>
      <div className="sf-coll-card-main">
        <h3>{collection.name}</h3>
        <p className="sf-coll-card-desc">{collection.description}</p>
        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topTags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="sf-coll-card-foot">
        <div className="sf-coll-item-count">
          <span className="material-symbols-outlined">inventory_2</span>
          <span>{collection.itemCount} Items</span>
        </div>
      </div>
    </button>
  );
}
