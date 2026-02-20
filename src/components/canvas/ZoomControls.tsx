'use client';

import { Minus, Plus, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { getCanvasManager } from '@/hooks/useCanvas';

export function ZoomControls() {
  const zoom = useCanvasStore((s) => s.zoom);

  const handleZoomIn = () => {
    getCanvasManager()?.getViewportManager().zoomIn();
  };

  const handleZoomOut = () => {
    getCanvasManager()?.getViewportManager().zoomOut();
  };

  const handleFitToScreen = () => {
    getCanvasManager()?.getViewportManager().fitToScreen();
  };

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-12 text-center text-xs font-medium tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFitToScreen}>
        <Maximize className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
