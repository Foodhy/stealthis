import { useRef, useEffect, useCallback, useState } from "react";

interface Globe3DProps {
  dotCount?: number;
  dotRadius?: number;
  autoRotateSpeed?: number;
  color?: { r: number; g: number; b: number };
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const PERSPECTIVE = 600;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function generateFibonacciSphere(count: number): Point3D[] {
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

export function Globe3D({
  dotCount = 800,
  dotRadius = 1.8,
  autoRotateSpeed = 0.003,
  color = { r: 6, g: 182, b: 212 },
  className = "",
}: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef({ y: 0, x: 0.3 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, autoRotate: true });
  const pointsRef = useRef<Point3D[]>(generateFibonacciSphere(dotCount));

  useEffect(() => {
    pointsRef.current = generateFibonacciSphere(dotCount);
  }, [dotCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let dragTimeout: ReturnType<typeof setTimeout>;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.parentElement?.clientWidth || window.innerWidth;
      const h = canvas!.parentElement?.clientHeight || window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const radius = Math.min(w, h) * 0.3;

      ctx!.clearRect(0, 0, w, h);

      // Glow
      const grad = ctx!.createRadialGradient(w / 2, h / 2, radius * 0.2, w / 2, h / 2, radius * 1.2);
      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`);
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);

      const rot = rotRef.current;
      if (dragRef.current.autoRotate && !dragRef.current.active) {
        rot.y += autoRotateSpeed;
      }

      const projected = pointsRef.current.map((p) => {
        const r = rotatePoint(p, rot.y, rot.x);
        const scale = PERSPECTIVE / (PERSPECTIVE + r.z * radius);
        return { x: r.x * radius * scale + w / 2, y: r.y * radius * scale + h / 2, scale, z: r.z };
      });
      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const alpha = Math.max(0.08, (p.z + 1) / 2);
        const ds = dotRadius * p.scale;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, ds, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx!.fill();

        if (p.z > 0.3) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, ds * 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.15})`;
          ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    const onDown = (x: number, y: number) => {
      dragRef.current = { ...dragRef.current, active: true, lastX: x, lastY: y, autoRotate: false };
      clearTimeout(dragTimeout);
    };
    const onMove = (x: number, y: number) => {
      if (!dragRef.current.active) return;
      const dx = x - dragRef.current.lastX;
      const dy = y - dragRef.current.lastY;
      rotRef.current.y += dx * 0.005;
      rotRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotRef.current.x + dy * 0.005));
      dragRef.current.lastX = x;
      dragRef.current.lastY = y;
    };
    const onUp = () => {
      dragRef.current.active = false;
      dragTimeout = setTimeout(() => { dragRef.current.autoRotate = true; }, 2000);
    };

    const md = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const ts = (e: TouchEvent) => onDown(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);

    canvas.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", ts, { passive: true });
    canvas.addEventListener("touchmove", tm, { passive: true });
    canvas.addEventListener("touchend", onUp);

    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(dragTimeout);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", ts);
      canvas.removeEventListener("touchmove", tm);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [dotCount, dotRadius, autoRotateSpeed, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", cursor: "grab" }}
    />
  );
}

// Demo usage
export default function Globe3DDemo() {
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
      <Globe3D dotCount={800} color={{ r: 6, g: 182, b: 212 }} />
      <div
        style={{
          position: "absolute",
          top: "12%",
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
            background: "linear-gradient(135deg, #a5f3fc 0%, #06b6d4 50%, #0891b2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          3D Globe
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
          }}
        >
          Drag to explore — pure canvas, no libraries
        </p>
      </div>
    </div>
  );
}
