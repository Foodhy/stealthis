import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "../lib/workspace-context";
import type { TechStack, ChatMessage } from "../lib/types";
import FolderBrowser from "./FolderBrowser";

const STACKS: { value: TechStack; label: string }[] = [
  { value: "html", label: "HTML / CSS / JS" },
  { value: "react", label: "React" },
  { value: "next", label: "Next.js" },
  { value: "astro", label: "Astro" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "node", label: "Node.js" },
  { value: "other", label: "Other" },
];

type SavedProject = {
  id: string;
  name: string;
  description: string;
  stack: string;
  projectPath: string;
  createdAt: string;
  updatedAt: string;
};

function generateId() {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { dispatch } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState<TechStack>("react");
  const [projectPath, setProjectPath] = useState("");
  const [showBrowser, setShowBrowser] = useState(false);

  const [recentProjects, setRecentProjects] = useState<SavedProject[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Load recent projects
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: { projects: SavedProject[] }) => {
        setRecentProjects(data.projects ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, []);

  const canSubmit = name.trim().length > 0 && projectPath.length > 0;

  const fullPath = projectPath
    ? `${projectPath}${name.trim() && !projectPath.endsWith(name.trim()) ? `/${name.trim()}` : ""}`
    : "";

  async function handleStart() {
    if (!canSubmit) return;

    const id = generateId();
    const config = {
      name: name.trim(),
      description: description.trim(),
      stack,
    };

    // Save project to disk and create the project directory
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: config.name,
          description: config.description,
          stack: config.stack,
          projectPath: fullPath,
        }),
      });
      // Ensure the project directory exists
      await fetch("/api/write-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectPath: fullPath,
          filePath: ".gitkeep",
          content: "",
        }),
      });
    } catch {}

    dispatch({ type: "SET_PROJECT_ID", payload: id });
    dispatch({ type: "SET_CONFIG", payload: config });
    dispatch({ type: "SET_PROJECT_PATH", payload: fullPath });
    dispatch({ type: "SET_CONFIGURED", payload: true });
  }

  const handleResume = useCallback(
    async (project: SavedProject) => {
      try {
        const res = await fetch(`/api/projects?id=${encodeURIComponent(project.id)}`);
        const data = (await res.json()) as {
          project: SavedProject;
          messages: ChatMessage[];
        };

        dispatch({
          type: "RESTORE_PROJECT",
          payload: {
            projectId: data.project.id,
            config: {
              name: data.project.name,
              description: data.project.description,
              stack: data.project.stack as TechStack,
            },
            projectPath: data.project.projectPath,
            messages: (data.messages ?? []) as ChatMessage[],
          },
        });
      } catch {
        // Fallback: open without chat history
        dispatch({
          type: "RESTORE_PROJECT",
          payload: {
            projectId: project.id,
            config: {
              name: project.name,
              description: project.description,
              stack: project.stack as TechStack,
            },
            projectPath: project.projectPath,
            messages: [],
          },
        });
      }
    },
    [dispatch]
  );

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setRecentProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex w-full max-w-2xl gap-6 px-4">
        {/* New project form */}
        <div className="w-full max-w-md rounded-xl border border-white/8 bg-slate-900/60 p-8">
          <h1 className="mb-1 text-2xl font-bold text-vibe-400">Vibe</h1>
          <p className="mb-6 text-sm text-slate-400">Set up your project to get started.</p>

          <label className="mb-1 block text-xs font-medium text-slate-300">Project name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-awesome-app"
            className="mb-4 w-full rounded-lg border border-white/8 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-vibe-500/50"
          />

          <label className="mb-1 block text-xs font-medium text-slate-300">Project folder</label>
          <button
            onClick={() => setShowBrowser(true)}
            className="mb-1 flex w-full items-center justify-between rounded-lg border border-white/8 bg-slate-950 px-3 py-2 text-left text-sm transition-colors hover:border-white/14"
          >
            {projectPath ? (
              <span className="truncate font-mono text-slate-200">{projectPath}</span>
            ) : (
              <span className="text-slate-500">Browse...</span>
            )}
            <span className="ml-2 shrink-0 text-xs text-slate-500">Select</span>
          </button>
          {fullPath && (
            <p className="mb-4 text-[10px] text-slate-500">
              Files will be written to: <span className="font-mono text-slate-400">{fullPath}</span>
            </p>
          )}
          {!fullPath && <div className="mb-4" />}

          <label className="mb-1 block text-xs font-medium text-slate-300">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of what you want to build..."
            rows={2}
            className="mb-4 w-full resize-none rounded-lg border border-white/8 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-vibe-500/50"
          />

          <label className="mb-1 block text-xs font-medium text-slate-300">Tech stack</label>
          <div className="mb-6 grid grid-cols-4 gap-2">
            {STACKS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStack(s.value)}
                className={`rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                  stack === s.value
                    ? "border-vibe-500/50 bg-vibe-600/20 text-vibe-300"
                    : "border-white/8 text-slate-400 hover:border-white/14 hover:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-vibe-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-vibe-500 disabled:opacity-40"
          >
            Start Building
          </button>
        </div>

        {/* Recent projects */}
        <div className="w-64 shrink-0">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Recent Projects
          </h2>

          {loadingRecent && <p className="text-xs text-slate-500">Loading...</p>}

          {!loadingRecent && recentProjects.length === 0 && (
            <p className="text-xs text-slate-500">No previous projects yet.</p>
          )}

          <div className="flex flex-col gap-2">
            {recentProjects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => handleResume(proj)}
                className="group relative rounded-lg border border-white/8 bg-slate-900/40 px-3 py-2.5 text-left transition-colors hover:border-vibe-500/30 hover:bg-slate-900/80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">{proj.name}</span>
                  <button
                    onClick={(e) => handleDelete(e, proj.id)}
                    className="hidden rounded px-1 text-[10px] text-slate-600 transition-colors hover:text-red-400 group-hover:block"
                    title="Delete project"
                  >
                    x
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {proj.stack}
                  </span>
                  <span className="text-[10px] text-slate-500">{timeAgo(proj.updatedAt)}</span>
                </div>
                {proj.description && (
                  <p className="mt-1 truncate text-[11px] text-slate-500">{proj.description}</p>
                )}
                <p className="mt-1 truncate font-mono text-[10px] text-slate-600">
                  {proj.projectPath}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showBrowser && (
        <FolderBrowser
          onSelect={(path) => {
            setProjectPath(path);
            setShowBrowser(false);
          }}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </div>
  );
}
