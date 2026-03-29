import { CSSProperties } from "react";

type SpinnerVariant = "circle" | "dots" | "bars" | "pulse";
type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  color?: string;
}

const sizes: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 36 };

export function Spinner({ variant = "circle", size = "md", color = "#38bdf8" }: SpinnerProps) {
  const s = sizes[size];

  if (variant === "circle") {
    const bw = size === "sm" ? 2 : size === "lg" ? 3 : 2.5;
    return (
      <div
        role="status"
        style={{
          width: s,
          height: s,
          border: `${bw}px solid rgba(255,255,255,0.08)`,
          borderTopColor: color,
          borderRadius: "50%",
          animation: "spinner-spin 0.7s linear infinite",
        }}
      >
        <span style={srOnly}>Loading...</span>
        <style>{`@keyframes spinner-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (variant === "dots") {
    const dotSize = s * 0.35;
    const gap = s * 0.25;
    return (
      <div role="status" style={{ display: "inline-flex", alignItems: "center", gap }}>
        {["-0.32s", "-0.16s", "0s"].map((delay, i) => (
          <span
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              background: color,
              borderRadius: "50%",
              animation: "spinner-bounce 1.4s ease-in-out infinite both",
              animationDelay: delay,
            }}
          />
        ))}
        <span style={srOnly}>Loading...</span>
        <style>{`@keyframes spinner-bounce { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  if (variant === "bars") {
    const barW = s * 0.15;
    const gap = s * 0.1;
    return (
      <div role="status" style={{ display: "inline-flex", alignItems: "center", height: s, gap }}>
        {["-0.36s", "-0.24s", "-0.12s", "0s"].map((delay, i) => (
          <span
            key={i}
            style={{
              width: barW,
              height: "100%",
              background: color,
              borderRadius: 2,
              animation: "spinner-bars 1.2s ease-in-out infinite",
              animationDelay: delay,
            }}
          />
        ))}
        <span style={srOnly}>Loading...</span>
        <style>{`@keyframes spinner-bars { 0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.4; } 20% { transform: scaleY(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  /* pulse */
  return (
    <div role="status" style={{ position: "relative", width: s, height: s }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          animation: "spinner-pulse-ring 1.5s ease-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          animation: "spinner-pulse-dot 1.5s ease-out infinite",
        }}
      />
      <span style={srOnly}>Loading...</span>
      <style>{`
        @keyframes spinner-pulse-ring { 0% { transform: scale(0.5); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes spinner-pulse-dot { 0%, 100% { transform: scale(0.5); opacity: 1; } 50% { transform: scale(0.7); opacity: 0.8; } }
      `}</style>
    </div>
  );
}

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

/* Demo */
export default function SpinnerDemo() {
  const variants: SpinnerVariant[] = ["circle", "dots", "bars", "pulse"];
  const sizeList: SpinnerSize[] = ["sm", "md", "lg"];
  const colors = ["#38bdf8", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#f2f6ff",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>Spinner</h1>
        <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Multiple loading animation styles and sizes.
        </p>

        {variants.map((v) => (
          <Section key={v} label={v}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              {sizeList.map((sz) => (
                <Spinner key={sz} variant={v} size={sz} />
              ))}
            </div>
          </Section>
        ))}

        <Section label="Colors">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {colors.map((c) => (
              <Spinner key={c} variant="circle" color={c} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <span
        style={{
          display: "block",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.75rem",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
