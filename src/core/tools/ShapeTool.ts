import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { BaseTool } from './BaseTool';
import type { ToolType, ShapeType } from '@/types/editor';

export class ShapeTool extends BaseTool {
  readonly type: ToolType = 'shape';
  readonly cursor = 'crosshair';

  private isDrawing = false;
  private startPoint: { x: number; y: number } | null = null;
  private currentShape: fabric.FabricObject | null = null;
  private shapeType: ShapeType = 'rectangle';
  private fillColor = '#3b82f6';
  private strokeColor = '#000000';
  private strokeWidth = 1;

  setShapeType(type: ShapeType) {
    this.shapeType = type;
  }

  setFillColor(color: string) {
    this.fillColor = color;
  }

  setStrokeColor(color: string) {
    this.strokeColor = color;
  }

  setStrokeWidth(width: number) {
    this.strokeWidth = width;
  }

  onActivate(): void {
    super.onActivate();
    this.canvas.selection = false;
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
  }

  onDeactivate(): void {
    super.onDeactivate();
    this.canvas.selection = true;
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
  }

  onMouseDown(opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {
    const pointer = this.canvas.getScenePoint(opt.e);
    this.isDrawing = true;
    this.startPoint = { x: pointer.x, y: pointer.y };

    const baseProps = {
      left: pointer.x,
      top: pointer.y,
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeUniform: true,
      originX: 'left' as const,
      originY: 'top' as const,
    };

    switch (this.shapeType) {
      case 'rectangle':
        this.currentShape = new fabric.Rect({
          ...baseProps,
          width: 0,
          height: 0,
          rx: 0,
          ry: 0,
        });
        break;
      case 'circle':
        this.currentShape = new fabric.Circle({
          ...baseProps,
          radius: 0,
        });
        break;
      case 'ellipse':
        this.currentShape = new fabric.Ellipse({
          ...baseProps,
          rx: 0,
          ry: 0,
        });
        break;
      case 'triangle':
        this.currentShape = new fabric.Triangle({
          ...baseProps,
          width: 0,
          height: 0,
        });
        break;
      case 'line':
      case 'arrow':
        this.currentShape = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeUniform: true,
          }
        );
        break;
    }

    if (this.currentShape) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.currentShape as any).id = uuidv4();
      this.canvas.add(this.currentShape);
    }
  }

  onMouseMove(opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {
    if (!this.isDrawing || !this.startPoint || !this.currentShape) return;

    const pointer = this.canvas.getScenePoint(opt.e);
    const width = pointer.x - this.startPoint.x;
    const height = pointer.y - this.startPoint.y;

    switch (this.shapeType) {
      case 'rectangle':
      case 'triangle':
        this.currentShape.set({
          left: width >= 0 ? this.startPoint.x : pointer.x,
          top: height >= 0 ? this.startPoint.y : pointer.y,
          width: Math.abs(width),
          height: Math.abs(height),
        });
        break;
      case 'circle': {
        const radius = Math.sqrt(width * width + height * height) / 2;
        (this.currentShape as fabric.Circle).set({
          radius,
          left: this.startPoint.x + width / 2 - radius,
          top: this.startPoint.y + height / 2 - radius,
        });
        break;
      }
      case 'ellipse':
        (this.currentShape as fabric.Ellipse).set({
          left: width >= 0 ? this.startPoint.x : pointer.x,
          top: height >= 0 ? this.startPoint.y : pointer.y,
          rx: Math.abs(width) / 2,
          ry: Math.abs(height) / 2,
        });
        break;
      case 'line':
      case 'arrow':
        (this.currentShape as fabric.Line).set({
          x2: pointer.x,
          y2: pointer.y,
        });
        break;
    }

    this.canvas.requestRenderAll();
  }

  onMouseUp(): void {
    if (!this.isDrawing || !this.currentShape) return;

    this.isDrawing = false;
    this.startPoint = null;

    // Remove tiny shapes (accidental clicks)
    const bounds = this.currentShape.getBoundingRect();
    if (bounds.width < 3 && bounds.height < 3) {
      this.canvas.remove(this.currentShape);
    } else {
      this.currentShape.set({
        selectable: true,
        evented: true,
      });
      this.currentShape.setCoords();
    }

    this.currentShape = null;
    this.canvas.requestRenderAll();
  }
}
