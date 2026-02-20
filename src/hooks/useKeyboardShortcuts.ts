'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { getCanvasManager } from '@/hooks/useCanvas';

export function useKeyboardShortcuts() {
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setActiveShapeType = useEditorStore((s) => s.setActiveShapeType);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const manager = getCanvasManager();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Tool shortcuts
      if (!isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'h':
            setActiveTool('pan');
            break;
          case 'r':
            setActiveTool('shape');
            setActiveShapeType('rectangle');
            break;
          case 'c':
            setActiveTool('shape');
            setActiveShapeType('circle');
            break;
          case 'l':
            setActiveTool('shape');
            setActiveShapeType('line');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'b':
            setActiveTool('draw');
            break;
          case 'i': {
            // Trigger image upload via hidden file input
            const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
            if (fileInput) fileInput.click();
            break;
          }
        }
      }

      // Ctrl/Cmd shortcuts
      if (isCtrlOrCmd && manager) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              manager.redo();
            } else {
              manager.undo();
            }
            break;
          case 'c':
            e.preventDefault();
            manager.copy();
            break;
          case 'v':
            e.preventDefault();
            manager.paste();
            break;
          case 'x':
            e.preventDefault();
            manager.copy();
            manager.removeSelected();
            break;
          case 'd':
            e.preventDefault();
            manager.duplicate();
            break;
          case 'a':
            e.preventDefault();
            manager.selectAll();
            break;
        }
      }

      // Delete/Backspace - don't delete objects while editing text
      if ((e.key === 'Delete' || e.key === 'Backspace') && manager) {
        const activeObj = manager.getFabricCanvas().getActiveObject();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (activeObj && (activeObj as any).isEditing) return;
        manager.removeSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, setActiveShapeType]);
}
