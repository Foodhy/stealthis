export function CollectionOverview() {
    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                {/* Controls */}
                <div className="sf-controls-bar">
                    <div className="sf-search-wrap">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            className="sf-search-input"
                            placeholder="Search your collections..."
                            type="text"
                        />
                    </div>
                    <div className="sf-controls-actions">
                        <button className="sf-pill-btn">
                            <span className="material-symbols-outlined">filter_list</span>
                            <span>Filter</span>
                        </button>
                        <button className="sf-pill-btn">
                            <span className="material-symbols-outlined">sort</span>
                            <span>Sort</span>
                        </button>
                        <button className="sf-cta-btn ml-auto md:ml-0">
                            <span className="material-symbols-outlined">add</span>
                            <span>New Collection</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="sf-coll-grid">
                    {/* Card 1 */}
                    <div className="sf-coll-card">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="sf-coll-thumb">
                            <img
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                alt="Abstract 3D purple and blue geometric shapes"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsDIkAkLwI-F4qorWFYTR-xbqh3ShKBCz6WU6Js_nalna6gk0oMXem88Ua9pRe5AT8TGx9OT6H_v8C_v0iTFb5GBrpce_sdypyJ-oqHl4FR_71g-HlpQgkSg02RNliwG6mAEEYpJ4yBAp2PEc1kEaoOzpBJkMoAUVYLOZnfZ1etCENvOAmGy90Szpm6wSlp5-5gVaDJ1hr37x60D0u6Cb7avePLe83Wqk2DlBp4ZNtnX8HFKycEbfHFul7KrFFdx-o6IfZ7kR4F4U"
                            />
                            <div className="sf-coll-cat-badge">UI Design</div>
                        </div>
                        <div className="sf-coll-card-main">
                            <h3>Quantum UI Kit</h3>
                            <p className="sf-coll-card-desc">Comprehensive set of futuristic dashboard components with integrated dark mode support.</p>
                        </div>
                        <div className="sf-coll-card-foot">
                            <div className="sf-coll-item-count">
                                <span className="material-symbols-outlined">inventory_2</span>
                                <span>124 Items</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="sf-coll-card">
                        <div className="sf-coll-thumb">
                            <img
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                alt="Minimalist abstract dark blue fluid gradient"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB722u5ZCmyqOB9zllzpnC8YK_d4xn9NYZHluZAHLrUOCjHqwt0bXte8malYKiyu3CHTaqvo92sag2DeEF--d5QhePTizYqcxD4AmsGtiS1-9CnNEsCWEJAdhdgkKd1zTKQCzSBobH5RwvYosjk8E_w8qnQ7lgsX486i9Z7n_k98IdnU7gsYWWN78mCSzxi2BDz4awyD-jVXjxtz0kcG7pP06TkGwwqi_uV17-TDCCIw-csewEGCy68fv4kJiUAsnV5CaKp12-ttn4"
                            />
                            <div className="sf-coll-cat-badge" style={{ color: "#6366f1", borderColor: "rgba(99,102,241,0.2)" }}>Branding</div>
                        </div>
                        <div className="sf-coll-card-main">
                            <h3>Neo-Tokyo Brand</h3>
                            <p className="sf-coll-card-desc">Cyberpunk inspired visual identity assets for modern tech startups and fintechs.</p>
                        </div>
                        <div className="sf-coll-card-foot">
                            <div className="sf-coll-item-count">
                                <span className="material-symbols-outlined">inventory_2</span>
                                <span>45 Items</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 (Empty State) */}
                    <div className="sf-coll-new-card">
                        <div className="sf-coll-new-icon">
                            <span className="material-symbols-outlined text-2xl">add_circle</span>
                        </div>
                        <span className="sf-coll-new-label">Create New Collection</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
