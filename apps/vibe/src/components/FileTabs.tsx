import { useWorkspace } from "../lib/workspace-context";
import { getFileIcon } from "../lib/file-icons";

function TabIcon({ name }: { name: string }) {
  const { icon, color } = getFileIcon(name);
  const isEmoji = /\p{Emoji_Presentation}/u.test(icon);
  if (isEmoji) {
    return <span className="text-[10px]">{icon}</span>;
  }
  return (
    <span className="text-[9px] font-bold" style={{ color }}>
      {icon}
    </span>
  );
}

export default function FileTabs() {
  const { state, dispatch } = useWorkspace();

  if (state.openTabs.length === 0) return null;

  return (
    <div className="flex border-b border-white/8 bg-slate-950">
      {state.openTabs.map((tab) => {
        const isActive = state.activeTab === tab.path;
        const fileName = tab.path.split("/").pop() ?? tab.path;

        return (
          <div
            key={tab.path}
            className={`group flex items-center gap-1.5 border-r border-white/6 px-3 py-1.5 text-xs ${
              isActive ? "bg-slate-900 text-slate-200" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <button
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: tab.path })}
              className="flex items-center gap-1.5"
            >
              <TabIcon name={fileName} />
              <span>{fileName}</span>
              {tab.dirty && <span className="text-[10px] font-medium text-vibe-400">M</span>}
            </button>
            <button
              onClick={() => dispatch({ type: "CLOSE_TAB", payload: tab.path })}
              className="ml-1 text-[10px] text-slate-600 opacity-0 transition-opacity hover:text-slate-300 group-hover:opacity-100"
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}
