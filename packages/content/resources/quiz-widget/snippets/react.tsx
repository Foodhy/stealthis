import { useState } from "react";

const QUESTIONS = [
  {
    question: "Which CSS property creates a flex container?",
    answers: ["display: grid", "display: block", "display: flex", "display: table"],
    correct: 2,
  },
  {
    question: "What does HTML stand for?",
    answers: [
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language",
      "Hyper Text Modern Language",
    ],
    correct: 0,
  },
  {
    question: "Which company originally developed JavaScript?",
    answers: ["Microsoft", "Netscape", "Google", "IBM"],
    correct: 1,
  },
  {
    question: "Which CSS unit is relative to the root element font size?",
    answers: ["em", "px", "rem", "vh"],
    correct: 2,
  },
  {
    question: "The correct way to declare a variable in modern JavaScript?",
    answers: ["var x = 5", "const x = 5", "int x = 5", "declare x = 5"],
    correct: 1,
  },
];

export default function QuizWidgetRC() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[idx];
  const pct = Math.round((score / QUESTIONS.length) * 100);

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 < QUESTIONS.length) {
        setIdx((n) => n + 1);
        setSelected(null);
      } else setDone(true);
    }, 1200);
  }

  function restart() {
    setIdx(0);
    setScore(0);
    setSelected(null);
    setDone(false);
  }

  function btnStyle(i: number): React.CSSProperties {
    if (selected === null)
      return { background: "#21262d", borderColor: "#30363d", color: "#e6edf3" };
    if (i === q.correct)
      return {
        background: "rgba(35,134,54,0.3)",
        borderColor: "rgba(126,231,135,0.5)",
        color: "#7ee787",
      };
    if (i === selected)
      return {
        background: "rgba(248,81,73,0.2)",
        borderColor: "rgba(248,81,73,0.5)",
        color: "#f85149",
      };
    return { background: "#21262d", borderColor: "#30363d", color: "#484f58" };
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center w-full max-w-sm">
          <p className="text-5xl mb-4">{pct === 100 ? "🏆" : pct >= 60 ? "🎯" : "📚"}</p>
          <h2 className="text-[#e6edf3] text-2xl font-bold mb-1">
            {score}/{QUESTIONS.length}
          </h2>
          <p className="text-[#8b949e] text-sm mb-6">You scored {pct}%</p>
          <div className="h-2 bg-[#21262d] rounded-full mb-6">
            <div
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={restart}
            className="w-full py-2.5 bg-[#238636] border border-[#2ea043] text-white rounded-xl font-semibold text-sm hover:bg-[#2ea043] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#8b949e]">
            Question {idx + 1}/{QUESTIONS.length}
          </span>
          <span className="text-xs font-semibold text-[#58a6ff]">Score: {score}</span>
        </div>
        <div className="h-1 bg-[#21262d] rounded-full mb-5">
          <div
            className="h-full bg-[#58a6ff] rounded-full transition-all"
            style={{ width: `${(idx / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="text-[#e6edf3] font-semibold text-base mb-4 leading-snug">{q.question}</p>
        <div className="space-y-2">
          {q.answers.map((a, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={selected !== null}
              className="w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-200"
              style={btnStyle(i)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
