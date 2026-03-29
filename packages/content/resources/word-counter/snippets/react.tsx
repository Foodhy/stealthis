import { useState, useMemo } from "react";

export default function WordCounterRC() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n+/).filter((p) => p.trim()).length;
    const readingMin = Math.ceil(words / 200);
    return { words, chars, charsNoSpace, sentences, paragraphs, readingMin };
  }, [text]);

  const items = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "Chars (no spaces)", value: stats.charsNoSpace },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: `${stats.readingMin} min` },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <h2 className="text-[#e6edf3] font-bold text-xl mb-4">Word Counter</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here…"
          rows={8}
          className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] placeholder-[#484f58] text-sm resize-none focus:outline-none focus:border-[#58a6ff] mb-4"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(({ label, value }) => (
            <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3">
              <p className="text-[24px] font-bold text-[#58a6ff] tabular-nums leading-none mb-1">{value}</p>
              <p className="text-[11px] text-[#8b949e] uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
        {text.length > 0 && (
          <button
            onClick={() => setText("")}
            className="mt-4 text-sm text-[#8b949e] hover:text-[#f85149] transition-colors"
          >
            Clear text
          </button>
        )}
      </div>
    </div>
  );
}
