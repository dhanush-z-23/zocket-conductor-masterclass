import * as fabric from 'fabric';

export class ImageTransforms {
  static cropToCircle(image: fabric.FabricImage): void {
    const radius = Math.min(image.width ?? 100, image.height ?? 100) / 2;
    const clipCircle = new fabric.Circle({
      radius,
      originX: 'center',
      originY: 'center',
    });
    image.set({ clipPath: clipCircle });
  }

  static cropToRoundedRect(
    image: fabric.FabricImage,
    radius: number = 20
  ): void {
    const clipRect = new fabric.Rect({
      width: image.width ?? 100,
      height: image.height ?? 100,
      rx: radius,
      ry: radius,
      originX: 'center',
      originY: 'center',
    });
    image.set({ clipPath: clipRect });
  }

  static cropToRect(image: fabric.FabricImage): void {
    image.set({ clipPath: undefined });
  }

  static removeCrop(image: fabric.FabricImage): void {
    image.set({ clipPath: undefined });
  }
}
