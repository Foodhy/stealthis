import { useState, useEffect, useRef } from "react";

const SIZE=200, CX=SIZE/2, CY=SIZE*0.6, R=80, STROKE=16;
const START_ANG = -210*(Math.PI/180), END_ANG = 30*(Math.PI/180);

type Zone = { from:number; to:number; color:string };
type GaugeCfg = { label:string; value:number; min:number; max:number; zones:Zone[] };

const GAUGES: GaugeCfg[] = [
  { label:"CPU Load",     value:68, min:0, max:100, zones:[{from:0,to:50,color:"#34d399"},{from:50,to:75,color:"#f59e0b"},{from:75,to:100,color:"#f87171"}] },
  { label:"Memory",       value:42, min:0, max:100, zones:[{from:0,to:50,color:"#34d399"},{from:50,to:80,color:"#f59e0b"},{from:80,to:100,color:"#f87171"}] },
  { label:"Disk Health",  value:87, min:0, max:100, zones:[{from:0,to:40,color:"#f87171"},{from:40,to:70,color:"#f59e0b"},{from:70,to:100,color:"#34d399"}] },
];

function ptOnArc(r:number, ang:number): [number,number] {
  return [CX+r*Math.cos(ang), CY+r*Math.sin(ang)];
}
function arcD(r:number, a1:number, a2:number) {
  const [sx,sy]=ptOnArc(r,a1), [ex,ey]=ptOnArc(r,a2);
  const large = a2-a1>Math.PI?1:0;
  return `M${sx.toFixed(2)},${sy.toFixed(2)} A${r},${r} 0 ${large},1 ${ex.toFixed(2)},${ey.toFixed(2)}`;
}
function valToAng(v:number, min:number, max:number) {
  return START_ANG+(v-min)/(max-min)*(END_ANG-START_ANG);
}

function Gauge({ cfg, value }: { cfg:GaugeCfg; value:number }) {
  const [current, setCurrent] = useState(cfg.min);
  const rafRef = useRef<number>(0);
  const fromRef = useRef(cfg.min);

  useEffect(() => {
    const from = fromRef.current;
    let start: number|null = null;
    const duration = 1000;
    function step(ts:number) {
      if (!start) start=ts;
      const p = Math.min((ts-start)/duration,1);
      const eased = 1-Math.pow(1-p,3);
      const v = from+(value-from)*eased;
      setCurrent(v);
      if (p<1) rafRef.current=requestAnimationFrame(step);
      else fromRef.current=value;
    }
    rafRef.current=requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const ang = valToAng(current, cfg.min, cfg.max);
  const [nx,ny] = ptOnArc(R-STROKE/2-2, ang);
  const [mlx,mly] = ptOnArc(R+18, START_ANG);
  const [mxlx,mxly] = ptOnArc(R+18, END_ANG);

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE*0.7} viewBox={`0 0 ${SIZE} ${SIZE*0.7}`}>
        <path d={arcD(R,START_ANG,END_ANG)} fill="none" stroke="#1e2130" strokeWidth={STROKE} strokeLinecap="round"/>
        {cfg.zones.map((z,i) => (
          <path key={i} d={arcD(R,valToAng(z.from,cfg.min,cfg.max),valToAng(z.to,cfg.min,cfg.max))}
            fill="none" stroke={z.color} strokeWidth={STROKE*0.55} strokeLinecap="round"/>
        ))}
        <text x={mlx} y={mly} textAnchor="middle" fill="#64748b" fontSize={10}>{cfg.min}</text>
        <text x={mxlx} y={mxly} textAnchor="middle" fill="#64748b" fontSize={10}>{cfg.max}</text>
        <line x1={CX} y1={CY} x2={nx.toFixed(2)} y2={ny.toFixed(2)} stroke="#e2e8f0" strokeWidth={2.5} strokeLinecap="round"/>
        <circle cx={CX} cy={CY} r={6} fill="#e2e8f0"/>
        <text x={CX} y={CY-16} textAnchor="middle" fill="#e2e8f0" fontSize={22} fontWeight={800}>{Math.round(current)}</text>
      </svg>
      <div className="text-[#8b949e] text-[13px] -mt-1">{cfg.label}</div>
    </div>
  );
}

export default function GaugeMeterRC() {
  const [values, setValues] = useState(GAUGES.map(g=>g.value));
  const randomize = () => setValues(GAUGES.map(()=>Math.floor(Math.random()*91)+5));

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex flex-col items-center gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {GAUGES.map((g,i) => <Gauge key={g.label} cfg={g} value={values[i]}/>)}
      </div>
      <button onClick={randomize}
        className="px-4 py-2 bg-[#818cf8]/20 border border-[#818cf8]/40 text-[#818cf8] rounded-lg text-[13px] hover:bg-[#818cf8]/30 transition-colors">
        Randomize
      </button>
    </div>
  );
}
