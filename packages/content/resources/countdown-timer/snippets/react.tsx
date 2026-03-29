import { useState, useEffect } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimerRC() {
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setExpired(false);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h2 className="text-center text-[#e6edf3] font-bold text-xl mb-6">Countdown Timer</h2>

        <div className="mb-6 flex justify-center">
          <input
            type="datetime-local"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#58a6ff]"
          />
        </div>

        {expired ? (
          <p className="text-center text-[#f85149] font-semibold text-lg">Time's up!</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {units.map(({ label, value }) => (
              <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-center">
                <p className="text-[40px] font-mono font-bold text-[#58a6ff] tabular-nums leading-none mb-1">
                  {pad(value)}
                </p>
                <p className="text-[11px] text-[#8b949e] uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
