import { useState, useRef, useEffect } from "react";

const DATA = [
  { label: "Electronics", value: 340, color: "#818cf8" },
  { label: "Clothing",    value: 220, color: "#34d399" },
  { label: "Books",       value: 185, color: "#f59e0b" },
  { label: "Sports",      value: 260, color: "#f87171" },
  { label: "Home",        value: 310, color: "#a78bfa" },
  { label: "Beauty",      value: 145, color: "#38bdf8" },
];
const PAD = { top: 24, right: 20, bottom: 40, left: 52 };

type Tooltip = { label: string; value: number; color: string; x: number; y: number } | null;

export default function ChartBarRC() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  const [orient, setOrient] = useState<"vertical"|"horizontal">("vertical");
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) setW(wrapRef.current.clientWidth - 32);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { setAnimated(false); requestAnimationFrame(() => setAnimated(true)); }, [orient]);

  const maxVal = Math.ceil(Math.max(...DATA.map(d => d.value)) * 1.15);

  if (orient === "vertical") {
    const H = Math.round(W * 0.5);
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const n = DATA.length;
    const gap = 8;
    const barW = (cW - gap * (n-1)) / n;
    const yOf = (v: number) => PAD.top + cH - (v / maxVal) * cH;

    return (
      <div className="min-h-screen bg-[#0d1117] p-6">
        <div ref={wrapRef} className="w-full max-w-[800px] mx-auto">
          <div className="flex gap-1 mb-4 justify-end">
            {(["vertical","horizontal"] as const).map(o => (
              <button key={o} onClick={() => setOrient(o)}
                className={`text-[11px] px-3 py-1 rounded border transition-colors capitalize ${orient===o?"bg-[#818cf8]/20 border-[#818cf8] text-[#818cf8]":"border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"}`}>
                {o}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
              {Array.from({length:6},(_,t) => { const v=Math.round((maxVal/5)*t); const y=yOf(v); return (
                <g key={t}>
                  <line x1={PAD.left} x2={PAD.left+cW} y1={y} y2={y} stroke="#21262d" strokeWidth={1}/>
                  <text x={PAD.left-6} y={y+3.5} textAnchor="end" fill="#484f58" fontSize={10}>{v}</text>
                </g>
              ); })}
              {DATA.map((d,i) => {
                const x = PAD.left + i*(barW+gap);
                const barH = (d.value/maxVal)*cH;
                const y = PAD.top+cH-barH;
                return (
                  <g key={d.label}>
                    <rect x={x} y={animated?y:PAD.top+cH} width={barW} height={animated?barH:0} rx={4} fill={d.color}
                      style={{ transition: `y 0.5s cubic-bezier(.4,0,.2,1) ${i*0.06}s, height 0.5s cubic-bezier(.4,0,.2,1) ${i*0.06}s` }}
                      onMouseEnter={e => setTooltip({...d, x:e.clientX, y:e.clientY})}
                      onMouseMove={e => setTooltip(t => t?{...t,x:e.clientX,y:e.clientY}:null)}
                      onMouseLeave={() => setTooltip(null)}/>
                    <text x={x+barW/2} y={y-4} textAnchor="middle" fill="#8b949e" fontSize={10}>{d.value}</text>
                    <text x={x+barW/2} y={H-6} textAnchor="middle" fill="#484f58" fontSize={10}>{d.label}</text>
                  </g>
                );
              })}
            </svg>
            {tooltip && (
              <div className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
                style={{ left: tooltip.x+12, top: tooltip.y-40 }}>
                <div className="font-semibold" style={{ color: tooltip.color }}>{tooltip.label}</div>
                <div className="text-[#8b949e]">{tooltip.value} units</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal
  const barH = 30, gap = 12;
  const totalH = DATA.length * (barH+gap);
  const H = totalH + PAD.top + PAD.bottom;
  const cW = W - PAD.left - PAD.right;
  const xOf = (v: number) => PAD.left + (v/maxVal)*cW;

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div ref={wrapRef} className="w-full max-w-[800px] mx-auto">
        <div className="flex gap-1 mb-4 justify-end">
          {(["vertical","horizontal"] as const).map(o => (
            <button key={o} onClick={() => setOrient(o)}
              className={`text-[11px] px-3 py-1 rounded border transition-colors capitalize ${orient===o?"bg-[#818cf8]/20 border-[#818cf8] text-[#818cf8]":"border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"}`}>
              {o}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
            {Array.from({length:6},(_,t) => { const v=Math.round((maxVal/5)*t); const x=xOf(v); return (
              <g key={t}>
                <line x1={x} x2={x} y1={PAD.top} y2={PAD.top+totalH} stroke="#21262d" strokeWidth={1}/>
                <text x={x} y={PAD.top+totalH+14} textAnchor="middle" fill="#484f58" fontSize={10}>{v}</text>
              </g>
            ); })}
            {DATA.map((d,i) => {
              const y = PAD.top + i*(barH+gap);
              const bW = animated ? (d.value/maxVal)*cW : 0;
              return (
                <g key={d.label}>
                  <rect x={PAD.left} y={y} width={bW} height={barH} rx={4} fill={d.color}
                    style={{ transition: `width 0.5s cubic-bezier(.4,0,.2,1) ${i*0.06}s` }}
                    onMouseEnter={e => setTooltip({...d,x:e.clientX,y:e.clientY})}
                    onMouseMove={e => setTooltip(t => t?{...t,x:e.clientX,y:e.clientY}:null)}
                    onMouseLeave={() => setTooltip(null)}/>
                  <text x={PAD.left-6} y={y+barH/2+4} textAnchor="end" fill="#484f58" fontSize={10}>{d.label}</text>
                  <text x={PAD.left+bW+4} y={y+barH/2+4} textAnchor="start" fill="#8b949e" fontSize={10}>{d.value}</text>
                </g>
              );
            })}
          </svg>
          {tooltip && (
            <div className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
              style={{ left: tooltip.x+12, top: tooltip.y-40 }}>
              <div className="font-semibold" style={{ color: tooltip.color }}>{tooltip.label}</div>
              <div className="text-[#8b949e]">{tooltip.value} units</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
