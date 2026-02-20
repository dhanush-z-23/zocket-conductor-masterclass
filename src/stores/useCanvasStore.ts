import { create } from 'zustand';

interface CanvasStore {
  zoom: number;
  backgroundColor: string;
  selectedObjectIds: string[];

  setZoom: (zoom: number) => void;
  setBackgroundColor: (color: string) => void;
  setSelectedObjectIds: (ids: string[]) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  zoom: 1,
  backgroundColor: '#f0f0f0',
  selectedObjectIds: [],

  setZoom: (zoom) => set({ zoom }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),
}));
