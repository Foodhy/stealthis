import { useState, useEffect } from "react";

function AnalogClock({ date }: { date: Date }) {
  const h = date.getHours() % 12;
  const m = date.getMinutes();
  const s = date.getSeconds();
  const hourDeg = (h / 12) * 360 + (m / 60) * 30;
  const minDeg = (m / 60) * 360 + (s / 60) * 6;
  const secDeg = (s / 60) * 360;

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      <circle cx="100" cy="100" r="96" fill="#161b22" stroke="#30363d" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = ((i / 12) * 360 * Math.PI) / 180;
        const x1 = 100 + 80 * Math.sin(angle);
        const y1 = 100 - 80 * Math.cos(angle);
        const x2 = 100 + 88 * Math.sin(angle);
        const y2 = 100 - 88 * Math.cos(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#484f58" strokeWidth="2.5" strokeLinecap="round" />;
      })}
      {/* Hour hand */}
      <line x1="100" y1="100" x2={100 + 50 * Math.sin((hourDeg * Math.PI) / 180)} y2={100 - 50 * Math.cos((hourDeg * Math.PI) / 180)} stroke="#e6edf3" strokeWidth="4" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="100" y1="100" x2={100 + 70 * Math.sin((minDeg * Math.PI) / 180)} y2={100 - 70 * Math.cos((minDeg * Math.PI) / 180)} stroke="#e6edf3" strokeWidth="2.5" strokeLinecap="round" />
      {/* Second hand */}
      <line x1="100" y1="100" x2={100 + 75 * Math.sin((secDeg * Math.PI) / 180)} y2={100 - 75 * Math.cos((secDeg * Math.PI) / 180)} stroke="#f85149" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="4" fill="#f85149" />
    </svg>
  );
}

export default function LiveClockRC() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const zones = [
    { city: "New York", offset: -5 },
    { city: "London", offset: 0 },
    { city: "Tokyo", offset: 9 },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <AnalogClock date={now} />
        <p className="font-mono text-[36px] font-bold text-[#e6edf3] tabular-nums">{timeStr}</p>
        <p className="text-[#8b949e] text-sm">{dateStr}</p>
      </div>

      <div className="flex gap-4">
        {zones.map(({ city, offset }) => {
          const cityTime = new Date(now.getTime() + (now.getTimezoneOffset() + offset * 60) * 60000);
          return (
            <div key={city} className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-center">
              <p className="text-[11px] text-[#484f58] uppercase tracking-wider mb-1">{city}</p>
              <p className="font-mono text-[14px] font-bold text-[#e6edf3] tabular-nums">
                {cityTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
