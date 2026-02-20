import * as fabric from 'fabric';
import { BaseTool } from './BaseTool';
import type { ToolType } from '@/types/editor';

export class DrawTool extends BaseTool {
  readonly type: ToolType = 'draw';
  readonly cursor = 'crosshair';

  private brushSize = 4;
  private brushColor = '#000000';

  setBrushSize(size: number) {
    this.brushSize = size;
    if (this.canvas.isDrawingMode && this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = size;
    }
  }

  setBrushColor(color: string) {
    this.brushColor = color;
    if (this.canvas.isDrawingMode && this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
  }

  onActivate(): void {
    super.onActivate();
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.width = this.brushSize;
    this.canvas.freeDrawingBrush.color = this.brushColor;
  }

  onDeactivate(): void {
    this.canvas.isDrawingMode = false;
    super.onDeactivate();
  }
}
