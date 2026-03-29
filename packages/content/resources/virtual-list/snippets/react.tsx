import { useLayoutEffect, useMemo, useRef, useState } from "react";

const TOTAL = 5000;
const ROW_HEIGHT = 44;
const OVERSCAN = 8;

const DATA = Array.from({ length: TOTAL }, (_, index) => ({
  id: index + 1,
  label: `Record #${index + 1}`,
  group: `Group ${((index % 8) + 1).toString().padStart(2, "0")}`,
}));

export default function VirtualListPattern() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(460);
  const [jumpTo, setJumpTo] = useState("250");

  useLayoutEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateSize = () => setViewHeight(node.clientHeight);
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const windowed = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(TOTAL, Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN);
    return { start, end, rows: DATA.slice(start, end) };
  }, [scrollTop, viewHeight]);

  const jump = () => {
    const value = Number.parseInt(jumpTo, 10);
    if (!Number.isFinite(value)) return;
    const clamped = Math.min(TOTAL, Math.max(1, value));
    const node = viewportRef.current;
    if (!node) return;
    node.scrollTo({ top: (clamped - 1) * ROW_HEIGHT, behavior: "smooth" });
  };

  return (
    <section className="min-h-screen bg-[#0d1117] px-4 py-6 text-[#e6edf3]">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8b949e]">Pattern</p>
          <h1 className="mt-1 text-lg font-bold">Virtual List</h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            Windowed rendering keeps a 5,000-row list responsive.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] p-3">
          <label className="text-xs font-semibold text-[#8b949e]">
            Jump to row
            <input
              value={jumpTo}
              onChange={(event) => setJumpTo(event.target.value)}
              className="ml-2 w-24 rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-[#e6edf3] outline-none focus:border-[#58a6ff]"
            />
          </label>
          <button
            type="button"
            onClick={jump}
            className="rounded-md border border-[#58a6ff]/45 bg-[#58a6ff]/15 px-3 py-1.5 text-xs font-semibold text-[#c9e6ff] transition-colors hover:bg-[#58a6ff]/25"
          >
            Scroll
          </button>
          <p className="text-xs text-[#8b949e]">
            Rendering rows{" "}
            <span className="font-semibold text-[#e6edf3]">{windowed.start + 1}</span>
            {" - "}
            <span className="font-semibold text-[#e6edf3]">{windowed.end}</span> of{" "}
            <span className="font-semibold text-[#e6edf3]">{TOTAL}</span>
          </p>
        </div>

        <div
          ref={viewportRef}
          className="relative h-[62vh] min-h-[360px] overflow-auto rounded-2xl border border-[#30363d] bg-[#111827]"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div style={{ height: TOTAL * ROW_HEIGHT }} />
          <div
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${windowed.start * ROW_HEIGHT}px)` }}
          >
            {windowed.rows.map((row) => (
              <div
                key={row.id}
                className="grid h-11 grid-cols-[1fr_auto] items-center border-b border-white/5 px-3 text-sm odd:bg-white/[0.01]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#8b949e]">#{row.id}</span>
                  <span className="text-[#dce6f2]">{row.label}</span>
                </div>
                <span className="font-mono text-xs text-sky-300">{row.group}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
