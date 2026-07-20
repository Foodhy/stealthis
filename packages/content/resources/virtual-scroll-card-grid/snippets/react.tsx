import { useMemo, useState } from "react";

export function VirtualScrollCardGrid() {
  const [offset, setOffset] = useState(0);
  const rows = useMemo(() => Array.from({ length: 20 }, (_, index) => index + offset), [offset]);
  return (
    <section className="demo">
      <h2>Windowed Card Grid</h2>
      <div
        style={{ height: 260, overflow: "auto" }}
        onScroll={(event) => setOffset(Math.floor(event.currentTarget.scrollTop / 42))}
      >
        {rows.map((row) => (
          <div key={row} style={{ height: 42, padding: 10, borderBottom: "1px solid #2b3d62" }}>
            Row {row + 1}
          </div>
        ))}
      </div>
    </section>
  );
}
