import { createStore } from "zustand/vanilla";

interface WorkspaceState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export function createWorkspaceStore() {
  return createStore<WorkspaceState>()((set) => ({
    isSidebarOpen: true,
    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  }));
}
