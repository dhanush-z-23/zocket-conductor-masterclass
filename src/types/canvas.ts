export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
}

export interface ObjectSpec {
  type: 'rectangle' | 'circle' | 'ellipse' | 'line' | 'triangle' | 'text' | 'image';
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  src?: string;
  [key: string]: unknown;
}

export interface BoundingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PlacementOptions {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  centerInViewport?: boolean;
}
