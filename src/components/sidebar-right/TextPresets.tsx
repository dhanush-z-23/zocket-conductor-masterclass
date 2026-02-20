'use client';

import { Button } from '@/components/ui/button';
import { getCanvasManager } from '@/hooks/useCanvas';
import { loadFont } from '@/lib/fontLoader';
import * as fabric from 'fabric';

interface TextPreset {
  label: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  fill: string;
}

const TEXT_PRESETS: TextPreset[] = [
  {
    label: 'Heading',
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    fill: '#000000',
  },
  {
    label: 'Subheading',
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Inter',
    fill: '#333333',
  },
  {
    label: 'Body',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    fill: '#000000',
  },
  {
    label: 'Description',
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    fill: '#666666',
  },
];

export function TextPresets() {
  const applyPreset = async (preset: TextPreset) => {
    const manager = getCanvasManager();
    if (!manager) return;

    await loadFont(preset.fontFamily);

    const objects = manager.getActiveObjects();
    if (objects.length > 0) {
      const obj = objects[0];
      if (obj instanceof fabric.IText) {
        obj.set({
          fontSize: preset.fontSize,
          fontWeight: preset.fontWeight,
          fontFamily: preset.fontFamily,
          fill: preset.fill,
        });
        obj.initDimensions();
        obj.setCoords();
        manager.getFabricCanvas().requestRenderAll();
        return;
      }
    }
  };

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
        Text Presets
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {TEXT_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
