import { CSSProperties, ReactNode } from "react";

interface AspectRatioProps {
  ratio?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function AspectRatioBox({ ratio = 16 / 9, children, style }: AspectRatioProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(ratio),
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DemoContent({
  label,
  gradient,
  icon,
}: {
  label: string;
  gradient: string;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        background: gradient,
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <span
        style={{
          fontSize: "0.8rem",
          fontWeight: 500,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <div style={{ opacity: 0.5 }}>{icon}</div>
    </div>
  );
}

const MonitorIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const ImageIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

const CircleIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const demos: { label: string; ratio: number; gradient: string; icon: ReactNode; wide?: boolean }[] =
  [
    {
      label: "Widescreen",
      ratio: 16 / 9,
      gradient: "linear-gradient(135deg, #1e1b4b, #312e81)",
      icon: MonitorIcon,
    },
    {
      label: "Classic",
      ratio: 4 / 3,
      gradient: "linear-gradient(135deg, #0c4a6e, #164e63)",
      icon: ImageIcon,
    },
    {
      label: "Square",
      ratio: 1,
      gradient: "linear-gradient(135deg, #14532d, #1a2e05)",
      icon: CircleIcon,
    },
    {
      label: "Ultra-Wide",
      ratio: 21 / 9,
      gradient: "linear-gradient(135deg, #4c1d95, #701a75)",
      icon: MonitorIcon,
      wide: true,
    },
    {
      label: "Portrait",
      ratio: 9 / 16,
      gradient: "linear-gradient(135deg, #78350f, #7c2d12)",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M12 18h.01" />
        </svg>
      ),
    },
  ];

export default function AspectRatio({ ratio }: { ratio?: number }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div
        style={{ width: "min(700px, 100%)", display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700 }}>Aspect Ratio Containers</h2>
        <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
          Resize the browser to see them maintain their proportions
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          {demos.map((demo) => (
            <div
              key={demo.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                gridColumn: demo.wide ? "span 2" : undefined,
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  letterSpacing: "0.06em",
                  fontFamily: '"Fira Code", monospace',
                }}
              >
                {Math.round(demo.ratio * 100) / 100 === demo.ratio ? `${demo.ratio}` : demo.label}
              </span>
              <AspectRatioBox ratio={ratio || demo.ratio}>
                <DemoContent label={demo.label} gradient={demo.gradient} icon={demo.icon} />
              </AspectRatioBox>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
