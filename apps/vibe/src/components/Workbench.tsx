import { useWorkspace } from "../lib/workspace-context";
import WorkbenchHeader from "./WorkbenchHeader";
import FileTree from "./FileTree";
import EditorPanel from "./EditorPanel";
import ChatPanel from "./ChatPanel";
import TerminalPanel from "./TerminalPanel";
import SettingsPanel from "./SettingsPanel";

export default function Workbench() {
  const { state } = useWorkspace();

  return (
    <div className="flex h-full flex-col">
      <WorkbenchHeader />
      <div className="workbench-grid flex-1 overflow-hidden">
        {/* File tree */}
        <div className="border-r border-white/8 overflow-y-auto">
          <FileTree />
        </div>

        {/* Editor + Terminal (vertical split) */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <EditorPanel />
          </div>
          {state.terminalVisible && (
            <div className="h-[240px] border-t border-white/8">
              <TerminalPanel />
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="border-l border-white/8 overflow-hidden">
          <ChatPanel />
        </div>
      </div>

      {state.settingsOpen && <SettingsPanel />}
    </div>
  );
}
