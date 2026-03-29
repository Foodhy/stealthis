import { useEffect, useRef, useState, useCallback } from "react";

interface AnimatedListItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  time?: string;
  iconColor?: string;
  iconBg?: string;
}

interface AnimatedListProps {
  items?: AnimatedListItem[];
  staggerDelay?: number;
}

const defaultItems: AnimatedListItem[] = [
  {
    id: "1",
    title: "Build successful",
    description: "Your project compiled without errors",
    time: "2m ago",
    iconColor: "#4ade80",
    iconBg: "rgba(34,197,94,0.12)",
  },
  {
    id: "2",
    title: "New comment",
    description: "Alex left feedback on your PR",
    time: "5m ago",
    iconColor: "#60a5fa",
    iconBg: "rgba(59,130,246,0.12)",
  },
  {
    id: "3",
    title: "Disk usage warning",
    description: "Storage is at 85% capacity",
    time: "12m ago",
    iconColor: "#fbbf24",
    iconBg: "rgba(245,158,11,0.12)",
  },
  {
    id: "4",
    title: "New team member",
    description: "Jordan joined the engineering team",
    time: "1h ago",
    iconColor: "#c084fc",
    iconBg: "rgba(168,85,247,0.12)",
  },
  {
    id: "5",
    title: "Security update",
    description: "All dependencies patched successfully",
    time: "3h ago",
    iconColor: "#4ade80",
    iconBg: "rgba(34,197,94,0.12)",
  },
  {
    id: "6",
    title: "Milestone reached",
    description: "Project hit 10,000 stars on GitHub",
    time: "1d ago",
    iconColor: "#fb7185",
    iconBg: "rgba(244,63,94,0.12)",
  },
];

function ListItem({
  item,
  index,
  staggerDelay,
  direction,
}: {
  item: AnimatedListItem;
  index: number;
  staggerDelay: number;
  direction: "left" | "right";
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateFrom = direction === "left" ? "-30px" : "30px";

  return (
    <li
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        padding: "0.875rem 1rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.875rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : `translateX(${translateFrom})`,
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${index * staggerDelay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * staggerDelay}ms`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: "0.625rem",
          display: "grid",
          placeItems: "center",
          background: item.iconBg || "rgba(34,197,94,0.12)",
          color: item.iconColor || "#4ade80",
        }}
      >
        {item.icon || (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
        )}
      </div>
      <div
        style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.125rem" }}
      >
        <strong style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0" }}>
          {item.title}
        </strong>
        <span
          style={{
            fontSize: "0.8rem",
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.description}
        </span>
      </div>
      {item.time && (
        <span style={{ flexShrink: 0, fontSize: "0.75rem", color: "#475569" }}>{item.time}</span>
      )}
    </li>
  );
}

export default function AnimatedList({
  items = defaultItems,
  staggerDelay = 80,
}: AnimatedListProps) {
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
      <div
        style={{
          width: "min(520px, 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#f1f5f9" }}>Notifications</h2>
        <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>
          Watch the items animate in
        </p>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: 0,
          }}
        >
          {items.map((item, i) => (
            <ListItem
              key={item.id}
              item={item}
              index={i}
              staggerDelay={staggerDelay}
              direction={i % 2 === 0 ? "left" : "right"}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
