export function SearchDiscovery() {
    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header / Search Area */}
                <div className="flex flex-col items-center justify-center py-10 space-y-6 border-b border-[rgba(13,185,242,0.1)]">
                    <h2 className="text-3xl font-bold text-slate-100">Search & Discovery</h2>
                    <p className="text-slate-400 text-sm max-w-lg text-center">Find specific components, tokens, or entire collections from the repository.</p>
                    <div className="sf-search-wrap" style={{ maxWidth: "40rem", width: "100%" }}>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">search</span>
                        <input
                            className="sf-search-input py-4 pl-14 text-base"
                            placeholder="E.g., 'primary button', 'dark mode palette', 'admin layout'..."
                            type="text"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center mt-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2 flex items-center">Popular:</span>
                        <button className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:text-primary hover:border-primary/50 transition-colors">Buttons</button>
                        <button className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:text-primary hover:border-primary/50 transition-colors">Navigation</button>
                        <button className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:text-primary hover:border-primary/50 transition-colors">Modals</button>
                        <button className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:text-primary hover:border-primary/50 transition-colors">Forms</button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-64 shrink-0 space-y-6 hidden lg:block">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-primary bg-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[10px] text-primary">check</span>
                                    </div>
                                    <span className="group-hover:text-slate-100">Components</span>
                                </label>
                                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                                    <span className="group-hover:text-slate-100">Collections</span>
                                </label>
                                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                                    <span className="group-hover:text-slate-100">Design Tokens</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                                    <span className="group-hover:text-slate-100">UI Elements</span>
                                </label>
                                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                                    <span className="group-hover:text-slate-100">Typography</span>
                                </label>
                                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                                    <span className="group-hover:text-slate-100">Layout</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-200">24 Results found</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <select className="bg-slate-800 border-none rounded text-sm text-slate-200 py-1 pl-2 pr-8 focus:ring-1 focus:ring-primary outline-none">
                                    <option>Relevance</option>
                                    <option>Newest</option>
                                    <option>Most Used</option>
                                </select>
                            </div>
                        </div>

                        {/* Component Icon Tile style for results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="sf-comp-tile is-active" style={{ alignItems: "flex-start", padding: "1.25rem" }}>
                                <div className="flex items-start justify-between w-full mb-3">
                                    <div className="sf-comp-tile-icon" style={{ background: "rgba(13,185,242,0.15)", width: "2.5rem", height: "2.5rem" }}>
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>smart_button</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">COMP</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-100 mb-1">Primary Button</h4>
                                <p className="text-xs text-slate-400 mb-3 line-clamp-2">Standard high-emphasis primary action button with hover states and active glow.</p>
                                <div className="mt-auto pt-3 border-t border-[rgba(13,185,242,0.1)] w-full flex justify-between items-center">
                                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">THEME_2</span>
                                    <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">visibility</span> Preview</button>
                                </div>
                            </div>

                            <div className="sf-comp-tile" style={{ alignItems: "flex-start", padding: "1.25rem" }}>
                                <div className="flex items-start justify-between w-full mb-3">
                                    <div className="sf-comp-tile-icon" style={{ width: "2.5rem", height: "2.5rem" }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>view_comfy_alt</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">COMP</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-100 mb-1">Data Table</h4>
                                <p className="text-xs text-slate-400 mb-3 line-clamp-2">Complex responsive data table with sorting, filtering, and pagination controls.</p>
                                <div className="mt-auto pt-3 border-t border-[rgba(13,185,242,0.1)] w-full flex justify-between items-center">
                                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded font-bold">CORE</span>
                                    <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">visibility</span> Preview</button>
                                </div>
                            </div>

                            <div className="sf-comp-tile" style={{ alignItems: "flex-start", padding: "1.25rem" }}>
                                <div className="flex items-start justify-between w-full mb-3">
                                    <div className="sf-comp-tile-icon" style={{ width: "2.5rem", height: "2.5rem" }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>style</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">COLL</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-100 mb-1">Neon Lights Kit</h4>
                                <p className="text-xs text-slate-400 mb-3 line-clamp-2">A full UI kit collection focused on bright neon accents against pitch dark backgrounds.</p>
                                <div className="mt-auto pt-3 border-t border-[rgba(13,185,242,0.1)] w-full flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                                        <span className="material-symbols-outlined text-[12px]">inventory_2</span> 89
                                    </div>
                                    <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">visibility</span> View</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <button className="sf-pill-btn">Load More Results</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
