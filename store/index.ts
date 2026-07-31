import { create } from 'zustand';

interface AppState {
  activeProgramId: number | null;
  setActiveProgramId: (id: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeProgramId: null,
  setActiveProgramId: (id) => set({ activeProgramId: id }),
}));
