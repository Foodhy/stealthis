import { useMemo, type CSSProperties } from "react";

interface StripedPatternProps {
  angle?: number;
  color1?: string;
  color2?: string;
  stripeWidth?: number;
  animate?: boolean;
  animationDuration?: number;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export function StripedPattern({
  angle = 135,
  color1 = "rgba(139, 92, 246, 0.08)",
  color2 = "transparent",
  stripeWidth = 16,
  animate = true,
  animationDuration = 40,
  className = "",
  style,
  children,
}: StripedPatternProps) {
  const bgStyle = useMemo<CSSProperties>(() => {
    const radians = (angle * Math.PI) / 180;
    const hyp = stripeWidth * Math.sqrt(2);

    return {
      position: "absolute" as const,
      inset: 0,
      background: `repeating-linear-gradient(
        ${angle}deg,
        ${color1} 0px,
        ${color1} 1px,
        ${color2} 1px,
        ${color2} ${stripeWidth}px
      )`,
      backgroundSize: `${hyp}px ${hyp}px`,
      animation: animate ? `stripe-drift-react ${animationDuration}s linear infinite` : "none",
    };
  }, [angle, color1, color2, stripeWidth, animate, animationDuration]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <style>{`
        @keyframes stripe-drift-react {
          0% { background-position: 0 0; }
          100% { background-position: 200px 200px; }
        }
      `}</style>
      <div style={bgStyle} aria-hidden="true" />
      {children && <div style={{ position: "relative", zIndex: 1 }}>{children}</div>}
    </div>
  );
}

// Pre-built variants
function DiagonalStripes() {
  return (
    <StripedPattern
      angle={135}
      color1="rgba(139, 92, 246, 0.08)"
      stripeWidth={16}
      style={{
        borderRadius: "1.25rem",
        minHeight: 280,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          padding: "1.75rem",
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: 280,
        }}
      >
        <span
          style={labelStyle(
            "rgba(139, 92, 246, 0.9)",
            "rgba(139, 92, 246, 0.1)",
            "rgba(139, 92, 246, 0.2)"
          )}
        >
          Diagonal
        </span>
        <h2 style={titleStyle}>135&deg; Stripes</h2>
        <p style={descStyle}>Classic diagonal striped pattern with subtle animation</p>
      </div>
    </StripedPattern>
  );
}

function HorizontalStripes() {
  return (
    <StripedPattern
      angle={0}
      color1="rgba(56, 189, 248, 0.06)"
      stripeWidth={12}
      style={{
        borderRadius: "1.25rem",
        minHeight: 280,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: 280,
        }}
      >
        <span
          style={labelStyle(
            "rgba(56, 189, 248, 0.9)",
            "rgba(56, 189, 248, 0.1)",
            "rgba(56, 189, 248, 0.2)"
          )}
        >
          Horizontal
        </span>
        <h2 style={titleStyle}>0&deg; Stripes</h2>
        <p style={descStyle}>Clean horizontal bands with dual-color layering</p>
      </div>
    </StripedPattern>
  );
}

function FineStripes() {
  return (
    <StripedPattern
      angle={135}
      color1="rgba(34, 211, 238, 0.1)"
      stripeWidth={6}
      animationDuration={20}
      style={{
        borderRadius: "1.25rem",
        minHeight: 280,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: 280,
        }}
      >
        <span
          style={labelStyle(
            "rgba(34, 211, 238, 0.9)",
            "rgba(34, 211, 238, 0.1)",
            "rgba(34, 211, 238, 0.2)"
          )}
        >
          Fine
        </span>
        <h2 style={titleStyle}>Thin Stripes</h2>
        <p style={descStyle}>Narrow stripes with neon accent overlay</p>
      </div>
    </StripedPattern>
  );
}

function CrosshatchStripes() {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "1.25rem",
        overflow: "hidden",
        minHeight: 280,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <style>{`
        @keyframes stripe-cross-react {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 200px 200px, -200px 200px; }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            repeating-linear-gradient(45deg, rgba(244,63,94,0.06) 0px, rgba(244,63,94,0.06) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(251,146,60,0.06) 0px, rgba(251,146,60,0.06) 1px, transparent 1px, transparent 20px)
          `,
          animation: "stripe-cross-react 40s linear infinite",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: 280,
        }}
      >
        <span
          style={labelStyle(
            "rgba(244, 63, 94, 0.9)",
            "rgba(244, 63, 94, 0.1)",
            "rgba(244, 63, 94, 0.2)"
          )}
        >
          Crosshatch
        </span>
        <h2 style={titleStyle}>Layered</h2>
        <p style={descStyle}>Two diagonal gradients composited into a crosshatch</p>
      </div>
    </div>
  );
}

// Shared styles
const labelStyle = (color: string, bg: string, border: string): CSSProperties => ({
  display: "inline-block",
  alignSelf: "flex-start",
  fontSize: "0.6875rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color,
  background: bg,
  border: `1px solid ${border}`,
  padding: "0.2rem 0.6rem",
  borderRadius: 999,
  marginBottom: "0.75rem",
});

const titleStyle: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#f1f5f9",
  letterSpacing: "-0.02em",
  marginBottom: "0.375rem",
};

const descStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "rgba(148, 163, 184, 0.7)",
  lineHeight: 1.5,
};

// Demo usage
export default function StripedPatternDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        .stripe-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          width: 100%;
          max-width: 1200px;
        }
        @media (max-width: 768px) {
          .stripe-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="stripe-grid">
        <DiagonalStripes />
        <HorizontalStripes />
        <CrosshatchStripes />
        <FineStripes />
      </div>
    </div>
  );
}
