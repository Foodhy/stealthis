import { useState, useEffect, useRef } from "react";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  distance: string;
  distanceNum: number;
  open: boolean;
  hours: string;
  phone: string;
  rating: number;
}

const STORES: Store[] = [
  {
    id: 1,
    name: "Flagship — Union Square",
    address: "170 O'Farrell St",
    city: "San Francisco",
    state: "CA",
    lat: 37.7869,
    lng: -122.4072,
    distance: "0.4 mi",
    distanceNum: 0.4,
    open: true,
    hours: "Mon–Sat 9–9, Sun 11–7",
    phone: "(415) 555-0101",
    rating: 4.8,
  },
  {
    id: 2,
    name: "SoMa Outlet",
    address: "899 Howard St",
    city: "San Francisco",
    state: "CA",
    lat: 37.7793,
    lng: -122.4024,
    distance: "1.2 mi",
    distanceNum: 1.2,
    open: true,
    hours: "Mon–Fri 10–7, Sat–Sun 10–6",
    phone: "(415) 555-0102",
    rating: 4.3,
  },
  {
    id: 3,
    name: "Mission District",
    address: "2401 Mission St",
    city: "San Francisco",
    state: "CA",
    lat: 37.7568,
    lng: -122.4189,
    distance: "2.8 mi",
    distanceNum: 2.8,
    open: false,
    hours: "Tue–Sun 10–7",
    phone: "(415) 555-0103",
    rating: 4.6,
  },
  {
    id: 4,
    name: "Berkeley Marina",
    address: "225 University Ave",
    city: "Berkeley",
    state: "CA",
    lat: 37.8702,
    lng: -122.2679,
    distance: "5.5 mi",
    distanceNum: 5.5,
    open: true,
    hours: "Daily 10–8",
    phone: "(510) 555-0104",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Oakland City Center",
    address: "20th & Broadway",
    city: "Oakland",
    state: "CA",
    lat: 37.8083,
    lng: -122.2712,
    distance: "8.1 mi",
    distanceNum: 8.1,
    open: true,
    hours: "Mon–Sat 10–8, Sun 11–6",
    phone: "(510) 555-0105",
    rating: 4.4,
  },
  {
    id: 6,
    name: "Palo Alto",
    address: "340 University Ave",
    city: "Palo Alto",
    state: "CA",
    lat: 37.4459,
    lng: -122.1613,
    distance: "29 mi",
    distanceNum: 29,
    open: false,
    hours: "Mon–Sat 10–7",
    phone: "(650) 555-0106",
    rating: 4.5,
  },
];

// Pseudo-map using SVG with real-ish coordinate mapping
function MapView({
  stores,
  selectedId,
  onSelect,
}: {
  stores: Store[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  // Map bounds (roughly Bay Area)
  const minLat = 37.4,
    maxLat = 37.93;
  const minLng = -122.52,
    maxLng = -122.1;

  const W = 540,
    H = 380;

  const project = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * W,
    y: H - ((lat - minLat) / (maxLat - minLat)) * H,
  });

  return (
    <div className="relative w-full h-full bg-[#0d1117] rounded-xl overflow-hidden border border-[#30363d]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        <defs>
          <pattern id="mapgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#21262d" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)" />

        {/* Water bodies (Bay) */}
        <path
          d="M 350 50 L 400 80 L 420 160 L 400 240 L 360 280 L 380 340 L 450 380 L 540 380 L 540 0 L 380 0 Z"
          fill="#1c2128"
          stroke="#30363d"
          strokeWidth="1"
          opacity="0.7"
        />
        <text x="460" y="190" fill="#484f58" fontSize="10" fontFamily="monospace">
          San Francisco Bay
        </text>

        {/* Roads */}
        {[
          "M 50 190 L 540 190",
          "M 200 0 L 200 380",
          "M 100 100 L 400 200",
          "M 50 300 L 350 250",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#21262d"
            strokeWidth={i === 0 || i === 1 ? 3 : 1.5}
          />
        ))}

        {/* Store pins */}
        {stores.map((s) => {
          const { x, y } = project(s.lat, s.lng);
          const isSelected = selectedId === s.id;
          return (
            <g key={s.id} className="cursor-pointer" onClick={() => onSelect(s.id)}>
              {isSelected && (
                <circle cx={x} cy={y} r="18" fill="#58a6ff" opacity="0.15">
                  <animate
                    attributeName="r"
                    from="14"
                    to="22"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.2"
                    to="0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 8 : 6}
                fill={isSelected ? "#58a6ff" : s.open ? "#7ee787" : "#f85149"}
                stroke={isSelected ? "#79b8ff" : "#0d1117"}
                strokeWidth={2}
              />
              <text
                x={x + 10}
                y={y + 4}
                fill={isSelected ? "#e6edf3" : "#8b949e"}
                fontSize={isSelected ? 11 : 9}
                fontWeight={isSelected ? "bold" : "normal"}
                fontFamily="sans-serif"
              >
                {s.name.split("—")[0].trim().split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          );
        })}

        {/* Compass */}
        <g transform="translate(28, 28)">
          <circle r="14" fill="#161b22" stroke="#30363d" strokeWidth="1" />
          <text textAnchor="middle" y="-5" fill="#8b949e" fontSize="10" fontFamily="monospace">
            N
          </text>
          <line y1="-10" y2="-2" stroke="#58a6ff" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

export default function StoreLocatorRC() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [showOpen, setShowOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(1);

  const filtered = STORES.filter(
    (s) =>
      (!showOpen || s.open) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => (sortBy === "distance" ? a.distanceNum - b.distanceNum : b.rating - a.rating));

  const selected = STORES.find((s) => s.id === selectedId);

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 flex justify-center">
      <div className="w-full max-w-[1000px] space-y-3">
        {/* Search bar */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by city, name, or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2.5 text-[13px] text-[#e6edf3] placeholder-[#484f58] outline-none focus:border-[#58a6ff] transition-colors"
          />
          <div className="flex gap-1.5">
            {(["distance", "rating"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors capitalize ${
                  sortBy === s
                    ? "bg-[#58a6ff]/10 border-[#58a6ff]/30 text-[#58a6ff]"
                    : "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setShowOpen((v) => !v)}
              className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors ${
                showOpen
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              Open now
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="flex gap-3 flex-col sm:flex-row" style={{ height: 440 }}>
          {/* List */}
          <div className="w-full sm:w-[280px] flex-shrink-0 space-y-1.5 overflow-y-auto">
            {filtered.map((store) => {
              const isSelected = selectedId === store.id;
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedId(store.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-colors ${
                    isSelected
                      ? "bg-[#58a6ff]/[0.08] border-[#58a6ff]/30"
                      : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p
                      className={`text-[12px] font-semibold leading-tight ${isSelected ? "text-[#58a6ff]" : "text-[#e6edf3]"}`}
                    >
                      {store.name}
                    </p>
                    <span
                      className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        store.open
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {store.open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e] truncate">
                    {store.address}, {store.city}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#484f58]">{store.distance}</span>
                    <span className="text-[10px] text-[#e3b341]">★ {store.rating}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-[12px] text-[#484f58]">No stores found</div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0">
              <MapView
                stores={filtered.length ? filtered : STORES}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            {/* Selected detail strip */}
            {selected && (
              <div className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#e6edf3] truncate">
                    {selected.name}
                  </p>
                  <p className="text-[10px] text-[#8b949e]">
                    {selected.hours} · {selected.phone}
                  </p>
                </div>
                <button className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#58a6ff] rounded-lg text-[11px] font-bold text-white hover:bg-[#79b8ff] transition-colors">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Directions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
