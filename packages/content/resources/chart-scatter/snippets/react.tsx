import { useState, useRef, useEffect } from "react";

const GROUPS = [
  {
    label: "Team A",
    color: "#818cf8",
    points: [
      { name: "Auth", x: 12, y: 3 },
      { name: "Dashboard", x: 18, y: 7 },
      { name: "Profile", x: 8, y: 2 },
      { name: "Settings", x: 22, y: 11 },
      { name: "Reports", x: 15, y: 5 },
    ],
  },
  {
    label: "Team B",
    color: "#34d399",
    points: [
      { name: "API", x: 25, y: 9 },
      { name: "Search", x: 30, y: 14 },
      { name: "Payments", x: 20, y: 6 },
      { name: "Mobile", x: 35, y: 18 },
      { name: "Export", x: 14, y: 4 },
    ],
  },
  {
    label: "Team C",
    color: "#f59e0b",
    points: [
      { name: "Admin", x: 40, y: 20 },
      { name: "CMS", x: 28, y: 12 },
      { name: "Email", x: 10, y: 1 },
      { name: "CDN", x: 45, y: 22 },
    ],
  },
];
const PAD = { top: 24, right: 24, bottom: 48, left: 52 };

type Tooltip = { name: string; x: number; y: number; cx: number; cy: number } | null;

function linReg(pts: { x: number; y: number }[]) {
  const n = pts.length,
    sumX = pts.reduce((a, p) => a + p.x, 0),
    sumY = pts.reduce((a, p) => a + p.y, 0);
  const sumXY = pts.reduce((a, p) => a + p.x * p.y, 0),
    sumX2 = pts.reduce((a, p) => a + p.x * p.x, 0);
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return { m, b: (sumY - m * sumX) / n };
}

export default function ChartScatterRC() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) setW(wrapRef.current.clientWidth - 32);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const H = Math.round(W * 0.5);
  const cW = W - PAD.left - PAD.right,
    cH = H - PAD.top - PAD.bottom;
  const allPts = GROUPS.flatMap((g) => g.points);
  const maxX = Math.ceil(Math.max(...allPts.map((p) => p.x)) * 1.1);
  const maxY = Math.ceil(Math.max(...allPts.map((p) => p.y)) * 1.15);
  const xOf = (v: number) => PAD.left + (v / maxX) * cW;
  const yOf = (v: number) => PAD.top + cH - (v / maxY) * cH;

  const reg = linReg(allPts);
  const ry1 = reg.m * 0 + reg.b,
    ry2 = reg.m * maxX + reg.b;

  const toggleHidden = (i: number) =>
    setHidden((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div ref={wrapRef} className="w-full max-w-[800px] mx-auto">
        <div className="flex gap-3 mb-4 flex-wrap">
          {GROUPS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => toggleHidden(i)}
              className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border transition-opacity ${hidden.has(i) ? "opacity-30" : "opacity-100"} border-[#30363d] hover:border-[#8b949e]`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: g.color }} />
              <span className="text-[#8b949e]">{g.label}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
            {/* X grid */}
            {Array.from({ length: 6 }, (_, t) => {
              const v = Math.round((maxX / 5) * t);
              const x = xOf(v);
              return (
                <g key={t}>
                  <line
                    x1={x}
                    x2={x}
                    y1={PAD.top}
                    y2={PAD.top + cH}
                    stroke="#21262d"
                    strokeWidth={1}
                  />
                  <text x={x} y={H - 8} textAnchor="middle" fill="#484f58" fontSize={10}>
                    {v} features
                  </text>
                </g>
              );
            })}
            {/* Y grid */}
            {Array.from({ length: 6 }, (_, t) => {
              const v = Math.round((maxY / 5) * t);
              const y = yOf(v);
              return (
                <g key={t}>
                  <line
                    x1={PAD.left}
                    x2={PAD.left + cW}
                    y1={y}
                    y2={y}
                    stroke="#21262d"
                    strokeWidth={1}
                  />
                  <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" fill="#484f58" fontSize={10}>
                    {v}
                  </text>
                </g>
              );
            })}
            {/* Regression line */}
            <line
              x1={xOf(0)}
              y1={yOf(ry1)}
              x2={xOf(maxX)}
              y2={yOf(ry2)}
              stroke="#484f58"
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
            {/* Dots */}
            {GROUPS.map(
              (g, gi) =>
                !hidden.has(gi) &&
                g.points.map((p, i) => (
                  <circle
                    key={`${gi}-${i}`}
                    cx={xOf(p.x)}
                    cy={yOf(p.y)}
                    r={7}
                    fill={g.color}
                    fillOpacity={0.85}
                    style={{ cursor: "pointer", transition: "r 0.15s" }}
                    onMouseEnter={(e) =>
                      setTooltip({
                        name: p.name,
                        x: e.clientX,
                        y: e.clientY,
                        cx: xOf(p.x),
                        cy: yOf(p.y),
                      })
                    }
                    onMouseMove={(e) =>
                      setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))
            )}
          </svg>
          {tooltip && (
            <div
              className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
              style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
            >
              <div className="font-semibold text-[#e6edf3]">{tooltip.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
