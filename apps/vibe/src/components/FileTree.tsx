import { useCallback, useRef, useState } from "react";
import { useWorkspace } from "../lib/workspace-context";
import { buildTreeFromPaths, type TreeNode } from "../lib/file-utils";
import { getFileIcon, getFolderIcon } from "../lib/file-icons";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";

type ContextState = {
  x: number;
  y: number;
  targetDir: string;
  targetFile: string | null;
} | null;

type InlineInput = {
  parentDir: string;
  kind: "file" | "folder";
} | null;

/* ── Icon badge component ── */
function FileIcon({ name, isDir, isOpen }: { name: string; isDir: boolean; isOpen?: boolean }) {
  if (isDir) {
    const { icon, color } = getFolderIcon(name);
    return (
      <span
        className="inline-flex w-[18px] shrink-0 items-center justify-center text-[11px]"
        style={{ color }}
      >
        {icon}
      </span>
    );
  }
  const { icon, color } = getFileIcon(name);
  const isEmoji = /\p{Emoji_Presentation}/u.test(icon);
  if (isEmoji) {
    return (
      <span className="inline-flex w-[18px] shrink-0 items-center justify-center text-[11px]">
        {icon}
      </span>
    );
  }
  return (
    <span
      className="inline-flex w-[18px] shrink-0 items-center justify-center rounded text-[9px] font-bold leading-none"
      style={{ color }}
    >
      {icon}
    </span>
  );
}

/* ── Tree item ── */
function TreeItem({
  node,
  depth,
  onContext,
  inlineInput,
  onInlineSubmit,
  onInlineCancel,
}: {
  node: TreeNode;
  depth: number;
  onContext: (e: React.MouseEvent, dirPath: string, filePath: string | null) => void;
  inlineInput: InlineInput;
  onInlineSubmit: (name: string) => void;
  onInlineCancel: () => void;
}) {
  const { state, dispatch } = useWorkspace();
  const [open, setOpen] = useState(true);

  const isDirty = !node.isDir && state.files[node.path]?.dirty;
  const isActive = state.activeTab === node.path;
  const showInline = inlineInput && inlineInput.parentDir === node.path && node.isDir;

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onContext(e, node.path, null);
          }}
          className="flex w-full items-center gap-1.5 px-2 py-[3px] text-left text-[12px] text-slate-300 hover:bg-white/6"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <span className="w-[10px] shrink-0 text-[9px] text-slate-500">{open ? "▾" : "▸"}</span>
          <FileIcon name={node.name} isDir isOpen={open} />
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {open && (
          <>
            {showInline && (
              <InlineNameInput
                depth={depth + 1}
                kind={inlineInput!.kind}
                onSubmit={onInlineSubmit}
                onCancel={onInlineCancel}
              />
            )}
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                onContext={onContext}
                inlineInput={inlineInput}
                onInlineSubmit={onInlineSubmit}
                onInlineCancel={onInlineCancel}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => dispatch({ type: "OPEN_TAB", payload: node.path })}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const parts = node.path.split("/");
        const parentDir = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
        onContext(e, parentDir, node.path);
      }}
      className={`flex w-full items-center gap-1.5 px-2 py-[3px] text-left text-[12px] transition-colors ${
        isActive
          ? "bg-vibe-600/15 text-vibe-200"
          : "text-slate-400 hover:bg-white/6 hover:text-slate-300"
      }`}
      style={{ paddingLeft: `${depth * 14 + 18}px` }}
    >
      <FileIcon name={node.name} isDir={false} />
      <span className="flex-1 truncate">{node.name}</span>
      {isDirty && <span className="ml-auto shrink-0 text-[10px] font-medium text-vibe-400">M</span>}
    </button>
  );
}

/* ── Inline name input ── */
function InlineNameInput({
  depth,
  kind,
  onSubmit,
  onCancel,
}: {
  depth: number;
  kind: "file" | "folder";
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-[3px]"
      style={{ paddingLeft: `${depth * 14 + 18}px` }}
    >
      <span className="text-[10px] text-slate-500">{kind === "folder" ? "📁" : "📄"}</span>
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onSubmit(value.trim());
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        onBlur={() => {
          if (value.trim()) onSubmit(value.trim());
          else onCancel();
        }}
        placeholder={kind === "folder" ? "folder name" : "filename.ext"}
        className="min-w-0 flex-1 rounded border border-vibe-500/40 bg-slate-950 px-1.5 py-0.5 text-[11px] text-slate-200 outline-none placeholder-slate-600"
      />
    </div>
  );
}

/* ── Save files helper ── */
async function saveFilesToDisk(
  projectPath: string,
  files: Record<string, { path: string; content: string; dirty: boolean }>
): Promise<number> {
  let saved = 0;
  for (const file of Object.values(files)) {
    if (!file.dirty) continue;
    try {
      await fetch("/api/write-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectPath,
          filePath: file.path,
          content: file.content,
        }),
      });
      saved++;
    } catch {}
  }
  return saved;
}

