import { useState, useEffect } from "react";

export default function DigitalClockRC() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = String(hours % 12 || 12).padStart(2, "0");
  const dateStr = time.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-10 py-8 text-center shadow-2xl">
        <div className="flex items-end justify-center gap-1 mb-2">
          <span className="text-[72px] font-mono font-bold text-[#e6edf3] leading-none tabular-nums">
            {h12}:{minutes}
          </span>
          <div className="flex flex-col items-start mb-2 gap-1">
            <span className="text-[28px] font-mono font-semibold text-[#58a6ff] leading-none tabular-nums">
              {seconds}
            </span>
            <span className="text-[14px] font-mono font-bold text-[#8b949e] leading-none">
              {ampm}
            </span>
          </div>
        </div>
        <p className="text-[14px] text-[#8b949e] tracking-wide">{dateStr}</p>
      </div>
    </div>
  );
}
