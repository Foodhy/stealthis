import { useState, ReactNode, useCallback } from "react";

interface CollapsibleProps {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  iconBg?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
}

function Collapsible({
  children,
  defaultOpen = false,
  icon,
  iconBg = "rgba(59,130,246,0.12)",
  iconColor = "#60a5fa",
  title = "Section",
  subtitle,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${open ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "0.875rem",
        overflow: "hidden",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Trigger */}
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1rem 1.25rem",
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0 }}>
          {icon && (
            <div
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: "0.5rem",
                display: "grid",
                placeItems: "center",
                background: iconBg,
                color: iconColor,
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
            <strong style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0" }}>
              {title}
            </strong>
            {subtitle && (
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{subtitle}</span>
            )}
          </div>
        </div>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{
            flexShrink: 0,
            color: open ? "#6366f1" : "#475569",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), color 0.15s ease",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Panel */}
      <div
        aria-hidden={!open}
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "0 1.25rem 1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: "1rem",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo
const InfoIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const ShieldIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

export default function CollapsibleDemo() {
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
      <div style={{ width: "min(560px, 100%)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700 }}>Settings</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Collapsible
            trigger={null}
            defaultOpen
            icon={InfoIcon}
            iconBg="rgba(59,130,246,0.12)"
            iconColor="#60a5fa"
            title="General Information"
            subtitle="Basic project details and metadata"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: "0.375rem" }}>
                  Project Name
                </label>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#e2e8f0",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  My Awesome Project
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: "0.375rem" }}>
                  Description
                </label>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#e2e8f0",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    minHeight: "4rem",
                    lineHeight: 1.5,
                  }}
                >
                  A brief description of your project that helps others understand what it does and why it exists.
                </div>
              </div>
            </div>
          </Collapsible>

          <Collapsible
            trigger={null}
            icon={ShieldIcon}
            iconBg="rgba(168,85,247,0.12)"
            iconColor="#c084fc"
            title="Security"
            subtitle="Authentication and access control"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: "0.375rem" }}>
                  Two-Factor Auth
                </label>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Disabled</span>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: "0.375rem" }}>
                  Session Timeout
                </label>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#e2e8f0",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  30 minutes
                </div>
              </div>
            </div>
          </Collapsible>

          <Collapsible
            trigger={null}
            icon={MailIcon}
            iconBg="rgba(34,197,94,0.12)"
            iconColor="#4ade80"
            title="Notifications"
            subtitle="Email and push notification preferences"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Email Notifications</span>
                <span style={{ fontSize: "0.78rem", color: "#4ade80" }}>Enabled</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Push Notifications</span>
                <span style={{ fontSize: "0.78rem", color: "#4ade80" }}>Enabled</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Weekly Digest</span>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Disabled</span>
              </div>
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
