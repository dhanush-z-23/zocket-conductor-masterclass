'use client';

import { useRef } from 'react';
import {
  MousePointer2,
  Square,
  Circle,
  Triangle,
  Type,
  Pencil,
  Hand,
  Sparkles,
  Paintbrush,
  Minus,
  Image as ImageIcon,
  RectangleHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/stores/useEditorStore';
import { getCanvasManager } from '@/hooks/useCanvas';
import { CTAFactory, CTA_PRESETS } from '@/core/canvas/CTAFactory';
import { loadFont } from '@/lib/fontLoader';
import type { ToolType, ShapeType } from '@/types/editor';
import { cn } from '@/lib/utils';

interface ToolConfig {
  type: ToolType;
  shapeType?: ShapeType;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const mainTools: ToolConfig[] = [
  { type: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select', shortcut: 'V' },
  { type: 'pan', icon: <Hand className="h-4 w-4" />, label: 'Pan', shortcut: 'H' },
];

const shapeTools: ToolConfig[] = [
  { type: 'shape', shapeType: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle', shortcut: 'R' },
  { type: 'shape', shapeType: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle', shortcut: 'C' },
  { type: 'shape', shapeType: 'triangle', icon: <Triangle className="h-4 w-4" />, label: 'Triangle', shortcut: '' },
  { type: 'shape', shapeType: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line', shortcut: 'L' },
];

const creativeTools: ToolConfig[] = [
  { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text', shortcut: 'T' },
  { type: 'draw', icon: <Pencil className="h-4 w-4" />, label: 'Draw', shortcut: 'B' },
];

const aiTools: ToolConfig[] = [
  { type: 'ai-generate', icon: <Sparkles className="h-4 w-4" />, label: 'AI Generate', shortcut: '' },
  { type: 'ai-inpaint', icon: <Paintbrush className="h-4 w-4" />, label: 'AI Inpaint', shortcut: '' },
];

function ToolButton({ tool }: { tool: ToolConfig }) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setActiveShapeType = useEditorStore((s) => s.setActiveShapeType);

  const isActive =
    tool.type === 'shape'
      ? activeTool === 'shape' && activeShapeType === tool.shapeType
      : activeTool === tool.type;

  const handleClick = () => {
    setActiveTool(tool.type);
    if (tool.shapeType) {
      setActiveShapeType(tool.shapeType);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9',
            isActive && 'bg-accent text-accent-foreground'
          )}
          onClick={handleClick}
        >
          {tool.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {tool.label}
        {tool.shortcut && (
          <span className="ml-2 text-muted-foreground">{tool.shortcut}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function ImageUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleClick}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Upload Image
          <span className="ml-2 text-muted-foreground">I</span>
        </TooltipContent>
      </Tooltip>
    </>
  );
}

function CTAButton() {
  const handleClick = async () => {
    const manager = getCanvasManager();
    if (!manager) return;
    await loadFont('Inter');
    const cta = CTAFactory.createCTA('Click Me', CTA_PRESETS.primary, {
      left: 200,
      top: 200,
    });
    CTAFactory.replaceExistingCTA(manager.getFabricCanvas(), cta);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleClick}
        >
          <RectangleHorizontal className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        CTA Button
      </TooltipContent>
    </Tooltip>
  );
}

export function ToolsSidebar() {
  return (
    <div className="flex w-12 flex-col items-center gap-0.5 border-r bg-background py-2">
      {mainTools.map((tool) => (
        <ToolButton key={tool.label} tool={tool} />
      ))}

      <Separator className="my-1 w-8" />

      {shapeTools.map((tool) => (
        <ToolButton key={tool.label} tool={tool} />
      ))}

      <Separator className="my-1 w-8" />

      {creativeTools.map((tool) => (
        <ToolButton key={tool.label} tool={tool} />
      ))}

      <Separator className="my-1 w-8" />

      <ImageUploadButton />
      <CTAButton />

      <Separator className="my-1 w-8" />

      {aiTools.map((tool) => (
        <ToolButton key={tool.label} tool={tool} />
      ))}
    </div>
  );
}
