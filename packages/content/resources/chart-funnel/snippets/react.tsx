import { useState } from "react";

const STAGES = [
  { label: "Visitors",       value: 10000, color: "#818cf8" },
  { label: "Sign Ups",       value:  4200, color: "#6366f1" },
  { label: "Onboarded",      value:  2800, color: "#a78bfa" },
  { label: "Active Users",   value:  1600, color: "#8b5cf6" },
  { label: "Paid Customers", value:   640, color: "#7c3aed" },
];

type Tooltip = { stage: typeof STAGES[0]; x: number; y: number }|null;

export default function ChartFunnelRC() {
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const maxW = 520;
  const minW = 80;

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[640px]">
        <div className="flex flex-col gap-0">
          {STAGES.map((stage,i) => {
            const pct = (stage.value / STAGES[0].value * 100).toFixed(1);
            const w = minW + (maxW-minW) * (stage.value/STAGES[0].value);
            const drop = i < STAGES.length-1 ? STAGES[i].value - STAGES[i+1].value : null;
            const dropPct = drop ? (drop/stage.value*100).toFixed(1) : null;

            return (
              <div key={stage.label} className="flex flex-col items-center" style={{ animation:`funnelIn 0.4s ${i*0.1}s ease both`, opacity:0 }}>
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                  style={{ width:w, background:stage.color, maxWidth:"100%" }}
                  onMouseEnter={e => setTooltip({ stage, x:e.clientX, y:e.clientY })}
                  onMouseMove={e => setTooltip(t=>t?{...t,x:e.clientX,y:e.clientY}:null)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span className="text-white font-semibold text-[13px]">{stage.label}</span>
                  <span className="text-white/80 text-[13px]">{stage.value.toLocaleString()}</span>
                </div>
                {drop !== null && (
                  <div className="flex items-center gap-2 py-1.5 text-[11px] text-[#484f58]">
                    <span className="text-[#f87171]">▼</span>
                    <span className="text-[#f87171] font-semibold">-{dropPct}%</span>
                    <span>dropped ({drop.toLocaleString()})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-[#21262d]">
          {STAGES.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[18px] font-bold" style={{ color:s.color }}>{(s.value/STAGES[0].value*100).toFixed(0)}%</div>
              <div className="text-[10px] text-[#484f58] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
          style={{ left:tooltip.x+12, top:tooltip.y-40 }}>
          <div className="font-semibold" style={{ color:tooltip.stage.color }}>{tooltip.stage.label}</div>
          <div className="text-[#8b949e]">{tooltip.stage.value.toLocaleString()} users</div>
          <div className="text-[#8b949e]">Overall: {(tooltip.stage.value/STAGES[0].value*100).toFixed(1)}%</div>
        </div>
      )}

      <style>{`@keyframes funnelIn{from{opacity:0;transform:scaleX(0.8)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
