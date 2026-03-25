import { useState, useCallback, type CSSProperties, type ReactNode, type MouseEvent } from "react";

interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: "blue" | "purple" | "emerald" | "rose" | "ghost" | "amber";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<string, CSSProperties> = {
  blue: { background: "#3b82f6", color: "#fff", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" },
  purple: { background: "#8b5cf6", color: "#fff", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" },
  emerald: { background: "#10b981", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" },
  rose: { background: "#f43f5e", color: "#fff", boxShadow: "0 4px 14px rgba(244,63,94,0.35)" },
  ghost: { background: "transparent", color: "#cbd5e1", border: "1.5px solid #334155" },
  amber: { background: "#f59e0b", color: "#0a0a0a", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" },
};

const sizeStyles: Record<string, CSSProperties> = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

let rippleId = 0;

export function RippleButton({
  children,
  onClick,
  variant = "blue",
  size = "md",
  className = "",
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const rippleSize = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - rippleSize / 2;
      const y = e.clientY - rect.top - rippleSize / 2;

      const id = ++rippleId;
      setRipples((prev) => [...prev, { id, x, y, size: rippleSize }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      onClick?.(e);
    },
    [onClick]
  );

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
    transition: "transform 0.15s ease, box-shadow 0.2s ease",
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const rippleColor = variant === "ghost" ? "rgba(148,163,184,0.2)" : "rgba(255,255,255,0.35)";

  return (
    <>
      <style>{`
        @keyframes ripple-expand {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ripple-span { display: none !important; }
        }
      `}</style>
      <button
        onClick={handleClick}
        className={className}
        style={btnStyle}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple-span"
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: rippleColor,
              width: r.size,
              height: r.size,
              left: r.x,
              top: r.y,
              transform: "scale(0)",
              animation: "ripple-expand 0.6s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        ))}
      </button>
    </>
  );
}

export default function RippleButtonDemo() {
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
        Ripple Buttons
      </h2>
      <p style={{ color: "#525252", fontSize: "0.875rem" }}>
        Click the buttons to see the ripple effect
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <RippleButton variant="blue">Click Me</RippleButton>
        <RippleButton variant="purple">Submit Form</RippleButton>
        <RippleButton variant="emerald">Confirm Action</RippleButton>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        <RippleButton variant="ghost">Ghost Ripple</RippleButton>
        <RippleButton variant="rose" size="lg">Large Button</RippleButton>
        <RippleButton variant="amber" size="sm">Small</RippleButton>
      </div>
    </div>
  );
}
