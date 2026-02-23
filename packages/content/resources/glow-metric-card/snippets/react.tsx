import type React from "react";

type GlowMetricCardProps = {
  label: string;
  value: string;
  delta: string;
  note: string;
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  width: "min(360px, 90vw)",
  padding: "28px 26px",
  borderRadius: 22,
  background: "rgba(15, 23, 42, 0.85)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
  overflow: "hidden",
};

const GlowMetricCard = ({ label, value, delta, note }: GlowMetricCardProps) => {
  return (
    <article style={cardStyle}>
      <div
        style={{
          position: "absolute",
          inset: "-30% 10% 40% -10%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.35), transparent 60%)",
          filter: "blur(24px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(148, 163, 184, 0.12), transparent 55%)",
          opacity: 0.6,
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: "2.4rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "#f8fafc",
          }}
        >
          {value}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
            color: "#94a3b8",
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(34, 197, 94, 0.15)",
              color: "#4ade80",
              fontWeight: 600,
            }}
          >
            {delta}
          </span>
          <span>{note}</span>
        </div>
      </div>
    </article>
  );
};

export default function GlowMetricDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 32,
        background: "radial-gradient(circle at top, #0f172a 0%, #020617 60%)",
        fontFamily: "Inter, Segoe UI, system-ui, -apple-system, sans-serif",
      }}
    >
      <GlowMetricCard label="Active users" value="24,680" delta="+12%" note="vs last month" />
    </div>
  );
}
