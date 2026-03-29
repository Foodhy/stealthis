import { useEffect, useRef, useCallback, useState } from "react";

interface PixelImageProps {
  width?: number;
  height?: number;
  pixelSize?: number;
  animationDuration?: number;
  className?: string;
}

interface Pixel {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
  color: string;
  delay: number;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number) {
  return t * t * t;
}

export function PixelImage({
  width = 400,
  height = 300,
  pixelSize = 4,
  animationDuration = 2000,
  className = "",
}: PixelImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animRef = useRef<number>(0);
  const scatteredRef = useRef(true);
  const animatingRef = useRef(false);

  const generateAndExtract = useCallback(() => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tctx = tempCanvas.getContext("2d")!;

    const bg = tctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#1e1b4b");
    bg.addColorStop(0.3, "#312e81");
    bg.addColorStop(0.6, "#4338ca");
    bg.addColorStop(1, "#6366f1");
    tctx.fillStyle = bg;
    tctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 6; i++) {
      const cx = width * (0.15 + Math.random() * 0.7);
      const cy = height * (0.15 + Math.random() * 0.7);
      const r = 20 + Math.random() * 60;
      const grad = tctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${167 + Math.random() * 60},${139 + Math.random() * 60},250,0.6)`);
      grad.addColorStop(1, "transparent");
      tctx.beginPath();
      tctx.arc(cx, cy, r, 0, Math.PI * 2);
      tctx.fillStyle = grad;
      tctx.fill();
    }

    tctx.save();
    tctx.translate(width / 2, height / 2);
    tctx.fillStyle = "rgba(255,255,255,0.15)";
    tctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * 50;
      const y = Math.sin(angle) * 50;
      if (i === 0) tctx.moveTo(x, y);
      else tctx.lineTo(x, y);
    }
    tctx.closePath();
    tctx.fill();
    tctx.restore();

    const imageData = tctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixels: Pixel[] = [];

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const i = (y * width + x) * 4;
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2],
          a = data[i + 3];
        if (a < 10) continue;
        pixels.push({
          targetX: x,
          targetY: y,
          currentX: Math.random() * width * 2 - width * 0.5,
          currentY: Math.random() * height * 2 - height * 0.5,
          startX: 0,
          startY: 0,
          color: `rgba(${r},${g},${b},${a / 255})`,
          delay: Math.random() * 0.3,
        });
      }
    }

    pixelsRef.current = pixels;
  }, [width, height, pixelSize]);

  const drawCurrent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (const p of pixelsRef.current) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.currentX, p.currentY, pixelSize, pixelSize);
    }
  }, [width, height, pixelSize]);

  const startAnimation = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const start = performance.now();
    const scattered = scatteredRef.current;

    for (const p of pixelsRef.current) {
      p.startX = p.currentX;
      p.startY = p.currentY;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / animationDuration, 1);

      ctx!.clearRect(0, 0, width, height);

      for (const p of pixelsRef.current) {
        const adj = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        if (scattered) {
          const ease = easeOutCubic(adj);
          p.currentX = p.startX + (p.targetX - p.startX) * ease;
          p.currentY = p.startY + (p.targetY - p.startY) * ease;
        } else {
          const ease = easeInCubic(adj);
          const rx = Math.random() * width * 2 - width * 0.5;
          const ry = Math.random() * height * 2 - height * 0.5;
          p.currentX = p.startX + (rx - p.startX) * ease;
          p.currentY = p.startY + (ry - p.startY) * ease;
        }
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = scattered ? adj : 1 - adj * 0.5;
        ctx!.fillRect(p.currentX, p.currentY, pixelSize, pixelSize);
      }
      ctx!.globalAlpha = 1;

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        animatingRef.current = false;
        scatteredRef.current = !scattered;
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, [animationDuration, width, height, pixelSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    generateAndExtract();
    drawCurrent();

    const timer = setTimeout(() => startAnimation(), 500);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animRef.current);
    };
  }, [width, height, generateAndExtract, drawCurrent, startAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onClick={startAnimation}
      style={{ cursor: "pointer", display: "block" }}
    />
  );
}

// Demo usage
export default function PixelImageDemo() {
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
        gap: "1.5rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <PixelImage width={400} height={300} pixelSize={4} />
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.25rem",
          }}
        >
          Pixel Image
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)" }}>
          Click to scatter &amp; reassemble
        </p>
      </div>
    </div>
  );
}
