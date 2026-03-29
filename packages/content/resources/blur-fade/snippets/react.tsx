import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface BlurFadeProps {
  children: ReactNode;
  blurAmount?: number;
  duration?: number;
  delay?: number;
  yOffset?: number;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

export function BlurFade({
  children,
  blurAmount = 10,
  duration = 800,
  delay = 0,
  yOffset = 20,
  threshold = 0.15,
  className = "",
  style = {},
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const baseStyle: CSSProperties = {
    filter: isVisible ? "blur(0px)" : `blur(${blurAmount}px)`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : `translateY(${yOffset}px)`,
    transition: `filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "filter, opacity, transform",
    ...style,
  };

  return (
    <div ref={ref} className={className} style={baseStyle}>
      {children}
    </div>
  );
}

// Demo usage
export default function BlurFadeDemo() {
  const cards = [
    {
      icon: "\u25C8",
      title: "Performance",
      desc: "Hardware-accelerated CSS transitions keep animations silky smooth at 60fps.",
    },
    {
      icon: "\u25CE",
      title: "Accessible",
      desc: "Uses IntersectionObserver for efficient, non-blocking scroll detection.",
    },
    {
      icon: "\u2726",
      title: "Customizable",
      desc: "Control blur amount, duration, easing, and stagger timing via props.",
    },
    {
      icon: "\u2605",
      title: "Zero Dependencies",
      desc: "Pure React with no external libraries required.",
    },
    {
      icon: "\u2699",
      title: "Easy Setup",
      desc: "Just wrap any content in the BlurFade component.",
    },
    {
      icon: "\u2728",
      title: "One-time Trigger",
      desc: "Elements are unobserved after reveal, keeping things lightweight.",
    },
  ];

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
          Blur Fade
        </h1>
        <p style={{ color: "rgba(148, 163, 184, 0.8)", fontSize: "1.125rem" }}>
          Elements fade from blurred to sharp as you scroll
        </p>
        <span
          style={{ marginTop: "2rem", color: "rgba(148, 163, 184, 0.5)", fontSize: "0.875rem" }}
        >
          Scroll down to see the effect
        </span>
      </section>

      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "4rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
        }}
      >
        <BlurFade>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f1f5f9" }}>Smooth Reveal</h2>
        </BlurFade>
        <BlurFade delay={100}>
          <p style={{ color: "rgba(148, 163, 184, 0.8)", lineHeight: 1.8, maxWidth: 640 }}>
            Content emerges from a soft blur as it enters the viewport, creating a polished and
            modern scroll experience.
          </p>
        </BlurFade>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {cards.slice(0, 3).map((card, i) => (
            <BlurFade key={card.title} delay={i * 120}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "2px solid rgba(99,102,241,0.15)",
                  borderRadius: 16,
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(99,102,241,0.15)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "1rem",
                    fontSize: "1.5rem",
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    color: "#f1f5f9",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: "rgba(148,163,184,0.8)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                  {card.desc}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f1f5f9" }}>
            Cascading Effect
          </h2>
        </BlurFade>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {cards.slice(3).map((card, i) => (
            <BlurFade key={card.title} delay={i * 120}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "2px solid rgba(99,102,241,0.15)",
                  borderRadius: 16,
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "rgba(99,102,241,0.15)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "1rem",
                    fontSize: "1.5rem",
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    color: "#f1f5f9",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: "rgba(148,163,184,0.8)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                  {card.desc}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>
    </div>
  );
}
