import { useCallback, useEffect, useRef } from "react";

export type ContextMenuItem = {
  label: string;
  action: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
};

type Props = {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onAction: (action: string) => void;
  onClose: () => void;
};

export default function ContextMenu({ x, y, items, onAction, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Clamp position to viewport
  const pos = useCallback(() => {
    if (!ref.current) return { left: x, top: y };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mw = ref.current.offsetWidth;
    const mh = ref.current.offsetHeight;
    return {
      left: Math.min(x, vw - mw - 8),
      top: Math.min(y, vh - mh - 8),
    };
  }, [x, y]);

  useEffect(() => {
    if (!ref.current) return;
    const { left, top } = pos();
    ref.current.style.left = `${left}px`;
    ref.current.style.top = `${top}px`;
  }, [pos]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className="context-menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        item.label === "---" ? (
          <div key={i} className="menu-divider" role="separator" />
        ) : (
          <button
            key={i}
            role="menuitem"
            disabled={item.disabled}
            className={`menu-item${item.danger ? " menu-item--danger" : ""}${item.disabled ? " menu-item--disabled" : ""}`}
            onClick={() => {
              if (!item.disabled) {
                onAction(item.action);
                onClose();
              }
            }}
          >
            {item.icon && <span className="menu-item__icon">{item.icon}</span>}
            <span className="menu-item__label">{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
