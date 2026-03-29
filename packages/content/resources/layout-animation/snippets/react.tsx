import { useState, useRef, useCallback, useLayoutEffect } from "react";

interface GridItem {
  id: number;
  label: string;
  emoji: string;
  cat: string;
  bg: string;
  border: string;
}

const items: GridItem[] = [
  {
    id: 1,
    label: "Figma",
    emoji: "🎨",
    cat: "design",
    bg: "rgba(168,85,247,0.2)",
    border: "rgba(168,85,247,0.4)",
  },
  {
    id: 2,
    label: "React",
    emoji: "⚛️",
    cat: "dev",
    bg: "rgba(59,130,246,0.2)",
    border: "rgba(59,130,246,0.4)",
  },
  {
    id: 3,
    label: "D3.js",
    emoji: "📊",
    cat: "data",
    bg: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.4)",
  },
  {
    id: 4,
    label: "Sketch",
    emoji: "💎",
    cat: "design",
    bg: "rgba(236,72,153,0.2)",
    border: "rgba(236,72,153,0.4)",
  },
  {
    id: 5,
    label: "Node",
    emoji: "🟢",
    cat: "dev",
    bg: "rgba(34,197,94,0.2)",
    border: "rgba(34,197,94,0.4)",
  },
  {
    id: 6,
    label: "SQL",
    emoji: "🗄️",
    cat: "data",
    bg: "rgba(245,158,11,0.2)",
    border: "rgba(245,158,11,0.4)",
  },
  {
    id: 7,
    label: "Color",
    emoji: "🌈",
    cat: "design",
    bg: "rgba(239,68,68,0.2)",
    border: "rgba(239,68,68,0.4)",
  },
  {
    id: 8,
    label: "TS",
    emoji: "📘",
    cat: "dev",
    bg: "rgba(14,165,233,0.2)",
    border: "rgba(14,165,233,0.4)",
  },
  {
    id: 9,
    label: "Charts",
    emoji: "📈",
    cat: "data",
    bg: "rgba(168,85,247,0.2)",
    border: "rgba(168,85,247,0.4)",
  },
  {
    id: 10,
    label: "Proto",
    emoji: "🖼️",
    cat: "design",
    bg: "rgba(109,40,217,0.2)",
    border: "rgba(109,40,217,0.4)",
  },
  {
    id: 11,
    label: "Rust",
    emoji: "🦀",
    cat: "dev",
    bg: "rgba(239,68,68,0.2)",
    border: "rgba(239,68,68,0.4)",
  },
  {
    id: 12,
    label: "ML",
    emoji: "🤖",
    cat: "data",
    bg: "rgba(59,130,246,0.2)",
    border: "rgba(59,130,246,0.4)",
  },
];

const filters = ["all", "design", "dev", "data"];

export default function LayoutAnimation() {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [filter, setFilter] = useState("all");
  const gridRef = useRef<HTMLDivElement>(null);
  const rectsRef = useRef<Record<number, DOMRect>>({});

  // Capture positions before render
  const captureRects = useCallback(() => {
    if (!gridRef.current) return;
    const rects: Record<number, DOMRect> = {};
    gridRef.current.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
      rects[Number(el.dataset.id)] = el.getBoundingClientRect();
    });
    rectsRef.current = rects;
  }, []);

  // FLIP after render
  useLayoutEffect(() => {
    if (!gridRef.current) return;
    const firstRects = rectsRef.current;
    const els = gridRef.current.querySelectorAll<HTMLElement>("[data-id]");

    els.forEach((el) => {
      const id = Number(el.dataset.id);
      const first = firstRects[id];
      const last = el.getBoundingClientRect();

      if (first) {
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx === 0 && dy === 0) return;

        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = "none";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = "";
            el.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            el.addEventListener(
              "transitionend",
              () => {
                el.style.transition = "";
              },
              { once: true }
            );
          });
        });
      } else {
        el.style.opacity = "0";
        el.style.transform = "scale(0.8)";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = "opacity 0.35s, transform 0.35s cubic-bezier(0.22,1,0.36,1)";
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
            el.addEventListener(
              "transitionend",
              () => {
                el.style.transition = "";
              },
              { once: true }
            );
          });
        });
      }
    });
  }, [order, filter]);

  const shuffle = () => {
    captureRects();
    setOrder((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  };

  const changeFilter = (f: string) => {
    captureRects();
    setFilter(f);
  };

  const visible = order.filter((idx) => filter === "all" || items[idx].cat === filter);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e4e4e7",
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f4f4f5" }}>
            Layout Animation
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.25rem" }}>
            FLIP technique for smooth layout transitions
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              style={{
                padding: "0.45rem 0.9rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: `1px solid ${filter === f ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "0.5rem",
                cursor: "pointer",
                background: filter === f ? "#6d28d9" : "rgba(255,255,255,0.05)",
                color: filter === f ? "#f4f4f5" : "#a1a1aa",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={shuffle}
            style={{
              padding: "0.45rem 0.9rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.5rem",
              cursor: "pointer",
              background: "rgba(255,255,255,0.05)",
              color: "#a1a1aa",
            }}
          >
            Shuffle
          </button>
        </div>

        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {visible.map((idx) => {
            const item = items[idx];
            return (
              <div
                key={item.id}
                data-id={item.id}
                style={{
                  aspectRatio: "1",
                  borderRadius: "0.75rem",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.04em",
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  willChange: "transform",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{item.emoji}</span>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
