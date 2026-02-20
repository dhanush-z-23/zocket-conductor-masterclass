import * as fabric from 'fabric';

export class HistoryManager {
  private canvas: fabric.Canvas;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxHistory = 50;
  private isRestoring = false;
  private onStateChange?: (canUndo: boolean, canRedo: boolean) => void;

  constructor(
    canvas: fabric.Canvas,
    onStateChange?: (canUndo: boolean, canRedo: boolean) => void
  ) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;
    // Save initial state
    this.saveState();
  }

  saveState(): void {
    if (this.isRestoring) return;

    const json = JSON.stringify(this.canvas.toJSON());

    // Don't save duplicate consecutive states
    if (
      this.undoStack.length > 0 &&
      this.undoStack[this.undoStack.length - 1] === json
    ) {
      return;
    }

    this.undoStack.push(json);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notifyStateChange();
  }

  async undo(): Promise<void> {
    if (!this.canUndo() || this.isRestoring) return;

    this.isRestoring = true;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    const previous = this.undoStack[this.undoStack.length - 1];

    await this.canvas.loadFromJSON(previous);
    this.canvas.requestRenderAll();
    this.isRestoring = false;
    this.notifyStateChange();
  }

  async redo(): Promise<void> {
    if (!this.canRedo() || this.isRestoring) return;

    this.isRestoring = true;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);

    await this.canvas.loadFromJSON(next);
    this.canvas.requestRenderAll();
    this.isRestoring = false;
    this.notifyStateChange();
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private notifyStateChange(): void {
    this.onStateChange?.(this.canUndo(), this.canRedo());
  }
}
