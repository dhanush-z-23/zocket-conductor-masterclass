import * as fabric from 'fabric';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export class ViewportManager {
  private canvas: fabric.Canvas;
  private isPanning = false;
  private lastPanPoint: { x: number; y: number } | null = null;
  private spacePressed = false;
  private onZoomChange?: (zoom: number) => void;

  constructor(canvas: fabric.Canvas, onZoomChange?: (zoom: number) => void) {
    this.canvas = canvas;
    this.onZoomChange = onZoomChange;
    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.on('mouse:wheel', this.handleWheel.bind(this));
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleWheel(opt: any) {
    const e = opt.e as WheelEvent;
    e.preventDefault();
    e.stopPropagation();

    // Ctrl/Cmd + scroll = zoom
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);

      const point = new fabric.Point(e.offsetX, e.offsetY);
      this.canvas.zoomToPoint(point, zoom);
      this.onZoomChange?.(zoom);
    } else {
      // Regular scroll = pan
      const vpt = this.canvas.viewportTransform;
      if (!vpt) return;
      vpt[4] -= e.deltaX;
      vpt[5] -= e.deltaY;
      this.canvas.requestRenderAll();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleMouseDown(opt: any) {
    const e = opt.e as MouseEvent;
    if (this.spacePressed || e.button === 1) {
      this.isPanning = true;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
      this.canvas.selection = false;
      this.canvas.setCursor('grabbing');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleMouseMove(opt: any) {
    if (!this.isPanning || !this.lastPanPoint) return;
    const e = opt.e as MouseEvent;
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;

    vpt[4] += e.clientX - this.lastPanPoint.x;
    vpt[5] += e.clientY - this.lastPanPoint.y;
    this.lastPanPoint = { x: e.clientX, y: e.clientY };
    this.canvas.requestRenderAll();
  }

  private handleMouseUp() {
    if (this.isPanning) {
      this.isPanning = false;
      this.lastPanPoint = null;
      this.canvas.selection = true;
      this.canvas.setCursor(this.spacePressed ? 'grab' : 'default');
    }
  }

  setSpacePressed(pressed: boolean) {
    this.spacePressed = pressed;
    if (pressed) {
      this.canvas.setCursor('grab');
      this.canvas.selection = false;
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    } else {
      this.canvas.setCursor('default');
      this.canvas.selection = true;
    }
  }

  zoomTo(zoom: number) {
    const clampedZoom = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
    const center = this.canvas.getCenterPoint();
    this.canvas.zoomToPoint(new fabric.Point(center.x, center.y), clampedZoom);
    this.onZoomChange?.(clampedZoom);
  }

  zoomIn() {
    this.zoomTo(this.canvas.getZoom() * 1.2);
  }

  zoomOut() {
    this.zoomTo(this.canvas.getZoom() / 1.2);
  }

  fitToScreen() {
    const objects = this.canvas.getObjects();
    if (objects.length === 0) {
      this.zoomTo(1);
      const vpt = this.canvas.viewportTransform;
      if (vpt) {
        vpt[4] = 0;
        vpt[5] = 0;
      }
      this.canvas.requestRenderAll();
      this.onZoomChange?.(1);
      return;
    }

    const bounds = this.getObjectsBounds();
    if (!bounds) return;

    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    const padding = 40;

    const zoomX = (canvasWidth - padding * 2) / bounds.width;
    const zoomY = (canvasHeight - padding * 2) / bounds.height;
    const zoom = Math.min(Math.min(zoomX, zoomY), MAX_ZOOM);

    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.canvas.zoomToPoint(
      new fabric.Point(canvasWidth / 2, canvasHeight / 2),
      zoom
    );

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const vpt = this.canvas.viewportTransform;
    if (vpt) {
      vpt[4] = canvasWidth / 2 - centerX * zoom;
      vpt[5] = canvasHeight / 2 - centerY * zoom;
    }
    this.canvas.requestRenderAll();
    this.onZoomChange?.(zoom);
  }

  resetView() {
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.onZoomChange?.(1);
  }

  private getObjectsBounds() {
    const objects = this.canvas.getObjects();
    if (objects.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const obj of objects) {
      const bound = obj.getBoundingRect();
      minX = Math.min(minX, bound.left);
      minY = Math.min(minY, bound.top);
      maxX = Math.max(maxX, bound.left + bound.width);
      maxY = Math.max(maxY, bound.top + bound.height);
    }

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  getZoom() {
    return this.canvas.getZoom();
  }

  dispose() {
    this.canvas.off('mouse:wheel');
    this.canvas.off('mouse:down');
    this.canvas.off('mouse:move');
    this.canvas.off('mouse:up');
  }
}
