import { useState, useRef, useEffect, useCallback } from "react";

interface Item {
  id: number;
  icon: string;
  color: string;
  border: string;
  name: string;
  time: string;
}

const icons = ["✦", "◆", "●", "▲", "★", "◉", "⬟", "⬡"];
const colors = [
  "rgba(109,40,217,0.25)",
  "rgba(59,130,246,0.25)",
  "rgba(16,185,129,0.25)",
  "rgba(245,158,11,0.25)",
  "rgba(239,68,68,0.25)",
  "rgba(236,72,153,0.25)",
  "rgba(14,165,233,0.25)",
  "rgba(168,85,247,0.25)",
];
const borderColors = [
  "rgba(109,40,217,0.5)",
  "rgba(59,130,246,0.5)",
  "rgba(16,185,129,0.5)",
  "rgba(245,158,11,0.5)",
  "rgba(239,68,68,0.5)",
  "rgba(236,72,153,0.5)",
  "rgba(14,165,233,0.5)",
  "rgba(168,85,247,0.5)",
];
const names = [
  "Design tokens updated",
  "New component merged",
  "Build pipeline passed",
  "Sprint review scheduled",
  "Pull request approved",
  "Test coverage improved",
  "Deployment complete",
  "Security audit passed",
];

function AnimatePresenceItem({
  item,
  onRemove,
}: {
  item: Item;
  onRemove: (id: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [state, setState] = useState<"entering" | "present" | "exiting">("entering");

  useEffect(() => {
    if (state === "entering") {
      const t = setTimeout(() => setState("present"), 350);
      return () => clearTimeout(t);
    }
  }, [state]);

  const handleRemove = () => {
    setState("exiting");
    const el = ref.current;
    if (el) {
      el.addEventListener("animationend", () => onRemove(item.id), { once: true });
    }
  };

  const animStyle: React.CSSProperties =
    state === "entering"
      ? { animation: "fadeSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards", opacity: 0 }
      : state === "exiting"
        ? { animation: "fadeSlideOut 0.3s cubic-bezier(0.22,1,0.36,1) forwards" }
        : {};

  return (
    <li
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem 1rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.75rem",
        ...animStyle,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "0.5rem",
          display: "grid",
          placeItems: "center",
          fontSize: "1rem",
          flexShrink: 0,
          background: item.color,
          border: `1px solid ${item.border}`,
          color: item.border.replace("0.5", "1"),
        }}
      >
        {item.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e4e4e7" }}>{item.name}</div>
        <div style={{ fontSize: "0.7rem", color: "#52525b", marginTop: "0.15rem" }}>
          {item.time}
        </div>
      </div>
      <button
        onClick={handleRemove}
        style={{
          width: 28,
          height: 28,
          borderRadius: "0.375rem",
          border: "none",
          background: "rgba(255,255,255,0.04)",
          color: "#71717a",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: "1rem",
        }}
      >
        &times;
      </button>
    </li>
  );
}

export default function AnimatePresence() {
  const [items, setItems] = useState<Item[]>([]);
  const counterRef = useRef(0);

  const addItem = useCallback(() => {
    const i = counterRef.current % icons.length;
    counterRef.current++;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setItems((prev) => [
      {
        id: Date.now(),
        icon: icons[i],
        color: colors[i],
        border: borderColors[i],
        name: names[Math.floor(Math.random() * names.length)],
        time: now,
      },
      ...prev,
    ]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = () => {
    setItems([]);
  };

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
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(12px) scale(0.96); }
        }
      `}</style>
      <div
        style={{
          width: "min(480px, 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f4f4f5" }}>
              Animate Presence
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.25rem" }}>
              Items animate in and out of the DOM
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={clearAll}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                background: "rgba(255,255,255,0.06)",
                color: "#a1a1aa",
              }}
            >
              Clear all
            </button>
            <button
              onClick={addItem}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                background: "#6d28d9",
                color: "#f4f4f5",
              }}
            >
              + Add item
            </button>
          </div>
        </div>

        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            minHeight: 60,
          }}
        >
          {items.map((item) => (
            <AnimatePresenceItem key={item.id} item={item} onRemove={removeItem} />
          ))}
          {items.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#3f3f46",
                fontSize: "0.85rem",
              }}
            >
              Click "+ Add item" to begin
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
