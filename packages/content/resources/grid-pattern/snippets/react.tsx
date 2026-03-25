import { type CSSProperties, type ReactNode } from "react";

interface GridPatternProps {
  /** Grid cell size in pixels */
  size?: number;
  /** SVG stroke color */
  color?: string;
  /** SVG stroke width */
  strokeWidth?: number;
  /** Extra CSS class names */
  className?: string;
  /** Overlay children on top of the grid */
  children?: ReactNode;
}

export function GridPattern({
  size = 40,
  color = "rgba(255,255,255,0.08)",
  strokeWidth = 1,
  className = "",
  children,
}: GridPatternProps) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><path d='M ${size} 0 L 0 0 0 ${size}' fill='none' stroke='${color}' stroke-width='${strokeWidth}'/></svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27");

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    backgroundColor: "#0a0a0a",
    backgroundImage: `url("data:image/svg+xml,${encoded}")`,
    backgroundSize: `${size}px ${size}px`,
    overflow: "hidden",
  };

  const fadeStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, #0a0a0a 100%)",
    pointerEvents: "none",
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={fadeStyle} />
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// Demo usage
export default function GridPatternDemo() {
  return (
    <GridPattern size={40} color="rgba(255,255,255,0.08)" strokeWidth={1}>
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
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0.3rem 0.85rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#a1a1aa",
          }}
        >
          Background
        </span>
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
          Grid Pattern
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
          A minimal SVG-based grid background with customizable size, color, and
          stroke width via CSS custom properties.
        </p>
      </div>
    </GridPattern>
  );
}
