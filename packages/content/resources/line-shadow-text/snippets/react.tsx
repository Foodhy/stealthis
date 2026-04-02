import { type ReactNode } from "react";

interface LineShadowTextProps {
  children: ReactNode;
  shadowColor?: string;
}

export default function LineShadowText({
  children = "Shadow",
  shadowColor = "167, 139, 250",
}: LineShadowTextProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1
        className="line-shadow-text"
        style={
          {
            "--shadow-color": shadowColor,
            fontSize: "clamp(3rem, 10vw, 8rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#f1f5f9",
            cursor: "default",
            animation: "lineShadowDrift 4s ease-in-out infinite alternate",
          } as React.CSSProperties
        }
      >
        {children}
      </h1>

      <p
        style={{
          marginTop: "2rem",
          fontSize: "0.8rem",
          color: "#444",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Striped shadow effect
      </p>

      <style>{`
        @keyframes lineShadowDrift {
          0% {
            text-shadow:
              1px  1px  0 rgba(var(--shadow-color), 0.25),
              2px  2px  0 rgba(var(--shadow-color), 0.00),
              3px  3px  0 rgba(var(--shadow-color), 0.22),
              4px  4px  0 rgba(var(--shadow-color), 0.00),
              5px  5px  0 rgba(var(--shadow-color), 0.19),
              6px  6px  0 rgba(var(--shadow-color), 0.00),
              7px  7px  0 rgba(var(--shadow-color), 0.16),
              8px  8px  0 rgba(var(--shadow-color), 0.00),
              9px  9px  0 rgba(var(--shadow-color), 0.13),
              10px 10px 0 rgba(var(--shadow-color), 0.00),
              11px 11px 0 rgba(var(--shadow-color), 0.10),
              12px 12px 0 rgba(var(--shadow-color), 0.00),
              13px 13px 0 rgba(var(--shadow-color), 0.07),
              14px 14px 0 rgba(var(--shadow-color), 0.00),
              15px 15px 0 rgba(var(--shadow-color), 0.04);
          }
          100% {
            text-shadow:
              2px  4px  0 rgba(var(--shadow-color), 0.25),
              4px  6px  0 rgba(var(--shadow-color), 0.00),
              6px  8px  0 rgba(var(--shadow-color), 0.22),
              8px  10px 0 rgba(var(--shadow-color), 0.00),
              10px 12px 0 rgba(var(--shadow-color), 0.19),
              12px 14px 0 rgba(var(--shadow-color), 0.00),
              14px 16px 0 rgba(var(--shadow-color), 0.16),
              16px 18px 0 rgba(var(--shadow-color), 0.00),
              18px 20px 0 rgba(var(--shadow-color), 0.13),
              20px 22px 0 rgba(var(--shadow-color), 0.00),
              22px 24px 0 rgba(var(--shadow-color), 0.10),
              24px 26px 0 rgba(var(--shadow-color), 0.00),
              26px 28px 0 rgba(var(--shadow-color), 0.07),
              28px 30px 0 rgba(var(--shadow-color), 0.00),
              30px 32px 0 rgba(var(--shadow-color), 0.04);
          }
        }
      `}</style>
    </div>
  );
}
