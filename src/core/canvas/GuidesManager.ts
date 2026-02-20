import * as fabric from 'fabric';

export class GuidesManager {
  private canvas: fabric.Canvas;
  private guideLines: fabric.FabricObject[] = [];
  private snapThreshold = 5;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  enable(): void {
    this.canvas.on('object:moving', this.handleObjectMoving);
    this.canvas.on('object:modified', this.clearGuides);
    this.canvas.on('mouse:up', this.clearGuides);
  }

  private handleObjectMoving = (
    e: fabric.TEvent<fabric.TPointerEvent> & { target?: fabric.FabricObject }
  ): void => {
    const target = e.target;
    if (!target) return;

    this.clearGuides();

    const targetLeft = target.left ?? 0;
    const targetTop = target.top ?? 0;
    const targetWidth = target.getScaledWidth();
    const targetHeight = target.getScaledHeight();
    const targetCenterX = targetLeft + targetWidth / 2;
    const targetCenterY = targetTop + targetHeight / 2;
    const targetRight = targetLeft + targetWidth;
    const targetBottom = targetTop + targetHeight;

    const canvasCenterX = this.canvas.getWidth() / 2;
    const canvasCenterY = this.canvas.getHeight() / 2;

    const others = this.canvas
      .getObjects()
      .filter(
        (o) =>
          o !== target &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !(o as any)._isGuideLine &&
          o.visible !== false
      );

    let snappedX = false;
    let snappedY = false;

    // Check canvas center guides
    if (Math.abs(targetCenterX - canvasCenterX) < this.snapThreshold) {
      target.set('left', canvasCenterX - targetWidth / 2);
      this.addGuideLine(canvasCenterX, 0, canvasCenterX, this.canvas.getHeight());
      snappedX = true;
    }
    if (Math.abs(targetCenterY - canvasCenterY) < this.snapThreshold) {
      target.set('top', canvasCenterY - targetHeight / 2);
      this.addGuideLine(0, canvasCenterY, this.canvas.getWidth(), canvasCenterY);
      snappedY = true;
    }

    for (const obj of others) {
      if (snappedX && snappedY) break;

      const objLeft = obj.left ?? 0;
      const objTop = obj.top ?? 0;
      const objWidth = obj.getScaledWidth();
      const objHeight = obj.getScaledHeight();
      const objCenterX = objLeft + objWidth / 2;
      const objCenterY = objTop + objHeight / 2;
      const objRight = objLeft + objWidth;
      const objBottom = objTop + objHeight;

      if (!snappedX) {
        // Left edge alignment
        if (Math.abs(targetLeft - objLeft) < this.snapThreshold) {
          target.set('left', objLeft);
          this.addGuideLine(objLeft, Math.min(targetTop, objTop) - 20, objLeft, Math.max(targetBottom, objBottom) + 20);
          snappedX = true;
        }
        // Right edge alignment
        else if (Math.abs(targetRight - objRight) < this.snapThreshold) {
          target.set('left', objRight - targetWidth);
          this.addGuideLine(objRight, Math.min(targetTop, objTop) - 20, objRight, Math.max(targetBottom, objBottom) + 20);
          snappedX = true;
        }
        // Left to right
        else if (Math.abs(targetLeft - objRight) < this.snapThreshold) {
          target.set('left', objRight);
          this.addGuideLine(objRight, Math.min(targetTop, objTop) - 20, objRight, Math.max(targetBottom, objBottom) + 20);
          snappedX = true;
        }
        // Right to left
        else if (Math.abs(targetRight - objLeft) < this.snapThreshold) {
          target.set('left', objLeft - targetWidth);
          this.addGuideLine(objLeft, Math.min(targetTop, objTop) - 20, objLeft, Math.max(targetBottom, objBottom) + 20);
          snappedX = true;
        }
        // Center X
        else if (Math.abs(targetCenterX - objCenterX) < this.snapThreshold) {
          target.set('left', objCenterX - targetWidth / 2);
          this.addGuideLine(objCenterX, Math.min(targetTop, objTop) - 20, objCenterX, Math.max(targetBottom, objBottom) + 20);
          snappedX = true;
        }
      }

      if (!snappedY) {
        // Top edge alignment
        if (Math.abs(targetTop - objTop) < this.snapThreshold) {
          target.set('top', objTop);
          this.addGuideLine(Math.min(targetLeft, objLeft) - 20, objTop, Math.max(targetRight, objRight) + 20, objTop);
          snappedY = true;
        }
        // Bottom edge alignment
        else if (Math.abs(targetBottom - objBottom) < this.snapThreshold) {
          target.set('top', objBottom - targetHeight);
          this.addGuideLine(Math.min(targetLeft, objLeft) - 20, objBottom, Math.max(targetRight, objRight) + 20, objBottom);
          snappedY = true;
        }
        // Top to bottom
        else if (Math.abs(targetTop - objBottom) < this.snapThreshold) {
          target.set('top', objBottom);
          this.addGuideLine(Math.min(targetLeft, objLeft) - 20, objBottom, Math.max(targetRight, objRight) + 20, objBottom);
          snappedY = true;
        }
        // Bottom to top
        else if (Math.abs(targetBottom - objTop) < this.snapThreshold) {
          target.set('top', objTop - targetHeight);
          this.addGuideLine(Math.min(targetLeft, objLeft) - 20, objTop, Math.max(targetRight, objRight) + 20, objTop);
          snappedY = true;
        }
        // Center Y
        else if (Math.abs(targetCenterY - objCenterY) < this.snapThreshold) {
          target.set('top', objCenterY - targetHeight / 2);
          this.addGuideLine(Math.min(targetLeft, objLeft) - 20, objCenterY, Math.max(targetRight, objRight) + 20, objCenterY);
          snappedY = true;
        }
      }
    }

    this.canvas.requestRenderAll();
  };

  private addGuideLine(x1: number, y1: number, x2: number, y2: number): void {
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: '#ff00ff',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (line as any)._isGuideLine = true;
    this.canvas.add(line);
    this.guideLines.push(line);
  }

  clearGuides = (): void => {
    if (this.guideLines.length === 0) return;
    this.guideLines.forEach((l) => this.canvas.remove(l));
    this.guideLines = [];
    this.canvas.requestRenderAll();
  };

  dispose(): void {
    this.canvas.off('object:moving', this.handleObjectMoving);
    this.canvas.off('object:modified', this.clearGuides);
    this.canvas.off('mouse:up', this.clearGuides);
    this.clearGuides();
  }
}
