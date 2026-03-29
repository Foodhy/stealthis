import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";

interface ScrollVelocityTextProps {
  text: string | string[];
  baseSpeed?: number;
  speedMultiplier?: number;
  direction?: "left" | "right";
  className?: string;
  textClassName?: string;
  accentIndices?: number[];
  style?: CSSProperties;
}

export function ScrollVelocityText({
  text,
  baseSpeed = 0.5,
  speedMultiplier = 3,
  direction = "left",
  className = "",
  textClassName = "",
  accentIndices = [],
  style = {},
}: ScrollVelocityTextProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const halfWidthRef = useRef(0);
  const scrollVelRef = useRef(0);
  const smoothVelRef = useRef(0);
  const lastScrollRef = useRef(0);
  const rafRef = useRef<number>(0);

  const texts = Array.isArray(text) ? text : [text];
  const dir = direction === "right" ? 1 : -1;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    lastScrollRef.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      scrollVelRef.current = y - lastScrollRef.current;
      lastScrollRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure after render
    requestAnimationFrame(() => {
      halfWidthRef.current = track.scrollWidth / 2;
    });

    const animate = () => {
      smoothVelRef.current = lerp(smoothVelRef.current, scrollVelRef.current, 0.05);
      scrollVelRef.current = lerp(scrollVelRef.current, 0, 0.05);

      const absVel = Math.abs(smoothVelRef.current);
      const speed = baseSpeed + absVel * speedMultiplier * 0.1;
      const scrollDir = smoothVelRef.current >= 0 ? 1 : -1;

      posRef.current += speed * dir * scrollDir;

      if (Math.abs(posRef.current) >= halfWidthRef.current && halfWidthRef.current > 0) {
        posRef.current = 0;
      }

      if (track) {
        track.style.transform = `translateX(${posRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [baseSpeed, speedMultiplier, dir]);

  const wrapperStyle: CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    padding: "1.5rem 0",
    userSelect: "none",
    ...style,
  };

  const trackStyle: CSSProperties = {
    display: "inline-flex",
    gap: "2rem",
    willChange: "transform",
  };

  const textStyle = (accent: boolean): CSSProperties => ({
    fontSize: "clamp(3rem, 10vw, 8rem)",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: accent ? "rgba(129, 140, 248, 0.25)" : "rgba(255, 255, 255, 0.08)",
    textTransform: "uppercase" as const,
    flexShrink: 0,
    paddingRight: "2rem",
  });

  // Duplicate for seamless loop
  const allTexts = [...texts, ...texts];

  return (
    <div className={className} style={wrapperStyle}>
      <div ref={trackRef} style={trackStyle}>
        {allTexts.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={textClassName}
            style={textStyle(accentIndices.includes(i % texts.length))}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// Demo usage
export default function ScrollVelocityTextDemo() {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;
    let smoothVel = 0;
    let raf: number;

    const onScroll = () => {
      const y = window.scrollY;
      smoothVel = Math.abs(y - lastY);
      lastY = y;
    };

    const tick = () => {
      smoothVel *= 0.95;
      setSpeed(smoothVel);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const sectionStyle: CSSProperties = {
    position: "relative",
    padding: "2rem 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  const blockStyle: CSSProperties = {
    maxWidth: 700,
    margin: "0 auto",
    padding: "6rem 2rem",
    textAlign: "center",
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "400vh",
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
          position: "relative",
          zIndex: 2,
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
          Scroll Velocity Text
        </h1>
        <p style={{ color: "rgba(148, 163, 184, 0.8)", fontSize: "1.125rem" }}>
          Marquee speed reacts to how fast you scroll
        </p>
        <span
          style={{ marginTop: "2rem", color: "rgba(148, 163, 184, 0.5)", fontSize: "0.875rem" }}
        >
          Scroll to see the speed change
        </span>
      </section>

      <div style={sectionStyle}>
        <ScrollVelocityText
          text={["STEAL THIS", "DESIGN", "STEAL THIS", "DESIGN"]}
          direction="left"
          baseSpeed={0.5}
          accentIndices={[1, 3]}
        />
      </div>

      <div style={blockStyle}>
        <h2
          style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}
        >
          Velocity-Driven Animation
        </h2>
        <p style={{ color: "rgba(148,163,184,0.8)", lineHeight: 1.8 }}>
          The marquee text responds to your scroll speed in real time. Scroll faster and the text
          accelerates.
        </p>
      </div>

      <div style={sectionStyle}>
        <ScrollVelocityText
          text={["COMPONENTS", "PATTERNS", "LAYOUTS", "EFFECTS"]}
          direction="right"
          baseSpeed={0.3}
          accentIndices={[1, 3]}
        />
      </div>

      <div style={blockStyle}>
        <h2
          style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1rem" }}
        >
          Smooth Interpolation
        </h2>
        <p style={{ color: "rgba(148,163,184,0.8)", lineHeight: 1.8 }}>
          Linear interpolation ensures smooth transitions. Velocity decays naturally when scrolling
          stops.
        </p>
      </div>

      <div style={sectionStyle}>
        <ScrollVelocityText
          text={["BUILD", "SHIP", "ITERATE", "REPEAT"]}
          direction="left"
          baseSpeed={0.8}
          accentIndices={[0, 2]}
        />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "0.75rem 1.25rem",
          fontSize: "0.8rem",
          color: "rgba(148,163,184,0.7)",
          zIndex: 100,
          backdropFilter: "blur(12px)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        Speed:{" "}
        <span style={{ color: "#818cf8", fontWeight: 700, fontSize: "1rem" }}>
          {speed.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
