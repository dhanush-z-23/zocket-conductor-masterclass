'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useCanvasManager, getCanvasManager } from '@/hooks/useCanvas';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useLayerStore } from '@/stores/useLayerStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { SelectTool } from '@/core/tools/SelectTool';
import { ShapeTool } from '@/core/tools/ShapeTool';
import { TextTool } from '@/core/tools/TextTool';
import { DrawTool } from '@/core/tools/DrawTool';
import type { LayerInfo } from '@/types/layers';
import * as fabric from 'fabric';

export function CanvasWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { initCanvas, destroyCanvas, getManager } = useCanvasManager();
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setSelectedObjectIds = useCanvasStore((s) => s.setSelectedObjectIds);
  const setLayers = useLayerStore((s) => s.setLayers);
  const setCanUndo = useHistoryStore((s) => s.setCanUndo);
  const setCanRedo = useHistoryStore((s) => s.setCanRedo);
  const activeTool = useEditorStore((s) => s.activeTool);
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const fillColor = useEditorStore((s) => s.fillColor);
  const strokeColor = useEditorStore((s) => s.strokeColor);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const brushSize = useEditorStore((s) => s.brushSize);
  const brushColor = useEditorStore((s) => s.brushColor);
  const fontSize = useEditorStore((s) => s.fontSize);
  const fontFamily = useEditorStore((s) => s.fontFamily);

  const toolsRef = useRef<{
    select: SelectTool;
    shape: ShapeTool;
    text: TextTool;
    draw: DrawTool;
  } | null>(null);

  const syncLayers = useCallback(() => {
    const manager = getManager();
    if (!manager) return;

    const objects = manager.getObjects();
    const layers: LayerInfo[] = objects.map((obj, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (obj as any).id as string;
      return {
        id: id || `layer-${index}`,
        name: getObjectName(obj, index),
        type: obj.type || 'object',
        visible: obj.visible !== false,
        locked: !obj.selectable,
        opacity: obj.opacity ?? 1,
      };
    }).reverse(); // Reverse so top layers appear first

    setLayers(layers);
  }, [getManager, setLayers]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const manager = initCanvas(canvasRef.current, {
      onZoomChange: setZoom,
      onSelectionChange: (objects: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids = (objects as any[]).map((obj) => (obj.id as string) || '');
        setSelectedObjectIds(ids);
      },
      onObjectsChange: syncLayers,
      onHistoryChange: (canUndo: boolean, canRedo: boolean) => {
        setCanUndo(canUndo);
        setCanRedo(canRedo);
      },
    });

    // Register tools
    const selectTool = new SelectTool(manager);
    const shapeTool = new ShapeTool(manager);
    const textTool = new TextTool(manager);
    const drawTool = new DrawTool(manager);

    manager.registerTool('select', selectTool);
    manager.registerTool('shape', shapeTool);
    manager.registerTool('text', textTool);
    manager.registerTool('draw', drawTool);
    manager.setActiveTool('select');

    toolsRef.current = { select: selectTool, shape: shapeTool, text: textTool, draw: drawTool };

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        manager.resize(width, height);
      }
    });
    resizeObserver.observe(container);

    // Initial size
    manager.resize(container.clientWidth, container.clientHeight);

    // Space key for panning
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        manager.getViewportManager().setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        manager.getViewportManager().setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      destroyCanvas();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync active tool
  useEffect(() => {
    const manager = getManager();
    if (!manager) return;
    manager.setActiveTool(activeTool);
  }, [activeTool, getManager]);

  // Sync shape tool settings
  useEffect(() => {
    if (!toolsRef.current) return;
    toolsRef.current.shape.setShapeType(activeShapeType);
    toolsRef.current.shape.setFillColor(fillColor);
    toolsRef.current.shape.setStrokeColor(strokeColor);
    toolsRef.current.shape.setStrokeWidth(strokeWidth);
  }, [activeShapeType, fillColor, strokeColor, strokeWidth]);

  // Sync draw tool settings
  useEffect(() => {
    if (!toolsRef.current) return;
    toolsRef.current.draw.setBrushSize(brushSize);
    toolsRef.current.draw.setBrushColor(brushColor);
  }, [brushSize, brushColor]);

  // Sync text tool settings
  useEffect(() => {
    if (!toolsRef.current) return;
    toolsRef.current.text.setFontSize(fontSize);
    toolsRef.current.text.setFontFamily(fontFamily);
    toolsRef.current.text.setFillColor(fillColor);
  }, [fontSize, fontFamily, fillColor]);

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const manager = getCanvasManager();
      if (!manager) return;
      await manager.addImageFromBase64(reader.result as string, {
        centerInViewport: true,
        width: 300,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-muted ${isDragOver ? 'ring-2 ring-inset ring-blue-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} />
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 pointer-events-none">
          <div className="rounded-lg bg-background/90 px-6 py-3 text-sm font-medium shadow-lg">
            Drop image here
          </div>
        </div>
      )}
    </div>
  );
}

function getObjectName(obj: fabric.FabricObject, index: number): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (obj instanceof fabric.Group && (obj as any)._isCTA) return `CTA Button`;
  if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') {
    const text = (obj as fabric.IText).text;
    return text ? text.substring(0, 20) : `Text ${index + 1}`;
  }
  if (obj.type === 'image') return `Image ${index + 1}`;
  if (obj.type === 'rect') return `Rectangle ${index + 1}`;
  if (obj.type === 'circle') return `Circle ${index + 1}`;
  if (obj.type === 'ellipse') return `Ellipse ${index + 1}`;
  if (obj.type === 'triangle') return `Triangle ${index + 1}`;
  if (obj.type === 'line') return `Line ${index + 1}`;
  if (obj.type === 'path') return `Drawing ${index + 1}`;
  if (obj.type === 'group') return `Group ${index + 1}`;
  return `Object ${index + 1}`;
}
