import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: "rect" | "circle" | "strip";
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

interface ConfettiProps {
  particleCount?: number;
  gravity?: number;
  drag?: number;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
  "#10b981", "#ec4899", "#fde68a", "#60a5fa",
];
const SHAPES: Particle["shape"][] = ["rect", "circle", "strip"];

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Confetti({
  particleCount = 150,
  gravity = 0.25,
  drag = 0.98,
  colors = DEFAULT_COLORS,
  className = "",
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size * 0.15, p.size, p.size * 0.3);
      }
      ctx.restore();
    }

    if (particles.length > 0) {
      animRef.current = requestAnimationFrame(tick);
    } else {
      animRef.current = null;
    }
  }, [gravity, drag]);

  const fire = useCallback(
    (x: number, y: number) => {
      for (let i = 0; i < particleCount; i++) {
        const angle = randomRange(0, Math.PI * 2);
        const speed = randomRange(6, 14);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed * randomRange(0.5, 1.5),
          vy: Math.sin(angle) * speed * randomRange(0.5, 1) - 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          size: randomRange(4, 8),
          rotation: randomRange(0, Math.PI * 2),
          rotationSpeed: randomRange(-0.15, 0.15),
          opacity: 1,
          decay: randomRange(0.005, 0.015),
        });
      }
      if (!animRef.current) tick();
    },
    [particleCount, colors, tick]
  );

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
      }}
      data-fire={undefined}
      ref-fire={undefined}
      {...({ "data-component": "confetti" } as any)}
    />
  );

  // Note: to use fire(), lift canvasRef or expose via useImperativeHandle.
  // See the demo below for a practical integration.
}

// Demo usage
export default function ConfettiDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number | null>(null);
  const gravity = 0.25;
  const drag = 0.98;
  const colors = DEFAULT_COLORS;
  const particleCount = 150;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size * 0.15, p.size, p.size * 0.3);
      }
      ctx.restore();
    }

    if (particles.length > 0) {
      animRef.current = requestAnimationFrame(tick);
    } else {
      animRef.current = null;
    }
  }, []);

  const fire = useCallback(
    (x: number, y: number) => {
      for (let i = 0; i < particleCount; i++) {
        const angle = randomRange(0, Math.PI * 2);
        const speed = randomRange(6, 14);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed * randomRange(0.5, 1.5),
          vy: Math.sin(angle) * speed * randomRange(0.5, 1) - 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          size: randomRange(4, 8),
          rotation: randomRange(0, Math.PI * 2),
          rotationSpeed: randomRange(-0.15, 0.15),
          opacity: 1,
          decay: randomRange(0.005, 0.015),
        });
      }
      if (!animRef.current) tick();
    },
    [tick]
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

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
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #ef4444 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Confetti
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
            marginBottom: "2rem",
          }}
        >
          Click the button for a burst of joy
        </p>
        <button
          onClick={handleClick}
          style={{
            padding: "0.875rem 2.5rem",
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "#0a0a0a",
            background: "linear-gradient(135deg, #fde68a, #f59e0b)",
            border: "none",
            borderRadius: "9999px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(245, 158, 11, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(245, 158, 11, 0.3)";
          }}
        >
          Celebrate!
        </button>
      </div>
    </div>
  );
}
