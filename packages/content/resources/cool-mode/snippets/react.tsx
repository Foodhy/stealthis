import { useEffect, useRef, useCallback } from "react";

interface CoolModeProps {
  emojis?: string[];
  particleCount?: number;
  gravity?: number;
  fadeSpeed?: number;
  children: React.ReactNode;
}

interface Particle {
  el: HTMLSpanElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
}

const DEFAULT_EMOJIS = [
  "\u2728", "\u2B50", "\u2764\uFE0F", "\uD83D\uDD25", "\uD83C\uDF89",
  "\uD83C\uDF1F", "\uD83D\uDCAB", "\uD83C\uDF08", "\uD83D\uDE80", "\uD83C\uDF88",
  "\uD83C\uDF81", "\uD83C\uDF82", "\uD83C\uDF86", "\uD83C\uDF87", "\u2604\uFE0F",
];

export function CoolMode({
  emojis = DEFAULT_EMOJIS,
  particleCount = 15,
  gravity = 0.12,
  fadeSpeed = 0.015,
  children,
}: CoolModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRunningRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  const animate = useCallback(() => {
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += gravity;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= fadeSpeed;
      p.rotation += p.rotationSpeed;

      if (p.opacity <= 0) {
        p.el.parentNode?.removeChild(p.el);
        particles.splice(i, 1);
        continue;
      }

      p.el.style.transform = `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`;
      p.el.style.left = `${p.x}px`;
      p.el.style.top = `${p.y}px`;
      p.el.style.opacity = String(p.opacity);
    }

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      animRunningRef.current = false;
    }
  }, [gravity, fadeSpeed]);

  const spawnParticles = useCallback(
    (x: number, y: number) => {
      for (let i = 0; i < particleCount; i++) {
        const el = document.createElement("span");
        el.style.position = "fixed";
        el.style.pointerEvents = "none";
        el.style.zIndex = "9999";
        el.style.lineHeight = "1";
        el.style.userSelect = "none";
        el.style.willChange = "transform, opacity";
        el.style.fontSize = `${14 + Math.random() * 16}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(el);

        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;

        particlesRef.current.push({
          el,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          opacity: 1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          scale: 0.5 + Math.random() * 0.8,
        });
      }

      if (!animRunningRef.current) {
        animRunningRef.current = true;
        animFrameRef.current = requestAnimationFrame(animate);
      }
    },
    [emojis, particleCount, animate]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      spawnParticles(e.clientX, e.clientY);
    };

    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
      cancelAnimationFrame(animFrameRef.current);
      // Clean up remaining particles
      for (const p of particlesRef.current) {
        p.el.parentNode?.removeChild(p.el);
      }
      particlesRef.current = [];
    };
  }, [spawnParticles]);

  return <div ref={containerRef}>{children}</div>;
}

// Demo usage
export default function CoolModeDemo() {
  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "white",
    transition: "all 0.2s",
  };

  return (
    <CoolMode>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#0a0a0a",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #ef4444 70%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Cool Mode
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)" }}>
            Click anywhere for emoji explosions!
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button style={{ ...btnBase, background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.3)" }}>
              <span>{"\u2764\uFE0F"}</span> Like
            </button>
            <button style={{ ...btnBase, background: "rgba(250,204,21,0.12)", borderColor: "rgba(250,204,21,0.3)" }}>
              <span>{"\u2B50"}</span> Star
            </button>
            <button style={{ ...btnBase, background: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.3)" }}>
              <span>{"\uD83C\uDF89"}</span> Party
            </button>
          </div>
        </div>
      </div>
    </CoolMode>
  );
}
