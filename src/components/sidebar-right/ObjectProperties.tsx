'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { getCanvasManager } from '@/hooks/useCanvas';
import { useCanvasStore } from '@/stores/useCanvasStore';
import * as fabric from 'fabric';

interface ObjectProps {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export function ObjectProperties() {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const [props, setProps] = useState<ObjectProps>({
    left: 0, top: 0, width: 0, height: 0, angle: 0, opacity: 1,
    fill: '#3b82f6', stroke: '#000000', strokeWidth: 1,
  });

  const readProps = useCallback(() => {
    const manager = getCanvasManager();
    if (!manager) return;
    const objects = manager.getActiveObjects();
    if (objects.length === 0) return;

    const obj = objects[0];
    setProps({
      left: Math.round(obj.left ?? 0),
      top: Math.round(obj.top ?? 0),
      width: Math.round(obj.getScaledWidth()),
      height: Math.round(obj.getScaledHeight()),
      angle: Math.round(obj.angle ?? 0),
      opacity: obj.opacity ?? 1,
      fill: typeof obj.fill === 'string' ? obj.fill : '#000000',
      stroke: typeof obj.stroke === 'string' ? obj.stroke : '#000000',
      strokeWidth: obj.strokeWidth ?? 0,
    });
  }, []);

  useEffect(() => {
    readProps();
  }, [selectedObjectIds, readProps]);

  // Listen for object modifications
  useEffect(() => {
    const manager = getCanvasManager();
    if (!manager) return;
    const canvas = manager.getFabricCanvas();
    const handler = () => readProps();
    canvas.on('object:modified', handler);
    canvas.on('object:scaling', handler);
    canvas.on('object:moving', handler);
    canvas.on('object:rotating', handler);
    return () => {
      canvas.off('object:modified', handler);
      canvas.off('object:scaling', handler);
      canvas.off('object:moving', handler);
      canvas.off('object:rotating', handler);
    };
  }, [readProps]);

  const updateProp = (key: string, value: unknown) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const objects = manager.getActiveObjects();
    if (objects.length === 0) return;

    const obj = objects[0];
    if (key === 'width') {
      obj.set('scaleX', (value as number) / (obj.width ?? 1));
    } else if (key === 'height') {
      obj.set('scaleY', (value as number) / (obj.height ?? 1));
    } else {
      obj.set(key as keyof fabric.FabricObject, value);
    }
    obj.setCoords();
    manager.getFabricCanvas().requestRenderAll();
    readProps();
  };

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Position & Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput label="X" value={props.left} onChange={(v) => updateProp('left', v)} />
          <PropertyInput label="Y" value={props.top} onChange={(v) => updateProp('top', v)} />
          <PropertyInput label="W" value={props.width} onChange={(v) => updateProp('width', v)} />
          <PropertyInput label="H" value={props.height} onChange={(v) => updateProp('height', v)} />
        </div>
        <div className="mt-2">
          <PropertyInput label="Rotation" value={props.angle} onChange={(v) => updateProp('angle', v)} suffix="°" />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Appearance</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs text-muted-foreground">Fill</span>
            <input
              type="color"
              value={props.fill}
              onChange={(e) => updateProp('fill', e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border"
            />
            <Input
              value={props.fill}
              onChange={(e) => updateProp('fill', e.target.value)}
              className="h-7 flex-1 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs text-muted-foreground">Stroke</span>
            <input
              type="color"
              value={props.stroke}
              onChange={(e) => updateProp('stroke', e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border"
            />
            <Input
              value={props.stroke}
              onChange={(e) => updateProp('stroke', e.target.value)}
              className="h-7 flex-1 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs text-muted-foreground">Width</span>
            <Slider
              value={[props.strokeWidth]}
              min={0}
              max={20}
              step={1}
              onValueChange={([v]) => updateProp('strokeWidth', v)}
              className="flex-1"
            />
            <span className="w-8 text-xs text-right tabular-nums">{props.strokeWidth}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Opacity</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[props.opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => updateProp('opacity', v / 100)}
            className="flex-1"
          />
          <span className="w-10 text-xs text-right tabular-nums">{Math.round(props.opacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

function PropertyInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-5 text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 text-xs"
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}
