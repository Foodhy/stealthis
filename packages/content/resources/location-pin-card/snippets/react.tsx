import { useState } from "react";

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  distance: string;
  rating: number;
  reviews: number;
  open: boolean;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
}

const LOCATIONS: Location[] = [
  {
    id: 1,
    name: "HQ — Main Campus",
    address: "1 Hacker Way",
    city: "Menlo Park, CA 94025",
    country: "United States",
    distance: "0.2 mi",
    rating: 4.8,
    reviews: 2340,
    open: true,
    hours: "Mon–Fri 8am–8pm",
    phone: "+1 (650) 555-0101",
    lat: 37.4848,
    lng: -122.1487,
  },
  {
    id: 2,
    name: "Downtown Office",
    address: "181 Fremont St, Floor 32",
    city: "San Francisco, CA 94105",
    country: "United States",
    distance: "1.4 mi",
    rating: 4.6,
    reviews: 871,
    open: true,
    hours: "Mon–Fri 9am–6pm",
    phone: "+1 (415) 555-0199",
    lat: 37.7907,
    lng: -122.3958,
  },
  {
    id: 3,
    name: "Research Lab East",
    address: "77 Massachusetts Ave",
    city: "Cambridge, MA 02139",
    country: "United States",
    distance: "2.8 mi",
    rating: 4.9,
    reviews: 540,
    open: false,
    hours: "Mon–Thu 9am–5pm",
    phone: "+1 (617) 555-0042",
    lat: 42.3601,
    lng: -71.0942,
  },
];

function MapPlaceholder({ lat, lng, pin }: { lat: number; lng: number; pin: string }) {
  return (
    <div className="relative h-48 bg-[#0d1117] rounded-xl overflow-hidden border border-[#30363d]">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mapgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#30363d" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)"/>
        {/* Roads */}
        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#21262d" strokeWidth="3"/>
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#21262d" strokeWidth="2"/>
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#21262d" strokeWidth="2"/>
        <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#21262d" strokeWidth="3"/>
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#21262d" strokeWidth="1.5"/>
        <rect x="32%" y="40%" width="15%" height="15%" fill="#1c2128" rx="3"/>
        <rect x="50%" y="20%" width="12%" height="8%" fill="#1c2128" rx="2"/>
      </svg>

      {/* Animated pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full" style={{ animation: "pin-drop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div className="relative">
          <div className="w-8 h-8 rounded-full rounded-bl-none rotate-45 flex items-center justify-center -rotate-45 shadow-lg"
               style={{ background: "#58a6ff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="rotate-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#58a6ff] rounded-full opacity-40 blur-sm scale-150" />
        </div>
      </div>

      {/* Coords badge */}
      <div className="absolute bottom-2 right-2 bg-[#161b22]/80 border border-[#30363d] rounded-lg px-2 py-1 font-mono text-[9px] text-[#484f58]">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>

      <style>{`@keyframes pin-drop{from{transform:translate(-50%,-150%) scale(0.5);opacity:0}to{transform:translate(-50%,-100%) scale(1);opacity:1}}`}</style>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
             fill={s <= Math.round(rating) ? "#e3b341" : "none"}
             stroke="#e3b341" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-[10px] text-[#8b949e] ml-1">{rating} ({(rating * 100).toLocaleString()})</span>
    </div>
  );
}

export default function LocationPinCardRC() {
  const [selected, setSelected] = useState(0);
  const loc = LOCATIONS[selected];

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[420px] space-y-4">
        {/* Location tabs */}
        <div className="flex gap-1 bg-[#161b22] border border-[#30363d] rounded-xl p-1">
          {LOCATIONS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setSelected(i)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors truncate ${
                selected === i
                  ? "bg-[#21262d] text-[#e6edf3]"
                  : "text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {i === 0 ? "HQ" : i === 1 ? "Downtown" : "Lab"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
          <MapPlaceholder lat={loc.lat} lng={loc.lng} pin={loc.name} />

          <div className="p-5 space-y-4">
            {/* Name + open badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-bold text-[#e6edf3] leading-tight">{loc.name}</h3>
              <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                loc.open
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {loc.open ? "Open" : "Closed"}
              </span>
            </div>

            <Stars rating={loc.rating} />

            {/* Address */}
            <div className="space-y-1.5 text-[12px]">
              <div className="flex items-start gap-2 text-[#8b949e]">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                <div>
                  <p>{loc.address}</p>
                  <p>{loc.city}</p>
                  <p className="text-[#484f58]">{loc.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#8b949e]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{loc.hours}</span>
              </div>
              <div className="flex items-center gap-2 text-[#8b949e]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{loc.phone}</span>
              </div>
            </div>

            {/* Distance + CTA */}
            <div className="flex items-center gap-2 pt-1">
              <span className="flex items-center gap-1.5 text-[11px] text-[#8b949e] bg-[#21262d] border border-[#30363d] rounded-lg px-2.5 py-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
                {loc.distance} away
              </span>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#58a6ff] rounded-xl text-[12px] font-bold text-white hover:bg-[#79b8ff] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
