import * as fabric from 'fabric';
import type { CanvasManager } from '../canvas/CanvasManager';
import type { ToolType } from '@/types/editor';

export abstract class BaseTool {
  protected manager: CanvasManager;
  protected canvas: fabric.Canvas;

  abstract readonly type: ToolType;
  abstract readonly cursor: string;

  constructor(manager: CanvasManager) {
    this.manager = manager;
    this.canvas = manager.getFabricCanvas();
  }

  onActivate(): void {
    this.canvas.defaultCursor = this.cursor;
    this.canvas.hoverCursor = this.cursor;
  }

  onDeactivate(): void {
    this.canvas.defaultCursor = 'default';
    this.canvas.hoverCursor = 'move';
    this.canvas.isDrawingMode = false;
  }

  onMouseDown(_opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {}
  onMouseMove(_opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {}
  onMouseUp(_opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {}
  onKeyDown(_e: KeyboardEvent): void {}
}
