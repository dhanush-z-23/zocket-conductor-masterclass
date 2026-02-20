'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getCanvasManager } from '@/hooks/useCanvas';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { CTAFactory, CTA_PRESETS, type CTAStyle } from '@/core/canvas/CTAFactory';
import { Trash2 } from 'lucide-react';
import * as fabric from 'fabric';

interface CTAProps {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  text: string;
  backgroundColor: string;
  textColor: string;
}

function getSelectedCTA(): fabric.Group | null {
  const manager = getCanvasManager();
  if (!manager) return null;
  const objects = manager.getActiveObjects();
  if (objects.length === 0) return null;
  const obj = objects[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (obj instanceof fabric.Group && (obj as any)._isCTA) return obj;
  return null;
}

export function CTAProperties() {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const [props, setProps] = useState<CTAProps>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 1,
    text: 'Click Me',
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
  });

  const readProps = useCallback(() => {
    const group = getSelectedCTA();
    if (!group) return;

    const objects = group.getObjects();
    const bg = objects.find((o) => o instanceof fabric.Rect) as
      | fabric.Rect
      | undefined;
    const label = objects.find(
      (o) => o instanceof fabric.FabricText || o instanceof fabric.IText
    ) as fabric.FabricText | undefined;

    setProps({
      left: Math.round(group.left ?? 0),
      top: Math.round(group.top ?? 0),
      width: Math.round(group.getScaledWidth()),
      height: Math.round(group.getScaledHeight()),
      opacity: group.opacity ?? 1,
      text: label?.text ?? 'Click Me',
      backgroundColor:
        typeof bg?.fill === 'string' ? bg.fill : '#2563eb',
      textColor:
        typeof label?.fill === 'string' ? label.fill : '#ffffff',
    });
  }, []);

  useEffect(() => {
    readProps();
  }, [selectedObjectIds, readProps]);

  useEffect(() => {
    const manager = getCanvasManager();
    if (!manager) return;
    const canvas = manager.getFabricCanvas();
    const handler = () => readProps();
    canvas.on('object:modified', handler);
    canvas.on('object:moving', handler);
    return () => {
      canvas.off('object:modified', handler);
      canvas.off('object:moving', handler);
    };
  }, [readProps]);

  const applyPreset = (presetName: string) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const style = CTA_PRESETS[presetName];
    if (!style) return;

    const newCTA = CTAFactory.createCTA(props.text, style);
    CTAFactory.replaceExistingCTA(manager.getFabricCanvas(), newCTA);
    readProps();
  };

  const updateColor = (key: 'backgroundColor' | 'textColor', color: string) => {
    const group = getSelectedCTA();
    if (!group) return;
    const manager = getCanvasManager();
    if (!manager) return;

    const objects = group.getObjects();
    if (key === 'backgroundColor') {
      const bg = objects.find((o) => o instanceof fabric.Rect);
      bg?.set('fill', color);
    } else {
      const label = objects.find(
        (o) => o instanceof fabric.FabricText || o instanceof fabric.IText
      );
      label?.set('fill', color);
    }
    manager.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const updateOpacity = (value: number) => {
    const group = getSelectedCTA();
    if (!group) return;
    group.set('opacity', value);
    getCanvasManager()?.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const handleDelete = () => {
    getCanvasManager()?.removeSelected();
  };

  return (
    <div className="space-y-4 p-3">
      {/* Position & Size */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          CTA Button
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput label="X" value={props.left} onChange={() => {}} />
          <PropertyInput label="Y" value={props.top} onChange={() => {}} />
          <PropertyInput label="W" value={props.width} onChange={() => {}} />
          <PropertyInput label="H" value={props.height} onChange={() => {}} />
        </div>
      </div>

      <Separator />

      {/* CTA Presets */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Button Style
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {Object.keys(CTA_PRESETS).map((name) => (
            <Button
              key={name}
              variant="outline"
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => applyPreset(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Colors
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs text-muted-foreground">
              Background
            </span>
            <input
              type="color"
              value={props.backgroundColor}
              onChange={(e) => updateColor('backgroundColor', e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border"
            />
            <Input
              value={props.backgroundColor}
              onChange={(e) => updateColor('backgroundColor', e.target.value)}
              className="h-7 flex-1 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs text-muted-foreground">
              Text
            </span>
            <input
              type="color"
              value={props.textColor}
              onChange={(e) => updateColor('textColor', e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border"
            />
            <Input
              value={props.textColor}
              onChange={(e) => updateColor('textColor', e.target.value)}
              className="h-7 flex-1 text-xs"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Opacity */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Opacity
        </h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[props.opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => updateOpacity(v / 100)}
            className="flex-1"
          />
          <span className="w-10 text-xs text-right tabular-nums">
            {Math.round(props.opacity * 100)}%
          </span>
        </div>
      </div>

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="h-8 w-full text-xs gap-1"
        onClick={handleDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </div>
  );
}

function PropertyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-5 text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 text-xs"
        readOnly
      />
    </div>
  );
}
