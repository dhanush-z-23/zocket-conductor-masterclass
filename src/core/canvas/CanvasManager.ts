import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { ViewportManager } from './ViewportManager';
import { HistoryManager } from './HistoryManager';
import { GuidesManager } from './GuidesManager';
import type { PlacementOptions } from '@/types/canvas';
import type { ToolType } from '@/types/editor';
import type { BaseTool } from '../tools/BaseTool';

export class CanvasManager {
  private canvas: fabric.Canvas;
  private viewportManager: ViewportManager;
  private historyManager: HistoryManager;
  private guidesManager: GuidesManager;
  private tools: Map<ToolType, BaseTool> = new Map();
  private activeTool: BaseTool | null = null;
  private onZoomChange?: (zoom: number) => void;
  private onSelectionChange?: (objects: fabric.FabricObject[]) => void;
  private onObjectsChange?: () => void;

  constructor(
    canvasElement: HTMLCanvasElement,
    options?: {
      onZoomChange?: (zoom: number) => void;
      onSelectionChange?: (objects: fabric.FabricObject[]) => void;
      onObjectsChange?: () => void;
      onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
    }
  ) {
    this.onZoomChange = options?.onZoomChange;
    this.onSelectionChange = options?.onSelectionChange;
    this.onObjectsChange = options?.onObjectsChange;

    this.canvas = new fabric.Canvas(canvasElement, {
      preserveObjectStacking: true,
      selection: true,
      fireRightClick: true,
      stopContextMenu: true,
      backgroundColor: '#f0f0f0',
    });

    // Default control styles for better visibility
    fabric.FabricObject.ownDefaults.borderColor = '#2563eb';
    fabric.FabricObject.ownDefaults.cornerColor = '#2563eb';
    fabric.FabricObject.ownDefaults.cornerStyle = 'circle';
    fabric.FabricObject.ownDefaults.transparentCorners = false;
    fabric.FabricObject.ownDefaults.borderScaleFactor = 2;
    fabric.FabricObject.ownDefaults.cornerSize = 8;

    this.viewportManager = new ViewportManager(this.canvas, this.onZoomChange);
    this.historyManager = new HistoryManager(this.canvas, options?.onHistoryChange);
    this.guidesManager = new GuidesManager(this.canvas);
    this.guidesManager.enable();
    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.on('selection:created', () => this.handleSelectionChange());
    this.canvas.on('selection:updated', () => this.handleSelectionChange());
    this.canvas.on('selection:cleared', () => this.handleSelectionChange());
    this.canvas.on('object:added', () => {
      this.onObjectsChange?.();
      this.historyManager.saveState();
    });
    this.canvas.on('object:removed', () => {
      this.onObjectsChange?.();
      this.historyManager.saveState();
    });
    this.canvas.on('object:modified', () => {
      this.onObjectsChange?.();
      this.historyManager.saveState();
    });

    // Preserve canvas background during text editing
    const savedBg = this.canvas.backgroundColor;
    this.canvas.on('text:editing:entered', () => {
      if (this.canvas.backgroundColor !== savedBg) {
        this.canvas.backgroundColor = savedBg;
        this.canvas.requestRenderAll();
      }
    });
    this.canvas.on('text:editing:exited', () => {
      if (this.canvas.backgroundColor !== savedBg) {
        this.canvas.backgroundColor = savedBg;
        this.canvas.requestRenderAll();
      }
    });

    // Delegate pointer events to active tool
    this.canvas.on('mouse:down', (opt) => {
      this.activeTool?.onMouseDown(opt);
    });
    this.canvas.on('mouse:move', (opt) => {
      this.activeTool?.onMouseMove(opt);
    });
    this.canvas.on('mouse:up', (opt) => {
      this.activeTool?.onMouseUp(opt);
    });
  }

  private handleSelectionChange() {
    const activeObjects = this.canvas.getActiveObjects();
    this.onSelectionChange?.(activeObjects);
  }

  // Tool management
  registerTool(type: ToolType, tool: BaseTool) {
    this.tools.set(type, tool);
  }

  setActiveTool(toolType: ToolType) {
    if (this.activeTool) {
      this.activeTool.onDeactivate();
    }

    const tool = this.tools.get(toolType);
    if (tool) {
      this.activeTool = tool;
      this.activeTool.onActivate();
    }

    // Handle pan tool via viewport manager
    this.viewportManager.setSpacePressed(toolType === 'pan');
  }

