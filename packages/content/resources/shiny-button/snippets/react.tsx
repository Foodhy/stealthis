import { useState, type CSSProperties, type ReactNode, type MouseEvent } from "react";

interface ShinyButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: "blue" | "purple" | "emerald" | "rose" | "dark" | "amber" | "gradient";
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
  amber: { background: "#f59e0b", color: "#0a0a0a", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" },
  gradient: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
  },
};

const sizeStyles: Record<string, CSSProperties> = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

export function ShinyButton({
  children,
  onClick,
  variant = "blue",
  size = "md",
  className = "",
}: ShinyButtonProps) {
  const [hovered, setHovered] = useState(false);

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
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    transform: hovered ? "translateY(-2px)" : "translateY(0)",
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const shineStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: hovered ? "125%" : "-75%",
    width: "50%",
    height: "100%",
    background:
      "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, rgba(255,255,255,0.05) 80%, transparent 100%)",
    transition: "left 0.5s ease",
    pointerEvents: "none",
  };

  return (
    <button
      onClick={onClick}
      className={className}
      style={btnStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={shineStyle} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}

export default function ShinyButtonDemo() {
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
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0" }}>Shiny Buttons</h2>
      <p style={{ color: "#525252", fontSize: "0.875rem" }}>
        Hover over the buttons to see the shine effect
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <ShinyButton variant="blue">Get Started</ShinyButton>
        <ShinyButton variant="purple">Upgrade Now</ShinyButton>
        <ShinyButton variant="dark">View Details</ShinyButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <ShinyButton variant="emerald" size="lg">
          Download App
        </ShinyButton>
        <ShinyButton variant="rose" size="sm">
          Subscribe
        </ShinyButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <ShinyButton variant="gradient">Premium Access</ShinyButton>
        <ShinyButton variant="amber">Go Pro</ShinyButton>
      </div>
    </div>
  );
}
