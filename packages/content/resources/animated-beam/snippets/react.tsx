import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type RefObject,
  type ReactNode,
  type CSSProperties,
} from "react";

interface Point {
  x: number;
  y: number;
}

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLDivElement | null>;
  fromRef: RefObject<HTMLDivElement | null>;
  toRef: RefObject<HTMLDivElement | null>;
  curvature?: number;
  gradientStartColor?: string;
  gradientEndColor?: string;
  dashSpeed?: string;
}

function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = -40,
  gradientStartColor = "#22d3ee",
  gradientEndColor = "#a855f7",
  dashSpeed = "2s",
}: AnimatedBeamProps) {
  const [pathD, setPathD] = useState("");
  const gradientId = useRef(
    `beam-grad-${Math.random().toString(36).slice(2, 9)}`
  );

  const updatePath = useCallback(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;

    const cr = container.getBoundingClientRect();
    const fr = from.getBoundingClientRect();
    const tr = to.getBoundingClientRect();

    const start: Point = {
      x: fr.left + fr.width / 2 - cr.left,
      y: fr.top + fr.height / 2 - cr.top,
    };
    const end: Point = {
      x: tr.left + tr.width / 2 - cr.left,
      y: tr.top + tr.height / 2 - cr.top,
    };

    const midX = (start.x + end.x) / 2;
    setPathD(
      `M ${start.x} ${start.y} C ${midX} ${start.y + curvature}, ${midX} ${end.y + curvature}, ${end.x} ${end.y}`
    );
  }, [containerRef, fromRef, toRef, curvature]);

  useEffect(() => {
    updatePath();
    window.addEventListener("resize", updatePath);
    return () => window.removeEventListener("resize", updatePath);
  }, [updatePath]);

  const dashAnim: CSSProperties = {
    fill: "none",
    stroke: `url(#${gradientId.current})`,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeDasharray: "16 24",
    animation: `animated-beam-dash ${dashSpeed} linear infinite`,
  };

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id={gradientId.current} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity={0.1} />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity={1} />
          <stop offset="100%" stopColor={gradientEndColor} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      {/* Background line */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Glow */}
      <path d={pathD} style={{ ...dashAnim, filter: "blur(4px)", opacity: 0.5 }} />
      {/* Main beam */}
      <path d={pathD} style={dashAnim} />
    </svg>
  );
}

interface NodeProps {
  children: ReactNode;
  style?: CSSProperties;
}

function BeamNode({ children, style }: NodeProps) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const iconBoxStyle = (color: string): CSSProperties => ({
  width: 56,
  height: 56,
  display: "grid",
  placeItems: "center",
  fontSize: "1.25rem",
  borderRadius: "1rem",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${color}44`,
  color,
  boxShadow: `0 0 20px ${color}26`,
});

// Demo usage
export default function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes animated-beam-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "min(700px, calc(100vw - 2rem))",
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2rem 3rem",
        }}
      >
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={fromRef}
          toRef={midRef}
          curvature={-40}
          gradientStartColor="#22d3ee"
          gradientEndColor="#a855f7"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={midRef}
          toRef={toRef}
          curvature={40}
          gradientStartColor="#a855f7"
          gradientEndColor="#34d399"
          dashSpeed="2.5s"
        />

        <BeamNode>
          <div ref={fromRef} style={iconBoxStyle("#22d3ee")}>&#9670;</div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#94a3b8" }}>
            Source
          </span>
        </BeamNode>

        <BeamNode>
          <div ref={midRef} style={iconBoxStyle("#a855f7")}>&#9733;</div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#94a3b8" }}>
            Process
          </span>
        </BeamNode>

        <BeamNode>
          <div ref={toRef} style={iconBoxStyle("#34d399")}>&#9679;</div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#94a3b8" }}>
            Output
          </span>
        </BeamNode>
      </div>
    </div>
  );
}
