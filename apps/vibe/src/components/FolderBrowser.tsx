import { useCallback, useEffect, useState } from "react";

type Props = {
  onSelect: (path: string) => void;
  onClose: () => void;
};

export default function FolderBrowser({ onSelect, onClose }: Props) {
  const [currentPath, setCurrentPath] = useState("");
  const [dirs, setDirs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const browse = useCallback(async (path?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = path ? `?path=${encodeURIComponent(path)}` : "";
      const res = await fetch(`/api/browse${params}`);
      const data = (await res.json()) as {
        path: string;
        dirs: string[];
        error?: string;
      };
      setCurrentPath(data.path);
      setDirs(data.dirs);
      if (data.error) setError(data.error);
    } catch (err: any) {
      setError(err?.message ?? "Failed to browse");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    browse();
  }, [browse]);

  const goUp = () => {
    const parent = currentPath.split("/").slice(0, -1).join("/") || "/";
    browse(parent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-white/8 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <h2 className="text-sm font-medium text-slate-200">
            Select project folder
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
        </div>

        {/* Current path */}
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2">
          <button
            onClick={goUp}
            className="rounded border border-white/8 px-2 py-0.5 text-xs text-slate-400 hover:text-slate-200"
          >
            ..
          </button>
          <span className="flex-1 truncate font-mono text-xs text-slate-300">
            {currentPath}
          </span>
        </div>

        {/* Directory list */}
        <div className="max-h-64 overflow-y-auto px-2 py-2">
          {loading && (
            <div className="px-2 py-4 text-center text-xs text-slate-500">
              Loading...
            </div>
          )}
          {error && (
            <div className="px-2 py-2 text-xs text-red-400">{error}</div>
          )}
          {!loading && dirs.length === 0 && !error && (
            <div className="px-2 py-4 text-center text-xs text-slate-500">
              No subdirectories
            </div>
          )}
          {dirs.map((name) => (
            <button
              key={name}
              onClick={() => browse(`${currentPath}/${name}`)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-slate-300 transition-colors hover:bg-white/6"
            >
              <span className="text-slate-500">&#x1F4C1;</span>
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Select button */}
        <div className="border-t border-white/8 px-4 py-3">
          <button
            onClick={() => onSelect(currentPath)}
            className="w-full rounded-lg bg-vibe-600 py-2 text-xs font-medium text-white transition-colors hover:bg-vibe-500"
          >
            Select this folder
          </button>
        </div>
      </div>
    </div>
  );
}
