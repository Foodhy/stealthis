import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

interface AuroraTextProps {
  children: ReactNode;
  colors?: [string, string, string];
  speed?: string;
  className?: string;
}

export function AuroraText({
  children,
  colors = ["#00ff87", "#7c3aed", "#00d4ff"],
  speed = "6s",
  className = "",
}: AuroraTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    let animationFrameId: number;

    const defaultColors = [
      "rgba(0, 255, 135, 0.4)",
      "rgba(124, 58, 237, 0.4)",
      "rgba(0, 212, 255, 0.4)",
    ];

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const w = canvas!.width;
      const h = canvas!.height;

      // Draw flowing aurora bands
      for (let i = 0; i < 3; i++) {
        const offset = i * 1.2;
        ctx!.beginPath();
        ctx!.moveTo(0, h * 0.5);
        for (let x = 0; x <= w; x += 4) {
          const y =
            h * 0.5 +
            Math.sin((x / w) * Math.PI * 2 + t * 0.8 + offset) * 30 +
            Math.sin((x / w) * Math.PI * 3 + t * 1.2 + offset) * 20;
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(w, h);
        ctx!.lineTo(0, h);
        ctx!.closePath();

        ctx!.fillStyle = defaultColors[i];
        ctx!.fill();
      }

      t += 0.015;
      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const textStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    backgroundImage: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 33%, ${colors[2]} 66%, ${colors[0]} 100%)`,
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: `aurora-shift ${speed} ease-in-out infinite`,
  };

  const glowStyle: CSSProperties = {
    ...textStyle,
    position: "absolute",
    inset: 0,
    zIndex: 0,
    filter: "blur(28px) brightness(1.5)",
    opacity: 0.6,
    animationDelay: "-0.5s",
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <>
      <style>{`
        @keyframes aurora-shift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-text-component, .aurora-glow-component { animation: none !important; }
        }
      `}</style>
      <span style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            opacity: 0.3,
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />
        <span className={`aurora-glow-component ${className}`} style={glowStyle} aria-hidden="true">
          {children}
        </span>
        <span className={`aurora-text-component ${className}`} style={textStyle}>
          {children}
        </span>
      </span>
    </>
  );
}

// Demo usage
export default function AuroraTextDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          <AuroraText>Aurora Borealis</AuroraText>
        </h1>
        <p
          style={{
            marginTop: "1.5rem",
            color: "#666",
            fontSize: "1rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          Northern lights flowing through text
        </p>
      </div>
    </div>
  );
}
