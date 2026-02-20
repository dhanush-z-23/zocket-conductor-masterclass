import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { BaseTool } from './BaseTool';
import type { ToolType } from '@/types/editor';

export class TextTool extends BaseTool {
  readonly type: ToolType = 'text';
  readonly cursor = 'text';

  private fontSize = 24;
  private fontFamily = 'Arial';
  private fillColor = '#000000';

  setFontSize(size: number) {
    this.fontSize = size;
  }

  setFontFamily(family: string) {
    this.fontFamily = family;
  }

  setFillColor(color: string) {
    this.fillColor = color;
  }

  onActivate(): void {
    super.onActivate();
    this.canvas.selection = false;
  }

  onDeactivate(): void {
    super.onDeactivate();
    this.canvas.selection = true;
  }

  onMouseDown(opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {
    // If clicking on an existing text, enter editing mode on it
    if (opt.target && opt.target instanceof fabric.IText) {
      const target = opt.target;
      this.canvas.setActiveObject(target);
      target.enterEditing();
      // Position caret at end
      target.setSelectionStart(target.text?.length ?? 0);
      target.setSelectionEnd(target.text?.length ?? 0);
      this.canvas.requestRenderAll();
      return;
    }

    // Don't create text if clicking on a non-text object
    if (opt.target) return;

    const pointer = this.canvas.getScenePoint(opt.e);
    const text = new fabric.IText('Type here', {
      left: pointer.x,
      top: pointer.y,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fill: this.fillColor,
      editable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (text as any).id = uuidv4();
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing();
    // Position caret at end of text
    text.setSelectionStart(text.text?.length ?? 0);
    text.setSelectionEnd(text.text?.length ?? 0);
    this.canvas.requestRenderAll();
  }
}
