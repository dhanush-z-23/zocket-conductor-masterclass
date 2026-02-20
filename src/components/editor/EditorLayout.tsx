'use client';

import { TopBar } from '@/components/toolbar/TopBar';
import { ToolsSidebar } from '@/components/sidebar-left/ToolsSidebar';
import { PropertiesSidebar } from '@/components/sidebar-right/PropertiesSidebar';
import { CanvasWorkspace } from '@/components/canvas/CanvasWorkspace';
import { ZoomControls } from '@/components/canvas/ZoomControls';
import { AIPromptBar } from '@/components/ai/AIPromptBar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function EditorLayout() {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ToolsSidebar />
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <CanvasWorkspace />
          <ZoomControls />
          <AIPromptBar />
        </div>
        <PropertiesSidebar />
      </div>
    </div>
  );
}
