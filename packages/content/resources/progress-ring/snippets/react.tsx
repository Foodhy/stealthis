import { useState, useEffect, useRef } from "react";

const SIZE = 120,
  STROKE = 10,
  R = SIZE / 2 - STROKE;
const C = 2 * Math.PI * R;

const RINGS = [
  { label: "Conversion", value: 72, color: "#818cf8" },
  { label: "Retention", value: 85, color: "#34d399" },
  { label: "Bounce", value: 38, color: "#f59e0b" },
  { label: "Uptime", value: 99, color: "#f87171" },
];

function ProgressRing({ value, color, label }: { value: number; color: string; label: string }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const cx = SIZE / 2,
    cy = SIZE / 2;

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCurrent(Math.round(value * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const offset = C - C * (current / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e2130" strokeWidth={STROKE} />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#e6edf3" fontSize={20} fontWeight={800}>
          {current}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#484f58" fontSize={10}>
          {label}
        </text>
      </svg>
    </div>
  );
}

export default function ProgressRingRC() {
  const [values, setValues] = useState(RINGS.map((r) => r.value));
  const randomize = () => setValues(RINGS.map(() => Math.floor(Math.random() * 95) + 5));

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex flex-col items-center gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {RINGS.map((r, i) => (
          <ProgressRing key={r.label} value={values[i]} color={r.color} label={r.label} />
        ))}
      </div>
      <button
        onClick={randomize}
        className="px-4 py-2 bg-[#818cf8]/20 border border-[#818cf8]/40 text-[#818cf8] rounded-lg text-[13px] hover:bg-[#818cf8]/30 transition-colors"
      >
        Randomize
      </button>
    </div>
  );
}
