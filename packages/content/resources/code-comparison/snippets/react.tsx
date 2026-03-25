import { useMemo, useRef, useCallback } from "react";

interface CodeComparisonProps {
  before?: string;
  after?: string;
  beforeLabel?: string;
  afterLabel?: string;
  filename?: string;
}

interface DiffLine {
  text: string;
  type: "same" | "added" | "removed" | "empty";
  num: number | null;
}

function computeDiff(
  oldLines: string[],
  newLines: string[]
): { oldResult: DiffLine[]; newResult: DiffLine[] } {
  const oldResult: DiffLine[] = [];
  const newResult: DiffLine[] = [];

  let oi = 0;
  let ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (
      oi < oldLines.length &&
      ni < newLines.length &&
      oldLines[oi] === newLines[ni]
    ) {
      oldResult.push({ text: oldLines[oi], type: "same", num: oi + 1 });
      newResult.push({ text: newLines[ni], type: "same", num: ni + 1 });
      oi++;
      ni++;
    } else {
      const oldInNew = newLines.indexOf(oldLines[oi], ni);
      const newInOld = oldLines.indexOf(newLines[ni], oi);

      if (
        oi < oldLines.length &&
        (oldInNew === -1 || (newInOld !== -1 && newInOld <= oi + 2))
      ) {
        oldResult.push({ text: oldLines[oi], type: "removed", num: oi + 1 });
        newResult.push({ text: "", type: "empty", num: null });
        oi++;
      } else if (ni < newLines.length) {
        oldResult.push({ text: "", type: "empty", num: null });
        newResult.push({ text: newLines[ni], type: "added", num: ni + 1 });
        ni++;
      } else {
        oi++;
        ni++;
      }
    }
  }

  return { oldResult, newResult };
}

const sampleBefore = `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div className="counter">
      <p>Count: {count}</p>
      <button onClick={handleClick}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`;

const sampleAfter = `import { useState, useCallback } from "react";

function Counter({ initial = 0, step = 1 }) {
  const [count, setCount] = useState(initial);

  const increment = useCallback(() => {
    setCount((prev) => prev + step);
  }, [step]);

  const decrement = useCallback(() => {
    setCount((prev) => prev - step);
  }, [step]);

  return (
    <div className="counter">
      <p>Count: {count}</p>
      <div className="counter-actions">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}

export default Counter;`;

function DiffPanel({
  lines,
  label,
  labelType,
  filename,
  onScroll,
  scrollRef,
}: {
  lines: DiffLine[];
  label: string;
  labelType: "before" | "after";
  filename: string;
  onScroll: (scrollTop: number) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div style={{ background: "#111318", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.625rem 1rem",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
            fontSize: "0.8rem",
            color: "#94a3b8",
          }}
        >
          {filename}
        </span>
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "0.15rem 0.5rem",
            borderRadius: 999,
            background:
              labelType === "before"
                ? "rgba(239,68,68,0.15)"
                : "rgba(34,197,94,0.15)",
            color: labelType === "before" ? "#f87171" : "#4ade80",
          }}
        >
          {label}
        </span>
      </div>
      <div
        ref={scrollRef}
        onScroll={(e) => onScroll((e.target as HTMLDivElement).scrollTop)}
        style={{
          fontFamily: '"Fira Code", "Cascadia Code", monospace',
          fontSize: "0.8rem",
          lineHeight: 1.7,
          overflowX: "auto",
          overflowY: "auto",
          padding: "0.5rem 0",
        }}
      >
        {lines.map((line, i) => {
          const bgMap: Record<string, string> = {
            removed: "rgba(239,68,68,0.08)",
            added: "rgba(34,197,94,0.08)",
            empty: "rgba(255,255,255,0.02)",
            same: "transparent",
          };
          const colorMap: Record<string, string> = {
            removed: "#fca5a5",
            added: "#86efac",
            empty: "transparent",
            same: "#cbd5e1",
          };
          const numColorMap: Record<string, string> = {
            removed: "#f87171",
            added: "#4ade80",
            empty: "transparent",
            same: "#475569",
          };
          const prefix =
            line.type === "removed"
              ? "- "
              : line.type === "added"
                ? "+ "
                : "  ";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "0 0.75rem",
                minHeight: "1.7em",
                background: bgMap[line.type],
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: "3ch",
                  textAlign: "right",
                  color: numColorMap[line.type],
                  marginRight: "1rem",
                  userSelect: "none",
                }}
              >
                {line.num ?? ""}
              </span>
              <span
                style={{
                  flex: 1,
                  whiteSpace: "pre",
                  color: colorMap[line.type],
                }}
              >
                {prefix}
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CodeComparison({
  before = sampleBefore,
  after = sampleAfter,
  beforeLabel = "Before",
  afterLabel = "After",
  filename = "utils.ts",
}: CodeComparisonProps) {
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const diff = useMemo(() => {
    return computeDiff(before.split("\n"), after.split("\n"));
  }, [before, after]);

  const handleScroll = useCallback(
    (source: "before" | "after", scrollTop: number) => {
      if (syncing.current) return;
      syncing.current = true;
      const target = source === "before" ? afterRef.current : beforeRef.current;
      if (target) target.scrollTop = scrollTop;
      requestAnimationFrame(() => {
        syncing.current = false;
      });
    },
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div style={{ width: "min(900px, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700 }}>Code Changes</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.875rem",
            overflow: "hidden",
          }}
        >
          <DiffPanel
            lines={diff.oldResult}
            label={beforeLabel}
            labelType="before"
            filename={filename}
            scrollRef={beforeRef as React.RefObject<HTMLDivElement>}
            onScroll={(st) => handleScroll("before", st)}
          />
          <DiffPanel
            lines={diff.newResult}
            label={afterLabel}
            labelType="after"
            filename={filename}
            scrollRef={afterRef as React.RefObject<HTMLDivElement>}
            onScroll={(st) => handleScroll("after", st)}
          />
        </div>
      </div>
    </div>
  );
}
