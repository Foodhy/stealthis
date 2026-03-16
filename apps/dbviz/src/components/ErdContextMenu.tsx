import { useEffect, useRef, useCallback } from "react";

// ─── Target types ───────────────────────────────────────────────────────────

export type ErdContextMenuTarget =
  | { kind: "canvas"; svgX: number; svgY: number }
  | { kind: "table"; tableId: string }
  | { kind: "column"; tableId: string; columnName: string };

export type ErdAction =
  | { type: "addTable"; svgX: number; svgY: number }
  | { type: "addColumn"; tableId: string }
  | { type: "renameTable"; tableId: string }
  | { type: "deleteTable"; tableId: string }
  | { type: "editColumn"; tableId: string; columnName: string }
  | { type: "deleteColumn"; tableId: string; columnName: string };

// ─── Props ──────────────────────────────────────────────────────────────────

interface ErdContextMenuProps {
  x: number;
  y: number;
  target: ErdContextMenuTarget;
  onAction: (action: ErdAction) => void;
  onClose: () => void;
  t: (key: string) => string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ErdContextMenu({
  x,
  y,
  target,
  onAction,
  onClose,
  t,
}: ErdContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  // Viewport clamping
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) {
      menu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > vh) {
      menu.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

  // Build menu items based on target kind
  type MenuItem = { label: string; action: ErdAction };
  const items: MenuItem[] = [];

  if (target.kind === "canvas") {
    items.push({
      label: t("erd.ctx.addTable" as any),
      action: { type: "addTable", svgX: target.svgX, svgY: target.svgY },
    });
  } else if (target.kind === "table") {
    items.push({
      label: t("erd.ctx.addColumn" as any),
      action: { type: "addColumn", tableId: target.tableId },
    });
    items.push({
      label: t("erd.ctx.renameTable" as any),
      action: { type: "renameTable", tableId: target.tableId },
    });
    items.push({
      label: t("erd.ctx.deleteTable" as any),
      action: { type: "deleteTable", tableId: target.tableId },
    });
  } else if (target.kind === "column") {
    items.push({
      label: t("erd.ctx.editColumn" as any),
      action: {
        type: "editColumn",
        tableId: target.tableId,
        columnName: target.columnName,
      },
    });
    items.push({
      label: t("erd.ctx.deleteColumn" as any),
      action: {
        type: "deleteColumn",
        tableId: target.tableId,
        columnName: target.columnName,
      },
    });
    items.push({
      label: t("erd.ctx.addColumn" as any),
      action: { type: "addColumn", tableId: target.tableId },
    });
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-lg border border-white/10 bg-slate-900 py-1 shadow-xl shadow-black/40"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          className="flex w-full items-center px-3 py-1.5 text-left text-[12px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => onAction(item.action)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
