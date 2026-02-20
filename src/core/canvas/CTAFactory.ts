import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';

export interface CTAStyle {
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

export const CTA_PRESETS: Record<string, CTAStyle> = {
  primary: {
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
    borderRadius: 8,
    paddingX: 24,
    paddingY: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondary: {
    backgroundColor: '#ffffff',
    textColor: '#2563eb',
    borderRadius: 8,
    paddingX: 24,
    paddingY: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rounded: {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    borderRadius: 24,
    paddingX: 32,
    paddingY: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: '#000000',
    borderRadius: 8,
    paddingX: 24,
    paddingY: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export class CTAFactory {
  static createCTA(
    text: string,
    style: CTAStyle,
    position?: { left: number; top: number }
  ): fabric.Group {
    const label = new fabric.FabricText(text, {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fill: style.textColor,
      originX: 'center',
      originY: 'center',
    });

    const bgWidth = label.width! + style.paddingX * 2;
    const bgHeight = label.height! + style.paddingY * 2;

    const bg = new fabric.Rect({
      width: bgWidth,
      height: bgHeight,
      fill: style.backgroundColor,
      rx: style.borderRadius,
      ry: style.borderRadius,
      originX: 'center',
      originY: 'center',
      stroke:
        style.backgroundColor === 'transparent' ? '#000000' : undefined,
      strokeWidth: style.backgroundColor === 'transparent' ? 2 : 0,
    });

    const group = new fabric.Group([bg, label], {
      left: position?.left ?? 100,
      top: position?.top ?? 100,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (group as any).id = uuidv4();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (group as any)._isCTA = true;

    return group;
  }

  static replaceExistingCTA(
    canvas: fabric.Canvas,
    newCTA: fabric.Group
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingCTA = canvas
      .getObjects()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .find((o) => (o as any)._isCTA);
    if (existingCTA) {
      newCTA.set({ left: existingCTA.left, top: existingCTA.top });
      canvas.remove(existingCTA);
    }
    canvas.add(newCTA);
    canvas.setActiveObject(newCTA);
    canvas.requestRenderAll();
  }
}
