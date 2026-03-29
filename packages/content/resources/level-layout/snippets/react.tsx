import { ReactNode, CSSProperties } from "react";

interface LevelProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
  variant?: "default" | "card" | "footer";
}

export function Level({ left, center, right, children, style, variant = "default" }: LevelProps) {
  const bg = variant === "footer" ? "transparent" : "#141414";
  const border = variant === "footer" ? "1px solid #1a1a1a" : "1px solid #1e1e1e";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: children ? "space-around" : "space-between",
        gap: "1rem",
        padding: variant === "footer" ? "0.625rem 1rem" : "0.75rem 1rem",
        background: bg,
        border,
        borderRadius: "0.75rem",
        ...style,
      }}
    >
      {children ? (
        children
      ) : (
        <>
          {left && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                justifyContent: "flex-start",
              }}
            >
              {left}
            </div>
          )}
          {center && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              {center}
            </div>
          )}
          {right && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              {right}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface LevelItemProps {
  value: string;
  label: string;
}

export function LevelItem({ value, label }: LevelItemProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.125rem",
      }}
    >
      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f2f6ff" }}>{value}</span>
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 500,
          color: "#4a4a4a",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* Demo */
export default function LevelLayoutDemo() {
  const linkStyle: CSSProperties = {
    fontSize: "0.8125rem",
    color: "#94a3b8",
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnStyle: CSSProperties = {
    background: "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.2)",
    padding: "0.4rem 0.875rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    fontFamily: "inherit",
    borderRadius: "0.5rem",
    cursor: "pointer",
  };

  const btnSmStyle: CSSProperties = {
    ...btnStyle,
    padding: "0.25rem 0.625rem",
    fontSize: "0.75rem",
  };

  const badgeStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.625rem",
    fontSize: "0.6875rem",
    fontWeight: 600,
    color: "#38bdf8",
    background: "rgba(56,189,248,0.1)",
    borderRadius: "999px",
  };

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
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
            Level Layout
          </h1>
          <p style={{ color: "#475569", fontSize: "0.875rem" }}>
            Horizontal alignment with left/center/right slots.
          </p>
        </div>

        <Section label="Navigation Bar">
          <Level
            left={
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#38bdf8",
                  letterSpacing: "-0.02em",
                }}
              >
                Stealthis
              </span>
            }
            center={
              <>
                <span style={linkStyle}>Home</span>
                <span style={linkStyle}>Library</span>
                <span style={linkStyle}>Docs</span>
              </>
            }
            right={<button style={btnStyle}>Sign In</button>}
          />
        </Section>

        <Section label="Stats Row">
          <Level>
            <LevelItem value="128" label="Components" />
            <LevelItem value="2.4k" label="Downloads" />
            <LevelItem value="56" label="Contributors" />
            <LevelItem value="4.9" label="Rating" />
          </Level>
        </Section>

        <Section label="Card Header">
          <Level
            left={
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f2f6ff" }}>
                Recent Activity
              </h3>
            }
            right={
              <>
                <span style={badgeStyle}>12 new</span>
                <button style={btnSmStyle}>View All</button>
              </>
            }
          />
        </Section>

        <Section label="Footer">
          <Level
            variant="footer"
            left={
              <span style={{ fontSize: "0.8125rem", color: "#4a4a4a" }}>&copy; 2026 Stealthis</span>
            }
            right={
              <>
                <span style={{ fontSize: "0.75rem", color: "#4a4a4a", cursor: "pointer" }}>
                  Privacy
                </span>
                <span style={{ fontSize: "0.75rem", color: "#4a4a4a", cursor: "pointer" }}>
                  Terms
                </span>
                <span style={{ fontSize: "0.75rem", color: "#4a4a4a", cursor: "pointer" }}>
                  Contact
                </span>
              </>
            }
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
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
