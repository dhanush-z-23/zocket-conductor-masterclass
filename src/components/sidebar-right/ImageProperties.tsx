'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getCanvasManager } from '@/hooks/useCanvas';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { ImageTransforms } from '@/core/canvas/ImageTransforms';
import {
  Circle,
  Square,
  RectangleHorizontal,
  Scissors,
  Trash2,
  Image as ImageIcon,
  ScanSearch,
  Eraser,
} from 'lucide-react';
import * as fabric from 'fabric';

interface ImageProps {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  hasCrop: boolean;
}

function getSelectedImage(): fabric.FabricImage | null {
  const manager = getCanvasManager();
  if (!manager) return null;
  const objects = manager.getActiveObjects();
  if (objects.length === 0) return null;
  const obj = objects[0];
  if (obj instanceof fabric.FabricImage) return obj;
  return null;
}

export function ImageProperties() {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [props, setProps] = useState<ImageProps>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    opacity: 1,
    hasCrop: false,
  });

  const readProps = useCallback(() => {
    const img = getSelectedImage();
    if (!img) return;

    setProps({
      left: Math.round(img.left ?? 0),
      top: Math.round(img.top ?? 0),
      width: Math.round(img.getScaledWidth()),
      height: Math.round(img.getScaledHeight()),
      angle: Math.round(img.angle ?? 0),
      opacity: img.opacity ?? 1,
      hasCrop: !!img.clipPath,
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
    const img = getSelectedImage();
    if (!img) return;

    if (key === 'width') {
      img.set('scaleX', (value as number) / (img.width ?? 1));
    } else if (key === 'height') {
      img.set('scaleY', (value as number) / (img.height ?? 1));
    } else {
      img.set(key as keyof fabric.FabricImage, value);
    }
    img.setCoords();
    manager.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const handleCropCircle = () => {
    const img = getSelectedImage();
    if (!img) return;
    ImageTransforms.cropToCircle(img);
    getCanvasManager()?.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const handleCropRoundedRect = () => {
    const img = getSelectedImage();
    if (!img) return;
    ImageTransforms.cropToRoundedRect(img, 20);
    getCanvasManager()?.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const handleRemoveCrop = () => {
    const img = getSelectedImage();
    if (!img) return;
    ImageTransforms.removeCrop(img);
    getCanvasManager()?.getFabricCanvas().requestRenderAll();
    readProps();
  };

  const handleDelete = () => {
    getCanvasManager()?.removeSelected();
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const manager = getCanvasManager();
      const img = getSelectedImage();
      if (!manager || !img) return;

      const newImg = await fabric.FabricImage.fromURL(
        reader.result as string
      );
      img.setElement(newImg.getElement());
      img.setCoords();
      manager.getFabricCanvas().requestRenderAll();
      readProps();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBackground = async () => {
    // Calls the existing AI background-remove API endpoint
    const img = getSelectedImage();
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.width ?? 100;
    canvas.height = img.height ?? 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const element = img.getElement();
    ctx.drawImage(element as HTMLImageElement, 0, 0);
    const base64 = canvas.toDataURL('image/png');

    try {
      const response = await fetch('/api/ai/background-remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageBase64 || data.imageUrl) {
          const resultUrl = data.imageBase64
            ? `data:image/png;base64,${data.imageBase64}`
            : data.imageUrl;
          const newImg = await fabric.FabricImage.fromURL(resultUrl);
          img.setElement(newImg.getElement());
          img.setCoords();
          getCanvasManager()?.getFabricCanvas().requestRenderAll();
        }
      }
    } catch {
      // API not available
    }
  };

  return (
    <div className="space-y-4 p-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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

      {/* Crop to Shape */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Crop to Shape
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 text-xs gap-1"
            onClick={handleCropCircle}
            title="Crop to Circle"
          >
            <Circle className="h-3.5 w-3.5" />
            Circle
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 text-xs gap-1"
            onClick={handleCropRoundedRect}
            title="Rounded Rectangle"
          >
            <RectangleHorizontal className="h-3.5 w-3.5" />
            Rounded
          </Button>
          {props.hasCrop && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={handleRemoveCrop}
              title="Remove Crop"
            >
              <Scissors className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* AI Actions */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          AI Actions
        </h3>
        <div className="space-y-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start text-xs gap-2"
            onClick={handleRemoveBackground}
          >
            <Eraser className="h-3.5 w-3.5" />
            Remove Background
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start text-xs gap-2"
            disabled
          >
            <Square className="h-3.5 w-3.5" />
            Convert to Shapes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start text-xs gap-2"
            disabled
          >
            <ScanSearch className="h-3.5 w-3.5" />
            Detect Logo/Text/Object
          </Button>
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

      <Separator />

      {/* Actions */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs gap-1"
          onClick={handleReplaceImage}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Replace
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 flex-1 text-xs gap-1"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
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
