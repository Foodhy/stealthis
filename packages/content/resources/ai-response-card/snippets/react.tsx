import { useState } from "react";

const RESPONSES = [
  {
    model: "claude-opus-4",
    provider: "#e89537",
    response: `The key difference between **RAG** and **fine-tuning** lies in how they inject knowledge into a language model.

**RAG** retrieves relevant documents at inference time and appends them to the prompt. This means your knowledge can be updated without retraining — just update the vector store.

**Fine-tuning** bakes knowledge into model weights during training. It's better for teaching style, tone, or structured output formats, but updating knowledge requires expensive retraining.

For most production use cases, **RAG + a strong base model** is the better default.`,
  },
  {
    model: "gpt-4o",
    provider: "#10a37f",
    response: `Great question! Here's a concise breakdown:

- **RAG** = retrieval at inference time (dynamic, updatable, grounded in sources)
- **Fine-tuning** = training on domain data (baked-in, style/format control, expensive to update)

Use RAG when your knowledge changes frequently. Use fine-tuning when you need consistent output format or specialized behavior the base model doesn't exhibit.`,
  },
];

function Markdown({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e6edf3] font-semibold">$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(
      /\n- /g,
      "\n<span class=\"block pl-4 before:content-['•'] before:mr-2 before:text-[#58a6ff]\">"
    )
    .replace(/\n(?!<)/g, "<br/>");
  return (
    <p
      className="text-[13px] text-[#8b949e] leading-relaxed mt-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ResponseCard({
  model,
  provider,
  response,
}: {
  model: string;
  provider: string;
  response: string;
}) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [regenerating, setRegen] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regen = () => {
    setRegen(true);
    setTimeout(() => setRegen(false), 1500);
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#21262d] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: provider }} />
          <span className="text-[12px] font-mono font-bold text-[#e6edf3]">{model}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-semibold">
          Generated
        </span>
      </div>

      {/* Body */}
      <div className={`px-5 py-4 transition-opacity ${regenerating ? "opacity-30" : ""}`}>
        {regenerating ? (
          <div className="flex items-center gap-2 py-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
            <span className="text-[12px] text-[#8b949e] ml-1">Regenerating…</span>
          </div>
        ) : (
          <Markdown text={response} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117]/50 border-t border-[#30363d]">
        <div className="flex items-center gap-1">
          {/* Copy */}
          <button
            onClick={copy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
              copied
                ? "text-green-400 border-green-500/30 bg-green-500/10"
                : "text-[#8b949e] border-transparent hover:border-[#30363d] hover:text-[#e6edf3]"
            }`}
          >
            {copied ? (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Thumbs */}
          {(["up", "down"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setVote(vote === dir ? null : dir)}
              className={`p-1.5 rounded-md border transition-colors ${
                vote === dir
                  ? dir === "up"
                    ? "text-green-400 border-green-500/30 bg-green-500/10"
                    : "text-red-400 border-red-500/30 bg-red-500/10"
                  : "text-[#8b949e] border-transparent hover:border-[#30363d] hover:text-[#e6edf3]"
              }`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={dir === "down" ? { transform: "scaleY(-1)" } : {}}
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
          ))}
        </div>

        {/* Regenerate */}
        <button
          onClick={regen}
          disabled={regenerating}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors disabled:opacity-30"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Regenerate
        </button>
      </div>
    </div>
  );
}

export default function AiResponseCardRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[680px] space-y-4">
        <p className="text-[13px] font-semibold text-[#8b949e]">
          What's the difference between RAG and fine-tuning?
        </p>
        {RESPONSES.map((r) => (
          <ResponseCard key={r.model} {...r} />
        ))}
      </div>
    </div>
  );
}
