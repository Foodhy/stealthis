import { useEffect, useRef } from "react";
import { WorkspaceProvider, useWorkspace } from "../lib/workspace-context";
import Dashboard from "./Dashboard";
import Workbench from "./Workbench";
import type { FileMap } from "../lib/types";

function VibeAppInner() {
  const { state, dispatch } = useWorkspace();
  const loadedRef = useRef("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    document.documentElement.classList.toggle("light", state.theme === "light");
  }, [state.theme]);

  // Load project files from disk when entering workbench
  useEffect(() => {
    if (!state.configured || !state.projectPath) return;
    // Don't reload if we already loaded this project path
    if (loadedRef.current === state.projectPath) return;
    loadedRef.current = state.projectPath;

    fetch(`/api/read-project?path=${encodeURIComponent(state.projectPath)}`)
      .then((r) => r.json())
      .then((data: { files: { path: string; content: string }[] }) => {
        if (!data.files || data.files.length === 0) return;
        const fileMap: FileMap = {};
        for (const f of data.files) {
          fileMap[f.path] = { path: f.path, content: f.content, dirty: false };
        }
        // Merge with any files already in state (from AI generation)
        const merged = { ...fileMap, ...state.files };
        dispatch({ type: "SET_FILES", payload: merged });
      })
      .catch(() => {});
  }, [state.configured, state.projectPath]);

  return state.configured ? <Workbench /> : <Dashboard />;
}

export default function VibeApp() {
  return (
    <WorkspaceProvider>
      <VibeAppInner />
    </WorkspaceProvider>
  );
}
