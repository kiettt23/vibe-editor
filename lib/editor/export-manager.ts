import { saveAs } from "file-saver";
import type * as fabric from "fabric";
import type { ExportOptions } from "@/types/editor";

/**
 * Export Manager - Handles canvas export functionality
 */
export class ExportManager {
  private canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  /**
   * Export canvas as image file
   */
  async exportImage(options: ExportOptions, filename?: string): Promise<void> {
    const {
      format = "png",
      quality = 1,
      width,
      height,
      removeWatermark = false,
    } = options;

    // Calculate multiplier for resolution
    const multiplier = this.calculateMultiplier(width, height);

    // Add watermark if not Pro tier
    let watermarkAdded = false;
    if (!removeWatermark) {
      watermarkAdded = this.addWatermark();
    }

    // Export canvas
    const dataURL = this.canvas.toDataURL({
      format: format === "jpg" ? "jpeg" : format,
      quality,
      multiplier,
    });

    // Remove watermark after export
    if (watermarkAdded) {
      this.removeWatermark();
    }

    // Convert to blob and download
    const blob = await this.dataURLToBlob(dataURL);
    const defaultFilename = `vibedit-${Date.now()}.${format}`;
    saveAs(blob, filename || defaultFilename);
  }

  /**
   * Calculate multiplier based on target dimensions
   */
  private calculateMultiplier(
    targetWidth?: number,
    targetHeight?: number
  ): number {
    if (!targetWidth && !targetHeight) return 1;

    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    if (targetWidth && targetHeight) {
      return Math.min(targetWidth / canvasWidth, targetHeight / canvasHeight);
    }

    if (targetWidth) {
      return targetWidth / canvasWidth;
    }

    if (targetHeight) {
      return targetHeight / canvasHeight;
    }

    return 1;
  }

  /**
   * Add watermark to canvas (for Free tier)
   */
  private addWatermark(): boolean {
    try {
      const text = new (window as any).fabric.Text("Made with VibeEdit", {
        fontSize: 20,
        fill: "rgba(255, 255, 255, 0.7)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        padding: 10,
        selectable: false,
        evented: false,
      });

      // Position at bottom-right
      text.set({
        left: this.canvas.getWidth() - text.width! - 20,
        top: this.canvas.getHeight() - text.height! - 20,
      });

      this.canvas.add(text);
      this.canvas.renderAll();

      // Store reference for removal
      (text as any).__isWatermark = true;

      return true;
    } catch (error) {
      console.error("Failed to add watermark:", error);
      return false;
    }
  }

  /**
   * Remove watermark from canvas
   */
  private removeWatermark() {
    const objects = this.canvas.getObjects();
    const watermark = objects.find((obj: any) => obj.__isWatermark);

    if (watermark) {
      this.canvas.remove(watermark);
      this.canvas.renderAll();
    }
  }

  /**
   * Convert data URL to Blob
   */
  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL);
    return response.blob();
  }

  /**
   * Get canvas as data URL (for thumbnails)
   */
  getThumbnail(maxWidth: number = 400, maxHeight: number = 400): string {
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    const multiplier = Math.min(
      maxWidth / canvasWidth,
      maxHeight / canvasHeight
    );

    return this.canvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier,
    });
  }

  /**
   * Copy canvas to clipboard (experimental)
   */
  async copyToClipboard(): Promise<boolean> {
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        this.canvas.getElement().toBlob(resolve);
      });

      if (!blob) return false;

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }
}
