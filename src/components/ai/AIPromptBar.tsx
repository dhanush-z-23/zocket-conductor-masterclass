'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIStore } from '@/stores/useAIStore';
import { getCanvasManager } from '@/hooks/useCanvas';

export function AIPromptBar() {
  const [prompt, setPrompt] = useState('');
  const isGenerating = useAIStore((s) => s.isGenerating);
  const error = useAIStore((s) => s.error);
  const startGeneration = useAIStore((s) => s.startGeneration);
  const completeGeneration = useAIStore((s) => s.completeGeneration);
  const failGeneration = useAIStore((s) => s.failGeneration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    startGeneration('generate', prompt);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width: 512, height: 512 }),
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
      setPrompt('');
    } catch (err) {
      failGeneration(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      {error && (
        <div className="mb-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-lg"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an image to generate..."
          className="h-8 w-80 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
          disabled={isGenerating}
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      {isGenerating && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Generating image... this may take 10-30 seconds
        </div>
      )}
    </div>
  );
}
