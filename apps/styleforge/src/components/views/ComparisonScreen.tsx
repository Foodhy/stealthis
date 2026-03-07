export function ComparisonScreen() {
    return (
        <div className="flex-1 overflow-hidden" style={{ background: "var(--sf-surface)", display: "flex", flexDirection: "column" }}>
            {/* Header bar matching the Collection Style headers */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[rgba(13,185,242,0.1)] bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button className="sf-preview-win-icon-btn">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Compare Components</span>
                        <span className="text-slate-100 font-semibold text-sm">Primary Buttons</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="sf-pill-btn">
                        <span className="material-symbols-outlined text-[16px]">tune</span>
                        <span className="text-xs">Adjust Variables</span>
                    </button>
                    <button className="sf-cta-btn">Export Comparison</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Summary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">contrast</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Similarity Score</p>
                                <p className="text-2xl font-bold text-slate-100">85%</p>
                            </div>
                        </div>
                        <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Accessibility</p>
                                <p className="text-sm font-bold text-slate-100 line-clamp-2">Both pass WCAG AA contrast ratio.</p>
                            </div>
                        </div>
                        <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <span className="material-symbols-outlined text-2xl">warning</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">Differences</p>
                                <p className="text-sm font-bold text-slate-100 line-clamp-2">Padding, border-radius, and active states differ.</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="glass-effect rounded-2xl overflow-hidden border border-primary/10 bg-[rgba(16,30,34,0.45)]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-primary/20 bg-slate-900/60">
                                    <th className="p-4 w-1/4 text-xs font-bold text-slate-500 uppercase tracking-widest">Property</th>
                                    <th className="p-4 w-1/3 border-l border-primary/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="block text-[10px] text-primary uppercase font-bold tracking-widest">Theme_1</span>
                                                <span className="block text-sm font-bold text-slate-100 mt-0.5">Quantum UI</span>
                                            </div>
                                            <button className="material-symbols-outlined text-slate-500 hover:text-primary transition-colors text-lg">close</button>
                                        </div>
                                    </th>
                                    <th className="p-4 w-1/3 border-l border-primary/10 bg-primary/5">
                                        <div className="flex items-center justify-between relative">
                                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent to-primary/50"></div>
                                            <div>
                                                <span className="block text-[10px] text-indigo-400 uppercase font-bold tracking-widest">Theme_2 (Draft)</span>
                                                <span className="block text-sm font-bold text-slate-100 mt-0.5">Neo-Tokyo Gen</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="material-symbols-outlined text-slate-500 hover:text-indigo-400 transition-colors text-lg">swap_horiz</button>
                                                <button className="material-symbols-outlined text-slate-500 hover:text-red-400 transition-colors text-lg">close</button>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-primary/5 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 font-semibold text-slate-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500 text-sm">visibility</span>
                                        Visual Preview
                                    </td>
                                    <td className="p-4 border-l border-primary/10 bg-[#0a1215]">
                                        <div className="flex items-center justify-center p-8">
                                            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg">Primary Action</button>
                                        </div>
                                    </td>
                                    <td className="p-4 border-l border-primary/10 bg-[#0a1215]">
                                        <div className="flex items-center justify-center p-8">
                                            <button className="bg-transparent text-[#0db9f2] border-2 border-[#0db9f2] px-6 py-2.5 rounded-none text-sm font-bold hover:bg-[#0db9f2]/10 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(13,185,242,0.3)]">Primary Action</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 font-semibold text-slate-400">Background Color</td>
                                    <td className="p-4 border-l border-slate-800 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-indigo-600"></div> <code className="text-xs text-slate-300">#4F46E5</code>
                                    </td>
                                    <td className="p-4 border-l border-slate-800 flex items-center gap-2 bg-amber-500/5 text-amber-200 line-through decoration-amber-500/50">
                                        <div className="w-4 h-4 rounded border border-[#0db9f2] bg-transparent"></div> <code className="text-xs">transparent</code>
                                        <span className="material-symbols-outlined ml-auto text-amber-500 text-sm" title="Significant Difference">assignment_late</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 font-semibold text-slate-400">Border Radius</td>
                                    <td className="p-4 border-l border-slate-800"><code className="text-xs text-slate-300">4px (rounded)</code></td>
                                    <td className="p-4 border-l border-slate-800 bg-amber-500/5 text-amber-200">
                                        <code className="text-xs">0px (none)</code>
                                        <span className="material-symbols-outlined ml-auto text-amber-500 text-sm float-right" title="Significant Difference">assignment_late</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 font-semibold text-slate-400">Typography</td>
                                    <td className="p-4 border-l border-slate-800 text-slate-300">Inter, SemiBold, 14px, Normal Case</td>
                                    <td className="p-4 border-l border-slate-800 text-slate-300">Space Grotesk, Bold, 14px, Uppercase</td>
                                </tr>
                                <tr className="hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 font-semibold text-slate-400">Class Name (Output)</td>
                                    <td className="p-4 border-l border-slate-800"><code className="text-[10px] text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">.btn-primary.quantum</code></td>
                                    <td className="p-4 border-l border-slate-800"><code className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded">.sf-btn-neon.neo-tokyo</code></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
