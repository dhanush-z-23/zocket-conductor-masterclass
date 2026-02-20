'use client';

import { useCanvasStore } from '@/stores/useCanvasStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { ObjectProperties } from './ObjectProperties';
import { TextProperties } from './TextProperties';
import { TextPresets } from './TextPresets';
import { ImageProperties } from './ImageProperties';
import { CTAProperties } from './CTAProperties';
import { AIGeneratePanel } from '../ai/AIGeneratePanel';
import { LayersPanel } from '../layers/LayersPanel';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCanvasManager } from '@/hooks/useCanvas';
import * as fabric from 'fabric';

type SelectedObjectType = 'text' | 'image' | 'cta' | 'shape' | null;

function getSelectedObjectType(): SelectedObjectType {
  const manager = getCanvasManager();
  if (!manager) return null;
  const objects = manager.getActiveObjects();
  if (objects.length === 0) return null;
  const obj = objects[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (obj instanceof fabric.Group && (obj as any)._isCTA) return 'cta';
  if (obj instanceof fabric.IText) return 'text';
  if (obj instanceof fabric.FabricImage) return 'image';
  return 'shape';
}

export function PropertiesSidebar() {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const activeTool = useEditorStore((s) => s.activeTool);
  const rightSidebarTab = useEditorStore((s) => s.rightSidebarTab);
  const setRightSidebarTab = useEditorStore((s) => s.setRightSidebarTab);

  const hasSelection = selectedObjectIds.length > 0;
  const isAITool = activeTool === 'ai-generate' || activeTool === 'ai-inpaint';
  const objectType = hasSelection ? getSelectedObjectType() : null;

  const renderPropertiesPanel = () => {
    switch (objectType) {
      case 'text':
        return (
          <>
            <TextProperties />
            <Separator />
            <div className="p-3">
              <TextPresets />
            </div>
          </>
        );
      case 'image':
        return <ImageProperties />;
      case 'cta':
        return <CTAProperties />;
      case 'shape':
        return <ObjectProperties />;
      default:
        return <ObjectProperties />;
    }
  };

  return (
    <div className="flex w-64 flex-col border-l bg-background">
      {/* Tab switcher */}
      <div className="flex border-b">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 rounded-none h-10 text-xs',
            rightSidebarTab === 'properties' && 'bg-accent'
          )}
          onClick={() => setRightSidebarTab('properties')}
        >
          Properties
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 rounded-none h-10 text-xs',
            rightSidebarTab === 'layers' && 'bg-accent'
          )}
          onClick={() => setRightSidebarTab('layers')}
        >
          Layers
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rightSidebarTab === 'layers' ? (
          <LayersPanel />
        ) : isAITool ? (
          <AIGeneratePanel />
        ) : hasSelection ? (
          renderPropertiesPanel()
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
            <p>Select an object to edit its properties</p>
            <Separator className="my-4" />
            <p className="text-xs">Or use the AI tools to generate content</p>
          </div>
        )}
      </div>
    </div>
  );
}
