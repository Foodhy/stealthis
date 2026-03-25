import { useState } from "react";

interface ButtonGroupItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ButtonGroupProps {
  items: ButtonGroupItem[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  variant?: "default" | "outline";
}

export function ButtonGroup({
  items,
  value,
  onChange,
  size = "md",
  variant = "default",
}: ButtonGroupProps) {
  const [internal, setInternal] = useState(value ?? items[0]?.value ?? "");
  const active = value ?? internal;

  const handleClick = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  const padY = size === "sm" ? "0.375rem" : "0.5rem";
  const padX = size === "sm" ? "0.75rem" : "1rem";
  const fontSize = size === "sm" ? "0.75rem" : "0.8125rem";

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: "0.625rem",
        overflow: "hidden",
        border: "1px solid #2a2a2a",
        background: variant === "outline" ? "transparent" : "#141414",
      }}
    >
      {items.map((item, i) => {
        const isActive = active === item.value;
        let bg = "transparent";
        let color = "#94a3b8";
        let fontWeight: number = 500;

        if (isActive) {
          if (variant === "outline") {
            bg = "#38bdf8";
            color = "#0a0a0a";
            fontWeight = 700;
          } else {
            bg = "rgba(56,189,248,0.12)";
            color = "#38bdf8";
            fontWeight = 600;
          }
        }

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => handleClick(item.value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: `${padY} ${padX}`,
              border: "none",
              borderLeft: i > 0 ? "1px solid #2a2a2a" : "none",
              background: bg,
              color,
              fontSize,
              fontWeight,
              fontFamily: "inherit",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* Demo */
export default function ButtonGroupDemo() {
  const [view, setView] = useState("grid");
  const [align, setAlign] = useState("left");
  const [period, setPeriod] = useState("daily");

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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
          Button Group
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Segmented control style buttons with shared borders.
        </p>

        <Section label="View Mode">
          <ButtonGroup
            items={[
              { value: "grid", label: "Grid" },
              { value: "list", label: "List" },
              { value: "board", label: "Board" },
            ]}
            value={view}
            onChange={setView}
          />
          <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#94a3b8" }}>
            Selected: <strong style={{ color: "#38bdf8" }}>{view}</strong>
          </p>
        </Section>

        <Section label="Alignment">
          <ButtonGroup
            items={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
              { value: "justify", label: "Justify" },
            ]}
            value={align}
            onChange={setAlign}
          />
        </Section>

        <Section label="Outlined Variant">
          <ButtonGroup
            variant="outline"
            items={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            value={period}
            onChange={setPeriod}
          />
        </Section>

        <Section label="Small Size">
          <ButtonGroup
            size="sm"
            items={[
              { value: "s", label: "Small" },
              { value: "m", label: "Medium" },
              { value: "l", label: "Large" },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <span
        style={{
          display: "block",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.625rem",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