/* ── Main FileTree ── */
export default function FileTree() {
  const { state, dispatch } = useWorkspace();
  const [ctx, setCtx] = useState<ContextState>(null);
  const [inlineInput, setInlineInput] = useState<InlineInput>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const paths = Object.keys(state.files);
  const tree = buildTreeFromPaths(paths);
  const dirtyCount = Object.values(state.files).filter((f) => f.dirty).length;

  const handleContext = useCallback(
    (e: React.MouseEvent, dirPath: string, filePath: string | null) => {
      setCtx({ x: e.clientX, y: e.clientY, targetDir: dirPath, targetFile: filePath });
    },
    []
  );

  const handleRootContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY, targetDir: "", targetFile: null });
  }, []);

  const handleAction = useCallback(
    (action: string) => {
      if (!ctx) return;

      if (action === "new-file") {
        setInlineInput({ parentDir: ctx.targetDir, kind: "file" });
      } else if (action === "new-folder") {
        setInlineInput({ parentDir: ctx.targetDir, kind: "folder" });
      } else if (action === "delete" && ctx.targetFile) {
        const newFiles = { ...state.files };
        delete newFiles[ctx.targetFile];
        dispatch({ type: "SET_FILES", payload: newFiles });
        if (state.activeTab === ctx.targetFile) {
          dispatch({ type: "CLOSE_TAB", payload: ctx.targetFile });
        }
      } else if (action === "rename" && ctx.targetFile) {
        const oldPath = ctx.targetFile;
        const parts = oldPath.split("/");
        const oldName = parts.pop()!;
        const newName = prompt("Rename to:", oldName);
        if (newName && newName !== oldName) {
          const newPath = parts.length > 0 ? `${parts.join("/")}/${newName}` : newName;
          const file = state.files[oldPath];
          if (file) {
            const newFiles = { ...state.files };
            delete newFiles[oldPath];
            newFiles[newPath] = { ...file, path: newPath };
            dispatch({ type: "SET_FILES", payload: newFiles });
            dispatch({ type: "CLOSE_TAB", payload: oldPath });
            dispatch({ type: "OPEN_TAB", payload: newPath });
          }
        }
      }

      setCtx(null);
    },
    [ctx, state.files, state.activeTab, dispatch]
  );

  const handleInlineSubmit = useCallback(
    (name: string) => {
      if (!inlineInput) return;
      const parentDir = inlineInput.parentDir;
      const fullPath = parentDir ? `${parentDir}/${name}` : name;

      if (inlineInput.kind === "file") {
        dispatch({
          type: "UPSERT_FILE",
          payload: { path: fullPath, content: "", dirty: true },
        });
        if (state.projectPath) {
          fetch("/api/write-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectPath: state.projectPath,
              filePath: fullPath,
              content: "",
            }),
          }).catch(() => {});
        }
      } else {
        const keepPath = `${fullPath}/.gitkeep`;
        dispatch({
          type: "UPSERT_FILE",
          payload: { path: keepPath, content: "", dirty: false },
        });
        if (state.projectPath) {
          fetch("/api/write-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectPath: state.projectPath,
              filePath: keepPath,
              content: "",
            }),
          }).catch(() => {});
        }
      }

      setInlineInput(null);
    },
    [inlineInput, state.projectPath, dispatch]
  );

  const handleInlineCancel = useCallback(() => setInlineInput(null), []);

  const handleSaveAll = useCallback(async () => {
    if (!state.projectPath || dirtyCount === 0) return;
    setSaving(true);
    const count = await saveFilesToDisk(state.projectPath, state.files);
    // Mark all files as clean
    const cleaned = { ...state.files };
    for (const key of Object.keys(cleaned)) {
      if (cleaned[key].dirty) {
        cleaned[key] = { ...cleaned[key], dirty: false };
      }
    }
    dispatch({ type: "SET_FILES", payload: cleaned });
    setSaveStatus(`${count} saved`);
    setSaving(false);
    setTimeout(() => setSaveStatus(""), 2000);
  }, [state.projectPath, state.files, dirtyCount, dispatch]);

  // Build context menu items
  const menuItems: ContextMenuItem[] = [];
  if (ctx) {
    menuItems.push({ label: "New File", action: "new-file", icon: "+" });
    menuItems.push({ label: "New Folder", action: "new-folder", icon: "📁" });
    if (ctx.targetFile) {
      menuItems.push({ label: "---", action: "" });
      menuItems.push({ label: "Rename", action: "rename", icon: "✎" });
      menuItems.push({ label: "---", action: "" });
      menuItems.push({ label: "Delete", action: "delete", icon: "🗑", danger: true });
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/6 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Files
        </span>
        <div className="flex items-center gap-1">
          {/* Save all */}
          {dirtyCount > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-vibe-400 transition-colors hover:bg-vibe-600/20 disabled:opacity-40"
              title={`Save ${dirtyCount} modified file${dirtyCount > 1 ? "s" : ""}`}
            >
              {saving ? "..." : "Save"}
              <span className="rounded-full bg-vibe-600/30 px-1 text-[9px]">{dirtyCount}</span>
            </button>
          )}
          {saveStatus && <span className="text-[10px] text-vibe-400">{saveStatus}</span>}
          {/* New file */}
          <button
            onClick={() => setInlineInput({ parentDir: "", kind: "file" })}
            className="rounded px-1.5 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300"
            title="New file"
          >
            +
          </button>
          {/* New folder */}
          <button
            onClick={() => setInlineInput({ parentDir: "", kind: "folder" })}
            className="rounded px-1.5 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300"
            title="New folder"
          >
            📁
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1" onContextMenu={handleRootContext}>
        {paths.length === 0 && !inlineInput && (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-[11px] text-slate-500">
              No files yet. Right-click to create
              <br />
              or switch to Execute mode.
            </p>
          </div>
        )}

        {/* Root-level inline input */}
        {inlineInput && inlineInput.parentDir === "" && (
          <InlineNameInput
            depth={0}
            kind={inlineInput.kind}
            onSubmit={handleInlineSubmit}
            onCancel={handleInlineCancel}
          />
        )}

        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            onContext={handleContext}
            inlineInput={inlineInput}
            onInlineSubmit={handleInlineSubmit}
            onInlineCancel={handleInlineCancel}
          />
        ))}
      </div>

      {/* Context menu */}
      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          items={menuItems}
          onAction={handleAction}
          onClose={() => setCtx(null)}
        />
      )}
    </div>
  );
}
