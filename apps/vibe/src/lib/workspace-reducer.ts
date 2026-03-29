import type { WorkspaceState, WorkspaceAction } from "./types";

export const initialState: WorkspaceState = {
  projectId: "",
  configured: false,
  config: { name: "", description: "", stack: "react" },
  mode: "plan",
  settingsOpen: false,
  folder: null,
  projectPath: "",
  theme: "dark",
  files: {},
  openTabs: [],
  activeTab: null,
  messages: [],
  loading: false,
  providerError: "",
  terminalLines: [],
  terminalRunning: false,
  terminalVisible: false,
  terminalCwd: "",
};

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "SET_PROJECT_ID":
      return { ...state, projectId: action.payload };
    case "SET_CONFIG":
      return { ...state, config: action.payload };
    case "SET_CONFIGURED":
      return {
        ...state,
        configured: action.payload,
        terminalVisible: action.payload ? true : state.terminalVisible,
      };
    case "RESTORE_PROJECT":
      return {
        ...state,
        projectId: action.payload.projectId,
        config: action.payload.config,
        projectPath: action.payload.projectPath,
        terminalCwd: action.payload.projectPath,
        messages: action.payload.messages,
        configured: true,
        files: {},
        openTabs: [],
        activeTab: null,
        loading: false,
        providerError: "",
        terminalLines: [],
        terminalRunning: false,
        terminalVisible: true,
      };
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_SETTINGS_OPEN":
      return { ...state, settingsOpen: action.payload };
    case "SET_FOLDER":
      return { ...state, folder: action.payload };
    case "SET_PROJECT_PATH":
      return { ...state, projectPath: action.payload, terminalCwd: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_FILES":
      return { ...state, files: action.payload };
    case "UPSERT_FILE": {
      const f = action.payload;
      const openTabs = state.openTabs.some((t) => t.path === f.path)
        ? state.openTabs
        : [...state.openTabs, { path: f.path, dirty: f.dirty }];
      return { ...state, files: { ...state.files, [f.path]: f }, openTabs, activeTab: f.path };
    }
    case "UPDATE_FILE_CONTENT": {
      const { path, content } = action.payload;
      const existing = state.files[path];
      if (!existing) return state;
      return {
        ...state,
        files: { ...state.files, [path]: { ...existing, content, dirty: true } },
        openTabs: state.openTabs.map((t) => (t.path === path ? { ...t, dirty: true } : t)),
      };
    }
    case "OPEN_TAB": {
      const path = action.payload;
      const already = state.openTabs.some((t) => t.path === path);
      return {
        ...state,
        openTabs: already ? state.openTabs : [...state.openTabs, { path, dirty: false }],
        activeTab: path,
      };
    }
    case "CLOSE_TAB": {
      const path = action.payload;
      const filtered = state.openTabs.filter((t) => t.path !== path);
      let activeTab = state.activeTab;
      if (activeTab === path) {
        activeTab = filtered.length > 0 ? filtered[filtered.length - 1].path : null;
      }
      return { ...state, openTabs: filtered, activeTab };
    }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_LAST_ASSISTANT": {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content: action.payload };
      }
      return { ...state, messages: msgs };
    }
    case "APPEND_TO_LAST_ASSISTANT": {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.payload };
      }
      return { ...state, messages: msgs };
    }
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_PROVIDER_ERROR":
      return { ...state, providerError: action.payload };
    case "TERMINAL_ADD_LINE":
      return { ...state, terminalLines: [...state.terminalLines, action.payload] };
    case "TERMINAL_CLEAR":
      return { ...state, terminalLines: [] };
    case "TERMINAL_SET_RUNNING":
      return { ...state, terminalRunning: action.payload };
    case "TERMINAL_SET_VISIBLE":
      return { ...state, terminalVisible: action.payload };
    case "TERMINAL_SET_CWD":
      return { ...state, terminalCwd: action.payload };
    default:
      return state;
  }
}
