import { type CSSProperties, type ReactNode, type MouseEvent } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: "blue" | "purple" | "emerald" | "rose" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<string, CSSProperties> = {
  blue: { background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" },
  purple: { background: "#8b5cf6", color: "#fff", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" },
  emerald: { background: "#10b981", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" },
  rose: { background: "#f43f5e", color: "#fff", boxShadow: "0 4px 14px rgba(244,63,94,0.3)" },
  dark: {
    background: "#1e293b",
    color: "#fff",
    border: "1px solid #334155",
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  },
  outline: { background: "transparent", color: "#94a3b8", border: "1.5px solid #334155" },
};

const sizeStyles: Record<string, CSSProperties> = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

export function ShimmerButton({
  children,
  onClick,
  variant = "blue",
  size = "md",
  className = "",
}: ShimmerButtonProps) {
  const isOutline = variant === "outline";
  const shimmerGradient = isOutline
    ? "linear-gradient(120deg, transparent 0%, transparent 30%, rgba(148,163,184,0.15) 45%, rgba(148,163,184,0.25) 50%, rgba(148,163,184,0.15) 55%, transparent 70%, transparent 100%)"
    : "linear-gradient(120deg, transparent 0%, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%, transparent 100%)";

  const btnStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    border: "none",
    outline: "none",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const shimmerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: shimmerGradient,
    animation: "shimmer-sweep 3s ease-in-out infinite",
    pointerEvents: "none",
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-sweep {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-pseudo { display: none !important; }
        }
      `}</style>
      <button
        onClick={onClick}
        className={className}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.filter = "brightness(1)";
        }}
      >
        <span className="shimmer-pseudo" style={shimmerStyle} />
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      </button>
    </>
  );
}

export default function ShimmerButtonDemo() {
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
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0" }}>Shimmer Buttons</h2>
      <p style={{ color: "#525252", fontSize: "0.875rem" }}>
        Watch the light sweep across each button
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <ShimmerButton variant="blue">Discover More</ShimmerButton>
        <ShimmerButton variant="purple">Upgrade Plan</ShimmerButton>
        <ShimmerButton variant="dark">Learn More</ShimmerButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <ShimmerButton variant="emerald" size="lg">
          Get Started Free
        </ShimmerButton>
        <ShimmerButton variant="rose" size="sm">
          Buy Now
        </ShimmerButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <ShimmerButton variant="outline">View Details</ShimmerButton>
      </div>
    </div>
  );
}
