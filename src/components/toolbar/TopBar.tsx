'use client';

import { Undo2, Redo2, Download, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { getCanvasManager } from '@/hooks/useCanvas';

export function TopBar() {
  const zoom = useCanvasStore((s) => s.zoom);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);

  const handleUndo = () => {
    const manager = getCanvasManager();
    manager?.undo();
  };

  const handleRedo = () => {
    const manager = getCanvasManager();
    manager?.redo();
  };

  const handleExport = () => {
    const manager = getCanvasManager();
    if (!manager) return;
    const canvas = manager.getFabricCanvas();
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex h-12 items-center justify-between border-b bg-background px-3">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">Bacon Editor</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <span className="text-xs text-muted-foreground tabular-nums w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
