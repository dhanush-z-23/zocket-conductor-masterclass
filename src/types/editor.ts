export type ToolType =
  | 'select'
  | 'pan'
  | 'shape'
  | 'text'
  | 'draw'
  | 'ai-generate'
  | 'ai-inpaint';

export type ShapeType = 'rectangle' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'triangle';

export type RightSidebarTab = 'properties' | 'layers';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface EditorState {
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
}
