import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import type { WorkspaceState, WorkspaceAction } from "./types";
import { initialState, workspaceReducer } from "./workspace-reducer";

type WorkspaceContextValue = {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
