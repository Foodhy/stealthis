import { useCallback, useRef, type CSSProperties, type ReactNode, type MouseEvent } from "react";

interface PulsatingButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

export function PulsatingButton({
  children,
  onClick,
  color = "59, 130, 246",
  size = "md",
  className = "",
}: PulsatingButtonProps) {
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

  const style: CSSProperties = {
    ["--pulse-color" as string]: color,
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: sizeMap[size].padding,
    fontSize: sizeMap[size].fontSize,
    borderRadius: "999px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    border: "none",
    outline: "none",
    color: "#fff",
    background: `rgb(${color})`,
    boxShadow: `0 0 0 0 rgba(${color}, 0.6)`,
    animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    transition: "transform 0.2s ease, filter 0.2s ease",
  };

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(var(--pulse-color), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-btn-react { animation: none !important; }
        }
      `}</style>
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`pulse-btn-react ${className}`}
        style={style}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.filter = "brightness(1.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.filter = "brightness(1)";
        }}
      >
        {children}
      </button>
    </>
  );
}

export default function PulsatingButtonDemo() {
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
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0" }}>Pulsating Buttons</h2>
      <p style={{ color: "#525252", fontSize: "0.875rem" }}>Buttons with animated glow rings</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", justifyContent: "center" }}>
        <PulsatingButton color="59, 130, 246">Get Started</PulsatingButton>
        <PulsatingButton color="139, 92, 246">Subscribe Now</PulsatingButton>
        <PulsatingButton color="16, 185, 129">Download Free</PulsatingButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", justifyContent: "center" }}>
        <PulsatingButton color="244, 63, 94" size="lg">
          Sign Up Today
        </PulsatingButton>
        <PulsatingButton color="245, 158, 11" size="sm">
          Learn More
        </PulsatingButton>
      </div>
    </div>
  );
}
