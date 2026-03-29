import { useState, useRef, useCallback, useEffect } from "react";

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export default function SpringPhysics() {
  const [config, setConfig] = useState<SpringConfig>({ stiffness: 180, damping: 12, mass: 1 });
  const areaRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const velBarRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    posX: 0,
    posY: 0,
    velX: 0,
    velY: 0,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
  });

  const configRef = useRef(config);
  configRef.current = config;

  // Animation loop
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;
      const s = stateRef.current;
      const c = configRef.current;

      if (!s.isDragging) {
        const fx = -c.stiffness * s.posX - c.damping * s.velX;
        const fy = -c.stiffness * s.posY - c.damping * s.velY;
        s.velX += (fx / c.mass) * dt;
        s.velY += (fy / c.mass) * dt;
        s.posX += s.velX * dt;
        s.posY += s.velY * dt;

        if (
          Math.abs(s.posX) < 0.01 &&
          Math.abs(s.posY) < 0.01 &&
          Math.abs(s.velX) < 0.01 &&
          Math.abs(s.velY) < 0.01
        ) {
          s.posX = 0;
          s.posY = 0;
          s.velX = 0;
          s.velY = 0;
        }
      }

      if (ballRef.current) {
        ballRef.current.style.transform = `translate(calc(-50% + ${s.posX}px), calc(-50% + ${s.posY}px))`;
      }

      if (lineRef.current) {
        const dist = Math.sqrt(s.posX * s.posX + s.posY * s.posY);
        const angle = Math.atan2(s.posY, s.posX) * (180 / Math.PI);
        lineRef.current.style.width = `${dist}px`;
        lineRef.current.style.transform = `rotate(${angle}deg)`;
      }

      if (velBarRef.current) {
        const speed = Math.sqrt(s.velX * s.velX + s.velY * s.velY);
        velBarRef.current.style.width = `${Math.min(speed / 8, 100)}%`;
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pointer events
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.velX = 0;
    s.velY = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      s.dragOffsetX = e.clientX - rect.left - rect.width / 2 - s.posX;
      s.dragOffsetY = e.clientY - rect.top - rect.height / 2 - s.posY;
    }
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging || !areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      s.posX = e.clientX - rect.left - rect.width / 2 - s.dragOffsetX;
      s.posY = e.clientY - rect.top - rect.height / 2 - s.dragOffsetY;
    };
    const onUp = () => {
      stateRef.current.isDragging = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const sliders: { key: keyof SpringConfig; label: string; min: number; max: number }[] = [
    { key: "stiffness", label: "Stiffness", min: 20, max: 500 },
    { key: "damping", label: "Damping", min: 1, max: 40 },
    { key: "mass", label: "Mass", min: 1, max: 10 },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e4e4e7",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f4f4f5" }}>Spring Physics</h2>
          <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.25rem" }}>
            Drag the ball and release — it springs back with real physics
          </p>
        </div>

        <div
          ref={areaRef}
          style={{
            width: "100%",
            height: 340,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "1rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Origin dot */}
          <div
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "rgba(109,40,217,0.3)",
              border: "2px solid rgba(109,40,217,0.5)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
          {/* Spring line */}
          <div
            ref={lineRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
              height: 2,
              background: "linear-gradient(90deg, rgba(109,40,217,0.4), rgba(109,40,217,0.1))",
              pointerEvents: "none",
              borderRadius: 1,
              width: 0,
            }}
          />
          {/* Ball */}
          <div
            ref={ballRef}
            onPointerDown={onPointerDown}
            style={{
              position: "absolute",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #a78bfa, #6d28d9)",
              boxShadow: "0 0 30px rgba(109,40,217,0.4), 0 0 60px rgba(109,40,217,0.15)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "grab",
              userSelect: "none",
              touchAction: "none",
              display: "grid",
              placeItems: "center",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.05em",
            }}
          >
            DRAG
          </div>
        </div>

        {/* Velocity bar */}
        <div
          style={{
            width: "100%",
            height: 4,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            ref={velBarRef}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #6d28d9, #a78bfa)",
              borderRadius: 2,
              width: "0%",
              transition: "width 0.05s",
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sliders.map(({ key, label, min, max }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#71717a",
                  minWidth: 80,
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
                  flex: 1,
                  WebkitAppearance: "none",
                  appearance: "none" as never,
                  height: 4,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  outline: "none",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#a78bfa",
                  minWidth: 40,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {config[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
