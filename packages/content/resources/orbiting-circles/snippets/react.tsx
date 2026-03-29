import { useMemo } from "react";

interface OrbitItem {
  content: React.ReactNode;
}

interface OrbitRingConfig {
  items: OrbitItem[];
  radius: number;
  duration: number;
  reverse?: boolean;
}

interface OrbitingCirclesProps {
  rings?: OrbitRingConfig[];
  centerContent?: React.ReactNode;
  className?: string;
}

const defaultCenter = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const defaultRings: OrbitRingConfig[] = [
  {
    items: [{ content: "\u2666" }, { content: "\u2663" }],
    radius: 80,
    duration: 8,
  },
  {
    items: [{ content: "\u2605" }, { content: "\u2665" }, { content: "\u2726" }],
    radius: 130,
    duration: 15,
    reverse: true,
  },
  {
    items: [
      { content: "\u263C" },
      { content: "\u2736" },
      { content: "\u273F" },
      { content: "\u263E" },
    ],
    radius: 190,
    duration: 22,
  },
];

export function OrbitingCircles({
  rings = defaultRings,
  centerContent = defaultCenter,
  className = "",
}: OrbitingCirclesProps) {
  const keyframesInjected = useMemo(() => {
    const styleId = "orbiting-circles-keyframes";
    if (typeof document !== "undefined" && !document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes oc-counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    return true;
  }, []);

  const containerSize = Math.max(...rings.map((r) => r.radius)) * 2 + 60;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: containerSize,
        height: containerSize,
      }}
    >
      {/* Center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "grid",
          placeItems: "center",
          color: "white",
          boxShadow: "0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2)",
          zIndex: 10,
        }}
      >
        {centerContent}
      </div>

      {/* Ring guides */}
      {rings.map((ring, ri) => (
        <div
          key={`ring-${ri}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: ring.radius * 2,
            height: ring.radius * 2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Orbiting items */}
      {rings.map((ring, ri) =>
        ring.items.map((item, ii) => {
          const startAngle = (360 / ring.items.length) * ii;
          const dir = ring.reverse ? "reverse" : "normal";
          const counterDir = ring.reverse ? "reverse" : "normal";
          const size = ring.radius > 150 ? 42 : 36;
          const animName = `oc-orbit-${ri}`;

          return (
            <div
              key={`${ri}-${ii}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                animation: `${animName} ${ring.duration}s linear infinite ${dir}`,
                // @ts-ignore -- inline keyframes via style
                ["--start-angle" as string]: `${startAngle}deg`,
                ["--radius" as string]: `${ring.radius}px`,
              }}
            >
              <span
                style={{
                  fontSize: ring.radius > 150 ? 16 : 14,
                  color: "rgba(199,210,254,0.9)",
                  lineHeight: 1,
                  animation: `oc-counter-spin ${ring.duration}s linear infinite ${counterDir}`,
                }}
              >
                {item.content}
              </span>
              <style>{`
                @keyframes ${animName} {
                  from { transform: rotate(var(--start-angle, 0deg)) translateX(var(--radius, 100px)); }
                  to { transform: rotate(calc(var(--start-angle, 0deg) + 360deg)) translateX(var(--radius, 100px)); }
                }
              `}</style>
            </div>
          );
        })
      )}
    </div>
  );
}

// Demo usage
export default function OrbitingCirclesDemo() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <OrbitingCircles />
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #e0e7ff 0%, #a78bfa 50%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Orbiting Circles
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)" }}>
          Pure CSS orbital animation with multiple rings
        </p>
      </div>
    </div>
  );
}
