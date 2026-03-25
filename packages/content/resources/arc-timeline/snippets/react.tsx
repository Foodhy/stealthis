import { useEffect, useRef, useState, useMemo } from "react";

interface ArcTimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface ArcTimelineProps {
  events?: ArcTimelineEvent[];
  radius?: number;
  width?: number;
  height?: number;
}

const defaultEvents: ArcTimelineEvent[] = [
  { date: "Jan 2025", title: "Research", description: "User interviews & competitive analysis" },
  { date: "Mar 2025", title: "Design", description: "Wireframes and high-fidelity prototypes" },
  { date: "Jun 2025", title: "Development", description: "Frontend and backend implementation" },
  { date: "Sep 2025", title: "Testing", description: "QA, performance, and accessibility audits" },
  { date: "Dec 2025", title: "Launch", description: "Public release and monitoring" },
];

export default function ArcTimeline({
  events = defaultEvents,
  radius = 250,
  width = 600,
  height = 380,
}: ArcTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const centerX = width / 2;
  const centerY = height - 80;
  const startAngle = Math.PI;
  const endAngle = 0;
  const count = events.length;

  const positions = useMemo(() => {
    return events.map((_, i) => {
      const angle = startAngle + (endAngle - startAngle) * (i / (count - 1));
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [events, radius, centerX, centerY, count]);

  const arcPathD = useMemo(() => {
    if (positions.length < 2) return "";
    const first = positions[0];
    const last = positions[positions.length - 1];
    return `M ${first.x} ${first.y} A ${radius} ${radius} 0 0 1 ${last.x} ${last.y}`;
  }, [positions, radius]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700, textAlign: "center" }}>
          Project Timeline
        </h2>

        <div
          ref={containerRef}
          style={{ position: "relative", width, height }}
        >
          {/* SVG arc path */}
          <svg
            viewBox={`0 0 ${width} ${height - 60}`}
            fill="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: height - 60, pointerEvents: "none" }}
          >
            <path
              d={arcPathD}
              stroke="rgba(148,163,184,0.2)"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="none"
            />
          </svg>

          {/* Event nodes */}
          {events.map((event, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: positions[i].x,
                top: positions[i].y,
                transform: visible
                  ? "translate(-50%, -50%) scale(1)"
                  : "translate(-50%, -50%) scale(0.6)",
                opacity: visible ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  border: "3px solid #0a0a0a",
                  boxShadow: "0 0 0 2px rgba(99,102,241,0.4), 0 0 12px rgba(99,102,241,0.2)",
                  flexShrink: 0,
                  zIndex: 2,
                }}
              />

              {/* Label */}
              <div style={{ marginTop: "0.75rem", textAlign: "center", maxWidth: 130 }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#6366f1",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {event.date}
                </span>
                <strong style={{ display: "block", fontSize: "0.85rem", color: "#e2e8f0", marginTop: "0.2rem" }}>
                  {event.title}
                </strong>
                <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.4, marginTop: "0.2rem" }}>
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
