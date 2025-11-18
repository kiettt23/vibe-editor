import * as fabric from "fabric";
import type { FilterConfig } from "@/types/editor";

export class CanvasManager {
  private canvas: fabric.Canvas | null = null;
  private originalImageData: fabric.Image | null = null;

  initialize(
    canvasElement: HTMLCanvasElement,
    options?: { width?: number; height?: number }
  ) {
    this.canvas = new fabric.Canvas(canvasElement, {
      width: options?.width || 800,
      height: options?.height || 600,
      backgroundColor: "#ffffff",
    });

    return this.canvas;
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvas;
  }

  async addImage(imageUrl: string): Promise<void> {
    if (!this.canvas) return;

    const img = await fabric.Image.fromURL(imageUrl);

    // Scale image to fit canvas
    const canvasWidth = this.canvas.width || 800;
    const canvasHeight = this.canvas.height || 600;
    const imgWidth = img.width || 1;
    const imgHeight = img.height || 1;

    const scale =
      Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.9;

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: (canvasWidth - imgWidth * scale) / 2,
      top: (canvasHeight - imgHeight * scale) / 2,
    });

    this.canvas.add(img);
    this.canvas.setActiveObject(img);
    this.canvas.renderAll();
    this.originalImageData = img;
  }

  addText(text: string, options?: any): void {
    if (!this.canvas) return;

    const textObj = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: "#000000",
      ...options,
    });

    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    this.canvas.renderAll();
  }

  deleteSelected(): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.remove(activeObject);
      this.canvas.renderAll();
    }
  }

  applyFilters(filters: FilterConfig): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) return;

    const filterArray: any[] = [];

    // Blur
    if (filters.blur && filters.blur > 0) {
      filterArray.push(new fabric.filters.Blur({ blur: filters.blur / 100 }));
    }

    // Grayscale
    if (filters.grayscale) {
      filterArray.push(new fabric.filters.Grayscale());
    }

    // Brightness
    if (filters.brightness && filters.brightness !== 0) {
      filterArray.push(
        new fabric.filters.Brightness({ brightness: filters.brightness / 100 })
      );
    }

    // Contrast
    if (filters.contrast && filters.contrast !== 0) {
      filterArray.push(
        new fabric.filters.Contrast({ contrast: filters.contrast / 100 })
      );
    }

    // Saturation
    if (filters.saturation && filters.saturation !== 0) {
      filterArray.push(
        new fabric.filters.Saturation({ saturation: filters.saturation / 100 })
      );
    }

    activeObject.filters = filterArray;
    activeObject.applyFilters();
    this.canvas.renderAll();
  }

  clearFilters(): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) return;

    activeObject.filters = [];
    activeObject.applyFilters();
    this.canvas.renderAll();
  }

  setZoom(zoomLevel: number): void {
    if (!this.canvas) return;
    this.canvas.setZoom(zoomLevel);
    this.canvas.renderAll();
  }

  toDataURL(format: "png" | "jpeg" = "png", quality = 1): string {
    if (!this.canvas) return "";
    return this.canvas.toDataURL({ format, quality, multiplier: 1 });
  }

  async toBlob(
    format: "png" | "jpeg" = "png",
    quality = 1
  ): Promise<Blob | null> {
    if (!this.canvas) return null;

    return new Promise((resolve) => {
      this.canvas
        ?.getElement()
        .toBlob((blob) => resolve(blob), `image/${format}`, quality);
    });
  }

  loadFromJSON(json: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.canvas) {
        reject(new Error("Canvas not initialized"));
        return;
      }

      this.canvas.loadFromJSON(json, () => {
        this.canvas?.renderAll();
        resolve();
      });
    });
  }

  toJSON(): string {
    if (!this.canvas) return "{}";
    return JSON.stringify(this.canvas.toJSON());
  }

  clear(): void {
    if (!this.canvas) return;
    this.canvas.clear();
    this.canvas.backgroundColor = "#ffffff";
    this.canvas.renderAll();
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }
}

// Singleton instance
let canvasManagerInstance: CanvasManager | null = null;

export function getCanvasManager(): CanvasManager {
  if (!canvasManagerInstance) {
    canvasManagerInstance = new CanvasManager();
  }
  return canvasManagerInstance;
}

export function resetCanvasManager(): void {
  if (canvasManagerInstance) {
    canvasManagerInstance.dispose();
    canvasManagerInstance = null;
  }
}
