import { useEffect, useRef, useCallback } from "react";

interface WarpBackgroundProps {
  gridCols?: number;
  gridRows?: number;
  speed?: number;
  amplitudeX?: number;
  amplitudeY?: number;
  frequency?: number;
  color?: [number, number, number];
  className?: string;
}

export function WarpBackground({
  gridCols = 40,
  gridRows = 30,
  speed = 0.0008,
  amplitudeX = 30,
  amplitudeY = 25,
  frequency = 0.06,
  color = [139, 92, 246],
  className = "",
}: WarpBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

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

    sizeRef.current = { width: w, height: h, dpr };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();

    const [cR, cG, cB] = color;

    function getWarpedPoint(col: number, row: number, t: number) {
      const { width, height } = sizeRef.current;
      const baseX = (col / gridCols) * width;
      const baseY = (row / gridRows) * height;

      const dx1 = Math.sin(baseY * frequency + t * 1.3) * amplitudeX;
      const dy1 = Math.cos(baseX * frequency + t * 1.1) * amplitudeY;

      const dx2 = Math.sin(baseX * frequency * 1.5 + baseY * frequency * 0.5 + t * 0.7) * amplitudeX * 0.5;
      const dy2 = Math.cos(baseY * frequency * 1.3 + baseX * frequency * 0.4 + t * 0.9) * amplitudeY * 0.5;

      const dx3 = Math.sin(baseX * frequency * 3 + t * 2.1) * amplitudeX * 0.15;
      const dy3 = Math.cos(baseY * frequency * 2.8 + t * 1.8) * amplitudeY * 0.15;

      return {
        x: baseX + dx1 + dx2 + dx3,
        y: baseY + dy1 + dy2 + dy3,
        displacement: Math.sqrt((dx1 + dx2) ** 2 + (dy1 + dy2) ** 2),
      };
    }

    function draw(timestamp: number) {
      const time = timestamp * speed;
      const { width, height, dpr } = sizeRef.current;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      // Build warped points
      const points: { x: number; y: number; displacement: number }[][] = [];
      for (let r = 0; r <= gridRows; r++) {
        points[r] = [];
        for (let c = 0; c <= gridCols; c++) {
          points[r][c] = getWarpedPoint(c, r, time);
        }
      }

      const maxAmp = amplitudeX + amplitudeY;

      // Horizontal lines
      for (let r = 0; r <= gridRows; r++) {
        ctx!.beginPath();
        for (let c = 0; c <= gridCols; c++) {
          const pt = points[r][c];
          if (c === 0) ctx!.moveTo(pt.x, pt.y);
          else ctx!.lineTo(pt.x, pt.y);
        }
        const avg = points[r].reduce((s, p) => s + p.displacement, 0) / points[r].length;
        const alpha = 0.03 + (avg / maxAmp) * 0.15;
        ctx!.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      // Vertical lines
      for (let c = 0; c <= gridCols; c++) {
        ctx!.beginPath();
        let totalDisp = 0;
        for (let r = 0; r <= gridRows; r++) {
          const pt = points[r][c];
          if (r === 0) ctx!.moveTo(pt.x, pt.y);
          else ctx!.lineTo(pt.x, pt.y);
          totalDisp += pt.displacement;
        }
        const avg = totalDisp / (gridRows + 1);
        const alpha = 0.03 + (avg / maxAmp) * 0.15;
        ctx!.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      // Glow nodes
      for (let r = 0; r <= gridRows; r += 2) {
        for (let c = 0; c <= gridCols; c += 2) {
          const pt = points[r][c];
          const norm = pt.displacement / maxAmp;

          if (norm > 0.3) {
            const dotAlpha = (norm - 0.3) * 0.6;
            const dotRadius = 1 + norm * 2;

            ctx!.beginPath();
            ctx!.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${cR}, ${cG}, ${cB}, ${dotAlpha.toFixed(3)})`;
            ctx!.fill();

            ctx!.beginPath();
            ctx!.arc(pt.x, pt.y, dotRadius * 3, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${cR}, ${cG}, ${cB}, ${(dotAlpha * 0.15).toFixed(3)})`;
            ctx!.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

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
  }, [gridCols, gridRows, speed, amplitudeX, amplitudeY, frequency, color, resize]);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 20%, rgba(10,10,10,0.5) 60%, #0a0a0a 85%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Demo usage
export default function WarpBackgroundDemo() {
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
      <WarpBackground
        gridCols={40}
        gridRows={30}
        speed={0.0008}
        amplitudeX={30}
        amplitudeY={25}
        color={[139, 92, 246]}
      />
      <div
        style={{
          position: "relative",
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
            background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 40%, #d946ef 80%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Warp Background
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Flowing mesh distortions powered by layered sine waves
        </p>
      </div>
    </div>
  );
}
