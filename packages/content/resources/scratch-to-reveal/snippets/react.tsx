import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";

interface ScratchToRevealProps {
  children: ReactNode;
  width?: number;
  height?: number;
  overlayColor?: string;
  brushSize?: number;
  revealThreshold?: number;
  onReveal?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function ScratchToReveal({
  children,
  width = 380,
  height = 240,
  overlayColor = "#1a1a2e",
  brushSize = 40,
  revealThreshold = 0.55,
  onReveal,
  className = "",
  style = {},
}: ScratchToRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [scratching, setScratching] = useState(false);

  const fillOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle noise texture
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let x = 0; x < width; x += 4) {
      for (let y = 0; y < height; y += 4) {
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  }, [width, height, overlayColor]);

  useEffect(() => {
    if (!revealed) fillOverlay();
  }, [fillOverlay, revealed]);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const scratch = useCallback(
    (pos: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [brushSize]
  );

  const scratchLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [brushSize]
  );

  const getScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    return transparent / total;
  }, []);

  const checkReveal = useCallback(() => {
    const pct = getScratchPercentage();
    if (pct >= revealThreshold && !revealed) {
      setRevealed(true);
      onReveal?.();
    }
  }, [getScratchPercentage, revealThreshold, revealed, onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (revealed) return;
      isDrawingRef.current = true;
      setScratching(true);
      const pos = getPos(e);
      lastPosRef.current = pos;
      scratch(pos);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current || revealed) return;
      const pos = getPos(e);
      if (lastPosRef.current) {
        scratchLine(lastPosRef.current, pos);
      }
      lastPosRef.current = pos;
    };

    const onEnd = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      lastPosRef.current = null;
      checkReveal();
    };

    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("mouseleave", onEnd);
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);
    canvas.addEventListener("touchcancel", onEnd);

    return () => {
      canvas.removeEventListener("mousedown", onStart);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onEnd);
      canvas.removeEventListener("mouseleave", onEnd);
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
      canvas.removeEventListener("touchcancel", onEnd);
    };
  }, [revealed, scratch, scratchLine, checkReveal]);

  const reset = () => {
    setRevealed(false);
    setScratching(false);
    setTimeout(fillOverlay, 10);
  };

  const containerStyle: CSSProperties = {
    position: "relative",
    width,
    height,
    borderRadius: 20,
    overflow: "hidden",
    cursor: "crosshair",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px -15px rgba(0,0,0,0.5)",
    ...style,
  };

  const canvasStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 2,
    borderRadius: 20,
    opacity: revealed ? 0 : 1,
    transition: "opacity 0.6s ease",
    pointerEvents: revealed ? "none" : "auto",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
      <div ref={containerRef} className={className} style={containerStyle}>
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>{children}</div>
        <canvas ref={canvasRef} style={canvasStyle} />
        {!scratching && !revealed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "2rem", color: "rgba(255,255,255,0.5)" }}>{"\u270D"}</span>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
              Scratch here
            </span>
          </div>
        )}
      </div>
      {revealed && (
        <button
          onClick={reset}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(148,163,184,0.8)",
            padding: "0.6rem 1.5rem",
            borderRadius: 10,
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            marginTop: "0.5rem",
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

// Demo usage
export default function ScratchToRevealDemo() {
  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        gap: "3rem",
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
          textAlign: "center",
        }}
      >
        Scratch to Reveal
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "rgba(148,163,184,0.8)",
          fontSize: "1.125rem",
          marginTop: "-1.5rem",
        }}
      >
        Drag across the card to reveal what's hidden
      </p>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <ScratchToReveal onReveal={() => console.log("Card 1 revealed!")}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              padding: "2rem",
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)",
            }}
          >
            <span style={{ fontSize: "3rem", lineHeight: 1 }}>{"\uD83C\uDF89"}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e0e7ff" }}>You Won!</span>
            <span
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px dashed rgba(255,255,255,0.3)",
                borderRadius: 8,
                padding: "0.5rem 1.5rem",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fbbf24",
                letterSpacing: "0.15em",
              }}
            >
              STEAL2026
            </span>
            <span style={{ fontSize: "0.9rem", color: "rgba(196,181,253,0.8)" }}>
              Use this code for 40% off
            </span>
          </div>
        </ScratchToReveal>

        <ScratchToReveal overlayColor="#1a2e1a" onReveal={() => console.log("Card 2 revealed!")}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              padding: "2rem",
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
            }}
          >
            <span style={{ fontSize: "3rem", lineHeight: 1 }}>{"\u2B50"}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e0e7ff" }}>
              Secret Message
            </span>
            <span
              style={{
                fontSize: "1rem",
                color: "rgba(167,243,208,0.8)",
                maxWidth: 260,
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              The best UI components are the ones you steal and make your own.
            </span>
          </div>
        </ScratchToReveal>
      </div>
    </div>
  );
}
