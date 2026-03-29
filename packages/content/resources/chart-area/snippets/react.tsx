import { useState, useRef, useEffect, useCallback } from "react";

const SERIES = [
  { label: "Pageviews", color: "#818cf8", data: [3200,2900,3800,4100,3700,4500,4900,4200,5100,4700,5300,5800,5500,6200] },
  { label: "Sessions",  color: "#34d399", data: [1800,1600,2100,2300,2000,2600,2900,2500,3100,2800,3200,3500,3300,3800] },
];
const DAYS = Array.from({length:14},(_,i) => {
  const d = new Date(); d.setDate(d.getDate()-13+i);
  return d.toLocaleDateString("en",{month:"short",day:"numeric"});
});
const PAD = { top: 20, right: 20, bottom: 36, left: 52 };

export default function ChartAreaRC() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 270 });
  const [tooltip, setTooltip] = useState<{ idx:number; x:number; y:number }|null>(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth - 32;
      setDims({ w, h: Math.round(w*0.45) });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = dims;
  const n = DAYS.length;
  const allVals = SERIES.flatMap(s => s.data);
  const maxVal = Math.ceil(Math.max(...allVals)*1.15);
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const xOf = (i: number) => PAD.left + (i/(n-1))*cW;
  const yOf = (v: number) => PAD.top + cH - (v/maxVal)*cH;

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W/rect.width);
    const idx = Math.round(((mx - PAD.left)/cW)*(n-1));
    if (idx < 0 || idx >= n) { setTooltip(null); return; }
    setTooltip({ idx, x: xOf(idx), y: PAD.top });
  }, [W, cW, n, xOf]);

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div ref={wrapRef} className="w-full max-w-[800px] mx-auto">
        <div className="flex gap-4 mb-4">
          {SERIES.map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-[12px]">
              <span className="w-3 h-0.5 rounded-full" style={{ background: s.color }}/>
              <span className="text-[#8b949e]">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full"
            onMouseMove={handleMove} onMouseLeave={() => setTooltip(null)}>
            <defs>
              {SERIES.map((s,si) => (
                <linearGradient key={si} id={`agrad${si}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.5}/>
                  <stop offset="100%" stopColor={s.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            {/* Grid */}
            {Array.from({length:6},(_,t) => { const v=Math.round((maxVal/5)*t); const y=yOf(v); return (
              <g key={t}>
                <line x1={PAD.left} x2={PAD.left+cW} y1={y} y2={y} stroke="#21262d" strokeWidth={1}/>
                <text x={PAD.left-6} y={y+3.5} textAnchor="end" fill="#484f58" fontSize={10}>{v>=1000?(v/1000).toFixed(1)+"k":v}</text>
              </g>
            ); })}
            {DAYS.map((d,i) => i%2===0 && (
              <text key={d} x={xOf(i)} y={H-6} textAnchor="middle" fill="#484f58" fontSize={10}>{d}</text>
            ))}
            {tooltip && <line x1={tooltip.x} x2={tooltip.x} y1={PAD.top} y2={PAD.top+cH} stroke="#8b949e" strokeWidth={1} strokeDasharray="4 2"/>}
            {SERIES.map((s,si) => {
              const pts = s.data.map((v,i): [number,number] => [xOf(i),yOf(v)]);
              const ptsStr = pts.map(p=>p.join(",")).join(" ");
              const areaD = `M${xOf(0)},${PAD.top+cH} L${ptsStr} L${xOf(n-1)},${PAD.top+cH} Z`;
              return (
                <g key={s.label}>
                  <path d={areaD} fill={`url(#agrad${si})`}/>
                  <polyline points={ptsStr} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  {tooltip && <circle cx={pts[tooltip.idx][0]} cy={pts[tooltip.idx][1]} r={4} fill={s.color} stroke="#0d1117" strokeWidth={2}/>}
                </g>
              );
            })}
          </svg>
          {tooltip && (
            <div className="absolute pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg min-w-[150px]"
              style={{ left: Math.min(tooltip.x+12, W-170), top: tooltip.y }}>
              <div className="text-[#8b949e] font-semibold mb-1.5">{DAYS[tooltip.idx]}</div>
              {SERIES.map(s => (
                <div key={s.label} className="flex items-center gap-2 py-0.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }}/>
                  <span className="text-[#8b949e] flex-1">{s.label}</span>
                  <span className="text-[#e6edf3] font-bold">{s.data[tooltip.idx].toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
