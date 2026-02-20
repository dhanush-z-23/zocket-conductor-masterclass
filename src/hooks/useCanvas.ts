'use client';

import { useRef, useCallback } from 'react';
import { CanvasManager } from '@/core/canvas/CanvasManager';

// Singleton-ish pattern: CanvasManager is created once, accessed via ref
let canvasManagerInstance: CanvasManager | null = null;

export function getCanvasManager(): CanvasManager | null {
  return canvasManagerInstance;
}

export function setCanvasManager(manager: CanvasManager | null) {
  canvasManagerInstance = manager;
}

export function useCanvasManager() {
  const managerRef = useRef<CanvasManager | null>(null);

  const initCanvas = useCallback(
    (
      canvasElement: HTMLCanvasElement,
      options?: {
        onZoomChange?: (zoom: number) => void;
        onSelectionChange?: (objects: unknown[]) => void;
        onObjectsChange?: () => void;
        onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
      }
    ) => {
      if (managerRef.current) {
        managerRef.current.dispose();
      }

      const manager = new CanvasManager(canvasElement, options);
      managerRef.current = manager;
      setCanvasManager(manager);
      return manager;
    },
    []
  );

  const destroyCanvas = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.dispose();
      managerRef.current = null;
      setCanvasManager(null);
    }
  }, []);

  return {
    manager: managerRef,
    initCanvas,
    destroyCanvas,
    getManager: () => managerRef.current,
  };
}
