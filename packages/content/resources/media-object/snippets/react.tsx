import { ReactNode } from "react";

interface MediaObjectProps {
  avatar: string;
  avatarColor?: string;
  title: string;
  time?: string;
  content: string;
  actions?: string[];
  onAction?: (action: string) => void;
  children?: ReactNode;
  small?: boolean;
}

export function MediaObject({
  avatar,
  avatarColor = "#38bdf8",
  title,
  time,
  content,
  actions = [],
  onAction,
  children,
  small = false,
}: MediaObjectProps) {
  const avatarSize = small ? 32 : 40;
  const fontSize = small ? "0.6875rem" : "0.75rem";

  return (
    <div
      style={{
        display: "flex",
        gap: "0.875rem",
        padding: "1rem",
        background: small ? "rgba(255,255,255,0.02)" : "#141414",
        border: small ? "1px solid #1a1a1a" : "1px solid #1e1e1e",
        borderLeft: small ? "2px solid #2a2a2a" : "1px solid #1e1e1e",
        borderRadius: small ? "0 0.75rem 0.75rem 0" : "0.75rem",
        marginTop: small ? "0.875rem" : 0,
      }}
    >
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 700,
          color: "#0a0a0a",
          background: avatarColor,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        {avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f2f6ff" }}>
            {title}
          </span>
          {time && (
            <span style={{ fontSize: "0.75rem", color: "#4a4a4a" }}>{time}</span>
          )}
        </div>
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#94a3b8", margin: 0 }}>
          {content}
        </p>
        {actions.length > 0 && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            {actions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onAction?.(a)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  color: "#4a4a4a",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* Demo */
export default function MediaObjectDemo() {
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
      <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
          Media Object
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
          Avatar + content layout with nested replies.
        </p>

        {/* Post 1 with nested replies */}
        <MediaObject
          avatar="AK"
          avatarColor="#38bdf8"
          title="Alex Kim"
          time="2 hours ago"
          content="Just shipped the new dashboard redesign. The dark mode looks incredible with the glass morphism cards."
          actions={["Reply", "Like", "Share"]}
        >
          <MediaObject
            small
            avatar="SR"
            avatarColor="#22c55e"
            title="Sara Rivera"
            time="1 hour ago"
            content="Looks amazing! Did you use the new backdrop-filter approach for the cards?"
            actions={["Reply", "Like"]}
          >
            <MediaObject
              small
              avatar="AK"
              avatarColor="#38bdf8"
              title="Alex Kim"
              time="45 min ago"
              content="Yes! backdrop-filter with saturate(1.6) gives a really nice effect on dark backgrounds."
              actions={["Reply", "Like"]}
            />
          </MediaObject>
        </MediaObject>

        {/* Post 2 with a reply */}
        <MediaObject
          avatar="JD"
          avatarColor="#a855f7"
          title="Jordan Doe"
          time="5 hours ago"
          content="Anyone have experience with the new View Transitions API? Trying to implement cross-page animations."
          actions={["Reply", "Like", "Share"]}
        >
          <MediaObject
            small
            avatar="MP"
            avatarColor="#f59e0b"
            title="Morgan Park"
            time="3 hours ago"
            content="Check out the Astro docs section on View Transitions -- great examples for MPA setups."
            actions={["Reply", "Like"]}
          />
        </MediaObject>

        {/* Post 3 — simple */}
        <MediaObject
          avatar="TN"
          avatarColor="#ef4444"
          title="Taylor Nguyen"
          time="1 day ago"
          content="Published a new blog post on CSS container queries and how they change responsive design patterns. Link in bio."
          actions={["Reply", "Like", "Share"]}
        />
      </div>
    </div>
  );
}
