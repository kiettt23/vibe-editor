import Konva from "konva";
import {
  ExportOptions,
  DEFAULT_EXPORT_OPTIONS,
  EditorError,
} from "@/types/editor";

export class ExportManager {
  /**
   * Add watermark to stage for free tier users
   */
  static addWatermark(stage: Konva.Stage): Konva.Text {
    const layer = stage.getLayers()[0];
    if (!layer) {
      throw new EditorError("No layer found in stage", "EXPORT_FAILED");
    }

    const watermark = new Konva.Text({
      text: "Created with VibeEdit",
      fontSize: Math.max(stage.width() * 0.02, 16), // Responsive size
      fontFamily: "Inter, sans-serif",
      fill: "#ffffff",
      opacity: 0.5,
      shadowColor: "#000000",
      shadowBlur: 4,
      shadowOpacity: 0.8,
      shadowOffset: { x: 1, y: 1 },
    });

    // Position at bottom-right with padding
    const padding = Math.max(stage.width() * 0.02, 20);
    watermark.position({
      x: stage.width() - watermark.width() - padding,
      y: stage.height() - watermark.height() - padding,
    });

    layer.add(watermark);
    layer.draw();

    return watermark;
  }

  /**
   * Remove watermark from stage
   */
  static removeWatermark(watermark: Konva.Text): void {
    watermark.destroy();
    watermark.getLayer()?.draw();
  }

  static async exportToBlob(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {},
    addWatermark: boolean = false
  ): Promise<Blob> {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    let watermark: Konva.Text | null = null;

    try {
      // Add watermark if needed
      if (addWatermark) {
        watermark = this.addWatermark(stage);
      }

      const mimeType = this.getMimeType(opts.format);

      const blob = await stage.toBlob({
        mimeType,
        quality: opts.quality,
        pixelRatio: opts.pixelRatio,
        ...(opts.width && { width: opts.width }),
        ...(opts.height && { height: opts.height }),
      });

      if (!blob) {
        throw new EditorError("toBlob() returned null", "EXPORT_FAILED");
      }

      return blob as Blob;
    } catch (error) {
      throw new EditorError(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "EXPORT_FAILED"
      );
    } finally {
      // Always remove watermark after export
      if (watermark) {
        this.removeWatermark(watermark);
      }
    }
  }

  static exportToDataURL(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {},
    addWatermark: boolean = false
  ): string {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    let watermark: Konva.Text | null = null;

    try {
      // Add watermark if needed
      if (addWatermark) {
        watermark = this.addWatermark(stage);
      }

      const mimeType = this.getMimeType(opts.format);

      return stage.toDataURL({
        mimeType,
        quality: opts.quality,
        pixelRatio: opts.pixelRatio,
        ...(opts.width && { width: opts.width }),
        ...(opts.height && { height: opts.height }),
      });
    } catch (error) {
      throw new EditorError(
        `Export to DataURL failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "EXPORT_FAILED"
      );
    } finally {
      // Always remove watermark after export
      if (watermark) {
        this.removeWatermark(watermark);
      }
    }
  }

  static async downloadImage(
    stage: Konva.Stage,
    filename: string,
    options: Partial<ExportOptions> = {},
    addWatermark: boolean = false
  ): Promise<void> {
    const blob = await this.exportToBlob(stage, options, addWatermark);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async copyToClipboard(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {},
    addWatermark: boolean = false
  ): Promise<void> {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new EditorError(
        "Clipboard API không được hỗ trợ trên browser này",
        "EXPORT_FAILED"
      );
    }

    try {
      const blob = await this.exportToBlob(stage, options, addWatermark);
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
    } catch (error) {
      throw new EditorError(
        `Copy to clipboard failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "EXPORT_FAILED"
      );
    }
  }

  private static getMimeType(format: "png" | "jpeg" | "webp"): string {
    const mimeTypes = {
      png: "image/png",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };
    return mimeTypes[format];
  }

  static getFileExtension(format: "png" | "jpeg" | "webp"): string {
    return format === "jpeg" ? "jpg" : format;
  }

  static generateFilename(
    prefix: string = "vibe-editor",
    format: "png" | "jpeg" | "webp" = "png"
  ): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const ext = this.getFileExtension(format);
    return `${prefix}_${timestamp}.${ext}`;
  }

  static estimateFileSize(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {}
  ): number {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    const width = opts.width || stage.width();
    const height = opts.height || stage.height();
    const pixels = width * height * opts.pixelRatio * opts.pixelRatio;
    const bytesPerPixel = {
      png: 3,
      jpeg: 0.5,
      webp: 0.3,
    };

    return Math.round(pixels * bytesPerPixel[opts.format]);
  }
}
