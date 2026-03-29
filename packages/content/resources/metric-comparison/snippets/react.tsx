import { useEffect, useRef, useState } from "react";

const METRICS = [
  { label:"Website Visits", before:45200, after:52100, format:"num" as const },
  { label:"Bounce Rate",    before:54.2,  after:48.6,  format:"pct" as const, reverse:true },
  { label:"Conversion",     before:2.8,   after:3.4,   format:"pct" as const },
  { label:"Avg Order",      before:65,    after:72,    format:"currency" as const },
];

function fmt(v:number, f:string) {
  if(f==="pct") return v+"%";
  if(f==="currency") return "$"+v;
  return v.toLocaleString();
}

function MetricBar({ label, value, max, color, delay }: { label:string; value:number; max:number; color:string; delay:number }) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = (value/max*100).toFixed(1)+"%";
  useEffect(() => {
    const t = setTimeout(() => { if(ref.current) ref.current.style.width=pct; }, delay);
    return ()=>clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="flex items-center gap-2">
      <div className="text-[11px] w-24 text-right flex-shrink-0" style={{ color }}>{label}</div>
      <div className="flex-1 h-5 bg-[#21262d] rounded-full overflow-hidden">
        <div ref={ref} className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width:0, background:color }}/>
      </div>
    </div>
  );
}

export default function MetricComparisonRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[640px] grid grid-cols-1 sm:grid-cols-2 gap-4">
        {METRICS.map(m => {
          const delta = ((m.after-m.before)/m.before*100).toFixed(1);
          const isBetter = m.reverse ? +delta<0 : +delta>0;
          const maxVal = Math.max(m.before,m.after)*1.1;
          return (
            <div key={m.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e]/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[#e6edf3] font-semibold text-[14px]">{m.label}</div>
                <div className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${isBetter?"bg-[#34d399]/10 text-[#34d399]":"bg-[#f87171]/10 text-[#f87171]"}`}>
                  {+delta>0?"▲":"▼"}{Math.abs(+delta)}%
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <MetricBar label="Last Month" value={m.before} max={maxVal} color="#484f58" delay={100}/>
                  <div className="text-[11px] text-[#484f58] mt-1 text-right">{fmt(m.before,m.format)}</div>
                </div>
                <div>
                  <MetricBar label="This Month" value={m.after} max={maxVal} color="#818cf8" delay={200}/>
                  <div className="text-[11px] text-[#818cf8] mt-1 text-right font-semibold">{fmt(m.after,m.format)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
