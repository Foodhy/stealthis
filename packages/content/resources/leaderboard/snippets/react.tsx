import { useState, useEffect, useRef } from "react";

const INITIAL_USERS = [
  { id:1, name:"Alice Smith",    score:9850, prevRank:1 },
  { id:2, name:"Bob Johnson",    score:8420, prevRank:2 },
  { id:3, name:"Carol Williams", score:8100, prevRank:3 },
  { id:4, name:"David Brown",    score:7650, prevRank:4 },
  { id:5, name:"Eve Davis",      score:6980, prevRank:5 },
  { id:6, name:"Frank Miller",   score:6200, prevRank:6 },
  { id:7, name:"Grace Wilson",   score:5800, prevRank:7 },
];
const COLORS = ["#818cf8","#34d399","#f59e0b","#f87171","#a78bfa","#38bdf8","#fb7185"];

function initials(name:string) { return name.split(" ").map(n=>n[0]).join("").slice(0,2); }
function rankCls(rank:number) {
  if(rank===1) return "text-[#f59e0b]";
  if(rank===2) return "text-[#94a3b8]";
  if(rank===3) return "text-[#b45309]";
  return "text-[#484f58]";
}

type User = typeof INITIAL_USERS[0] & { rank?:number };

function ScoreBar({ value, max, color, animate }: { value:number; max:number; color:string; animate:boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = (value/max*100).toFixed(1)+"%";
  useEffect(() => {
    if(!ref.current) return;
    ref.current.style.width="0%";
    const t = setTimeout(() => { if(ref.current) ref.current.style.width=pct; },50);
    return ()=>clearTimeout(t);
  },[pct,animate]);
  return (
    <div className="flex-1 h-2 bg-[#21262d] rounded-full overflow-hidden">
      <div ref={ref} className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ background:color }}/>
    </div>
  );
}

export default function LeaderboardRC() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [live, setLive] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const sorted = [...users].sort((a,b)=>b.score-a.score).map((u,i)=>({...u,rank:i+1}));
  const maxScore = sorted[0].score*1.1;

  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(() => {
        setUsers(prev => prev.map(u=>({...u,prevRank:u.rank??u.id,score:u.score+Math.floor(Math.random()*500)})));
        setTick(t=>t+1);
      },2500);
    } else {
      if(intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
  },[live]);

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#e6edf3] font-bold text-[16px]">Leaderboard</h2>
          <button onClick={() => setLive(l=>!l)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${live?"bg-[#34d399]/20 border-[#34d399] text-[#34d399]":"border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"}`}>
            {live?"■ Stop Live":"▶ Start Live"}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {sorted.map((u) => {
            const color = COLORS[u.id % COLORS.length];
            const rankDiff = (u.prevRank||u.rank) - u.rank!;
            return (
              <div key={u.id} className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#8b949e]/40 transition-all">
                <div className={`w-6 text-center font-bold text-[14px] ${rankCls(u.rank!)}`}>
                  {u.rank! <= 3 ? ["🥇","🥈","🥉"][u.rank!-1] : u.rank}
                </div>
                <div className="text-[10px] w-8 text-center">
                  {rankDiff>0&&<span className="text-[#34d399]">▲{rankDiff}</span>}
                  {rankDiff<0&&<span className="text-[#f87171]">▼{Math.abs(rankDiff)}</span>}
                  {rankDiff===0&&<span className="text-[#484f58]">—</span>}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ background:color }}>{initials(u.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#e6edf3] text-[13px] font-medium truncate">{u.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <ScoreBar value={u.score} max={maxScore} color={color} animate={tick>0}/>
                  </div>
                </div>
                <div className="text-[#e6edf3] font-bold text-[14px] tabular-nums">{u.score.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
