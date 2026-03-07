import { useState, useRef } from "react";

interface Citation {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

const CITATIONS: Citation[] = [
  {
    id: 1,
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    domain: "arxiv.org",
    snippet: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
  },
  {
    id: 2,
    title: "RLHF: Training language models to follow instructions",
    url: "https://arxiv.org/abs/2203.02155",
    domain: "arxiv.org",
    snippet: "We fine-tune language models to follow instructions with human feedback, showing that this substantially improves alignment across a range of tasks.",
  },
  {
    id: 3,
    title: "Constitutional AI: Harmlessness from AI Feedback",
    url: "https://arxiv.org/abs/2212.08073",
    domain: "anthropic.com",
    snippet: "We propose a method for training a harmless AI assistant without any human labels identifying harmful outputs, using a set of principles to guide self-critique.",
  },
  {
    id: 4,
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    url: "https://arxiv.org/abs/2005.11401",
    domain: "arxiv.org",
    snippet: "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory.",
  },
];

interface TooltipProps {
  citation: Citation;
  side?: "top" | "bottom";
}

function CitationMarker({ citation, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<"left" | "center" | "right">("center");
  const ref = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const vw = window.innerWidth;
      if (rect.left < 200) setPos("left");
      else if (rect.right > vw - 200) setPos("right");
      else setPos("center");
    }
    setVisible(true);
  };

  const transformOrigin: Record<typeof pos, string> = {
    left: "0%",
    center: "50%",
    right: "100%",
  };

  const translateX: Record<typeof pos, string> = {
    left: "0%",
    center: "-50%",
    right: "-100%",
  };

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
      onFocus={show}
      onBlur={() => setVisible(false)}
    >
      <button
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold align-super ml-0.5 transition-colors ${
          visible
            ? "bg-[#58a6ff] text-white"
            : "bg-[#58a6ff]/20 text-[#58a6ff] hover:bg-[#58a6ff]/40"
        }`}
        tabIndex={0}
      >
        {citation.id}
      </button>

      {visible && (
        <div
          className="absolute z-50 w-[280px] bg-[#21262d] border border-[#30363d] rounded-xl shadow-2xl p-3.5"
          style={{
            [side === "top" ? "bottom" : "top"]: "calc(100% + 8px)",
            left: "50%",
            transform: `translateX(${translateX[pos]})`,
          }}
        >
          {/* Arrow */}
          <div
            className={`absolute left-[50%] w-2 h-2 rotate-45 bg-[#21262d] border-[#30363d] ${
              side === "top"
                ? "bottom-[-5px] border-r border-b"
                : "top-[-5px] border-l border-t"
            }`}
            style={{ transform: `translateX(-50%) rotate(45deg)` }}
          />

          {/* Source line */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-3.5 h-3.5 rounded-sm bg-[#58a6ff]/20 flex items-center justify-center flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <span className="text-[10px] text-[#484f58] font-mono">{citation.domain}</span>
          </div>

          {/* Title */}
          <p className="text-[12px] font-semibold text-[#e6edf3] leading-tight mb-1.5">
            {citation.title}
          </p>

          {/* Snippet */}
          <p className="text-[11px] text-[#8b949e] leading-relaxed line-clamp-3">
            "{citation.snippet}"
          </p>

          {/* View link */}
          <div className="mt-2.5 pt-2 border-t border-[#30363d]">
            <span className="text-[10px] text-[#58a6ff] font-semibold">
              View source →
            </span>
          </div>
        </div>
      )}
    </span>
  );
}

export default function CitationTooltipRC() {
  const cite = (id: number) => <CitationMarker citation={CITATIONS[id - 1]} />;

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[680px] space-y-6">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
          {/* Model tag */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e89537]" />
            <span className="text-[11px] font-mono font-bold text-[#8b949e]">claude-opus-4</span>
          </div>

          <p className="text-[14px] text-[#e6edf3] leading-relaxed">
            Large language models are built on the Transformer architecture{cite(1)}, which uses
            attention mechanisms to process sequences in parallel. To align these models with human
            preferences, researchers employ techniques like RLHF{cite(2)} — reinforcement learning
            from human feedback — or newer approaches like Constitutional AI{cite(3)}, which uses
            AI-generated feedback instead of human labels.
          </p>

          <p className="text-[14px] text-[#e6edf3] leading-relaxed">
            For knowledge-intensive tasks, retrieval-augmented generation (RAG){cite(4)} combines
            the model's parametric knowledge with a live retrieval step, grounding responses in
            up-to-date sources and reducing hallucination rates significantly.
          </p>

          {/* Citations list */}
          <div className="mt-4 pt-4 border-t border-[#30363d] space-y-1.5">
            <p className="text-[10px] font-bold text-[#484f58] uppercase tracking-wider mb-2">Sources</p>
            {CITATIONS.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-[11px]">
                <span className="w-4 h-4 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] font-bold flex items-center justify-center flex-shrink-0 text-[9px]">
                  {c.id}
                </span>
                <div>
                  <span className="text-[#8b949e]">{c.title}</span>
                  <span className="text-[#484f58] ml-2">— {c.domain}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#484f58] text-center">Hover the citation numbers to see source tooltips</p>
      </div>
    </div>
  );
}
