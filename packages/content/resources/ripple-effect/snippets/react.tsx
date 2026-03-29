import { useCallback, useRef, useEffect, useState } from "react";

interface RippleEffectProps {
  color?: string;
  duration?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleEffect({
  color = "rgba(99, 102, 241, 0.35)",
  duration = 800,
  children,
  className = "",
  style = {},
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDist = Math.max(
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y)
      );
      const size = maxDist * 2;
      const id = nextId.current++;

      setRipples((prev) => [...prev, { id, x, y, size }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, duration + 200);
    },
    [duration]
  );

  // Inject keyframes once
  useEffect(() => {
    const id = "ripple-effect-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes re-expand {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
      @keyframes re-ring {
        0% { transform: scale(0); opacity: 0.6; }
        100% { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={handleClick}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
      {ripples.map((r) => (
        <span key={r.id}>
          <span
            style={{
              position: "absolute",
              left: r.x - r.size / 2,
              top: r.y - r.size / 2,
              width: r.size,
              height: r.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              transform: "scale(0)",
              animation: `re-expand ${duration}ms ease-out forwards`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          {[0, 1, 2].map((i) => {
            const ringSize = r.size * (0.5 + i * 0.3);
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: r.x - ringSize / 2,
                  top: r.y - ringSize / 2,
                  width: ringSize,
                  height: ringSize,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  background: "transparent",
                  transform: "scale(0)",
                  animation: `re-ring ${duration * 1.25}ms ease-out ${i * 120}ms forwards`,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

// Demo usage
export default function RippleEffectDemo() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <RippleEffect
        style={{
          width: "min(90vw, 700px)",
          height: 280,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{ textAlign: "center", pointerEvents: "none", position: "relative", zIndex: 2 }}
        >
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
            }}
          >
            Ripple Effect
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)" }}>
            Click anywhere on this surface
          </p>
        </div>
      </RippleEffect>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        {["Card One", "Card Two", "Card Three"].map((title) => (
          <RippleEffect
            key={title}
            style={{
              width: 200,
              padding: "1.5rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
                color: "#e0e7ff",
                position: "relative",
                zIndex: 2,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "rgba(148,163,184,0.6)",
                position: "relative",
                zIndex: 2,
              }}
            >
              Click me for a ripple
            </p>
          </RippleEffect>
        ))}
      </div>
    </div>
  );
}
