import { useEffect, useRef, useCallback } from "react";

interface ParticlesSystemProps {
  count?: number;
  color?: { r: number; g: number; b: number };
  connectionDistance?: number;
  speed?: number;
  mouseRadius?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function ParticlesSystem({
  count = 120,
  color = { r: 99, g: 102, b: 241 },
  connectionDistance = 150,
  speed = 0.4,
  mouseRadius = 180,
  className = "",
}: ParticlesSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const createParticle = useCallback(
    (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed * 2,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }),
    [speed]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas!.width = w;
      canvas!.height = h;
      sizeRef.current = { w, h };
    }

    function init() {
      resize();
      const { w, h } = sizeRef.current;
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(w, h));
      }
    }

    function update() {
      const { w, h } = sizeRef.current;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      const mouseForce = 0.08;
      const maxV = speed * 3;

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius && dist > 0) {
            const force = (mouseRadius - dist) / mouseRadius;
            p.vx += (dx / dist) * force * mouseForce;
            p.vy += (dy / dist) * force * mouseForce;
          }
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
        p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        }
        if (p.x > w) {
          p.x = w;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        }
        if (p.y > h) {
          p.y = h;
          p.vy *= -1;
        }
      }
    }

    function draw() {
      const { w, h } = sizeRef.current;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const { r, g, b } = color;

      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const bp = particles[j];
          const dx = a.x - bp.x;
          const dy = a.y - bp.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.3;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(bp.x, bp.y);
            ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${p.opacity * 0.15})`;
        ctx!.fill();
      }

      if (mouse.active) {
        const gradient = ctx!.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouseRadius
        );
        gradient.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
        gradient.addColorStop(1, "transparent");
        ctx!.beginPath();
        ctx!.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }
    }

    function loop() {
      update();
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    const handleResize = () => {
      resize();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    init();
    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [count, color, connectionDistance, speed, mouseRadius, createParticle]);

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

// Demo usage
export default function ParticlesSystemDemo() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <ParticlesSystem count={120} color={{ r: 99, g: 102, b: 241 }} connectionDistance={150} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 10,
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
            marginBottom: "0.5rem",
          }}
        >
          Particles System
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)" }}>
          Move your mouse to interact with the particles
        </p>
      </div>
    </div>
  );
}
