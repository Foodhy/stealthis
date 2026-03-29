import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef } from "react";

interface FlickeringGridProps {
  /** Grid cell size in pixels */
  cellSize?: number;
  /** Gap between cells in pixels */
  gap?: number;
  /** Base (resting) opacity of each cell */
  baseOpacity?: number;
  /** Maximum opacity a cell can flicker to */
  maxOpacity?: number;
  /** Chance per cell per frame to start flickering (0-1) */
  flickerChance?: number;
  /** Color as {r, g, b} (0-255) */
  color?: { r: number; g: number; b: number };
  /** Extra CSS class names */
  className?: string;
  /** Overlay children on top of the grid */
  children?: ReactNode;
}

interface Cell {
  x: number;
  y: number;
  opacity: number;
  target: number;
}

export function FlickeringGrid({
  cellSize = 24,
  gap = 2,
  baseOpacity = 0.06,
  maxOpacity = 0.35,
  flickerChance = 0.005,
  color = { r: 16, g: 185, b: 129 },
  className = "",
  children,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const cellsRef = useRef<Cell[]>([]);
  const lerpSpeed = 0.04;

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(rect.width / (cellSize + gap));
    const rows = Math.ceil(rect.height / (cellSize + gap));

    const cells: Cell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: c * (cellSize + gap),
          y: r * (cellSize + gap),
          opacity: baseOpacity + Math.random() * 0.03,
          target: baseOpacity,
        });
      }
    }
    cellsRef.current = cells;

    const w = rect.width;
    const h = rect.height;

    function animate() {
      ctx!.clearRect(0, 0, w, h);

      for (const cell of cellsRef.current) {
        if (Math.random() < flickerChance) {
          cell.target = baseOpacity + Math.random() * (maxOpacity - baseOpacity);
        }
        cell.opacity += (cell.target - cell.opacity) * lerpSpeed;
        cell.target += (baseOpacity - cell.target) * 0.01;

        ctx!.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${cell.opacity})`;
        ctx!.beginPath();
        ctx!.roundRect(cell.x, cell.y, cellSize, cellSize, 2);
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    cancelAnimationFrame(animRef.current);
    animate();
  }, [cellSize, gap, baseOpacity, maxOpacity, flickerChance, color]);

  useEffect(() => {
    setup();

    let timer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(setup, 100);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [setup]);

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#000",
    overflow: "hidden",
  };

  const canvasStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "block",
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// Demo usage
export default function FlickeringGridDemo() {
  return (
    <FlickeringGrid
      cellSize={24}
      gap={2}
      baseOpacity={0.06}
      maxOpacity={0.35}
      flickerChance={0.005}
      color={{ r: 16, g: 185, b: 129 }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          padding: "2rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <h1
          style={{
            fontSize: "2.75rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#fafafa",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Flickering Grid
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "#71717a",
            maxWidth: 400,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Canvas-based animated grid where cells randomly pulse opacity, creating a living,
          breathing background.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {[
            { value: "60", label: "FPS" },
            { value: "<2%", label: "CPU" },
            { value: "Canvas", label: "2D API" },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{ display: "contents" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#52525b",
                  }}
                >
                  {stat.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 32,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </FlickeringGrid>
  );
}
