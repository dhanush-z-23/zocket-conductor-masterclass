import { create } from 'zustand';
import type { AIOperationType } from '@/types/ai';

interface AIStore {
  isGenerating: boolean;
  progress: number;
  currentOperation: AIOperationType | null;
  error: string | null;
  lastPrompt: string;
  abortController: AbortController | null;

  startGeneration: (operation: AIOperationType, prompt: string) => void;
  setProgress: (progress: number) => void;
  completeGeneration: () => void;
  failGeneration: (error: string) => void;
  cancelGeneration: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  isGenerating: false,
  progress: 0,
  currentOperation: null,
  error: null,
  lastPrompt: '',
  abortController: null,

  startGeneration: (operation, prompt) => {
    const existing = get().abortController;
    if (existing) existing.abort();

    set({
      isGenerating: true,
      progress: 0,
      currentOperation: operation,
      error: null,
      lastPrompt: prompt,
      abortController: new AbortController(),
    });
  },

  setProgress: (progress) => set({ progress }),

  completeGeneration: () =>
    set({
      isGenerating: false,
      progress: 100,
      currentOperation: null,
      abortController: null,
    }),

  failGeneration: (error) =>
    set({
      isGenerating: false,
      progress: 0,
      currentOperation: null,
      error,
      abortController: null,
    }),

  cancelGeneration: () => {
    const { abortController } = get();
    if (abortController) abortController.abort();
    set({
      isGenerating: false,
      progress: 0,
      currentOperation: null,
      abortController: null,
    });
  },
}));
