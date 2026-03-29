import { useState, useEffect, useRef } from "react";

function format(ms: number) {
  const cents = Math.floor((ms % 1000) / 10);
  const secs = Math.floor(ms / 1000) % 60;
  const mins = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(cents).padStart(2, "0")}`;
}

export default function StopwatchRC() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(baseRef.current + Date.now() - startRef.current);
    }, 10);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      baseRef.current = elapsed;
    }
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
  }

  function lap() {
    if (running) setLaps((prev) => [elapsed, ...prev]);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center mb-4">
          <p className="font-mono text-[52px] font-bold text-[#e6edf3] tabular-nums leading-none mb-6">
            {format(elapsed)}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={toggle}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                running
                  ? "bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] hover:bg-[#f85149]/20"
                  : "bg-[#238636] border border-[#2ea043] text-white hover:bg-[#2ea043]"
              }`}
            >
              {running ? "Stop" : "Start"}
            </button>
            <button
              onClick={lap}
              disabled={!running}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] disabled:opacity-40 transition-colors"
            >
              Lap
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {laps.length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="max-h-48 overflow-y-auto divide-y divide-[#21262d]">
              {laps.map((lapTime, i) => (
                <div key={i} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-[#8b949e]">Lap {laps.length - i}</span>
                  <span className="font-mono text-[#e6edf3] tabular-nums">{format(lapTime)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
