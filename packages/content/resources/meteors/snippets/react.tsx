import { useMemo } from "react";

interface MeteorsProps {
  count?: number;
  minDuration?: number;
  maxDuration?: number;
  minLength?: number;
  maxLength?: number;
  className?: string;
}

interface MeteorData {
  top: number;
  left: number;
  duration: number;
  delay: number;
  length: number;
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateMeteors(
  count: number,
  minDuration: number,
  maxDuration: number,
  minLength: number,
  maxLength: number
): MeteorData[] {
  return Array.from({ length: count }, () => ({
    top: randomRange(-10, 80),
    left: randomRange(10, 110),
    duration: randomRange(minDuration, maxDuration),
    delay: randomRange(0, 10),
    length: randomRange(minLength, maxLength),
  }));
}

const meteorKeyframes = `
  @keyframes meteorFall {
    0% { opacity: 0; transform: rotate(215deg) translateX(0); }
    5% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; transform: rotate(215deg) translateX(-120vh); }
  }
`;

export function Meteors({
  count = 20,
  minDuration = 2,
  maxDuration = 6,
  minLength = 80,
  maxLength = 200,
  className = "",
}: MeteorsProps) {
  const meteors = useMemo(
    () => generateMeteors(count, minDuration, maxDuration, minLength, maxLength),
    [count, minDuration, maxDuration, minLength, maxLength]
  );

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <style>{meteorKeyframes}</style>
      {meteors.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${m.top}%`,
            left: `${m.left}%`,
            width: m.length,
            height: 1,
            borderRadius: 999,
            transform: "rotate(215deg)",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(148,163,184,0.3) 20%, rgba(255,255,255,0.8) 100%)",
            animation: `meteorFall ${m.duration}s linear infinite`,
            animationDelay: `${m.delay}s`,
            opacity: 0,
          }}
        >
          {/* Glowing head */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 6px 2px rgba(255,255,255,0.8), 0 0 12px 4px rgba(148,163,184,0.4)",
            }}
          />
          {/* Glow trail */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              width: "60%",
              height: 3,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.08) 40%, rgba(255,255,255,0.15) 100%)",
              filter: "blur(1px)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Demo usage
export default function MeteorsDemo() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(180deg, #0a0a0a 0%, #0f172a 50%, #0a0a0a 100%)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Star field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: [
            "radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.3) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.5) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.2) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.4) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.3) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.2) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,0.5) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.3) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.4) 0%, transparent 100%)",
          ].join(","),
        }}
      />
      <Meteors count={20} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", pointerEvents: "none" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Meteors
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
          }}
        >
          Shooting stars streaking across the night sky
        </p>
      </div>
    </div>
  );
}
