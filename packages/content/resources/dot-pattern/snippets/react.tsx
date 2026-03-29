import { type CSSProperties, type ReactNode, useCallback, useRef, useState } from "react";

interface DotPatternProps {
  /** Distance between dot centers in pixels */
  spacing?: number;
  /** Dot radius in pixels */
  radius?: number;
  /** Dot fill color */
  color?: string;
  /** Background color behind the dots */
  bg?: string;
  /** Extra CSS class names */
  className?: string;
  /** Overlay children on top of the pattern */
  children?: ReactNode;
}

export function DotPattern({
  spacing = 24,
  radius = 1,
  color = "rgba(255,255,255,0.15)",
  bg = "#0a0a0a",
  className = "",
  children,
}: DotPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0, visible: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlowPos((prev) => ({ ...prev, visible: false }));
  }, []);

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    backgroundColor: bg,
    backgroundImage: `radial-gradient(circle, ${color} ${radius}px, transparent ${radius}px)`,
    backgroundSize: `${spacing}px ${spacing}px`,
    overflow: "hidden",
  };

  const fadeStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 70% 50% at 50% 50%, transparent 20%, ${bg} 100%)`,
    pointerEvents: "none",
  };

  const glowStyle: CSSProperties = {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    transform: "translate(-50%, -50%)",
    transition: "opacity 0.3s ease",
    opacity: glowPos.visible ? 1 : 0,
    left: glowPos.x,
    top: glowPos.y,
    zIndex: 0,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div style={fadeStyle} />
      <div style={glowStyle} />
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// Demo usage
export default function DotPatternDemo() {
  return (
    <DotPattern spacing={24} radius={1} color="rgba(255,255,255,0.15)">
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
          <circle cx="5" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="5" r="1" />
          <circle cx="19" cy="5" r="1" />
          <circle cx="5" cy="19" r="1" />
          <circle cx="19" cy="19" r="1" />
        </svg>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#fafafa",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Dot Pattern
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "#71717a",
            maxWidth: 380,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Repeating dot background using radial-gradient, fully customizable with CSS custom
          properties.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          {["CSS", "radial-gradient", "pattern"].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#a5b4fc",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </DotPattern>
  );
}
