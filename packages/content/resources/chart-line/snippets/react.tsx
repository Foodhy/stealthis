import { useState, useRef, useEffect, useCallback } from "react";

const SERIES = [
  {
    label: "Revenue",
    color: "#818cf8",
    data: [42, 58, 51, 67, 73, 89, 95, 88, 102, 115, 108, 127],
  },
  { label: "Expenses", color: "#f87171", data: [30, 34, 29, 35, 40, 44, 48, 42, 50, 55, 52, 58] },
  { label: "Profit", color: "#34d399", data: [12, 24, 22, 32, 33, 45, 47, 46, 52, 60, 56, 69] },
];
const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAD = { top: 20, right: 20, bottom: 36, left: 48 };

function linePath(pts: [number, number][]) {
  return pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
}
function bezierPath(pts: [number, number][]) {
  if (pts.length < 2) return linePath(pts);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * 0.4;
    const cp2x = pts[i + 1][0] - (pts[i + 1][0] - pts[i][0]) * 0.4;
    d += ` C${cp1x.toFixed(1)} ${pts[i][1].toFixed(1)} ${cp2x.toFixed(1)} ${pts[i + 1][1].toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

export default function ChartLineRC() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 270 });
  const [smooth, setSmooth] = useState(false);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth - 32;
      setDims({ w, h: Math.round(w * 0.45) });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const toggleHidden = (i: number) =>
    setHidden((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const { w: W, h: H } = dims;
  const visible = SERIES.filter((_, i) => !hidden.has(i));
  const allVals = visible.flatMap((s) => s.data);
  const maxVal = allVals.length ? Math.ceil(Math.max(...allVals) * 1.15) : 100;
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const n = LABELS.length;
  const xOf = (i: number) => PAD.left + (i / (n - 1)) * cW;
  const yOf = (v: number) => PAD.top + cH - (v / maxVal) * cH;

  const handleMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const idx = Math.round(((mx - PAD.left) / cW) * (n - 1));
      if (idx < 0 || idx >= n) {
        setTooltip(null);
        return;
      }
      setTooltip({ idx, x: xOf(idx), y: PAD.top });
    },
    [W, cW, n, xOf]
  );

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div ref={wrapRef} className="w-full max-w-[800px] mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            {SERIES.map((s, i) => (
              <button
                key={s.label}
                onClick={() => toggleHidden(i)}
                className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border transition-opacity ${hidden.has(i) ? "opacity-30" : "opacity-100"} border-[#30363d] hover:border-[#8b949e]`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[#8b949e]">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {["Linear", "Smooth"].map((m) => (
              <button
                key={m}
                onClick={() => setSmooth(m === "Smooth")}
                className={`text-[11px] px-3 py-1 rounded border transition-colors ${(smooth ? "Smooth" : "Linear") === m ? "bg-[#818cf8]/20 border-[#818cf8] text-[#818cf8]" : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            onMouseMove={handleMove}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Grid */}
            {Array.from({ length: 6 }, (_, t) => {
              const v = (maxVal / 5) * t;
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
                    {Math.round(v)}k
                  </text>
                </g>
              );
            })}
            {LABELS.map((lbl, i) => (
              <text key={lbl} x={xOf(i)} y={H - 6} textAnchor="middle" fill="#484f58" fontSize={10}>
                {lbl}
              </text>
            ))}
            {tooltip && (
              <line
                x1={tooltip.x}
                x2={tooltip.x}
                y1={PAD.top}
                y2={PAD.top + cH}
                stroke="#8b949e"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
            )}
            {/* Series */}
            {SERIES.map((s, si) => {
              if (hidden.has(si)) return null;
              const pts: [number, number][] = s.data.map((v, i) => [xOf(i), yOf(v)]);
              return (
                <g key={s.label}>
                  <path
                    d={smooth ? bezierPath(pts) : linePath(pts)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pts.map(([px, py], i) => (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r={tooltip?.idx === i ? 4 : 2.5}
                      fill={s.color}
                      opacity={tooltip?.idx === i ? 1 : 0.7}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg min-w-[140px]"
              style={{ left: Math.min(tooltip.x + 12, W - 160), top: tooltip.y }}
            >
              <div className="text-[#8b949e] font-semibold mb-1.5">{LABELS[tooltip.idx]}</div>
              {SERIES.map(
                (s, si) =>
                  !hidden.has(si) && (
                    <div key={s.label} className="flex items-center gap-2 py-0.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <span className="text-[#8b949e] flex-1">{s.label}</span>
                      <span className="text-[#e6edf3] font-bold">${s.data[tooltip.idx]}k</span>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
