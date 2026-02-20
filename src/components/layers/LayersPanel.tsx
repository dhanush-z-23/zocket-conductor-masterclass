'use client';

import { Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayerStore } from '@/stores/useLayerStore';
import { getCanvasManager } from '@/hooks/useCanvas';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/useCanvasStore';

function findObjectById(id: string) {
  const manager = getCanvasManager();
  if (!manager) return null;
  const canvas = manager.getFabricCanvas();
  return (
    canvas.getObjects().find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (o) => (o as any).id === id
    ) ?? null
  );
}

export function LayersPanel() {
  const layers = useLayerStore((s) => s.layers);
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);

  const handleToggleVisibility = (id: string) => {
    const obj = findObjectById(id);
    if (obj) {
      obj.visible = !obj.visible;
      getCanvasManager()?.getFabricCanvas().requestRenderAll();
    }
    useLayerStore.getState().toggleVisibility(id);
  };

  const handleToggleLock = (id: string) => {
    const obj = findObjectById(id);
    if (obj) {
      const isLocked = !obj.selectable;
      obj.selectable = isLocked;
      obj.evented = isLocked;
      getCanvasManager()?.getFabricCanvas().requestRenderAll();
    }
    useLayerStore.getState().toggleLock(id);
  };

  const handleSelectLayer = (id: string) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const obj = findObjectById(id);
    if (obj && obj.selectable) {
      manager.getFabricCanvas().setActiveObject(obj);
      manager.getFabricCanvas().requestRenderAll();
    }
  };

  const handleDelete = (id: string) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const obj = findObjectById(id);
    if (obj) {
      manager.getFabricCanvas().remove(obj);
      manager.getFabricCanvas().requestRenderAll();
    }
  };

  const handleMoveUp = (id: string) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const obj = findObjectById(id);
    if (obj) {
      manager.bringForward(obj);
    }
  };

  const handleMoveDown = (id: string) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const obj = findObjectById(id);
    if (obj) {
      manager.sendBackward(obj);
    }
  };

  if (layers.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        No layers yet. Add shapes, text, or images to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b p-2">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground">Layers</h3>
      </div>
      <div className="flex flex-col">
        {layers.map((layer) => {
          const isSelected = selectedObjectIds.includes(layer.id);
          return (
            <div
              key={layer.id}
              className={cn(
                'group flex items-center gap-1 px-2 py-1.5 text-xs hover:bg-accent/50 cursor-pointer',
                isSelected && 'bg-accent'
              )}
              onClick={() => handleSelectLayer(layer.id)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(layer.id);
                }}
              >
                {layer.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock(layer.id);
                }}
              >
                {layer.locked ? (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </Button>
              <span className="flex-1 truncate">{layer.name}</span>
              <div className="flex shrink-0 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(layer.id);
                  }}
                  title="Bring Forward"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(layer.id);
                  }}
                  title="Send Backward"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(layer.id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
