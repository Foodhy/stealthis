import { type CSSProperties, type ReactNode } from "react";

interface BorderBeamProps {
  children: ReactNode;
  beamColor?: string;
  beamSpeed?: string;
  borderWidth?: number;
  className?: string;
}

export function BorderBeam({
  children,
  beamColor = "#22d3ee",
  beamSpeed = "4s",
  borderWidth = 2,
  className = "",
}: BorderBeamProps) {
  const outerStyle: CSSProperties = {
    position: "relative",
    borderRadius: "1.25rem",
    overflow: "hidden",
  };

  const beamStyle: CSSProperties = {
    position: "absolute",
    inset: "-50%",
    borderRadius: "inherit",
    background: `conic-gradient(
      from 0deg,
      transparent 0%,
      transparent 70%,
      ${beamColor} 76%,
      ${beamColor}99 78%,
      transparent 82%,
      transparent 100%
    )`,
    animation: `border-beam-rotate ${beamSpeed} linear infinite`,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    margin: borderWidth,
    borderRadius: `calc(1.25rem - ${borderWidth}px)`,
    background: "#0a0a0a",
  };

  return (
    <>
      <style>{`
        @keyframes border-beam-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={outerStyle} className={className}>
        <div style={beamStyle} />
        <div style={contentStyle}>{children}</div>
      </div>
    </>
  );
}

// Demo usage
export default function BorderBeamDemo() {
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
      <BorderBeam>
        <div
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            color: "#f1f5f9",
          }}
        >
          <span style={{ fontSize: "1.75rem" }}>&#x2728;</span>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Border Beam
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            An animated beam of light travels around the card border using a
            rotating conic-gradient and CSS keyframes.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["CSS", "Animation", "Gradient"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  padding: "0.25rem 0.75rem",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </BorderBeam>
    </div>
  );
}
