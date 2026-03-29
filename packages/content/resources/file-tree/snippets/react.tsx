import { useState, useRef, useCallback, useEffect } from "react";

type FileType = "folder" | "ts" | "tsx" | "js" | "jsx" | "json" | "css" | "md" | "env" | "git" | "lock";

interface TreeNode {
  id: string;
  name: string;
  type: FileType;
  children?: TreeNode[];
  modified?: boolean;
  untracked?: boolean;
}

const TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          { id: "button", name: "Button.tsx",       type: "tsx" },
          { id: "input",  name: "Input.tsx",        type: "tsx", modified: true },
          { id: "modal",  name: "Modal.tsx",        type: "tsx" },
          { id: "nav",    name: "Navbar.tsx",       type: "tsx" },
        ],
      },
      {
        id: "hooks",
        name: "hooks",
        type: "folder",
        children: [
          { id: "useauth",  name: "useAuth.ts",   type: "ts" },
          { id: "usefetch", name: "useFetch.ts",  type: "ts", untracked: true },
        ],
      },
      {
        id: "lib",
        name: "lib",
        type: "folder",
        children: [
          { id: "utils",  name: "utils.ts",     type: "ts" },
          { id: "api",    name: "api.ts",        type: "ts", modified: true },
        ],
      },
      { id: "apptsx",  name: "App.tsx",        type: "tsx" },
      { id: "maintsx", name: "main.tsx",       type: "tsx" },
    ],
  },
  {
    id: "public",
    name: "public",
    type: "folder",
    children: [
      { id: "indexhtml", name: "index.html", type: "md" },
      { id: "favicon",   name: "favicon.svg", type: "env" },
    ],
  },
  { id: "pkgjson",     name: "package.json",     type: "json" },
  { id: "tsconfigjson",name: "tsconfig.json",    type: "json" },
  { id: "tailwindcfg", name: "tailwind.config.js", type: "js" },
  { id: "envlocal",    name: ".env.local",       type: "env", untracked: true },
  { id: "gitignore",   name: ".gitignore",       type: "git" },
  { id: "readme",      name: "README.md",        type: "md", modified: true },
];

const TYPE_ICON: Record<FileType, { color: string; label: string }> = {
  folder: { color: "#e3b341", label: "📁" },
  ts:     { color: "#3178c6", label: "TS" },
  tsx:    { color: "#61dafb", label: "TSX"},
  js:     { color: "#f7df1e", label: "JS" },
  jsx:    { color: "#61dafb", label: "JSX"},
  json:   { color: "#ffca28", label: "{}" },
  css:    { color: "#264de4", label: "CS" },
  md:     { color: "#ffffff", label: "MD" },
  env:    { color: "#7ee787", label: "EN" },
  git:    { color: "#f05032", label: "GI" },
  lock:   { color: "#8b949e", label: "LK" },
};

function FileIcon({ type }: { type: FileType }) {
  const { color, label } = TYPE_ICON[type];
  if (type === "folder") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none" opacity="0.9">
        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
      </svg>
    );
  }
  return (
    <span
      className="text-[8px] font-bold rounded px-0.5 leading-none flex items-center"
      style={{ color, background: color + "22", border: `1px solid ${color}44`, minWidth: 16, height: 14, justifyContent: "center" }}
    >
      {label}
    </span>
  );
}

function AnimatedChildren({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      const h = ref.current.scrollHeight;
      setHeight(h);
      const timer = setTimeout(() => setHeight("auto"), 200);
      return () => clearTimeout(timer);
    } else {
      if (height === "auto") {
        setHeight(ref.current.scrollHeight);
        requestAnimationFrame(() => setHeight(0));
      } else {
        setHeight(0);
      }
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{
        height: typeof height === "number" ? height : undefined,
        overflow: height === "auto" ? "visible" : "hidden",
        transition: "height 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  activeId,
  onActivate,
  expandedIds,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  activeId: string | null;
  onActivate: (id: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isOpen = expandedIds.has(node.id);
  const isActive = activeId === node.id;

  const handleClick = () => {
    if (isFolder) onToggle(node.id);
    onActivate(node.id);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 py-[3px] px-2 rounded-md cursor-pointer select-none transition-colors group ${
          isActive
            ? "bg-[#21262d] text-[#e6edf3]"
            : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/[0.03]"
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {/* Chevron (folders) */}
        {isFolder ? (
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`flex-shrink-0 transition-transform duration-150 ${isOpen ? "rotate-90" : ""} text-[#484f58]`}
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        ) : (
          <span className="w-2.5 flex-shrink-0" />
        )}

        <FileIcon type={node.type} />

        <span className={`text-[12px] flex-1 truncate ${node.modified ? "text-[#e3b341]" : ""}`}>
          {node.name}
        </span>

        {/* Git indicators */}
        {node.modified && (
          <span className="text-[9px] font-bold text-[#e3b341] ml-auto">M</span>
        )}
        {node.untracked && (
          <span className="text-[9px] font-bold text-green-400 ml-auto">U</span>
        )}
      </div>

      {isFolder && node.children && (
        <AnimatedChildren open={isOpen}>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onActivate={onActivate}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </AnimatedChildren>
      )}
    </div>
  );
}

function getInitialExpanded(nodes: TreeNode[], max = 1, depth = 0): string[] {
  if (depth >= max) return [];
  const ids: string[] = [];
  for (const n of nodes) {
    if (n.type === "folder") {
      ids.push(n.id);
      if (n.children) ids.push(...getInitialExpanded(n.children, max, depth + 1));
    }
  }
  return ids;
}

export default function FileTreeRC() {
  const [activeId, setActiveId] = useState<string | null>("apptsx");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(getInitialExpanded(TREE))
  );

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    const all: string[] = [];
    function collect(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.type === "folder") {
          all.push(n.id);
          if (n.children) collect(n.children);
        }
      }
    }
    collect(TREE);
    setExpandedIds(new Set(all));
  };

  const collapseAll = () => setExpandedIds(new Set());

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 flex justify-center">
      <div className="w-full max-w-[360px]">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#21262d] border-b border-[#30363d]">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">Explorer</span>
            <div className="flex gap-1">
              <button
                onClick={expandAll}
                title="Expand all"
                className="p-1 rounded text-[#484f58] hover:text-[#e6edf3] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </button>
              <button
                onClick={collapseAll}
                title="Collapse all"
                className="p-1 rounded text-[#484f58] hover:text-[#e6edf3] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                  <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Tree */}
          <div className="py-1.5 px-1">
            {TREE.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                depth={0}
                activeId={activeId}
                onActivate={setActiveId}
                expandedIds={expandedIds}
                onToggle={toggle}
              />
            ))}
          </div>

          {/* Footer */}
          {activeId && (
            <div className="px-3 py-2 border-t border-[#30363d] bg-[#0d1117]">
              <p className="text-[10px] text-[#484f58] font-mono truncate">
                /{activeId.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-2 text-[10px] text-[#484f58]">
          <span className="flex items-center gap-1"><span className="text-[#e3b341] font-bold">M</span> Modified</span>
          <span className="flex items-center gap-1"><span className="text-green-400 font-bold">U</span> Untracked</span>
        </div>
      </div>
    </div>
  );
}
