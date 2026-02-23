import { useCallback, useRef } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  radius?: number;
  variant?: "primary" | "ghost";
}

export function MagneticButton({
  children,
  strength = 0.35,
  radius = 100,
  variant = "primary",
  className = "",
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reducedMotion) return;
      const btn = btnRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength;
        btn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
        if (innerRef.current) {
          innerRef.current.style.transform = `translate(${dx * pull * 0.4}px, ${dy * pull * 0.4}px)`;
        }
      }
    },
    [strength, radius, reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = "";
    if (innerRef.current) innerRef.current.style.transform = "";
  }, []);

  const baseStyles =
    "relative inline-flex items-center justify-center px-10 py-4 rounded-full text-base font-semibold cursor-pointer outline-none border-none";
  const variantStyles = {
    primary:
      "bg-sky-500 text-white shadow-[0_4px_24px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_32px_rgba(14,165,233,0.45)]",
    ghost:
      "bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-slate-100",
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
        willChange: "transform",
      }}
      {...props}
    >
      <span
        ref={innerRef}
        style={{ transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)", pointerEvents: "none" }}
      >
        {children}
      </span>
    </button>
  );
}

// Demo
export default function MagneticButtonDemo() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8">
      <p className="text-slate-500 text-sm">Move your cursor near the buttons</p>
      <MagneticButton variant="primary">Browse Library</MagneticButton>
      <MagneticButton variant="ghost">View Docs</MagneticButton>
    </div>
  );
}
