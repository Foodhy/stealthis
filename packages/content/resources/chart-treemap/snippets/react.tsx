import { useState, useRef, useEffect, useMemo } from "react";

const DATA = [
  {
    label: "Technology",
    color: "#818cf8",
    children: [
      { label: "NVDA", value: 320 },
      { label: "AAPL", value: 280 },
      { label: "MSFT", value: 240 },
      { label: "GOOGL", value: 200 },
    ],
  },
  {
    label: "Finance",
    color: "#34d399",
    children: [
      { label: "JPM", value: 180 },
      { label: "BAC", value: 140 },
      { label: "GS", value: 120 },
    ],
  },
  {
    label: "Healthcare",
    color: "#f59e0b",
    children: [
      { label: "JNJ", value: 160 },
      { label: "UNH", value: 130 },
      { label: "PFE", value: 90 },
    ],
  },
  {
    label: "Energy",
    color: "#f87171",
    children: [
      { label: "XOM", value: 150 },
      { label: "CVX", value: 110 },
    ],
  },
  {
    label: "Consumer",
    color: "#a78bfa",
    children: [
      { label: "AMZN", value: 200 },
      { label: "WMT", value: 130 },
    ],
  },
];
const total = DATA.flatMap((g) => g.children).reduce((a, d) => a + d.value, 0);

type Item = {
  label: string;
  value: number;
  color: string;
  group: string;
  rect: { x: number; y: number; w: number; h: number };
};

function squarify(
  items: { label: string; value: number; color: string; group: string }[],
  x: number,
  y: number,
  w: number,
  h: number
): Item[] {
  if (!items.length) return [];
  const results: Item[] = [];
  const remaining = [...items];
  while (remaining.length) {
    const row: typeof remaining = [];
    let rowVal = 0;
    const totalVal = remaining.reduce((a, d) => a + d.value, 0);
    const isHoriz = w >= h;
    const dim = isHoriz ? h : w;
    for (let i = 0; i < remaining.length; i++) {
      row.push(remaining[i]);
      rowVal += remaining[i].value;
      const rowArea = (rowVal / totalVal) * (w * h);
      const rowLen = rowArea / dim;
      const worst = row.reduce(
        (a, d) =>
          Math.max(
            a,
            Math.max(
              (rowLen * (d.value / rowVal) * dim) / (rowLen || 1),
              (rowLen || 1) / ((rowLen * (d.value / rowVal) * dim) / (rowLen || 1) || 1)
            )
          ),
        0
      );
      const nextVal = i + 1 < remaining.length ? remaining[i + 1].value : 0;
      const nextWorst =
        nextVal > 0
          ? Math.max(
              worst,
              Math.max(
                (rowLen * (nextVal / (rowVal + nextVal)) * dim) / (rowLen || 1),
                (rowLen || 1) /
                  ((rowLen * (nextVal / (rowVal + nextVal)) * dim) / (rowLen || 1) || 1)
              )
            )
          : Infinity;
      if (nextWorst >= worst && i + 1 < remaining.length) continue;
      let cursor = isHoriz ? y : x;
      const rowLen2 = ((rowVal / totalVal) * (w * h)) / dim;
      row.forEach((d) => {
        const size = (d.value / rowVal) * dim;
        const rect = isHoriz
          ? { x, y: cursor, w: rowLen2, h: size }
          : { x: cursor, y, w: size, h: rowLen2 };
        results.push({ ...d, rect });
        cursor += size;
      });
      remaining.splice(0, row.length);
      if (isHoriz) {
        x += rowLen2;
        w -= rowLen2;
      } else {
        y += rowLen2;
        h -= rowLen2;
      }
      break;
    }
    if (!row.length && remaining.length) {
      const d = remaining.shift()!;
      results.push({ ...d, rect: { x, y, w, h } });
    }
  }
  return results;
}

type Tooltip = { item: Item; x: number; y: number } | null;

export default function ChartTreemapRC() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 360 });
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth - 4;
      setDims({ w, h: Math.round(w * 0.6) });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dims;
  const all = DATA.flatMap((g) =>
    g.children.map((c) => ({ ...c, group: g.label, color: g.color }))
  );
  const tiles = useMemo(() => squarify(all, 0, 0, w, h), [w, h]);

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="w-full max-w-[800px] mx-auto">
        {/* Legend */}
        <div className="flex gap-3 mb-3 flex-wrap">
          {DATA.map((g) => (
            <div key={g.label} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: g.color }} />
              <span className="text-[#8b949e]">{g.label}</span>
            </div>
          ))}
        </div>
        <div
          ref={wrapRef}
          className="relative rounded-xl overflow-hidden border border-[#21262d]"
          style={{ height: h }}
        >
          {tiles.map((d, i) => {
            const { x, y, w: tw, h: th } = d.rect;
            if (tw < 2 || th < 2) return null;
            return (
              <div
                key={i}
                className="absolute flex flex-col items-center justify-center overflow-hidden transition-opacity"
                style={{
                  left: x,
                  top: y,
                  width: tw,
                  height: th,
                  background: d.color,
                  border: "1px solid #0d1117",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  animation: `tmIn 0.3s ${i * 0.015}s ease both`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => setTooltip({ item: d, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) =>
                  setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                }
                onMouseLeave={() => setTooltip(null)}
              >
                {tw > 40 && th > 30 && (
                  <>
                    <div className="text-white font-bold text-[11px] leading-none">{d.label}</div>
                    <div className="text-white/70 text-[10px] mt-0.5">${d.value}B</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed pointer-events-none bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[12px] shadow-lg z-50"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <div className="font-semibold text-[#e6edf3]">
            {tooltip.item.label} ·{" "}
            <span className="text-[#8b949e] font-normal">{tooltip.item.group}</span>
          </div>
          <div className="text-[#8b949e]">
            ${tooltip.item.value}B &nbsp;|&nbsp; {((tooltip.item.value / total) * 100).toFixed(1)}%
          </div>
        </div>
      )}
      <style>{`@keyframes tmIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
