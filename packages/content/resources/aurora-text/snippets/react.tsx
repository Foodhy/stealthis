import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

interface AuroraTextProps {
  children: ReactNode;
  colors?: [string, string, string];
  speed?: string;
  className?: string;
}

export function AuroraText({
  children,
  colors = ["#00ff87", "#7c3aed", "#00d4ff"],
  speed = "6s",
  className = "",
}: AuroraTextProps) {
  const textStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    backgroundImage: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 33%, ${colors[2]} 66%, ${colors[0]} 100%)`,
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: `aurora-shift ${speed} ease-in-out infinite`,
  };

  const glowStyle: CSSProperties = {
    ...textStyle,
    position: "absolute",
    inset: 0,
    zIndex: 0,
    filter: "blur(28px) brightness(1.5)",
    opacity: 0.6,
    animationDelay: "-0.5s",
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <>
      <style>{`
        @keyframes aurora-shift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-text-component, .aurora-glow-component { animation: none !important; }
        }
      `}</style>
      <span style={{ position: "relative", display: "inline-block" }}>
        <span className={`aurora-glow-component ${className}`} style={glowStyle} aria-hidden="true">
          {children}
        </span>
        <span className={`aurora-text-component ${className}`} style={textStyle}>
          {children}
        </span>
      </span>
    </>
  );
}

// Demo usage
export default function AuroraTextDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "2rem",
        overflow: "hidden",
      }}
    >
      <div>
        <h1>
          <AuroraText>
            <span style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
              Aurora Borealis
            </span>
          </AuroraText>
        </h1>
        <p style={{ marginTop: "1.5rem", color: "#666", fontSize: "1rem", position: "relative", zIndex: 1 }}>
          Northern lights flowing through text
        </p>
      </div>
    </div>
  );
}
