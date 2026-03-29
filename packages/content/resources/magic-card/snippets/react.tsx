import { useRef, useState, type CSSProperties, type ReactNode } from "react";

interface MagicCardProps {
  children: ReactNode;
  spotlightColor?: string;
  spotlightRadius?: number;
  className?: string;
}

export function MagicCard({
  children,
  spotlightColor = "rgba(120, 120, 255, 0.15)",
  spotlightRadius = 250,
  className = "",
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setMousePos({
      x: `${e.clientX - rect.left}px`,
      y: `${e.clientY - rect.top}px`,
    });
  }

  const cardStyle: CSSProperties = {
    position: "relative",
    borderRadius: "1rem",
    overflow: "hidden",
    border: `1px solid rgba(255, 255, 255, ${isHovered ? 0.15 : 0.08})`,
    background: "rgba(255, 255, 255, 0.03)",
    cursor: "default",
    transition: "border-color 0.3s ease",
  };

  const spotlightStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    opacity: isHovered ? 1 : 0,
    transition: "opacity 0.3s ease",
    background: `radial-gradient(${spotlightRadius}px circle at ${mousePos.x} ${mousePos.y}, ${spotlightColor}, transparent 100%)`,
    pointerEvents: "none",
    zIndex: 0,
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: "50%", y: "50%" });
      }}
      style={cardStyle}
      className={className}
    >
      <div style={spotlightStyle} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// Demo usage
export default function MagicCardDemo() {
  const items = [
    {
      icon: "\u2666",
      title: "Interactive",
      body: "Move your mouse over this card to see the spotlight follow your cursor.",
    },
    {
      icon: "\u2733",
      title: "Responsive",
      body: "Each card tracks the cursor independently with its own radial gradient.",
    },
    {
      icon: "\u2726",
      title: "Customizable",
      body: "Adjust colors, radius, and intensity using simple props.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          width: "min(740px, calc(100vw - 2rem))",
        }}
      >
        {items.map((item) => (
          <MagicCard key={item.title}>
            <div
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "1.5rem", color: "#818cf8", lineHeight: 1 }}>
                {item.icon}
              </span>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "#94a3b8",
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </div>
          </MagicCard>
        ))}
      </div>
    </div>
  );
}
