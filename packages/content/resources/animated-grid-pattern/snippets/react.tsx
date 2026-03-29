import { useEffect, useRef, useCallback, useState } from "react";

interface AnimatedGridPatternProps {
  cellSize?: number;
  gap?: number;
  glowColor?: string;
  glowColorBright?: string;
  highlightInterval?: number;
  glowDuration?: number;
  maxSimultaneous?: number;
  className?: string;
}

export function AnimatedGridPattern({
  cellSize = 40,
  gap = 1,
  glowColor = "rgba(99, 102, 241, 0.6)",
  glowColorBright = "rgba(129, 140, 248, 0.9)",
  highlightInterval = 120,
  glowDuration = 2500,
  maxSimultaneous = 8,
  className = "",
}: AnimatedGridPatternProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cellsRef = useRef<SVGRectElement[]>([]);
  const activeCountRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const buildGrid = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const parent = svg.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;
    setDimensions({ width: w, height: h });

    const cols = Math.ceil(w / (cellSize + gap)) + 1;
    const rows = Math.ceil(h / (cellSize + gap)) + 1;

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    cellsRef.current = [];
    activeCountRef.current = 0;

    const ns = "http://www.w3.org/2000/svg";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", String(c * (cellSize + gap)));
        rect.setAttribute("y", String(r * (cellSize + gap)));
        rect.setAttribute("width", String(cellSize));
        rect.setAttribute("height", String(cellSize));
        rect.setAttribute("rx", "2");
        rect.setAttribute("fill", "transparent");
        rect.setAttribute("stroke", "rgba(255,255,255,0.06)");
        rect.setAttribute("stroke-width", "0.5");
        svg.appendChild(rect);
        cellsRef.current.push(rect);
      }
    }
  }, [cellSize, gap]);

  useEffect(() => {
    buildGrid();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildGrid, 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [buildGrid]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cells = cellsRef.current;
      if (cells.length === 0 || activeCountRef.current >= maxSimultaneous) return;

      const idx = Math.floor(Math.random() * cells.length);
      const cell = cells[idx];

      if (cell.dataset.active === "true") return;

      cell.dataset.active = "true";
      cell.setAttribute("fill", glowColor);
      cell.style.filter = `drop-shadow(0 0 8px ${glowColorBright})`;
      cell.style.transition = "fill 0.3s ease, filter 0.3s ease";
      activeCountRef.current++;

      setTimeout(() => {
        cell.setAttribute("fill", glowColorBright);
        cell.style.filter = `drop-shadow(0 0 16px ${glowColorBright})`;
      }, glowDuration * 0.2);

      setTimeout(() => {
        cell.setAttribute("fill", "transparent");
        cell.style.filter = "none";
        cell.dataset.active = "false";
        activeCountRef.current--;
      }, glowDuration);
    }, highlightInterval);

    return () => clearInterval(interval);
  }, [glowColor, glowColorBright, highlightInterval, glowDuration, maxSimultaneous]);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 30%, #0a0a0a 80%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Demo usage
export default function AnimatedGridPatternDemo() {
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
      <AnimatedGridPattern
        className=""
        cellSize={40}
        glowColor="rgba(99, 102, 241, 0.6)"
        glowColorBright="rgba(129, 140, 248, 0.9)"
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
            background: "linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Animated Grid
        </h1>
        <p
          style={{
            fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
            color: "rgba(148, 163, 184, 0.8)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Randomly glowing cells create a living background
        </p>
      </div>
    </div>
  );
}
