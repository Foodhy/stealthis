import { useState, type CSSProperties, type ReactNode, type MouseEvent } from "react";

type Variant =
  | "default"
  | "blue"
  | "purple"
  | "emerald"
  | "rose"
  | "slide-right"
  | "curtain"
  | "glow";

interface InteractiveHoverButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantConfig: Record<
  Variant,
  { fill: string; text: string; textHover: string; border: string; borderHover: string }
> = {
  default: {
    fill: "#f1f5f9",
    text: "#e2e8f0",
    textHover: "#0a0a0a",
    border: "#475569",
    borderHover: "#f1f5f9",
  },
  blue: {
    fill: "#3b82f6",
    text: "#93c5fd",
    textHover: "#fff",
    border: "#3b82f6",
    borderHover: "#60a5fa",
  },
  purple: {
    fill: "#8b5cf6",
    text: "#c4b5fd",
    textHover: "#fff",
    border: "#8b5cf6",
    borderHover: "#a78bfa",
  },
  emerald: {
    fill: "#10b981",
    text: "#6ee7b7",
    textHover: "#fff",
    border: "#10b981",
    borderHover: "#34d399",
  },
  rose: {
    fill: "#f43f5e",
    text: "#fda4af",
    textHover: "#fff",
    border: "#f43f5e",
    borderHover: "#fb7185",
  },
  "slide-right": {
    fill: "#f1f5f9",
    text: "#e2e8f0",
    textHover: "#0a0a0a",
    border: "#475569",
    borderHover: "#f1f5f9",
  },
  curtain: {
    fill: "#8b5cf6",
    text: "#c4b5fd",
    textHover: "#fff",
    border: "#8b5cf6",
    borderHover: "#a78bfa",
  },
  glow: {
    fill: "#3b82f6",
    text: "#93c5fd",
    textHover: "#fff",
    border: "#3b82f6",
    borderHover: "#60a5fa",
  },
};

const sizeStyles: Record<string, CSSProperties> = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

export function InteractiveHoverButton({
  children,
  onClick,
  variant = "default",
  size = "md",
  className = "",
}: InteractiveHoverButtonProps) {
  const [hovered, setHovered] = useState(false);
  const config = variantConfig[variant];

  const isSlideRight = variant === "slide-right";
  const isCurtain = variant === "curtain";
  const isGlow = variant === "glow";

  const btnStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    background: "transparent",
    border: `1.5px solid ${hovered ? config.borderHover : config.border}`,
    outline: "none",
    overflow: "hidden",
    transition: "border-color 0.35s ease, box-shadow 0.35s ease",
    boxShadow:
      isGlow && hovered ? "0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.2)" : "none",
    ...sizeStyles[size],
  };

  const fillStyle: CSSProperties = isSlideRight
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: hovered ? "100%" : "0",
        height: "100%",
        background: config.fill,
        transition: "width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        zIndex: 0,
      }
    : isCurtain
      ? {
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          height: hovered ? "100%" : "0",
          transform: "translateY(-50%)",
          background: config.fill,
          transition: "height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          zIndex: 0,
        }
      : {
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: hovered ? "100%" : "0",
          background: config.fill,
          transition: "height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          zIndex: 0,
        };

  const labelStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    color: hovered ? config.textHover : config.text,
    transition: "color 0.35s ease",
  };

  return (
    <button
      onClick={onClick}
      className={className}
      style={btnStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={fillStyle} />
      <span style={labelStyle}>{children}</span>
    </button>
  );
}

export default function InteractiveHoverButtonDemo() {
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
        Interactive Hover Buttons
      </h2>
      <p style={{ color: "#525252", fontSize: "0.875rem" }}>
        Hover over the buttons to see the fill effect
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <InteractiveHoverButton variant="default">Explore</InteractiveHoverButton>
        <InteractiveHoverButton variant="blue">Get Started</InteractiveHoverButton>
        <InteractiveHoverButton variant="purple">Learn More</InteractiveHoverButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <InteractiveHoverButton variant="emerald" size="lg">
          Download Now
        </InteractiveHoverButton>
        <InteractiveHoverButton variant="rose" size="sm">
          Sign Up
        </InteractiveHoverButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <InteractiveHoverButton variant="slide-right">Slide Right</InteractiveHoverButton>
        <InteractiveHoverButton variant="curtain">Curtain Reveal</InteractiveHoverButton>
        <InteractiveHoverButton variant="glow">Glow Effect</InteractiveHoverButton>
      </div>
    </div>
  );
}
