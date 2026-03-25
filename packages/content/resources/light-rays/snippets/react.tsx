import { useMemo } from "react";

interface LightRaysProps {
  rayCount?: number;
  color?: string;
  colorBright?: string;
  glowColor?: string;
  speed?: number;
  intensity?: number;
  className?: string;
}

interface RayData {
  angle: number;
  width: number;
  opacity: number;
  delay: number;
  blur: number;
}

function generateRays(count: number, intensity: number): RayData[] {
  const rays: RayData[] = [];
  for (let i = 0; i < count; i++) {
    const baseAngle = -60 + (120 / (count - 1)) * i;
    rays.push({
      angle: baseAngle + (Math.random() - 0.5) * 8,
      width: Math.random() * 80 + 20,
      opacity: (Math.random() * 0.5 + 0.2) * intensity,
      delay: Math.random() * 4,
      blur: Math.random() * 8 + 2,
    });
  }
  return rays;
}

export function LightRays({
  rayCount = 16,
  color = "rgba(251, 191, 36, 0.4)",
  colorBright = "rgba(251, 191, 36, 0.15)",
  glowColor = "rgba(251, 191, 36, 0.3)",
  speed = 4,
  intensity = 1,
  className = "",
}: LightRaysProps) {
  const rays = useMemo(() => generateRays(rayCount, intensity), [rayCount, intensity]);

  const keyframes = `
    @keyframes rayPulse {
      0%, 100% { opacity: var(--ray-opacity); }
      50% { opacity: calc(var(--ray-opacity) * 0.3); }
    }
  `;

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <style>{keyframes}</style>
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "120%",
        }}
      >
        {/* Central glow */}
        <div
          style={{
            position: "absolute",
            top: "-5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor.replace(/[\d.]+\)$/, "0.1)")} 30%, transparent 70%)`,
            filter: "blur(40px)",
            zIndex: 2,
          }}
        />
        {rays.map((ray, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: ray.width,
              height: "100%",
              transformOrigin: "top center",
              transform: `translateX(-50%) rotate(${ray.angle}deg)`,
              background: `linear-gradient(180deg, ${color} 0%, ${colorBright} 30%, transparent 80%)`,
              opacity: ray.opacity,
              animation: `rayPulse ${speed}s ease-in-out infinite`,
              animationDelay: `${ray.delay}s`,
              filter: `blur(${ray.blur}px)`,
              ["--ray-opacity" as any]: ray.opacity,
            }}
          />
        ))}
      </div>
      {/* Edge fade overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 30%, transparent 20%, #0a0a0a 80%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    </div>
  );
}

// Demo usage
export default function LightRaysDemo() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <LightRays
        rayCount={16}
        color="rgba(251, 191, 36, 0.4)"
        colorBright="rgba(251, 191, 36, 0.15)"
        glowColor="rgba(251, 191, 36, 0.3)"
        speed={4}
        intensity={1}
      />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", pointerEvents: "none" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Light Rays
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
          }}
        >
          Atmospheric volumetric lighting effect
        </p>
      </div>
    </div>
  );
}
