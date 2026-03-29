import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface BoxRevealProps {
  children: ReactNode;
  color?: string;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

export function BoxReveal({
  children,
  color = "#818cf8",
  duration = 700,
  delay = 0,
  threshold = 0.2,
  className = "",
  style = {},
}: BoxRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"hidden" | "covering" | "revealed">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setPhase("covering");
            setTimeout(() => {
              setPhase("revealed");
            }, duration);
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, duration]);

  const durationSec = `${duration}ms`;
  const ease = "cubic-bezier(0.77, 0, 0.175, 1)";

  const wrapperStyle: CSSProperties = {
    position: "relative",
    display: "inline-block",
    overflow: "hidden",
    ...style,
  };

  const contentStyle: CSSProperties = {
    opacity: phase === "hidden" || phase === "covering" ? 0 : 1,
    transition: "opacity 0.01s",
  };

  const boxStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: color,
    zIndex: 2,
    transform: phase === "hidden" ? "scaleX(0)" : phase === "covering" ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: phase === "hidden" || phase === "covering" ? "left center" : "right center",
    transition: `transform ${durationSec} ${ease}`,
  };

  return (
    <div ref={ref} className={className} style={wrapperStyle}>
      <div style={contentStyle}>{children}</div>
      <div style={boxStyle} aria-hidden="true" />
    </div>
  );
}

// Demo usage
export default function BoxRevealDemo() {
  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "300vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <section
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          textAlign: "center",
          padding: "2rem",
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
          }}
        >
          Box Reveal
        </h1>
        <p style={{ color: "rgba(148, 163, 184, 0.8)", fontSize: "1.125rem" }}>
          A colored box slides in and out to reveal content
        </p>
        <span
          style={{ marginTop: "2rem", color: "rgba(148, 163, 184, 0.5)", fontSize: "0.875rem" }}
        >
          Scroll down to see the effect
        </span>
      </section>

      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "4rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <BoxReveal color="#818cf8" delay={0}>
            <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "#818cf8" }}>
              Introducing
            </span>
          </BoxReveal>
          <BoxReveal color="#818cf8" delay={200}>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              Box Reveal Effect
            </h2>
          </BoxReveal>
          <BoxReveal color="#818cf8" delay={400}>
            <p style={{ color: "rgba(148, 163, 184, 0.8)", lineHeight: 1.8, maxWidth: 560 }}>
              A dramatic two-step animation where a colored block sweeps across the element,
              revealing polished content underneath.
            </p>
          </BoxReveal>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <BoxReveal color="#f472b6">
            <h2
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f1f5f9" }}
            >
              Custom Colors
            </h2>
          </BoxReveal>
          <BoxReveal color="#f472b6" delay={200}>
            <p style={{ color: "rgba(148, 163, 184, 0.8)", lineHeight: 1.8, maxWidth: 560 }}>
              Change the reveal color with a simple prop. Match your brand, create emphasis, or use
              different colors for different sections.
            </p>
          </BoxReveal>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <BoxReveal color="#34d399">
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  marginBottom: "0.5rem",
                }}
              >
                Fast
              </h3>
              <p style={{ color: "rgba(148,163,184,0.8)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Pure CSS animations with no JavaScript overhead during the transition.
              </p>
            </div>
          </BoxReveal>
          <BoxReveal color="#fbbf24" delay={200}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  marginBottom: "0.5rem",
                }}
              >
                Flexible
              </h3>
              <p style={{ color: "rgba(148,163,184,0.8)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Works with any content — text, cards, images, or entire sections.
              </p>
            </div>
          </BoxReveal>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <BoxReveal color="#a78bfa">
            <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "#a78bfa" }}>
              Staggered Reveals
            </span>
          </BoxReveal>
          <BoxReveal color="#a78bfa" delay={200}>
            <h2
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f1f5f9" }}
            >
              Cascading Wipe
            </h2>
          </BoxReveal>
          <BoxReveal color="#a78bfa" delay={400}>
            <p style={{ color: "rgba(148, 163, 184, 0.8)", lineHeight: 1.8, maxWidth: 560 }}>
              Elements within the same group automatically stagger their reveals, creating a
              beautiful sequential wipe effect down the page.
            </p>
          </BoxReveal>
        </div>
      </section>
    </div>
  );
}
