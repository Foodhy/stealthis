export type ChatImage = {
  mimeType: string;
  data: string; // base64
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: ChatImage[];
};

export type ProjectFolder = {
  handle: FileSystemDirectoryHandle;
  name: string;
};

export type AppMode = "plan" | "execute";

export type TechStack =
  | "html"
  | "react"
  | "next"
  | "astro"
  | "vue"
  | "svelte"
  | "node"
  | "other";

export type ProjectConfig = {
  name: string;
  description: string;
  stack: TechStack;
};

export type FileEntry = {
  path: string;
  content: string;
  dirty: boolean;
};

export type FileMap = Record<string, FileEntry>;

export type OpenTab = {
  path: string;
  dirty: boolean;
};

export type TerminalLine = {
  type: "stdin" | "stdout" | "stderr" | "info";
  text: string;
};

export type WorkspaceState = {
  projectId: string;
  configured: boolean;
  config: ProjectConfig;
  mode: AppMode;
  settingsOpen: boolean;
  folder: ProjectFolder | null;
  projectPath: string;
  theme: "dark" | "light";
  files: FileMap;
  openTabs: OpenTab[];
  activeTab: string | null;
  messages: ChatMessage[];
  loading: boolean;
  providerError: string;
  terminalLines: TerminalLine[];
  terminalRunning: boolean;
  terminalVisible: boolean;
  terminalCwd: string;
};

export type WorkspaceAction =
  | { type: "SET_PROJECT_ID"; payload: string }
  | { type: "SET_CONFIG"; payload: ProjectConfig }
  | { type: "SET_CONFIGURED"; payload: boolean }
  | { type: "RESTORE_PROJECT"; payload: { projectId: string; config: ProjectConfig; projectPath: string; messages: ChatMessage[] } }
  | { type: "SET_MODE"; payload: AppMode }
  | { type: "SET_SETTINGS_OPEN"; payload: boolean }
  | { type: "SET_FOLDER"; payload: ProjectFolder | null }
  | { type: "SET_PROJECT_PATH"; payload: string }
  | { type: "SET_THEME"; payload: "dark" | "light" }
  | { type: "SET_FILES"; payload: FileMap }
  | { type: "UPSERT_FILE"; payload: FileEntry }
  | { type: "UPDATE_FILE_CONTENT"; payload: { path: string; content: string } }
  | { type: "OPEN_TAB"; payload: string }
  | { type: "CLOSE_TAB"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string | null }
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_LAST_ASSISTANT"; payload: string }
  | { type: "APPEND_TO_LAST_ASSISTANT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PROVIDER_ERROR"; payload: string }
  | { type: "TERMINAL_ADD_LINE"; payload: TerminalLine }
  | { type: "TERMINAL_CLEAR" }
  | { type: "TERMINAL_SET_RUNNING"; payload: boolean }
  | { type: "TERMINAL_SET_VISIBLE"; payload: boolean }
  | { type: "TERMINAL_SET_CWD"; payload: string };
