import { useState, useRef, useCallback, useLayoutEffect } from "react";

interface ListItem {
  id: number;
  emoji: string;
  text: string;
  badge: string;
  bg: string;
  border: string;
}

const initialItems: ListItem[] = [
  { id: 1, emoji: "🎨", text: "Design System", badge: "UI", bg: "rgba(168,85,247,0.2)", border: "rgba(168,85,247,0.4)" },
  { id: 2, emoji: "⚙️", text: "API Integration", badge: "DEV", bg: "rgba(59,130,246,0.2)", border: "rgba(59,130,246,0.4)" },
  { id: 3, emoji: "📊", text: "Analytics Dashboard", badge: "DATA", bg: "rgba(16,185,129,0.2)", border: "rgba(16,185,129,0.4)" },
  { id: 4, emoji: "🔒", text: "Auth & Permissions", badge: "SEC", bg: "rgba(245,158,11,0.2)", border: "rgba(245,158,11,0.4)" },
  { id: 5, emoji: "🚀", text: "CI/CD Pipeline", badge: "OPS", bg: "rgba(239,68,68,0.2)", border: "rgba(239,68,68,0.4)" },
  { id: 6, emoji: "📝", text: "Documentation", badge: "DOCS", bg: "rgba(236,72,153,0.2)", border: "rgba(236,72,153,0.4)" },
];

export default function ReorderList() {
  const [items, setItems] = useState(initialItems);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rectsRef = useRef<Record<number, DOMRect>>({});
  const startYRef = useRef(0);
  const cloneRef = useRef<HTMLDivElement | null>(null);

  // Capture rects before state change
  const captureRects = useCallback(() => {
    if (!listRef.current) return;
    const rects: Record<number, DOMRect> = {};
    listRef.current.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
      rects[Number(el.dataset.id)] = el.getBoundingClientRect();
    });
    rectsRef.current = rects;
  }, []);

  // FLIP after render
  useLayoutEffect(() => {
    if (!listRef.current) return;
    const firstRects = rectsRef.current;
    listRef.current.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
      const id = Number(el.dataset.id);
      const first = firstRects[id];
      if (!first) return;
      const last = el.getBoundingClientRect();
      const dy = first.top - last.top;
      if (dy === 0) return;

      el.style.transform = `translateY(${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = "";
          el.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
          el.addEventListener("transitionend", () => { el.style.transition = ""; el.style.transform = ""; }, { once: true });
        });
      });
    });
  }, [items]);

  const onPointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragIndex(index);
    startYRef.current = e.clientY;

    // Create clone
    const itemEl = (e.target as HTMLElement).closest("[data-id]") as HTMLElement;
    if (itemEl) {
      const rect = itemEl.getBoundingClientRect();
      const clone = document.createElement("div");
      clone.innerHTML = itemEl.outerHTML;
      clone.style.position = "fixed";
      clone.style.left = rect.left + "px";
      clone.style.top = rect.top + "px";
      clone.style.width = rect.width + "px";
      clone.style.pointerEvents = "none";
      clone.style.zIndex = "9999";
      clone.style.opacity = "0.92";
      clone.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(109,40,217,0.3)";
      clone.style.borderRadius = "0.75rem";
      clone.style.transform = "scale(1.03)";
      document.body.appendChild(clone);
      cloneRef.current = clone;
    }

    const onMove = (ev: PointerEvent) => {
      if (cloneRef.current) {
        const dy = ev.clientY - startYRef.current;
        cloneRef.current.style.transform = `translateY(${dy}px) scale(1.03)`;
      }

      // Check swap
      if (!listRef.current) return;
      const els = Array.from(listRef.current.querySelectorAll<HTMLElement>("[data-id]"));
      setItems((prev) => {
        const currentIndex = prev.findIndex((_, i) => i === index);
        // We need to find which item is currently at the dragged position
        let dragIdx = -1;
        for (let i = 0; i < els.length; i++) {
          if (Number(els[i].dataset.id) === prev[index]?.id) {
            dragIdx = i;
            break;
          }
        }

        for (let i = 0; i < els.length; i++) {
          if (i === dragIdx) continue;
          const rect = els[i].getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if ((i < dragIdx && ev.clientY < midY) || (i > dragIdx && ev.clientY > midY)) {
            captureRects();
            const newItems = [...prev];
            const [moved] = newItems.splice(dragIdx, 1);
            newItems.splice(i, 0, moved);
            index = i; // Update tracked index
            return newItems;
          }
        }
        return prev;
      });
    };

    const onUp = () => {
      setDragIndex(null);
      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [captureRects]);

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
      <div style={{ width: "min(440px, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f4f4f5" }}>Reorder List</h2>
          <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.25rem" }}>
            Drag items to reorder — FLIP animation keeps it smooth
          </p>
        </div>

        <ul ref={listRef} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", position: "relative" }}>
          {items.map((item, i) => (
            <li
              key={item.id}
              data-id={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.75rem",
                userSelect: "none",
                willChange: "transform",
                position: "relative",
                zIndex: 1,
                opacity: dragIndex === i ? 0.3 : 1,
                borderStyle: dragIndex === i ? "dashed" : "solid",
                borderColor: dragIndex === i ? "rgba(109,40,217,0.3)" : "rgba(255,255,255,0.08)",
              }}
            >
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, color: "#3f3f46",
                minWidth: 18, textAlign: "center", fontVariantNumeric: "tabular-nums",
              }}>
                {i + 1}
              </span>
              <span
                onPointerDown={(e) => onPointerDown(e, i)}
                style={{
                  color: "#3f3f46", fontSize: "1.1rem", cursor: "grab",
                  lineHeight: 1, touchAction: "none",
                  display: "grid", placeItems: "center", width: 24, height: 24,
                }}
              >
                ⠿
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: "0.5rem",
                display: "grid", placeItems: "center", fontSize: "0.9rem", flexShrink: 0,
                background: item.bg, border: `1px solid ${item.border}`,
              }}>
                {item.emoji}
              </div>
              <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500, color: "#d4d4d8" }}>
                {item.text}
              </span>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                borderRadius: 999, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)", color: "#71717a",
                letterSpacing: "0.04em",
              }}>
                {item.badge}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
