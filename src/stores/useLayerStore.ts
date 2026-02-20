import { create } from 'zustand';
import type { LayerInfo } from '@/types/layers';

interface LayerStore {
  layers: LayerInfo[];
  selectedLayerIds: string[];

  setLayers: (layers: LayerInfo[]) => void;
  setSelectedLayerIds: (ids: string[]) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
}

export const useLayerStore = create<LayerStore>((set) => ({
  layers: [],
  selectedLayerIds: [],

  setLayers: (layers) => set({ layers }),
  setSelectedLayerIds: (ids) => set({ selectedLayerIds: ids }),
  toggleVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    })),
  toggleLock: (id) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l
      ),
    })),
  renameLayer: (id, name) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, name } : l
      ),
    })),
}));
