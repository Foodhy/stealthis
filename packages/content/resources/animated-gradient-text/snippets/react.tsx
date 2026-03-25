import type { CSSProperties, ReactNode } from "react";

interface AnimatedGradientTextProps {
  children: ReactNode;
  colors?: string[];
  speed?: string;
  className?: string;
}

export function AnimatedGradientText({
  children,
  colors = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#ff6b6b"],
  speed = "3s",
  className = "",
}: AnimatedGradientTextProps) {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: `gradient-flow ${speed} linear infinite`,
  };

  return (
    <>
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animated-gradient-text { animation: none !important; }
        }
      `}</style>
      <span className={`animated-gradient-text ${className}`} style={gradientStyle}>
        {children}
      </span>
    </>
  );
}

// Demo usage
export default function AnimatedGradientTextDemo() {
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
      <div>
        <h1>
          <AnimatedGradientText>
            <span style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Animated Gradient Text
            </span>
          </AnimatedGradientText>
        </h1>
        <p style={{ marginTop: "1.25rem", color: "#666", fontSize: "1rem" }}>
          Pure CSS animated gradient flowing through text
        </p>
      </div>
    </div>
  );
}
