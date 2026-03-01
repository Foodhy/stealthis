import { useRef, useCallback, useEffect, useRef as _ref } from "react";

// ── Hook ────────────────────────────────────────────────────────────
interface UseMagneticOptions {
  /** Pull intensity — 0 = none, 1 = full cursor offset. Default: 0.4 */
  strength?: number;
  /** Activation radius in px. Default: 120 */
  radius?: number;
}

export function useMagnetic<T extends HTMLElement = HTMLElement>({
  strength = 0.4,
  radius = 120,
}: UseMagneticOptions = {}) {
  const ref = useRef<T>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e as MouseEvent).clientX - cx;
      const dy = (e as MouseEvent).clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const pull = (1 - dist / radius) * strength;
        ref.current.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      }
    },
    [strength, radius, reduced]
  );

  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

// ── Demo ────────────────────────────────────────────────────────────
const TRANSITION = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";

function MagneticCard({ label, sub }: { label: string; sub: string }) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic<HTMLDivElement>({
    strength: 0.35,
    radius: 130,
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove as React.MouseEventHandler<HTMLDivElement>}
      onMouseLeave={onMouseLeave}
      style={{
        transition: TRANSITION,
        willChange: "transform",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.5rem",
        padding: "2.5rem 3rem",
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{label}</p>
      <p style={{ fontSize: "0.875rem", color: "#64748b" }}>{sub}</p>
    </div>
  );
}

function MagneticButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const { ref, onMouseMove, onMouseLeave } =
    useMagnetic<HTMLButtonElement>({ strength: 0.45, radius: 100 });

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.875rem 2rem",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    border: "none",
    transition: TRANSITION,
    willChange: "transform",
  };

  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: "#38bdf8", color: "#0f172a" },
    ghost: {
      ...base,
      background: "transparent",
      color: "#94a3b8",
      border: "1px solid rgba(255,255,255,0.1)",
    },
  };

  return (
    <button
      ref={ref}
      onMouseMove={onMouseMove as React.MouseEventHandler<HTMLButtonElement>}
      onMouseLeave={onMouseLeave}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

export default function UseMagneticDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050910",
        color: "#f2f6ff",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3rem",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          useMagnetic
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem" }}>
          Move your cursor near any element
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <MagneticCard label="🎯" sub="strength: 0.35" />
        <MagneticCard label="⚡" sub="radius: 130px" />
        <MagneticCard label="✨" sub="snap-back smooth" />
      </div>

      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        <MagneticButton variant="primary">Primary CTA</MagneticButton>
        <MagneticButton variant="ghost">Ghost Button</MagneticButton>
      </div>
    </div>
  );
}
