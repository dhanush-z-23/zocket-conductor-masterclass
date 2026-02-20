import * as fabric from 'fabric';
import { BaseTool } from './BaseTool';
import type { ToolType } from '@/types/editor';

export class SelectTool extends BaseTool {
  readonly type: ToolType = 'select';
  readonly cursor = 'default';

  onActivate(): void {
    super.onActivate();
    this.canvas.selection = true;
    this.canvas.hoverCursor = 'move';
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });

    this.canvas.on('mouse:dblclick', this.handleDblClick);
  }

  onDeactivate(): void {
    super.onDeactivate();
    this.canvas.off('mouse:dblclick', this.handleDblClick);
  }

  private handleDblClick = (opt: fabric.TPointerEventInfo<fabric.TPointerEvent>): void => {
    const target = opt.target;
    if (target && target instanceof fabric.IText) {
      target.enterEditing();
      target.setCursorByClick(opt.e);
      this.canvas.requestRenderAll();
    }
  };
}
