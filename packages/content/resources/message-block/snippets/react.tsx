import { useState, useRef, ReactNode } from "react";

type MessageVariant = "info" | "success" | "warning" | "danger";

interface MessageBlockProps {
  variant?: MessageVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
}

const variantStyles: Record<
  MessageVariant,
  { color: string; bg: string; border: string; icon: string }
> = {
  info: {
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.06)",
    border: "rgba(56,189,248,0.12)",
    icon: "\u2139",
  },
  success: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.12)",
    icon: "\u2713",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.12)",
    icon: "\u26A0",
  },
  danger: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.12)",
    icon: "\u2717",
  },
};

export function MessageBlock({
  variant = "info",
  title,
  children,
  onDismiss,
  dismissible = true,
}: MessageBlockProps) {
  const [dismissed, setDismissed] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const v = variantStyles[variant];

  const handleDismiss = () => {
    if (ref.current) {
      ref.current.style.maxHeight = ref.current.offsetHeight + "px";
    }
    setDismissing(true);
    setTimeout(() => {
      setDismissed(true);
      onDismiss?.();
    }, 300);
  };

  if (dismissed) return null;

  return (
    <div
      ref={ref}
      role="alert"
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderLeft: `4px solid ${v.color}`,
        borderRadius: "0.75rem",
        overflow: "hidden",
        transition: "opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease",
        opacity: dismissing ? 0 : 1,
        transform: dismissing ? "translateX(12px) scale(0.98)" : "none",
        maxHeight: dismissing ? 0 : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.625rem",
          padding: "0.875rem 1rem",
        }}
      >
        <span style={{ fontSize: "1rem", color: v.color, flexShrink: 0, lineHeight: 1.5 }}>
          {v.icon}
        </span>

        {title ? (
          <span
            style={{
              flex: 1,
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#f2f6ff",
              lineHeight: 1.5,
            }}
          >
            {title}
          </span>
        ) : (
          <div style={{ flex: 1, fontSize: "0.8125rem", lineHeight: 1.6, color: "#94a3b8" }}>
            {children}
          </div>
        )}

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              color: "#4a4a4a",
              cursor: "pointer",
              fontSize: "1.25rem",
              lineHeight: 1,
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              marginLeft: "auto",
            }}
          >
            &times;
          </button>
        )}
      </div>

      {title && (
        <div
          style={{
            padding: "0 1rem 0.875rem 2.625rem",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
            color: "#94a3b8",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* Demo */
export default function MessageBlockDemo() {
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
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
          Message Block
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Colored message blocks with dismiss animation.
        </p>

        <MessageBlock variant="info" title="New Feature Available">
          We just launched dark mode support across all components. Toggle it from the settings
          panel or use the keyboard shortcut{" "}
          <code
            style={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.06)",
              padding: "0.125rem 0.375rem",
              borderRadius: "0.25rem",
              color: "#f2f6ff",
            }}
          >
            Ctrl+D
          </code>
          .
        </MessageBlock>

        <MessageBlock variant="success" title="Deployment Complete">
          Your application has been successfully deployed to production. All health checks passed
          and the CDN cache has been purged.
        </MessageBlock>

        <MessageBlock variant="warning" title="API Rate Limit">
          You have used 85% of your API quota for this billing period. Consider upgrading your plan
          to avoid service interruptions.
        </MessageBlock>

        <MessageBlock variant="danger" title="Build Failed">
          The production build failed due to a type error in{" "}
          <code
            style={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.06)",
              padding: "0.125rem 0.375rem",
              borderRadius: "0.25rem",
              color: "#f2f6ff",
            }}
          >
            src/components/Dashboard.tsx
          </code>
          . Check the build logs for details.
        </MessageBlock>

        <MessageBlock variant="info">
          This is a compact info message without a separate title. Dismiss it with the button on the
          right.
        </MessageBlock>

        <MessageBlock variant="success" dismissible={false}>
          This success message cannot be dismissed. It stays visible permanently.
        </MessageBlock>
      </div>
    </div>
  );
}
