import { type CSSProperties, type ReactNode } from "react";

interface NeonGradientCardProps {
  children: ReactNode;
  neonSpeed?: string;
  glowSize?: number;
  borderWidth?: number;
  borderRadius?: string;
  className?: string;
}

export function NeonGradientCard({
  children,
  neonSpeed = "4s",
  glowSize = 30,
  borderWidth = 2,
  borderRadius = "1.25rem",
  className = "",
}: NeonGradientCardProps) {
  const gradientColors = "#ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080";

  const outerStyle: CSSProperties = {
    position: "relative",
    borderRadius,
    overflow: "visible",
  };

  const glowStyle: CSSProperties = {
    position: "absolute",
    inset: -borderWidth,
    borderRadius,
    background: `conic-gradient(from 0deg, ${gradientColors})`,
    animation: `neon-hue-shift ${neonSpeed} linear infinite`,
    zIndex: 0,
  };

  const outerGlowStyle: CSSProperties = {
    position: "absolute",
    inset: -glowSize,
    borderRadius: `calc(${borderRadius} + ${glowSize}px)`,
    background: `conic-gradient(from 0deg, ${gradientColors})`,
    filter: `blur(${glowSize}px)`,
    opacity: 0.4,
    animation: `neon-hue-shift ${neonSpeed} linear infinite`,
    zIndex: -1,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    margin: borderWidth,
    borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
    background: "#0a0a0a",
  };

  return (
    <>
      <style>{`
        @keyframes neon-hue-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
      <div style={outerStyle} className={className}>
        <div style={glowStyle}>
          <div style={outerGlowStyle} />
        </div>
        <div style={contentStyle}>{children}</div>
      </div>
    </>
  );
}

// Demo usage
export default function NeonGradientCardDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <NeonGradientCard>
        <div
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            color: "#f1f5f9",
            width: "min(400px, calc(100vw - 2rem))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>&#x26A1;</span>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                background: "rgba(255,0,128,0.15)",
                border: "1px solid rgba(255,0,128,0.4)",
                color: "#ff0080",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              NEW
            </span>
          </div>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Neon Gradient Card
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            An animated neon glow border that shifts through vivid colors,
            perfect for eye-catching UI elements.
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: 0,
              margin: 0,
            }}
          >
            {["Animated color shifting", "Soft outer glow", "Pure CSS animation"].map(
              (feature) => (
                <li
                  key={feature}
                  style={{ fontSize: "0.875rem", color: "#cbd5e1" }}
                >
                  <span style={{ color: "#40e0d0", fontWeight: 700, marginRight: "0.5rem" }}>
                    &#x2713;
                  </span>
                  {feature}
                </li>
              )
            )}
          </ul>
        </div>
      </NeonGradientCard>
    </div>
  );
}
