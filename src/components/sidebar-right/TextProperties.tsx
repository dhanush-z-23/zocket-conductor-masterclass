'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FontPicker } from './FontPicker';
import { getCanvasManager } from '@/hooks/useCanvas';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { loadFont } from '@/lib/fontLoader';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import * as fabric from 'fabric';

interface TextProps {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  lineHeight: number;
  charSpacing: number;
}

function getSelectedText(): fabric.IText | null {
  const manager = getCanvasManager();
  if (!manager) return null;
  const objects = manager.getActiveObjects();
  if (objects.length === 0) return null;
  const obj = objects[0];
  if (obj instanceof fabric.IText) return obj;
  return null;
}

export function TextProperties() {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const [props, setProps] = useState<TextProps>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    opacity: 1,
    fill: '#000000',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    underline: false,
    textAlign: 'left',
    lineHeight: 1.16,
    charSpacing: 0,
  });

  const readProps = useCallback(() => {
    const text = getSelectedText();
    if (!text) return;

    setProps({
      left: Math.round(text.left ?? 0),
      top: Math.round(text.top ?? 0),
      width: Math.round(text.getScaledWidth()),
      height: Math.round(text.getScaledHeight()),
      angle: Math.round(text.angle ?? 0),
      opacity: text.opacity ?? 1,
      fill: typeof text.fill === 'string' ? text.fill : '#000000',
      fontFamily: text.fontFamily ?? 'Arial',
      fontSize: text.fontSize ?? 24,
      fontWeight: text.fontWeight ?? 'normal',
      fontStyle: text.fontStyle ?? 'normal',
      underline: text.underline ?? false,
      textAlign: text.textAlign ?? 'left',
      lineHeight: text.lineHeight ?? 1.16,
      charSpacing: text.charSpacing ?? 0,
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
    canvas.on('object:scaling', handler);
    canvas.on('object:moving', handler);
    canvas.on('object:rotating', handler);
    canvas.on('text:changed', handler);
    return () => {
      canvas.off('object:modified', handler);
      canvas.off('object:scaling', handler);
      canvas.off('object:moving', handler);
      canvas.off('object:rotating', handler);
      canvas.off('text:changed', handler);
    };
  }, [readProps]);

  const updateProp = (key: string, value: unknown) => {
    const manager = getCanvasManager();
    if (!manager) return;
    const text = getSelectedText();
    if (!text) return;

    if (key === 'width') {
      text.set('scaleX', (value as number) / (text.width ?? 1));
    } else if (key === 'height') {
      text.set('scaleY', (value as number) / (text.height ?? 1));
    } else {
      text.set(key as keyof fabric.IText, value);
    }
    text.setCoords();
    manager.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const updateFontWeight = (weight: string | number) => {
    const text = getSelectedText();
    if (!text) return;
    const manager = getCanvasManager();
    if (!manager) return;

    const currentSpacing = text.charSpacing ?? 0;
    text.set('fontWeight', weight);
    text.set('charSpacing', currentSpacing);
    text.initDimensions();
    text.setCoords();
    manager.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const updateFontFamily = async (family: string) => {
    await loadFont(family);
    const text = getSelectedText();
    if (!text) return;
    const manager = getCanvasManager();
    if (!manager) return;

    text.set('fontFamily', family);
    text.initDimensions();
    text.setCoords();
    manager.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const isBold =
    props.fontWeight === 'bold' || Number(props.fontWeight) >= 700;
  const isItalic = props.fontStyle === 'italic';

  return (
    <div className="space-y-4 p-3">
      {/* Position & Size */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Position & Size
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput
            label="X"
            value={props.left}
            onChange={(v) => updateProp('left', v)}
          />
          <PropertyInput
            label="Y"
            value={props.top}
            onChange={(v) => updateProp('top', v)}
          />
          <PropertyInput
            label="W"
            value={props.width}
            onChange={(v) => updateProp('width', v)}
          />
          <PropertyInput
            label="H"
            value={props.height}
            onChange={(v) => updateProp('height', v)}
          />
        </div>
        <div className="mt-2">
          <PropertyInput
            label="Rotation"
            value={props.angle}
            onChange={(v) => updateProp('angle', v)}
            suffix="°"
          />
        </div>
      </div>

      <Separator />

      {/* Font */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Font
        </h3>
        <div className="space-y-2">
          <FontPicker value={props.fontFamily} onChange={updateFontFamily} />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={props.fontSize}
              onChange={(e) => updateProp('fontSize', Number(e.target.value))}
              className="h-7 w-20 text-xs"
              min={1}
            />
            <div className="flex gap-0.5">
              <Button
                variant={isBold ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  updateFontWeight(isBold ? 'normal' : 'bold')
                }
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={isItalic ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  updateProp('fontStyle', isItalic ? 'normal' : 'italic')
                }
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={props.underline ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                onClick={() => updateProp('underline', !props.underline)}
                title="Underline"
              >
                <Underline className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Alignment */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Alignment
        </h3>
        <div className="flex gap-0.5">
          {([
            { align: 'left', Icon: AlignLeft },
            { align: 'center', Icon: AlignCenter },
            { align: 'right', Icon: AlignRight },
            { align: 'justify', Icon: AlignJustify },
          ] as const).map(({ align, Icon }) => (
            <Button
              key={align}
              variant={props.textAlign === align ? 'default' : 'outline'}
              size="icon"
              className="h-7 w-7"
              onClick={() => updateProp('textAlign', align)}
              title={align.charAt(0).toUpperCase() + align.slice(1)}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Spacing */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Spacing
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-muted-foreground">
              Line Height
            </span>
            <Slider
              value={[props.lineHeight * 100]}
              min={80}
              max={300}
              step={5}
              onValueChange={([v]) => updateProp('lineHeight', v / 100)}
              className="flex-1"
            />
            <span className="w-10 text-xs text-right tabular-nums">
              {props.lineHeight.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-muted-foreground">
              Letter
            </span>
            <Slider
              value={[props.charSpacing]}
              min={-200}
              max={800}
              step={10}
              onValueChange={([v]) => updateProp('charSpacing', v)}
              className="flex-1"
            />
            <span className="w-10 text-xs text-right tabular-nums">
              {props.charSpacing}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Color */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Color
        </h3>
        <div className="flex items-center gap-2">
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
            onValueChange={([v]) => updateProp('opacity', v / 100)}
            className="flex-1"
          />
          <span className="w-10 text-xs text-right tabular-nums">
            {Math.round(props.opacity * 100)}%
          </span>
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
      {suffix && (
        <span className="text-xs text-muted-foreground">{suffix}</span>
      )}
    </div>
  );
}
