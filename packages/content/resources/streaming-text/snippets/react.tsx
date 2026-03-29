import { useState, useEffect, useRef } from "react";

const TEXTS = [
  "The transformer architecture fundamentally changed natural language processing by introducing the attention mechanism — allowing models to weigh the relevance of each token relative to all others in the sequence, regardless of distance.",
  "Retrieval-augmented generation (RAG) combines a parametric language model with a non-parametric retrieval component. At inference time, relevant documents are fetched from a knowledge base and appended to the context, grounding the model's output in factual sources.",
  "Constitutional AI trains models to be helpful, harmless, and honest by generating a set of principles the model critiques itself against. This iterative self-improvement loop reduces harmful outputs without requiring human labelers for every edge case.",
];

interface StreamProps {
  text: string;
  speed?: number;
  label?: string;
}

function StreamCard({ text, speed = 16, label }: StreamProps) {
  const [displayed, setDisplayed] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idxRef = useRef(0);

  const start = () => {
    if (running) return;
    idxRef.current = 0;
    setDisplayed("");
    setDone(false);
    setRunning(true);
    timerRef.current = setInterval(() => {
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        clearInterval(timerRef.current!);
        setRunning(false);
        setDone(true);
      }
    }, speed);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayed("");
    setRunning(false);
    setDone(false);
    idxRef.current = 0;
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const pct = Math.round((displayed.length / text.length) * 100);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#21262d] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">{label}</span>
          {running && (
            <span className="flex items-center gap-1 text-[11px] text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Streaming
            </span>
          )}
          {done && (
            <span className="text-[11px] text-[#8b949e]">{text.length} chars</span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={start}
            disabled={running}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#58a6ff]/20 transition-colors"
          >
            {done ? "Replay" : "Stream"}
          </button>
          {(running || done) && (
            <button
              onClick={reset}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(running || done) && (
        <div className="h-0.5 bg-[#21262d]">
          <div
            className="h-full bg-[#58a6ff] transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Text */}
      <div className="px-5 py-4 min-h-[80px]">
        {displayed ? (
          <p className="text-[14px] leading-relaxed text-[#cdd6f4]">
            {displayed}
            {running && (
              <span className="inline-block w-0.5 h-4 bg-[#58a6ff] ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        ) : (
          <p className="text-[13px] text-[#484f58]">Click Stream to start →</p>
        )}
      </div>
    </div>
  );
}

export default function StreamingTextRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[720px] space-y-4">
        <StreamCard text={TEXTS[0]} speed={12} label="Standard (12ms)" />
        <StreamCard text={TEXTS[1]} speed={4}  label="Fast (4ms)" />
        <StreamCard text={TEXTS[2]} speed={30} label="Slow (30ms)" />
      </div>
    </div>
  );
}
