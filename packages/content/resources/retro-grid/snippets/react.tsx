import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useRef,
} from "react";

interface RetroGridProps {
  /** Grid line color */
  color?: string;
  /** Grid cell size in pixels */
  size?: number;
  /** Horizon glow color */
  glowColor?: string;
  /** Animation duration in seconds (0 to disable) */
  speed?: number;
  /** Extra CSS class names */
  className?: string;
  /** Overlay children */
  children?: ReactNode;
}

export function RetroGrid({
  color = "rgba(139,92,246,0.3)",
  size = 60,
  glowColor = "rgba(139,92,246,0.5)",
  speed = 8,
  className = "",
  children,
}: RetroGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      wrapper.style.perspectiveOrigin = `${50 + x * 10}% ${y * 8}%`;
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) wrapper.style.perspectiveOrigin = "50% 0%";
  }, []);

  const animationCSS = speed
    ? `@keyframes retro-scroll{0%{transform:rotateX(55deg) translateY(0)}100%{transform:rotateX(55deg) translateY(${size}px)}}`
    : "";

  const sceneStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to bottom, #0a0a0a 0%, #0a0a0a 50%, #0d0520 100%)",
    overflow: "hidden",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const glowStyle: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "120%",
    height: 300,
    background: `radial-gradient(ellipse 50% 80% at 50% 50%, ${glowColor}, transparent)`,
    opacity: 0.4,
    pointerEvents: "none",
    filter: "blur(40px)",
  };

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    overflow: "hidden",
    perspective: 400,
    perspectiveOrigin: "50% 0%",
  };

  const gridStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: "rotateX(55deg)",
    transformOrigin: "50% 0%",
    backgroundImage: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 1px, transparent 1px, transparent ${size}px), repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent ${size}px)`,
    backgroundSize: `${size}px ${size}px`,
    animation: speed ? `retro-scroll ${speed}s linear infinite` : "none",
  };

  const horizonFadeStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 1,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 2,
  };

  return (
    <div
      className={className}
      style={sceneStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {animationCSS && <style>{animationCSS}</style>}
      <div style={glowStyle} />
      <div ref={wrapperRef} style={wrapperStyle}>
        <div style={gridStyle} />
        <div style={horizonFadeStyle} />
      </div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// Demo usage
export default function RetroGridDemo() {
  return (
    <RetroGrid color="rgba(139,92,246,0.3)" size={60} speed={8}>
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "10vh",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            lineHeight: 1,
            color: "#fafafa",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textShadow:
              "0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(139,92,246,0.1)",
          }}
        >
          RETRO<span style={{ color: "#a78bfa" }}>GRID</span>
        </h1>
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 400,
            color: "#71717a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Perspective grid with vanishing-point effect
        </p>
        <div
          style={{
            width: 80,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #8b5cf6, transparent)",
            marginTop: "0.5rem",
          }}
        />
      </div>
    </RetroGrid>
  );
}
