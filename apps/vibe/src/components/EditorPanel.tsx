import { lazy, Suspense } from "react";
import { useWorkspace } from "../lib/workspace-context";
import { languageFromPath } from "../lib/file-utils";
import FileTabs from "./FileTabs";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

export default function EditorPanel() {
  const { state, dispatch } = useWorkspace();

  const activeFile = state.activeTab ? state.files[state.activeTab] : null;

  return (
    <div className="flex h-full flex-col">
      <FileTabs />
      <div className="flex-1">
        {activeFile ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Loading editor...
              </div>
            }
          >
            <MonacoEditor
              key={state.activeTab}
              height="100%"
              language={languageFromPath(state.activeTab!)}
              value={activeFile.content}
              theme="vs-dark"
              onChange={(value) => {
                if (value !== undefined && state.activeTab) {
                  dispatch({
                    type: "UPDATE_FILE_CONTENT",
                    payload: { path: state.activeTab, content: value },
                  });
                }
              }}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: "on",
                renderLineHighlight: "line",
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
}
