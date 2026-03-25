import { type CSSProperties, type ReactNode } from "react";

interface ShineBorderProps {
  children: ReactNode;
  color1?: string;
  color2?: string;
  borderWidth?: number;
  speed?: string;
  borderRadius?: string;
  className?: string;
}

export function ShineBorder({
  children,
  color1 = "#22d3ee",
  color2 = "#3b82f6",
  borderWidth = 2,
  speed = "3s",
  borderRadius = "1.25rem",
  className = "",
}: ShineBorderProps) {
  const outerStyle: CSSProperties = {
    position: "relative",
    borderRadius,
    overflow: "hidden",
    padding: borderWidth,
  };

  const bgStyle: CSSProperties = {
    position: "absolute",
    inset: "-100%",
    background: `conic-gradient(from 0deg, ${color1}, transparent 25%, transparent 50%, ${color2}, transparent 75%, ${color1})`,
    animation: `shine-border-rotate ${speed} linear infinite`,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
    background: "#0a0a0a",
  };

  return (
    <>
      <style>{`
        @keyframes shine-border-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={outerStyle} className={className}>
        <div style={bgStyle} />
        <div style={contentStyle}>{children}</div>
      </div>
    </>
  );
}

// Demo usage
export default function ShineBorderDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
      }}
    >
      <ShineBorder>
        <div
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "min(400px, calc(100vw - 4rem))",
          }}
        >
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f1f5f9",
              margin: 0,
            }}
          >
            Shine Border
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            A glowing animated border using a rotating gradient that sweeps light
            around the container edge for a premium look.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.3)",
                color: "#22d3ee",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Premium
            </span>
          </div>
        </div>
      </ShineBorder>

      <ShineBorder color1="#a855f7" color2="#ec4899">
        <div
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "min(400px, calc(100vw - 4rem))",
          }}
        >
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f1f5f9",
              margin: 0,
            }}
          >
            Custom Colors
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.65,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            Change the gradient colors to match your brand with simple props.
          </p>
        </div>
      </ShineBorder>
    </div>
  );
}
