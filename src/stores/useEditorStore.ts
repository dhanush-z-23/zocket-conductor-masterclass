import { create } from 'zustand';
import type { ToolType, ShapeType, RightSidebarTab } from '@/types/editor';

interface EditorStore {
  activeTool: ToolType;
  activeShapeType: ShapeType;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  rightSidebarTab: RightSidebarTab;
  brushSize: number;
  brushColor: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;

  setActiveTool: (tool: ToolType) => void;
  setActiveShapeType: (shape: ShapeType) => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setRightSidebarTab: (tab: RightSidebarTab) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeTool: 'select',
  activeShapeType: 'rectangle',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  rightSidebarTab: 'properties',
  brushSize: 4,
  brushColor: '#000000',
  fillColor: '#3b82f6',
  strokeColor: '#000000',
  strokeWidth: 1,
  fontSize: 24,
  fontFamily: 'Arial',

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveShapeType: (shape) => set({ activeShapeType: shape }),
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushColor: (color) => set({ brushColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
  setFontFamily: (family) => set({ fontFamily: family }),
}));
