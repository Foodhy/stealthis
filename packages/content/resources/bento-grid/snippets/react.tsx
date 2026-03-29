import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

interface BentoGridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export function BentoGrid({ children, columns = 3, gap = "1rem", className = "" }: BentoGridProps) {
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    width: "100%",
  };

  return (
    <div style={gridStyle} className={className}>
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
  index?: number;
}

export function BentoGridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = "",
  index = 0,
}: BentoGridItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const itemStyle: CSSProperties = {
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
    padding: "1.5rem",
    borderRadius: "1rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    transition:
      "border-color 0.2s ease, background 0.2s ease, opacity 0.5s ease, transform 0.5s ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
  };

  return (
    <div
      ref={ref}
      style={itemStyle}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {children}
    </div>
  );
}

// Demo icon box
function Icon({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        display: "grid",
        placeItems: "center",
        borderRadius: "0.75rem",
        fontSize: "1.125rem",
        background: `${color}1a`,
        color,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

// Demo usage
export default function BentoGridDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
      }}
    >
      <BentoGrid columns={3} gap="1rem">
        {/* Large feature item */}
        <BentoGridItem colSpan={2} rowSpan={2} index={0}>
          <Icon color="#22d3ee">{"\u2666"}</Icon>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Analytics Dashboard
          </h3>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#94a3b8", margin: 0 }}>
            Real-time metrics and charts with interactive filters and drill-down capabilities.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.5rem",
              height: 80,
              marginTop: "auto",
              paddingTop: "1rem",
            }}
          >
            {[60, 85, 45, 70, 90, 55, 75].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: "0.25rem 0.25rem 0 0",
                  background: "linear-gradient(to top, rgba(34,211,238,0.3), rgba(34,211,238,0.1))",
                  border: "1px solid rgba(34,211,238,0.2)",
                  borderBottom: "none",
                }}
              />
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem index={1}>
          <Icon color="#a855f7">{"\u2733"}</Icon>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Authentication
          </h3>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#94a3b8", margin: 0 }}>
            Secure login with OAuth, 2FA, and session management.
          </p>
        </BentoGridItem>

        <BentoGridItem index={2}>
          <Icon color="#34d399">{"\u2726"}</Icon>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            API Gateway
          </h3>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#94a3b8", margin: 0 }}>
            Rate limiting, caching, and request routing.
          </p>
        </BentoGridItem>

        {/* Wide item */}
        <BentoGridItem colSpan={2} index={3}>
          <Icon color="#f59e0b">{"\u2747"}</Icon>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Team Collaboration
          </h3>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#94a3b8", margin: 0 }}>
            Real-time editing, comments, and shared workspaces for your entire team.
          </p>
          <div style={{ display: "flex", marginTop: "0.5rem" }}>
            {[
              { initials: "SC", bg: "#22d3ee" },
              { initials: "JD", bg: "#a855f7" },
              { initials: "MK", bg: "#34d399" },
              { initials: "AL", bg: "#f59e0b" },
            ].map((a, i) => (
              <div
                key={a.initials}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#0a0a0a",
                  background: a.bg,
                  border: "2px solid #0a0a0a",
                  marginLeft: i === 0 ? 0 : -8,
                }}
              >
                {a.initials}
              </div>
            ))}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#94a3b8",
                background: "rgba(255,255,255,0.1)",
                border: "2px solid #0a0a0a",
                marginLeft: -8,
              }}
            >
              +5
            </div>
          </div>
        </BentoGridItem>

        <BentoGridItem index={4}>
          <Icon color="#ec4899">{"\u2665"}</Icon>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Notifications
          </h3>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#94a3b8", margin: 0 }}>
            Push, email, and in-app alerts.
          </p>
        </BentoGridItem>
      </BentoGrid>
    </div>
  );
}
