import { create } from 'zustand';
import { getDatabase } from '../db/init';
import { setUserSetting } from '../db/settings';

interface AppState {
  activeProgramId: number | null;
  setActiveProgramId: (id: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeProgramId: null,
  setActiveProgramId: (id) => {
    set({ activeProgramId: id });
    getDatabase().then(async (db) => {
      await setUserSetting(db, 'active_program_id', id !== null ? String(id) : null);
    });
  },
}));
