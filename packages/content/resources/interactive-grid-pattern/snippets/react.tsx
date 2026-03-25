import { useEffect, useRef, useCallback } from "react";

interface InteractiveGridPatternProps {
  cellSize?: number;
  gap?: number;
  cornerRadius?: number;
  illuminationRadius?: number;
  trailRadius?: number;
  glowColor?: [number, number, number];
  className?: string;
}

export function InteractiveGridPattern({
  cellSize = 32,
  gap = 2,
  cornerRadius = 3,
  illuminationRadius = 200,
  trailRadius = 120,
  glowColor = [52, 211, 153],
  className = "",
}: InteractiveGridPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const gridRef = useRef({ cols: 0, rows: 0, dpr: 1 });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const roundRect = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    },
    []
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    gridRef.current = {
      cols: Math.ceil(w / (cellSize + gap)) + 1,
      rows: Math.ceil(h / (cellSize + gap)) + 1,
      dpr,
    };
  }, [cellSize, gap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();

    const [gR, gG, gB] = glowColor;

    function draw() {
      const mouse = mouseRef.current;
      const target = targetRef.current;
      mouse.x = lerp(mouse.x, target.x, 0.15);
      mouse.y = lerp(mouse.y, target.y, 0.15);

      const { cols, rows, dpr } = gridRef.current;
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * (cellSize + gap);
          const y = r * (cellSize + gap);
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;

          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const intensity = Math.max(0, 1 - dist / illuminationRadius);
          const smoothIntensity = intensity * intensity;
          const trailI = Math.max(0, 1 - dist / (illuminationRadius + trailRadius));
          const smoothTrail = trailI * trailI * 0.3;
          const finalIntensity = Math.min(1, smoothIntensity + smoothTrail);

          const alpha = 0.04 + finalIntensity * 0.55;

          if (finalIntensity > 0.01) {
            ctx!.fillStyle = `rgba(${gR}, ${gG}, ${gB}, ${alpha.toFixed(3)})`;
            ctx!.shadowColor = `rgba(${gR}, ${gG}, ${gB}, ${(finalIntensity * 0.6).toFixed(3)})`;
            ctx!.shadowBlur = finalIntensity * 12;
          } else {
            ctx!.fillStyle = "rgba(255, 255, 255, 0.04)";
            ctx!.shadowColor = "transparent";
            ctx!.shadowBlur = 0;
          }

          roundRect(ctx!, x, y, cellSize, cellSize, cornerRadius);
          ctx!.fill();
          ctx!.shadowColor = "transparent";
          ctx!.shadowBlur = 0;

          if (finalIntensity > 0.1) {
            ctx!.strokeStyle = `rgba(${gR}, ${gG}, ${gB}, ${(finalIntensity * 0.3).toFixed(3)})`;
            ctx!.lineWidth = 0.5;
            roundRect(ctx!, x, y, cellSize, cellSize, cornerRadius);
            ctx!.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [cellSize, gap, cornerRadius, illuminationRadius, trailRadius, glowColor, resize, roundRect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: -1000, y: -1000 };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    targetRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  const handleTouchEnd = useCallback(() => {
    targetRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, #0a0a0a 75%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Demo usage
export default function InteractiveGridPatternDemo() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        position: "relative",
      }}
    >
      <InteractiveGridPattern
        cellSize={32}
        illuminationRadius={200}
        glowColor={[52, 211, 153]}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #d1fae5 0%, #34d399 50%, #059669 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Interactive Grid
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Move your mouse to illuminate nearby cells
        </p>
      </div>
    </div>
  );
}
