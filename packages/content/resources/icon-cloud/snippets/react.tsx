import { useRef, useEffect, useMemo } from "react";

interface IconCloudProps {
  icons?: string[];
  rotateSpeed?: number;
  perspective?: number;
  tiltSensitivity?: number;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const DEFAULT_ICONS = [
  "\u269B\uFE0F",
  "\u{1F310}",
  "\u26A1",
  "\u{1F4E6}",
  "\u{1F680}",
  "\u{1F3A8}",
  "\u{1F527}",
  "\u{1F4BB}",
  "\u2728",
  "\u{1F50D}",
  "\u{1F4CA}",
  "\u{1F512}",
  "\u2601\uFE0F",
  "\u{1F916}",
  "\u{1F9E9}",
  "\u{1F4A1}",
  "\u{1F525}",
  "\u{1F48E}",
  "\u{1F3AF}",
  "\u{1F30A}",
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function generateSpherePoints(count: number): Point3D[] {
  const pts: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

function rotatePoint(p: Point3D, ry: number, rx: number): Point3D {
  const x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
  const z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
  const y2 = p.y * Math.cos(rx) - z * Math.sin(rx);
  const z2 = p.y * Math.sin(rx) + z * Math.cos(rx);
  return { x, y: y2, z: z2 };
}

export function IconCloud({
  icons = DEFAULT_ICONS,
  rotateSpeed = 0.004,
  perspective = 500,
  tiltSensitivity = 0.0003,
  className = "",
}: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  const rotRef = useRef({ y: 0, x: 0 });
  const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const points = useMemo(() => generateSpherePoints(icons.length), [icons.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tiltRef.current.targetY = (e.clientX - cx) * tiltSensitivity;
      tiltRef.current.targetX = (e.clientY - cy) * tiltSensitivity;
    };

    const onLeave = () => {
      tiltRef.current.targetX = 0;
      tiltRef.current.targetY = 0;
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    function tick() {
      const size = container!.clientWidth / 2;
      rotRef.current.y += rotateSpeed;

      const t = tiltRef.current;
      t.x += (t.targetX - t.x) * 0.05;
      t.y += (t.targetY - t.y) * 0.05;

      const totalRY = rotRef.current.y + t.y;
      const totalRX = rotRef.current.x + t.x;

      for (let i = 0; i < points.length; i++) {
        const el = elementsRef.current[i];
        if (!el) continue;

        const rotated = rotatePoint(points[i], totalRY, totalRX);
        const scale = perspective / (perspective + rotated.z * size);
        const px = rotated.x * size * scale;
        const py = rotated.y * size * scale;
        const opacity = Math.max(0.15, (rotated.z + 1) / 2);
        const s = 0.6 + scale * 0.5;

        el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${s})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(Math.round(scale * 100));
      }

      animId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [points, rotateSpeed, perspective, tiltSensitivity]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: 500,
        height: 500,
        maxWidth: "90vmin",
        maxHeight: "90vmin",
      }}
    >
      {icons.map((icon, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) elementsRef.current[i] = el;
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            fontSize: "2rem",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(4px)",
            willChange: "transform, opacity",
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}

// Demo usage
export default function IconCloudDemo() {
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
      <IconCloud />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
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
          Icon Cloud
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
          }}
        >
          Technology icons orbiting in 3D space
        </p>
      </div>
    </div>
  );
}
