import { useState, useRef, useEffect, useCallback } from "react";

interface TrailConfig {
  count: number;
  size: number;
  speed: number;
  color: string;
}

const colorSchemes: Record<string, { base: [number, number, number]; label: string; hex: string }> =
  {
    purple: { base: [167, 139, 250], label: "Purple", hex: "#a78bfa" },
    cyan: { base: [34, 211, 238], label: "Cyan", hex: "#22d3ee" },
    rose: { base: [251, 113, 133], label: "Rose", hex: "#fb7185" },
    green: { base: [74, 222, 128], label: "Green", hex: "#4ade80" },
  };

export default function CursorTrail() {
  const [config, setConfig] = useState<TrailConfig>({
    count: 20,
    size: 12,
    speed: 15,
    color: "purple",
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const configRef = useRef(config);
  configRef.current = config;

  // Create/recreate dots
  useEffect(() => {
    if (!canvasRef.current) return;

    // Clear old dots
    dotsRef.current.forEach((d) => d.remove());
    dotsRef.current = [];
    pointsRef.current = [];

    const { count, size, color } = config;
    const [r, g, b] = colorSchemes[color].base;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const dotSize = size * (1 - t * 0.7);
      const opacity = 1 - t * 0.85;

      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.borderRadius = "50%";
      el.style.pointerEvents = "none";
      el.style.willChange = "transform";
      el.style.zIndex = "5";
      el.style.width = dotSize + "px";
      el.style.height = dotSize + "px";
      el.style.background = `rgba(${r},${g},${b},${opacity})`;
      el.style.boxShadow = `0 0 ${dotSize * 1.5}px rgba(${r},${g},${b},${opacity * 0.5})`;

      canvasRef.current.appendChild(el);
      dotsRef.current.push(el);
      pointsRef.current.push({ x: mouseRef.current.x, y: mouseRef.current.y });
    }
  }, [config.count, config.size, config.color]);

  // Update styles when size/color changes without recreating
  const updateStyles = useCallback(() => {
    const { size, color } = configRef.current;
    const [r, g, b] = colorSchemes[color].base;
    const count = dotsRef.current.length;

    dotsRef.current.forEach((el, i) => {
      const t = i / count;
      const dotSize = size * (1 - t * 0.7);
      const opacity = 1 - t * 0.85;
      el.style.width = dotSize + "px";
      el.style.height = dotSize + "px";
      el.style.background = `rgba(${r},${g},${b},${opacity})`;
      el.style.boxShadow = `0 0 ${dotSize * 1.5}px rgba(${r},${g},${b},${opacity * 0.5})`;
    });
  }, []);

  // Animation loop
  useEffect(() => {
    let raf: number;

    function animate() {
      const { speed, size } = configRef.current;
      const ease = speed / 100;
      const pts = pointsRef.current;
      const dots = dotsRef.current;
      const mouse = mouseRef.current;

      if (pts.length > 0) {
        pts[0].x += (mouse.x - pts[0].x) * ease;
        pts[0].y += (mouse.y - pts[0].y) * ease;
      }

      for (let i = 1; i < pts.length; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * (ease * 0.85);
        pts[i].y += (pts[i - 1].y - pts[i].y) * (ease * 0.85);
      }

      for (let i = 0; i < dots.length; i++) {
        const t = i / dots.length;
        const dotSize = size * (1 - t * 0.7);
        dots[i].style.transform =
          `translate(${pts[i].x - dotSize / 2}px, ${pts[i].y - dotSize / 2}px)`;
      }

      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const sliders: { key: "count" | "size" | "speed"; label: string; min: number; max: number }[] = [
    { key: "count", label: "Count", min: 5, max: 40 },
    { key: "size", label: "Size", min: 4, max: 24 },
    { key: "speed", label: "Speed", min: 5, max: 40 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", overflow: "hidden", cursor: "none" }}>
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Info */}
      <div
        style={{
          position: "fixed",
          top: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#f4f4f5",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Cursor Trail
        </h2>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#52525b",
            marginTop: "0.25rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Move your mouse around — dots follow with lerp interpolation
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "1rem",
          zIndex: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1.25rem",
          cursor: "default",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {sliders.map(({ key, label, min, max }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#52525b",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </span>
            <input
              type="range"
              min={min}
              max={max}
              value={config[key]}
              onChange={(e) => setConfig((c) => ({ ...c, [key]: Number(e.target.value) }))}
              style={{
                width: 80,
                WebkitAppearance: "none",
                appearance: "none" as never,
                height: 3,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                outline: "none",
              }}
            />
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "#52525b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Color
          </span>
          {Object.entries(colorSchemes).map(([key, { hex }]) => (
            <button
              key={key}
              onClick={() => setConfig((c) => ({ ...c, color: key }))}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: hex,
                border: config.color === key ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer",
                transition: "border-color 0.15s, transform 0.15s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Trail container */}
      <div ref={canvasRef} />
    </div>
  );
}
