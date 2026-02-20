import { create } from 'zustand';

interface HistoryStore {
  canUndo: boolean;
  canRedo: boolean;
  setCanUndo: (v: boolean) => void;
  setCanRedo: (v: boolean) => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  canUndo: false,
  canRedo: false,
  setCanUndo: (v) => set({ canUndo: v }),
  setCanRedo: (v) => set({ canRedo: v }),
}));
