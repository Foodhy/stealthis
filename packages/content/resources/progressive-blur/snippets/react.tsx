import { type CSSProperties, type ReactNode } from "react";

interface ProgressiveBlurProps {
  children: ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  blurHeight?: number;
  layers?: number;
  maxBlur?: number;
  className?: string;
  style?: CSSProperties;
}

export function ProgressiveBlur({
  children,
  direction = "bottom",
  blurHeight = 200,
  layers = 6,
  maxBlur = 20,
  className = "",
  style = {},
}: ProgressiveBlurProps) {
  const isVertical = direction === "top" || direction === "bottom";

  const containerStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  const overlayStyle: CSSProperties = {
    position: "absolute",
    zIndex: 10,
    pointerEvents: "none",
    display: "flex",
    ...(isVertical
      ? {
          left: 0,
          right: 0,
          height: blurHeight,
          flexDirection: direction === "bottom" ? "column" : "column-reverse",
          ...(direction === "bottom" ? { bottom: 0 } : { top: 0 }),
        }
      : {
          top: 0,
          bottom: 0,
          width: blurHeight,
          flexDirection: direction === "right" ? "row" : "row-reverse",
          ...(direction === "right" ? { right: 0 } : { left: 0 }),
        }),
  };

  // Exponential blur progression for smooth gradient
  const blurValues = Array.from({ length: layers }, (_, i) => {
    const t = i / (layers - 1);
    return Math.round(maxBlur * Math.pow(t, 2));
  });

  return (
    <div className={className} style={containerStyle}>
      {children}
      <div style={overlayStyle} aria-hidden="true">
        {blurValues.map((blur, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Demo usage
export default function ProgressiveBlurDemo() {
  const items = [
    {
      title: "Design System v4.2",
      desc: "Updated component tokens and added new color primitives for dark mode theming.",
      tag: "Design",
    },
    {
      title: "API Rate Limiting",
      desc: "Implemented sliding window rate limiter with Redis backing store.",
      tag: "Backend",
    },
    {
      title: "Motion Library",
      desc: "Spring-based animation primitives with configurable stiffness and damping.",
      tag: "Animation",
    },
    {
      title: "Edge Caching",
      desc: "Cloudflare Workers KV integration for sub-50ms response times globally.",
      tag: "Infra",
    },
    {
      title: "Accessibility Audit",
      desc: "Full WCAG 2.1 AA compliance pass with automated testing pipeline.",
      tag: "A11y",
    },
    {
      title: "Real-time Sync",
      desc: "WebSocket-based collaborative editing with conflict resolution via CRDTs.",
      tag: "Feature",
    },
  ];

  const cardStyle: CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "1.5rem",
    marginBottom: "1rem",
  };

  const tagStyle: CSSProperties = {
    display: "inline-block",
    background: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "0.25rem 0.75rem",
    borderRadius: 999,
    marginTop: "0.75rem",
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        gap: "4rem",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textAlign: "center",
          paddingTop: "3rem",
        }}
      >
        Progressive Blur
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "rgba(148,163,184,0.8)",
          fontSize: "1.125rem",
          marginTop: "-2rem",
        }}
      >
        Content fades into a smooth blur at the edges
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
          width: "100%",
          maxWidth: 900,
        }}
      >
        {/* Bottom blur */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "rgba(148,163,184,0.5)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}
          >
            Bottom Blur
          </span>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <ProgressiveBlur direction="bottom" style={{ maxWidth: 700 }}>
              <div
                style={{
                  height: 400,
                  overflowY: "auto",
                  padding: "2rem",
                  scrollbarWidth: "thin" as const,
                  scrollbarColor: "rgba(255,255,255,0.1) transparent",
                }}
              >
                {items.map((item) => (
                  <div key={item.title} style={cardStyle}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#f1f5f9",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        color: "rgba(148,163,184,0.7)",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.desc}
                    </p>
                    <span style={tagStyle}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </ProgressiveBlur>
          </div>
        </div>

        {/* Image with bottom blur */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "rgba(148,163,184,0.5)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}
          >
            Image Blur Edge
          </span>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <ProgressiveBlur direction="bottom" blurHeight={150}>
              <div
                style={{
                  height: 300,
                  background:
                    "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 30% 30%, #a78bfa, #4338ca)",
                      boxShadow: "0 0 60px rgba(129,140,248,0.4)",
                    }}
                  />
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    Visual content fades smoothly
                  </p>
                </div>
              </div>
            </ProgressiveBlur>
          </div>
        </div>

        {/* Top blur */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "rgba(148,163,184,0.5)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
            }}
          >
            Top Blur
          </span>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <ProgressiveBlur direction="top" style={{ maxWidth: 700 }}>
              <div
                style={{
                  height: 400,
                  overflowY: "auto",
                  padding: "2rem",
                  scrollbarWidth: "thin" as const,
                  scrollbarColor: "rgba(255,255,255,0.1) transparent",
                }}
              >
                {items.slice(0, 4).map((item) => (
                  <div key={item.title} style={cardStyle}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#f1f5f9",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        color: "rgba(148,163,184,0.7)",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.desc}
                    </p>
                    <span style={tagStyle}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </ProgressiveBlur>
          </div>
        </div>
      </div>
    </div>
  );
}