  // Object operations
  addObject(obj: fabric.FabricObject): fabric.FabricObject {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (!(obj as any).id) {
      (obj as any).id = uuidv4();
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    return obj;
  }

  removeSelected() {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => this.canvas.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  removeObject(obj: fabric.FabricObject) {
    this.canvas.remove(obj);
    this.canvas.requestRenderAll();
  }

  getObjects(): fabric.FabricObject[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.canvas.getObjects().filter((o) => !(o as any)._isGuideLine);
  }

  getActiveObjects(): fabric.FabricObject[] {
    return this.canvas.getActiveObjects();
  }

  discardSelection() {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  selectAll() {
    const objects = this.canvas.getObjects();
    if (objects.length === 0) return;
    const selection = new fabric.ActiveSelection(objects, { canvas: this.canvas });
    this.canvas.setActiveObject(selection);
    this.canvas.requestRenderAll();
  }

  // Image operations
  async addImageFromURL(url: string, options?: PlacementOptions): Promise<fabric.FabricImage> {
    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (img as any).id = uuidv4();

    if (options?.width) {
      img.scaleToWidth(options.width);
    }
    if (options?.height) {
      img.scaleToHeight(options.height);
    }

    if (options?.centerInViewport) {
      const center = this.canvas.getCenterPoint();
      const vpt = this.canvas.viewportTransform;
      if (vpt) {
        const zoom = this.canvas.getZoom();
        img.set({
          left: (center.x - vpt[4]) / zoom - (img.getScaledWidth() / 2),
          top: (center.y - vpt[5]) / zoom - (img.getScaledHeight() / 2),
        });
      }
    } else {
      img.set({
        left: options?.left ?? 100,
        top: options?.top ?? 100,
      });
    }

    this.canvas.add(img);
    this.canvas.setActiveObject(img);
    this.canvas.requestRenderAll();
    return img;
  }

  async addImageFromBase64(data: string, options?: PlacementOptions): Promise<fabric.FabricImage> {
    const url = data.startsWith('data:') ? data : `data:image/png;base64,${data}`;
    return this.addImageFromURL(url, options);
  }

  // Canvas state
  getCanvasJSON(): string {
    return JSON.stringify(this.canvas.toJSON());
  }

  async loadFromJSON(json: string): Promise<void> {
    await this.canvas.loadFromJSON(json);
    this.canvas.requestRenderAll();
  }

  // History operations
  async undo(): Promise<void> {
    await this.historyManager.undo();
    this.onObjectsChange?.();
  }

  async redo(): Promise<void> {
    await this.historyManager.redo();
    this.onObjectsChange?.();
  }

  getHistoryManager(): HistoryManager {
    return this.historyManager;
  }

  // Viewport delegation
  getViewportManager(): ViewportManager {
    return this.viewportManager;
  }

  getZoom(): number {
    return this.canvas.getZoom();
  }

  // Canvas access
  getFabricCanvas(): fabric.Canvas {
    return this.canvas;
  }

  // Resize
  resize(width: number, height: number) {
    this.canvas.setDimensions({ width, height });
    this.canvas.requestRenderAll();
  }

  // Clipboard
  private clipboard: fabric.FabricObject | null = null;

  async copy() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    this.clipboard = await active.clone();
  }

  async paste() {
    if (!this.clipboard) return;
    const cloned = await this.clipboard.clone();
    this.canvas.discardActiveObject();

    cloned.set({
      left: (cloned.left ?? 0) + 20,
      top: (cloned.top ?? 0) + 20,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cloned as any).id = uuidv4();

    if (cloned instanceof fabric.ActiveSelection) {
      cloned.canvas = this.canvas;
      cloned.forEachObject((obj: fabric.FabricObject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (obj as any).id = uuidv4();
        this.canvas.add(obj);
      });
      cloned.setCoords();
    } else {
      this.canvas.add(cloned);
    }

    this.clipboard.set({
      left: (this.clipboard.left ?? 0) + 20,
      top: (this.clipboard.top ?? 0) + 20,
    });

    this.canvas.setActiveObject(cloned);
    this.canvas.requestRenderAll();
  }

  async duplicate() {
    await this.copy();
    await this.paste();
  }

  // Layer operations
  moveObjectToIndex(obj: fabric.FabricObject, index: number) {
    // Remove and re-insert at target index
    const objects = this.canvas.getObjects();
    const currentIndex = objects.indexOf(obj);
    if (currentIndex === -1 || currentIndex === index) return;
    this.canvas.remove(obj);
    // Re-add at the correct position
    this.canvas.insertAt(index, obj);
    this.canvas.requestRenderAll();
  }

  bringForward(obj?: fabric.FabricObject) {
    const target = obj || this.canvas.getActiveObject();
    if (!target) return;
    this.canvas.bringObjectForward(target);
    this.canvas.requestRenderAll();
  }

  sendBackward(obj?: fabric.FabricObject) {
    const target = obj || this.canvas.getActiveObject();
    if (!target) return;
    this.canvas.sendObjectBackwards(target);
    this.canvas.requestRenderAll();
  }

  bringToFront(obj?: fabric.FabricObject) {
    const target = obj || this.canvas.getActiveObject();
    if (!target) return;
    this.canvas.bringObjectToFront(target);
    this.canvas.requestRenderAll();
  }

  sendToBack(obj?: fabric.FabricObject) {
    const target = obj || this.canvas.getActiveObject();
    if (!target) return;
    this.canvas.sendObjectToBack(target);
    this.canvas.requestRenderAll();
  }

  dispose() {
    this.guidesManager.dispose();
    this.viewportManager.dispose();
    this.canvas.dispose();
  }
}
