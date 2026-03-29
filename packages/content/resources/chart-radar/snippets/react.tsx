import { useState } from "react";

const AXES = ["Design", "Frontend", "Backend", "DevOps", "Testing", "Communication"];
const SERIES = [
  { label: "Alice", color: "#818cf8", data: [85, 90, 65, 70, 80, 92] },
  { label: "Bob", color: "#34d399", data: [70, 75, 88, 82, 60, 75] },
];
const SIZE = 320,
  CX = SIZE / 2,
  CY = SIZE / 2 + 10,
  R = 120,
  RINGS = 5;

function polarXY(r: number, angleDeg: number): [number, number] {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
function points(data: number[], r = R) {
  const step = 360 / AXES.length;
  return data.map((v, i) => polarXY((v / 100) * r, i * step));
}
function ptsStr(pts: [number, number][]) {
  return pts.map((p) => p.join(",")).join(" ");
}

type Tooltip = { axis: string; label: string; value: number; x: number; y: number } | null;

export default function ChartRadarRC() {
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const step = 360 / AXES.length;

  const toggleHidden = (i: number) =>
    setHidden((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[600px]">
        <div className="flex gap-3 mb-4 justify-center">
          {SERIES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => toggleHidden(i)}
              className={`flex items-center gap-1.5 text-[12px] px-3 py-1 rounded border transition-opacity ${hidden.has(i) ? "opacity-30" : "opacity-100"} border-[#30363d] hover:border-[#8b949e]`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-[#8b949e]">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Rings */}
            {Array.from({ length: RINGS }, (_, r) => {
              const pts = AXES.map((_, i) => polarXY((R / RINGS) * (r + 1), i * step));
              return (
                <g key={r}>
                  <polygon points={ptsStr(pts)} fill="none" stroke="#21262d" strokeWidth={1} />
                  <text
                    x={polarXY((R / RINGS) * (r + 1), 0)[0] + 3}
                    y={polarXY((R / RINGS) * (r + 1), 0)[1]}
                    fill="#484f58"
                    fontSize={9}
                  >
                    {Math.round((100 / RINGS) * (r + 1))}
                  </text>
                </g>
              );
            })}
            {/* Axes + labels */}
            {AXES.map((axis, i) => {
              const [ex, ey] = polarXY(R, i * step);
              const [lx, ly] = polarXY(R + 22, i * step);
              const anchor = lx < CX - 5 ? "end" : lx > CX + 5 ? "start" : "middle";
              return (
                <g key={axis}>
                  <line x1={CX} y1={CY} x2={ex} y2={ey} stroke="#30363d" strokeWidth={1} />
                  <text x={lx} y={ly + 4} textAnchor={anchor} fill="#8b949e" fontSize={11}>
                    {axis}
                  </text>
                </g>
              );
            })}
            {/* Series */}
            {SERIES.map((s, si) => {
              if (hidden.has(si)) return null;
              const pts = points(s.data);
              return (
                <g key={s.label}>
                  <polygon
                    points={ptsStr(pts)}
                    fill={s.color}
                    fillOpacity={0.15}
                    stroke={s.color}
                    strokeWidth={2}
                  />
                  {pts.map(([px, py], i) => (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r={4}
                      fill={s.color}
                      stroke="#0d1117"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) =>
                        setTooltip({
                          axis: AXES[i],
                          label: s.label,
                          value: s.data[i],
                          x: e.clientX,
                          y: e.clientY,
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <div className="font-semibold text-[#e6edf3]">{tooltip.axis}</div>
          <div className="text-[#8b949e]">
            {tooltip.label}: <strong className="text-[#e6edf3]">{tooltip.value}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
