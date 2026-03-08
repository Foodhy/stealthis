import { useState } from "react";

const DATA = [
  { label: "Organic Search", value: 4200, color: "#818cf8" },
  { label: "Direct",         value: 2800, color: "#34d399" },
  { label: "Social Media",   value: 1900, color: "#f59e0b" },
  { label: "Referral",       value: 1300, color: "#f87171" },
  { label: "Email",          value:  800, color: "#a78bfa" },
];
const total = DATA.reduce((a,d) => a+d.value, 0);
const SIZE = 260, CX = SIZE/2, CY = SIZE/2, R = 110, INNER_R = 65;

function polarXY(r: number, angle: number): [number,number] {
  return [CX + r*Math.cos(angle), CY + r*Math.sin(angle)];
}
function arcPath(r: number, innerR: number, start: number, end: number, isDonut: boolean) {
  const [sx,sy] = polarXY(r, start);
  const [ex,ey] = polarXY(r, end);
  const large = end-start > Math.PI ? 1 : 0;
  if (isDonut) {
    const [ix,iy] = polarXY(innerR, end);
    const [ox,oy] = polarXY(innerR, start);
    return `M${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} L${ix},${iy} A${innerR},${innerR} 0 ${large},0 ${ox},${oy} Z`;
  }
  return `M${CX},${CY} L${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} Z`;
}

type Tooltip = { label: string; value: number; pct: string; x: number; y: number } | null;

export default function ChartPieRC() {
  const [mode, setMode] = useState<"donut"|"pie">("donut");
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [hovered, setHovered] = useState<number|null>(null);

  let angle = -Math.PI/2;
  const slices = DATA.map((d,i) => {
    const share = (d.value/total) * 2*Math.PI;
    const start = angle;
    const end = angle + share;
    angle = end;
    return { ...d, start, end, i };
  });

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[600px]">
        <div className="flex gap-1 mb-6 justify-center">
          {(["donut","pie"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`text-[11px] px-3 py-1 rounded border transition-colors capitalize ${mode===m?"bg-[#818cf8]/20 border-[#818cf8] text-[#818cf8]":"border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"}`}>
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative flex-shrink-0">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {slices.map((s) => (
                <path key={s.label}
                  d={arcPath(R, INNER_R, s.start, s.end, mode==="donut")}
                  fill={s.color}
                  opacity={hovered===null||hovered===s.i?1:0.5}
                  transform={hovered===s.i?`translate(${(Math.cos((s.start+s.end)/2)*6).toFixed(1)},${(Math.sin((s.start+s.end)/2)*6).toFixed(1)})`:"translate(0,0)"}
                  style={{ transition:"transform 0.2s, opacity 0.2s", cursor:"pointer" }}
                  onMouseEnter={e => { setHovered(s.i); setTooltip({ label:s.label, value:s.value, pct:((s.value/total)*100).toFixed(1), x:e.clientX, y:e.clientY }); }}
                  onMouseMove={e => setTooltip(t => t?{...t,x:e.clientX,y:e.clientY}:null)}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                />
              ))}
              {mode==="donut" && (
                <>
                  <text x={CX} y={CY-6} textAnchor="middle" fill="#e6edf3" fontSize={22} fontWeight={800}>{(total/1000).toFixed(1)}k</text>
                  <text x={CX} y={CY+12} textAnchor="middle" fill="#484f58" fontSize={11}>total visits</text>
                </>
              )}
            </svg>
          </div>

          <div className="flex flex-col gap-2 flex-1 w-full">
            {DATA.map((d,i) => {
              const pct = ((d.value/total)*100).toFixed(1);
              return (
                <div key={d.label} className={`flex items-center gap-2 py-1 px-2 rounded transition-colors cursor-default ${hovered===i?"bg-[#161b22]":""}`}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: d.color }}/>
                  <span className="text-[#8b949e] text-[13px] flex-1">{d.label}</span>
                  <span className="text-[#484f58] text-[12px]">{d.value.toLocaleString()}</span>
                  <span className="text-[12px] font-semibold w-12 text-right" style={{ color: d.color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
          style={{ left: tooltip.x+12, top: tooltip.y-40 }}>
          <div className="font-semibold text-[#e6edf3]">{tooltip.label}</div>
          <div className="text-[#8b949e]">{tooltip.value.toLocaleString()} visits · {tooltip.pct}%</div>
        </div>
      )}
    </div>
  );
}
