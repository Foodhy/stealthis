export function CollectionDetail() {
    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ background: "var(--sf-surface)" }}>
            {/* Metadata & Progress Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-[rgba(13,185,242,0.1)] pb-8 mb-4">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-wider">
                        Active Collection
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-100 m-0">Futuristic Dark Mode</h2>
                    <div className="flex gap-6 text-sm text-slate-400 mt-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">face</span>
                            <span>System Admin</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            <span>Modified 2 mins ago</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: "var(--sf-primary)" }}>
                            <span className="material-symbols-outlined text-xs">bolt</span>
                            <span>Theme: THEME_2</span>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-72 p-5 rounded-xl space-y-4" style={{ background: "rgba(34,63,73,0.4)", border: "1px solid rgba(13,185,242,0.1)" }}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">Overall Progress</span>
                        <span className="text-xs font-bold" style={{ color: "var(--sf-primary)" }}>65%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2 mb-3">
                        <div className="h-full rounded-full" style={{ width: "65%", background: "var(--sf-primary)", boxShadow: "0 0 10px rgba(13,185,242,0.5)" }}></div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-3">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--sf-primary)" }}></span>
                        Asset Finalization
                    </div>
                </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Components Library */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <h3 className="sf-comp-section-head">
                            <span className="sf-comp-section-label">Base Components</span>
                            <span className="material-symbols-outlined text-sm">expand_less</span>
                        </h3>
                        <div className="sf-comp-tile-grid">
                            <div className="sf-comp-tile">
                                <div className="sf-comp-tile-icon">
                                    <span className="material-symbols-outlined">smart_button</span>
                                </div>
                                <span className="sf-comp-tile-label">Buttons</span>
                            </div>
                            <div className="sf-comp-tile">
                                <div className="sf-comp-tile-icon">
                                    <span className="material-symbols-outlined">text_fields</span>
                                </div>
                                <span className="sf-comp-tile-label">Typography</span>
                            </div>
                            <div className="sf-comp-tile is-active">
                                <div className="sf-comp-tile-icon">
                                    <span className="material-symbols-outlined">palette</span>
                                </div>
                                <span className="sf-comp-tile-label">Color Palette</span>
                            </div>
                            <div className="sf-comp-tile">
                                <div className="sf-comp-tile-icon">
                                    <span className="material-symbols-outlined">view_quilt</span>
                                </div>
                                <span className="sf-comp-tile-label">Cards</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[rgba(13,185,242,0.08)]">
                        <h3 className="sf-comp-section-head">
                            <span className="sf-comp-section-label">Page Components</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </h3>
                        <div className="space-y-2">
                            <div className="sf-comp-row">
                                <div className="sf-comp-row-left">
                                    <span className="material-symbols-outlined">grid_view</span>
                                    <span>Dashboard Layout</span>
                                </div>
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                            </div>
                            <div className="sf-comp-row">
                                <div className="sf-comp-row-left">
                                    <span className="material-symbols-outlined">account_circle</span>
                                    <span>Profile Section</span>
                                </div>
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                            </div>
                            <div className="sf-comp-row">
                                <div className="sf-comp-row-left">
                                    <span className="material-symbols-outlined">settings_suggest</span>
                                    <span>System Preferences</span>
                                </div>
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Central Preview Area */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="sf-preview-window">
                        <div className="sf-preview-win-bar">
                            <div className="flex items-center gap-4">
                                <div className="sf-preview-win-dots">
                                    <i></i><i></i><i></i>
                                </div>
                                <span className="sf-preview-win-title">Asset Preview: Theme_2 Palette</span>
                            </div>
                            <div className="sf-preview-win-actions">
                                <button className="sf-preview-win-icon-btn">
                                    <span className="material-symbols-outlined">zoom_in</span>
                                </button>
                                <button className="sf-preview-win-icon-btn">
                                    <span className="material-symbols-outlined">fullscreen</span>
                                </button>
                                <button className="sf-preview-win-btn">EXPORT CSS</button>
                            </div>
                        </div>

                        <div className="sf-preview-win-canvas">
                            <div className="max-w-3xl mx-auto w-full space-y-12">
                                {/* Visual Preview Content */}
                                <div className="sf-swatch-grid">
                                    <div className="sf-swatch-item">
                                        <div className="sf-swatch-box" style={{ background: "var(--sf-primary)", boxShadow: "0 0 20px rgba(13,185,242,0.25)" }}></div>
                                        <div className="sf-swatch-label">
                                            <p>PRIMARY</p>
                                            <code>#0DB9F2</code>
                                        </div>
                                    </div>
                                    <div className="sf-swatch-item">
                                        <div className="sf-swatch-box" style={{ background: "var(--sf-surface)", border: "1px solid rgba(13,185,242,0.2)" }}></div>
                                        <div className="sf-swatch-label">
                                            <p>DARK_BG</p>
                                            <code>#101E22</code>
                                        </div>
                                    </div>
                                    <div className="sf-swatch-item">
                                        <div className="sf-swatch-box bg-slate-800"></div>
                                        <div className="sf-swatch-label">
                                            <p>NEUTRAL_600</p>
                                            <code>#334155</code>
                                        </div>
                                    </div>
                                    <div className="sf-swatch-item">
                                        <div className="sf-swatch-box" style={{ background: "rgba(13,185,242,0.2)", border: "1px solid rgba(13,185,242,0.4)" }}></div>
                                        <div className="sf-swatch-label">
                                            <p>ACCENT_GLOW</p>
                                            <code>P_20_BLUR</code>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 mt-8">
                                    <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(13,185,242,0.2), transparent)" }}></div>
                                    <div className="grid grid-cols-2 gap-8 pt-4">
                                        <div className="space-y-4">
                                            <div className="h-8 w-48 bg-slate-800 rounded"></div>
                                            <div className="space-y-3 mt-3">
                                                <div className="h-2 w-full bg-slate-800/50 rounded"></div>
                                                <div className="h-2 w-5/6 bg-slate-800/50 rounded"></div>
                                                <div className="h-2 w-4/6 bg-slate-800/50 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="sf-preview-add">
                                            <span className="material-symbols-outlined text-4xl mb-2">add_circle</span>
                                            <p className="sf-preview-add-label">Add Preview Element</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
