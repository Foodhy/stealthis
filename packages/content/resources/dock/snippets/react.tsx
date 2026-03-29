import { useRef, useState, useCallback } from "react";

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface DockProps {
  items?: DockItem[];
  baseSize?: number;
  maxSize?: number;
  magnifyRange?: number;
}

const defaultItems: DockItem[] = [
  {
    label: "Finder",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    label: "Mail",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m2 7 10 6 10-6" />
      </svg>
    ),
  },
  {
    label: "Music",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    label: "Photos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

export default function Dock({
  items = defaultItems,
  baseSize = 48,
  maxSize = 72,
  magnifyRange = 200,
}: DockProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>(items.map(() => baseSize));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const dock = dockRef.current;
      if (!dock) return;

      const children = Array.from(dock.children) as HTMLElement[];
      const newSizes = children.map((child) => {
        const rect = child.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(e.clientX - centerX);
        const scale = Math.max(
          baseSize,
          maxSize - ((maxSize - baseSize) * Math.pow(distance, 2)) / Math.pow(magnifyRange, 2)
        );
        return Math.round(Math.min(maxSize, Math.max(baseSize, scale)));
      });

      setSizes(newSizes);
    },
    [baseSize, maxSize, magnifyRange]
  );

  const handleMouseLeave = useCallback(() => {
    setSizes(items.map(() => baseSize));
    setHoveredIndex(null);
  }, [items, baseSize]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "2rem",
        paddingBottom: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "3rem" }}>
        Hover over the dock icons
      </p>

      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0.25rem",
          padding: "0.625rem 0.875rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1.25rem",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={item.onClick}
          >
            {hoveredIndex === i && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(15,23,42,0.95)",
                  color: "#f1f5f9",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  padding: "0.3rem 0.6rem",
                  borderRadius: "0.375rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>
            )}
            <div
              style={{
                width: sizes[i],
                height: sizes[i],
                display: "grid",
                placeItems: "center",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                transition: "width 0.2s ease, height 0.2s ease",
              }}
            >
              <div style={{ width: "55%", height: "55%" }}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
