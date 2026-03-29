import type { CSSProperties, ReactNode } from "react";

interface AnimatedShinyTextProps {
  children: ReactNode;
  shineColor?: string;
  speed?: string;
  className?: string;
  style?: CSSProperties;
}

export function AnimatedShinyText({
  children,
  shineColor = "rgba(255, 255, 255, 0.9)",
  speed = "3s",
  className = "",
  style = {},
}: AnimatedShinyTextProps) {
  const shinyStyle: CSSProperties = {
    backgroundImage: `linear-gradient(120deg, #555 0%, #555 40%, ${shineColor} 50%, #555 60%, #555 100%)`,
    backgroundSize: "250% 100%",
    backgroundPosition: "100% center",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: `shine-sweep ${speed} ease-in-out infinite`,
    lineHeight: 1.1,
    ...style,
  };

  return (
    <>
      <style>{`
        @keyframes shine-sweep {
          0% { background-position: 100% center; }
          40% { background-position: -100% center; }
          100% { background-position: -100% center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animated-shiny-text { animation: none !important; background-position: 0% center !important; }
        }
      `}</style>
      <span className={`animated-shiny-text ${className}`} style={shinyStyle}>
        {children}
      </span>
    </>
  );
}

// Demo usage
export default function AnimatedShinyTextDemo() {
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
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
        <h1>
          <AnimatedShinyText
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Animated Shiny Text
          </AnimatedShinyText>
        </h1>
        <p style={{ color: "#666", fontSize: "1rem" }}>
          A shimmer highlight sweeps across the text
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          {["NEW", "PRO", "PREMIUM"].map((label, i) => (
            <AnimatedShinyText key={label} speed={`${3 + i * 0.3}s`}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  padding: "0.5rem 1.25rem",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "999px",
                  display: "inline-block",
                }}
              >
                {label}
              </span>
            </AnimatedShinyText>
          ))}
        </div>
      </div>
    </div>
  );
}
