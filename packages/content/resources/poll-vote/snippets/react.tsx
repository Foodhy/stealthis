import { useState } from "react";

const POLL = {
  question: "What's your favorite frontend tool?",
  options: [
    { label: "React", emoji: "⚛️", votes: 850 },
    { label: "Vue", emoji: "💚", votes: 420 },
    { label: "Svelte", emoji: "🔥", votes: 310 },
    { label: "Angular", emoji: "🔴", votes: 240 },
  ],
};

export default function PollVoteRC() {
  const [options, setOptions] = useState(POLL.options);
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);

  const total = options.reduce((s, o) => s + o.votes, 0);

  function vote() {
    if (selected === null) return;
    setOptions((prev) => prev.map((o, i) => (i === selected ? { ...o, votes: o.votes + 1 } : o)));
    setVoted(true);
  }

  const sortedForResults = [...options]
    .map((o, i) => ({ ...o, idx: i }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-[#e6edf3] font-bold text-base mb-1">{POLL.question}</h2>
        <p className="text-[#484f58] text-xs mb-5">
          {(total + (voted ? 1 : 0)).toLocaleString()} total votes
        </p>

        {!voted ? (
          <>
            <div className="space-y-2 mb-5">
              {options.map((o, i) => (
                <button
                  key={o.label}
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200 ${
                    selected === i
                      ? "bg-[#58a6ff]/10 border-[#58a6ff]/50 text-[#e6edf3]"
                      : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/40"
                  }`}
                >
                  <span className="text-lg">{o.emoji}</span>
                  <span className="font-medium">{o.label}</span>
                  {selected === i && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-[#58a6ff] flex items-center justify-center">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={vote}
              disabled={selected === null}
              className="w-full py-2.5 bg-[#238636] border border-[#2ea043] text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-[#2ea043] transition-colors"
            >
              Vote
            </button>
          </>
        ) : (
          <div className="space-y-3">
            {sortedForResults.map((o, rank) => {
              const pct = Math.round((o.votes / (total + 1)) * 100);
              const isWinner = rank === 0;
              return (
                <div key={o.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{o.emoji}</span>
                      <span
                        className={`text-sm font-medium ${isWinner ? "text-[#f1e05a]" : "text-[#8b949e]"}`}
                      >
                        {o.label}
                      </span>
                      {isWinner && <span className="text-xs">👑</span>}
                    </div>
                    <span className="text-xs font-bold text-[#e6edf3] tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: isWinner ? "#f1e05a" : "#30363d" }}
                    />
                  </div>
                  <p className="text-[10px] text-[#484f58] mt-0.5">
                    {o.votes.toLocaleString()} votes
                  </p>
                </div>
              );
            })}
            <button
              onClick={() => {
                setVoted(false);
                setSelected(null);
              }}
              className="w-full mt-2 py-2 text-sm text-[#484f58] hover:text-[#8b949e] transition-colors"
            >
              Vote again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
