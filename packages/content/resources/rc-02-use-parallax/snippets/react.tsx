import { useRef, useState, useEffect, CSSProperties } from "react";

// ── Hook ────────────────────────────────────────────────────────────
/**
 * Returns a ref and an inline style with a scroll-linked translateY.
 * @param speed  Parallax multiplier. Positive = slower (depth), negative = opposite direction.
 */
export function useParallax<T extends HTMLElement = HTMLElement>(speed = 0.3) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;

    function update() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(center * speed);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [speed, reduced]);

  const style: CSSProperties = { transform: `translateY(${offset}px)` };

  return { ref, style };
}

// ── Demo ────────────────────────────────────────────────────────────
function ParallaxLayer({
  speed,
  label,
  bg,
  zIndex,
}: {
  speed: number;
  label: string;
  bg: string;
  zIndex: number;
}) {
  const { ref, style } = useParallax<HTMLDivElement>(speed);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        borderRadius: "1rem",
        zIndex,
        padding: "1.5rem",
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ParallaxCard({
  speed,
  label,
  emoji,
}: {
  speed: number;
  label: string;
  emoji: string;
}) {
  const { ref, style } = useParallax<HTMLDivElement>(speed);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        minWidth: "160px",
        willChange: "transform",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{emoji}</div>
      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8" }}>
        speed: {speed}
      </p>
      <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.25rem" }}>
        {label}
      </p>
    </div>
  );
}

export default function UseParallaxDemo() {
  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#050910",
        color: "#f2f6ff",
        minHeight: "200vh",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "6rem 0 4rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          useParallax
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem" }}>
          Scroll down to see the depth effect
        </p>
      </div>

      {/* Layered scene */}
      <div
        style={{
          position: "relative",
          height: "320px",
          maxWidth: "600px",
          margin: "0 auto 6rem",
        }}
      >
        <ParallaxLayer speed={0.05} label="BACKGROUND · speed 0.05" bg="rgba(99,102,241,0.08)" zIndex={1} />
        <ParallaxLayer speed={0.15} label="MIDGROUND · speed 0.15" bg="rgba(56,189,248,0.06)" zIndex={2} />
        <ParallaxLayer speed={0.3}  label="FOREGROUND · speed 0.30" bg="rgba(34,197,94,0.05)"  zIndex={3} />
      </div>

      {/* Cards with different speeds */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "4rem 0 8rem",
        }}
      >
        <ParallaxCard speed={-0.1} label="opposite direction" emoji="🌙" />
        <ParallaxCard speed={0.2}  label="slow depth"         emoji="🏔" />
        <ParallaxCard speed={0.5}  label="fast depth"         emoji="⚡" />
        <ParallaxCard speed={0.8}  label="very fast"          emoji="🚀" />
      </div>
    </div>
  );
}
