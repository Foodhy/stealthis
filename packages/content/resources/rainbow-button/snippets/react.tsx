import { useRef, useCallback, type CSSProperties, type ReactNode, type MouseEvent } from "react";

interface RainbowButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  filled?: boolean;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  speed?: string;
  className?: string;
}

const sizeStyles: Record<string, CSSProperties> = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

export function RainbowButton({
  children,
  onClick,
  filled = false,
  size = "md",
  rounded = false,
  speed = "3s",
  className = "",
}: RainbowButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const btn = btnRef.current;
      if (btn) {
        btn.style.animation = "none";
        btn.offsetHeight;
        btn.style.animation = "";
      }
      onClick?.(e);
    },
    [onClick]
  );

  const radius = rounded ? "999px" : "12px";
  const innerRadius = rounded ? "999px" : "10px";

  const outerStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px",
    borderRadius: radius,
    border: "none",
    outline: "none",
    cursor: "pointer",
    background:
      "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, #ff0000)",
    animation: `rainbow-spin ${speed} linear infinite`,
    transition: "transform 0.2s ease, filter 0.2s ease",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    ...sizeStyles[size],
    borderRadius: innerRadius,
    background: filled ? "transparent" : "#0a0a0a",
    color: filled ? "#fff" : "#f1f5f9",
    fontWeight: 600,
    letterSpacing: "0.01em",
    textShadow: filled ? "0 1px 2px rgba(0,0,0,0.4)" : "none",
    transition: "background 0.3s ease",
  };

  return (
    <>
      <style>{`
        @keyframes rainbow-spin {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rainbow-btn-react { animation: none !important; }
        }
      `}</style>
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`rainbow-btn-react ${className}`}
        style={outerStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.04)";
          e.currentTarget.style.filter = "brightness(1.2) hue-rotate(0deg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.filter = "";
        }}
      >
        <span style={labelStyle}>{children}</span>
      </button>
    </>
  );
}

export default function RainbowButtonDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0" }}>
        Rainbow Buttons
      </h2>
      <p style={{ color: "#525252", fontSize: "0.875rem" }}>
        Animated rainbow gradient borders
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", justifyContent: "center" }}>
        <RainbowButton>Explore Now</RainbowButton>
        <RainbowButton filled>Get Premium</RainbowButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", justifyContent: "center" }}>
        <RainbowButton size="lg">Start Your Journey</RainbowButton>
        <RainbowButton size="sm" filled>Try Free</RainbowButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", justifyContent: "center" }}>
        <RainbowButton rounded>Join Community</RainbowButton>
      </div>
    </div>
  );
}
