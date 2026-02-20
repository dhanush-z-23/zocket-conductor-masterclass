'use client';

import { EditorLayout } from '@/components/editor/EditorLayout';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Home() {
  return (
    <TooltipProvider>
      <EditorLayout />
    </TooltipProvider>
  );
}
