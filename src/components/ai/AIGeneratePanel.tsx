'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAIStore } from '@/stores/useAIStore';
import { getCanvasManager } from '@/hooks/useCanvas';

export function AIGeneratePanel() {
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const isGenerating = useAIStore((s) => s.isGenerating);
  const error = useAIStore((s) => s.error);
  const startGeneration = useAIStore((s) => s.startGeneration);
  const completeGeneration = useAIStore((s) => s.completeGeneration);
  const failGeneration = useAIStore((s) => s.failGeneration);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    startGeneration('generate', prompt);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width, height }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      const manager = getCanvasManager();
      if (manager) {
        if (data.imageBase64) {
          await manager.addImageFromBase64(data.imageBase64, { centerInViewport: true });
        } else if (data.imageUrl) {
          await manager.addImageFromURL(data.imageUrl, { centerInViewport: true });
        }
      }

      completeGeneration();
    } catch (err) {
      failGeneration(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  const dimensionPresets = [
    { label: '512x512', w: 512, h: 512 },
    { label: '768x768', w: 768, h: 768 },
    { label: '1024x1024', w: 1024, h: 1024 },
    { label: '1024x768', w: 1024, h: 768 },
    { label: '768x1024', w: 768, h: 1024 },
  ];

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          AI Image Generation
        </h3>
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full rounded-md border bg-background p-2 text-sm resize-none"
            rows={3}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Dimensions</h3>
        <div className="flex flex-wrap gap-1">
          {dimensionPresets.map((preset) => (
            <Button
              key={preset.label}
              variant={width === preset.w && height === preset.h ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setWidth(preset.w);
                setHeight(preset.h);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <Button
        className="w-full gap-2"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </Button>
    </div>
  );
}
