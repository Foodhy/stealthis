import { useState, useEffect, useRef } from "react";

const CARDS = [
  { label:"Monthly Revenue",  value:124500, prev:108200, prefix:"$", suffix:"",  color:"#818cf8", period:"Mar 2026" },
  { label:"Active Users",     value:8420,   prev:7890,   prefix:"",  suffix:"",  color:"#34d399", period:"This month" },
  { label:"Conversion Rate",  value:3.4,    prev:2.8,    prefix:"",  suffix:"%", color:"#f59e0b", period:"vs last month", decimals:1 },
  { label:"Avg Order Value",  value:72,     prev:65,     prefix:"$", suffix:"",  color:"#f87171", period:"Last 30 days" },
];

function useCounter(target: number, decimals=0) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    let start: number|null=null;
    const duration=1200;
    function step(ts:number){
      if(!start)start=ts;
      const p=Math.min((ts-start)/duration,1);
      const eased=1-Math.pow(1-p,3);
      setVal(+(target*eased).toFixed(decimals));
      if(p<1)rafRef.current=requestAnimationFrame(step);
    }
    rafRef.current=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[target,decimals]);
  return val;
}

function KpiCard({ card }: { card:typeof CARDS[0] }) {
  const count = useCounter(card.value, card.decimals??0);
  const delta = card.prev ? ((card.value-card.prev)/card.prev*100).toFixed(1) : "0";
  const isUp = +delta > 0;

  const sparkPts = [0,10,14,8,18,4,24].map((v,i): [number,number] => [i*10, 24-v]);
  const sparkStr = sparkPts.map(p=>p.join(",")).join(" ");

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 relative overflow-hidden hover:border-[#8b949e]/40 transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background:card.color }}/>
      <div className="ml-1">
        <div className="text-[11px] text-[#484f58] uppercase tracking-wider mb-1">{card.period}</div>
        <div className="text-[28px] font-extrabold text-[#e6edf3] leading-none mb-1">
          {card.prefix}{card.decimals ? count.toFixed(card.decimals) : Math.round(count).toLocaleString()}{card.suffix}
        </div>
        <div className="text-[#8b949e] text-[13px] mb-3">{card.label}</div>
        <div className="flex items-center justify-between">
          <div className={`text-[12px] font-semibold ${isUp?"text-[#34d399]":"text-[#f87171]"}`}>
            {isUp?"▲":"▼"} {Math.abs(+delta)}%
          </div>
          <svg width={60} height={24} viewBox="0 0 60 24">
            <polyline points={sparkStr} fill="none" stroke={card.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function KpiCardRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="w-full max-w-[800px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map(card => <KpiCard key={card.label} card={card}/>)}
        </div>
      </div>
    </div>
  );
}
