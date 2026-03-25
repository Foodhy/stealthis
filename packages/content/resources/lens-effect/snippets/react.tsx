import { useRef, useEffect, useCallback, useState, type ReactNode } from "react";

interface LensEffectProps {
  zoom?: number;
  lensSize?: number;
  lerpFactor?: number;
  borderColor?: string;
  children?: ReactNode;
  className?: string;
}

export function LensEffect({
  zoom = 2.5,
  lensSize = 160,
  lerpFactor = 0.15,
  borderColor = "rgba(139, 92, 246, 0.5)",
  children,
  className = "",
}: LensEffectProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const animRef = useRef<number | null>(null);

  const updateClone = useCallback(() => {
    const area = areaRef.current;
    const lens = lensRef.current;
    const content = contentRef.current;
    if (!area || !lens || !content) return;

    if (cloneRef.current) cloneRef.current.remove();

    const clone = content.cloneNode(true) as HTMLDivElement;
    clone.style.position = "absolute";
    clone.style.width = area.clientWidth + "px";
    clone.style.height = area.clientHeight + "px";
    clone.style.transform = `scale(${zoom})`;
    clone.style.transformOrigin = "0 0";
    clone.style.pointerEvents = "none";
    clone.style.top = "0";
    clone.style.left = "0";

    lens.appendChild(clone);
    cloneRef.current = clone;
  }, [zoom]);

  const tick = useCallback(() => {
    const area = areaRef.current;
    const lens = lensRef.current;
    const clone = cloneRef.current;
    if (!area || !lens) return;

    const rect = area.getBoundingClientRect();
    const relX = mouseRef.current.x - rect.left;
    const relY = mouseRef.current.y - rect.top;

    posRef.current.x += (relX - posRef.current.x) * lerpFactor;
    posRef.current.y += (relY - posRef.current.y) * lerpFactor;

    lens.style.left = posRef.current.x + "px";
    lens.style.top = posRef.current.y + "px";

    if (clone) {
      clone.style.transform = `scale(${zoom})`;
      clone.style.left = -(posRef.current.x * zoom - lensSize / 2) + "px";
      clone.style.top = -(posRef.current.y * zoom - lensSize / 2) + "px";
    }

    if (activeRef.current) {
      animRef.current = requestAnimationFrame(tick);
    }
  }, [zoom, lensSize, lerpFactor]);

  const [active, setActive] = useState(false);

  return (
    <div
      ref={areaRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "none",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={() => {
        activeRef.current = true;
        setActive(true);
        updateClone();
        animRef.current = requestAnimationFrame(tick);
      }}
      onMouseMove={(e) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }}
      onMouseLeave={() => {
        activeRef.current = false;
        setActive(false);
        if (animRef.current) cancelAnimationFrame(animRef.current);
      }}
    >
      <div ref={contentRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}
      </div>
      <div
        ref={lensRef}
        style={{
          position: "absolute",
          width: lensSize,
          height: lensSize,
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 30px ${borderColor.replace(/[\d.]+\)$/, "0.2)")}, inset 0 0 20px ${borderColor.replace(/[\d.]+\)$/, "0.05)")}`,
          pointerEvents: "none",
          opacity: active ? 1 : 0,
          transition: "opacity 0.2s ease",
          overflow: "hidden",
          zIndex: 100,
          transform: "translate(-50%, -50%)",
          background: "#111",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

// Demo usage
export default function LensEffectDemo() {
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
      <LensEffect zoom={2.5} lensSize={160}>
        <div
          style={{
            width: "min(600px, 90vw)",
            height: "min(400px, 60vh)",
            background: "#111",
            position: "relative",
          }}
        >
          {/* Grid pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.75rem" }}>
              Hover to Magnify
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(148,163,184,0.7)",
                maxWidth: 400,
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}
            >
              Move your cursor over this area to see the lens effect in action.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[260, 280, 300, 320, 200, 220, 240, 180, 160].map((hue, i) => (
                <div
                  key={i}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: `hsl(${hue} 60% 50% / 0.3)`,
                    border: `1px solid hsl(${hue} 60% 60% / 0.2)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </LensEffect>
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Lens Effect
        </h1>
        <p style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)", color: "rgba(148,163,184,0.8)" }}>
          Magnifying glass that follows your cursor
        </p>
      </div>
    </div>
  );
}
