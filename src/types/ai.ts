export type AIOperationType = 'generate' | 'inpaint' | 'background-remove' | 'background-replace';

export interface AIGenerateRequest {
  prompt: string;
  width: number;
  height: number;
  negativePrompt?: string;
  guidanceScale?: number;
  steps?: number;
  seed?: number;
  model?: string;
}

export interface AIInpaintRequest {
  image: string;
  mask: string;
  prompt: string;
  strength?: number;
  model?: string;
}

export interface AIBackgroundRemoveRequest {
  image: string;
}

export interface AIBackgroundReplaceRequest {
  image: string;
  backgroundPrompt: string;
}

export interface AIResponse {
  imageUrl?: string;
  imageBase64?: string;
  error?: string;
}
