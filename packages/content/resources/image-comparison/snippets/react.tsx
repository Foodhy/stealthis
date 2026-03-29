import { useState, useRef, useCallback } from "react";

const PAIRS = [
  {
    label: "Dark / Light Mode",
    before: { label: "Dark", bg: "#0d1117", items: ["#58a6ff", "#bc8cff", "#7ee787"] },
    after: { label: "Light", bg: "#ffffff", items: ["#0969da", "#8250df", "#1a7f37"] },
  },
  {
    label: "Blur / Sharp",
    before: { label: "Blurred", bg: "#1c1c2e", items: ["#bc8cff", "#58a6ff", "#ff6b6b"] },
    after: { label: "Sharp", bg: "#1c1c2e", items: ["#e040fb", "#29b6f6", "#ef5350"] },
  },
];

function CompareSlider({ pair }: { pair: (typeof PAIRS)[0] }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  function onMouseMove(e: React.MouseEvent) {
    if (dragging) updatePos(e.clientX);
  }
  function onTouchMove(e: React.TouchEvent) {
    updatePos(e.touches[0].clientX);
  }

  function MockUI({ side }: { side: typeof pair.before }) {
    return (
      <div className="w-full h-full flex flex-col p-4 gap-3" style={{ background: side.bg }}>
        <div className="flex items-center gap-2">
          {side.items.map((c, i) => (
            <div
              key={i}
              className="h-2 rounded-full"
              style={{ background: c, width: `${[40, 25, 35][i]}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {side.items.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 p-2 flex items-end"
              style={{ background: `${c}20` }}
            >
              <div className="h-1.5 rounded-full w-full" style={{ background: c, opacity: 0.7 }} />
            </div>
          ))}
        </div>
        <div
          className="h-1 rounded-full w-3/4"
          style={{ background: side.items[0], opacity: 0.4 }}
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-[#8b949e] text-xs mb-2 text-center">{pair.label}</p>
      <div
        ref={containerRef}
        className="relative h-36 rounded-xl overflow-hidden cursor-col-resize select-none border border-[#30363d]"
        onMouseMove={onMouseMove}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchMove={onTouchMove}
        onTouchEnd={() => setDragging(false)}
      >
        {/* Before (full width) */}
        <div className="absolute inset-0">
          <MockUI side={pair.before} />
        </div>
        {/* After (clipped) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <MockUI side={pair.after} />
        </div>
        {/* Divider */}
        <div className="absolute top-0 bottom-0 w-px bg-white z-10" style={{ left: `${pos}%` }}>
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg cursor-col-resize"
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333"
              strokeWidth="2.5"
            >
              <polyline points="8 4 4 12 8 20" />
              <polyline points="16 4 20 12 16 20" />
            </svg>
          </div>
        </div>
        {/* Labels */}
        <span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
          {pair.before.label}
        </span>
        <span className="absolute top-2 right-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
          {pair.after.label}
        </span>
      </div>
    </div>
  );
}

export default function ImageComparisonRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-5">
        <h2 className="text-[#e6edf3] font-bold text-lg">Image Comparison</h2>
        {PAIRS.map((pair) => (
          <CompareSlider key={pair.label} pair={pair} />
        ))}
        <p className="text-[11px] text-center text-[#484f58]">Drag the handle to compare</p>
      </div>
    </div>
  );
}
