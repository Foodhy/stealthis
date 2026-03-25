import { useEffect, useRef, useState, useCallback } from "react";

interface SmoothCursorProps {
  dotSize?: number;
  ringSize?: number;
  dotColor?: string;
  ringColor?: string;
  dotSpeed?: number;
  ringSpeed?: number;
  trailSize?: number;
  trailSpeed?: number;
  children?: React.ReactNode;
}

export function SmoothCursor({
  dotSize = 8,
  ringSize = 36,
  dotColor = "#818cf8",
  ringColor = "rgba(129, 140, 248, 0.4)",
  dotSpeed = 0.25,
  ringSpeed = 0.12,
  trailSize = 80,
  trailSpeed = 0.06,
  children,
}: SmoothCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotPosRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const trailPosRef = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressing, setPressing] = useState(false);
  const animRef = useRef<number>(0);

  const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

  const animate = useCallback(() => {
    const mouse = mouseRef.current;
    const dp = dotPosRef.current;
    const rp = ringPosRef.current;
    const tp = trailPosRef.current;

    dp.x = lerp(dp.x, mouse.x, dotSpeed);
    dp.y = lerp(dp.y, mouse.y, dotSpeed);
    rp.x = lerp(rp.x, mouse.x, ringSpeed);
    rp.y = lerp(rp.y, mouse.y, ringSpeed);
    tp.x = lerp(tp.x, mouse.x, trailSpeed);
    tp.y = lerp(tp.y, mouse.y, trailSpeed);

    if (dotRef.current) {
      dotRef.current.style.left = `${dp.x}px`;
      dotRef.current.style.top = `${dp.y}px`;
    }
    if (ringRef.current) {
      ringRef.current.style.left = `${rp.x}px`;
      ringRef.current.style.top = `${rp.y}px`;
    }
    if (trailRef.current) {
      trailRef.current.style.left = `${tp.x}px`;
      trailRef.current.style.top = `${tp.y}px`;
    }

    animRef.current = requestAnimationFrame(animate);
  }, [dotSpeed, ringSpeed, trailSpeed]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!visible) setVisible(true);
    };
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);
    const handleDown = () => setPressing(true);
    const handleUp = () => setPressing(false);

    // Hover detection
    const handleOverCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], .hoverable")
      ) {
        setHovering(true);
      }
    };
    const handleOutCapture = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !related.closest("a, button, [role='button'], .hoverable")) {
        setHovering(false);
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseover", handleOverCapture, true);
    document.addEventListener("mouseout", handleOutCapture, true);

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseover", handleOverCapture, true);
      document.removeEventListener("mouseout", handleOutCapture, true);
    };
  }, [animate, visible]);

  const cursorStyle: React.CSSProperties = { cursor: "none" };
  const hoverDotSize = hovering ? dotSize * 1.5 : dotSize;
  const hoverRingSize = hovering ? ringSize * 1.6 : ringSize;

  return (
    <div style={cursorStyle}>
      {/* Cursor dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          width: hoverDotSize,
          height: hoverDotSize,
          background: hovering ? "#a78bfa" : dotColor,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 10001,
          transform: `translate(-50%, -50%) scale(${pressing ? 1.4 : 1})`,
          transition: "width 0.2s, height 0.2s, background 0.2s, transform 0.15s",
          boxShadow: `0 0 ${hovering ? 20 : 10}px ${hovering ? "rgba(167,139,250,0.6)" : `${dotColor}80`}`,
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Cursor ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          width: hoverRingSize,
          height: hoverRingSize,
          border: `1.5px solid ${hovering ? "rgba(167,139,250,0.5)" : ringColor}`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 10000,
          transform: `translate(-50%, -50%) scale(${pressing ? 0.8 : 1})`,
          transition: "width 0.3s, height 0.3s, border-color 0.3s, transform 0.15s",
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Trail glow */}
      <div
        ref={trailRef}
        style={{
          position: "fixed",
          width: trailSize,
          height: trailSize,
          background: `radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          opacity: visible ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
}

// Demo usage
export default function SmoothCursorDemo() {
  return (
    <SmoothCursor>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "3rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f1f5f9",
          cursor: "none",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
            }}
          >
            Smooth Cursor
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)" }}>
            Move your mouse around — notice the smooth lag
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["Hover Me", "Hover Me Too"].map((title) => (
            <div
              key={title}
              className="hoverable"
              style={{
                padding: "1.5rem 2rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                textAlign: "center",
                cursor: "none",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e0e7ff", marginBottom: "0.25rem" }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)" }}>
                The cursor ring grows on hover
              </p>
            </div>
          ))}
          <a
            href="#"
            className="hoverable"
            onClick={(e) => e.preventDefault()}
            style={{
              color: "#818cf8",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              cursor: "none",
            }}
          >
            Interactive Link
          </a>
        </div>
      </div>
    </SmoothCursor>
  );
}
