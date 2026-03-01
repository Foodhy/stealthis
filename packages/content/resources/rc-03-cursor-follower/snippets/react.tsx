import { useEffect, useRef, CSSProperties } from "react";

// ── Component ───────────────────────────────────────────────────────
interface CursorFollowerProps {
  /** Diameter of the center dot in px. Default: 8 */
  dotSize?: number;
  /** Diameter of the outer trailing ring in px. Default: 40 */
  ringSize?: number;
  /** Ring follow speed — 0 (never moves) to 1 (instant). Default: 0.1 */
  ringLerp?: number;
  /** Accent color. Default: "#38bdf8" */
  color?: string;
}

export function CursorFollower({
  dotSize = 8,
  ringSize = 40,
  ringLerp = 0.1,
  color = "#38bdf8",
}: CursorFollowerProps = {}) {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse   = useRef({ x: -100, y: -100 });
  const ring    = useRef({ x: -100, y: -100 });
  const rafId   = useRef<number>(0);
  const hidden  = useRef(true);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;

    // Hide native cursor on body
    document.body.style.cursor = "none";

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (hidden.current) {
        ring.current = { x: e.clientX, y: e.clientY };
        hidden.current = false;
      }
    }

    function onLeave() { hidden.current = true; }
    function onEnter() { hidden.current = false; }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function loop() {
      const { x: mx, y: my } = mouse.current;
      ring.current.x = lerp(ring.current.x, mx, ringLerp);
      ring.current.y = lerp(ring.current.y, my, ringLerp);

      const opacity = hidden.current ? "0" : "1";

      if (dotRef.current) {
        dotRef.current.style.transform  = `translate(${mx - dotSize / 2}px, ${my - dotSize / 2}px)`;
        dotRef.current.style.opacity    = opacity;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - ringSize / 2}px, ${ring.current.y - ringSize / 2}px)`;
        ringRef.current.style.opacity   = opacity;
      }

      rafId.current = requestAnimationFrame(loop);
    }

    rafId.current = requestAnimationFrame(loop);

    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId.current);
    };
  }, [dotSize, ringSize, ringLerp, reduced]);

  if (reduced) return null;

  const fixed: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 9999,
    willChange: "transform, opacity",
    transition: "opacity 0.2s ease",
    opacity: 0,
  };

  return (
    <>
      {/* Center dot */}
      <div
        ref={dotRef}
        style={{
          ...fixed,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: color,
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          ...fixed,
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `1.5px solid ${color}`,
          opacity: 0,
        }}
      />
    </>
  );
}

// ── Demo ────────────────────────────────────────────────────────────
export default function CursorFollowerDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050910",
        color: "#f2f6ff",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2.5rem",
        padding: "2rem",
      }}
    >
      {/* Mount the cursor — it renders its own fixed elements */}
      <CursorFollower color="#38bdf8" ringLerp={0.1} />

      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Cursor Follower
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem" }}>
          Dot follows the cursor instantly · ring lerps behind it
        </p>
      </div>

      {/* Interactive cards */}
      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "Hover me", emoji: "🎯", border: "rgba(56,189,248,0.2)" },
          { label: "And me",   emoji: "✨", border: "rgba(99,102,241,0.2)" },
          { label: "And me",   emoji: "🚀", border: "rgba(34,197,94,0.2)"  },
        ].map(({ label, emoji, border }) => (
          <div
            key={label + emoji}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${border}`,
              borderRadius: "1rem",
              padding: "2rem 2.5rem",
              textAlign: "center",
              minWidth: "140px",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{emoji}</div>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>{label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.75rem", color: "#334155" }}>
        Disabled automatically when prefers-reduced-motion is set
      </p>
    </div>
  );
}
