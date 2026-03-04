import { useMemo, useState } from "react";

const TOTAL = 5000;
const ROW_HEIGHT = 44;
const OVERSCAN = 6;

const DATA = Array.from({ length: TOTAL }, (_, index) => ({
  id: index + 1,
  label: `Record #${index + 1}`,
  group: `Group ${((index % 8) + 1).toString().padStart(2, "0")}`,
}));

export default function VirtualListPattern() {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(460);

  const windowed = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(TOTAL, Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN);
    return {
      start,
      end,
      rows: DATA.slice(start, end),
    };
  }, [scrollTop, viewHeight]);

  return (
    <section
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "#e2e8f0" }}
    >
      <p>
        Rendering rows {windowed.start + 1}-{windowed.end} of {TOTAL}
      </p>
      <div
        style={{
          position: "relative",
          height: 460,
          overflow: "auto",
          border: "1px solid #334155",
          borderRadius: 12,
          background: "#0f172a",
        }}
        onScroll={(event) => {
          const next = event.currentTarget;
          setScrollTop(next.scrollTop);
          setViewHeight(next.clientHeight);
        }}
      >
        <div style={{ height: TOTAL * ROW_HEIGHT }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            transform: `translateY(${windowed.start * ROW_HEIGHT}px)`,
          }}
        >
          {windowed.rows.map((row) => (
            <div
              key={row.id}
              style={{
                height: ROW_HEIGHT,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                padding: "0 12px",
              }}
            >
              <span>{row.label}</span>
              <span style={{ color: "#38bdf8" }}>{row.group}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
