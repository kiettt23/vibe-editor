import Konva from "konva";
import {
  ExportOptions,
  DEFAULT_EXPORT_OPTIONS,
  EditorError,
} from "@/types/editor";

/**
 * ExportManager - Export Konva canvas to various formats
 *
 * Best practices từ Konva docs:
 * - toBlob() cho async export (recommended)
 * - toDataURL() cho sync export (fallback)
 * - pixelRatio = 2 cho high quality export (retina)
 * - mimeType: 'image/png', 'image/jpeg', 'image/webp'
 */
export class ExportManager {
  /**
   * Export stage to Blob
   * Async method, recommended cho file downloads
   */
  static async exportToBlob(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

    try {
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
    }
  }

  /**
   * Export stage to Data URL (base64 string)
   * Sync method, useful cho preview
   */
  static exportToDataURL(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {}
  ): string {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

    try {
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
    }
  }

  /**
   * Export và download file
   * Tạo blob → create download link → trigger click → cleanup
   */
  static async downloadImage(
    stage: Konva.Stage,
    filename: string,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const blob = await this.exportToBlob(stage, options);

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy image to clipboard (modern browsers)
   */
  static async copyToClipboard(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new EditorError(
        "Clipboard API không được hỗ trợ trên browser này",
        "EXPORT_FAILED"
      );
    }

    try {
      const blob = await this.exportToBlob(stage, options);
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

  /**
   * Get MIME type from format string
   */
  private static getMimeType(format: "png" | "jpeg" | "webp"): string {
    const mimeTypes = {
      png: "image/png",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };
    return mimeTypes[format];
  }

  /**
   * Get file extension from format
   */
  static getFileExtension(format: "png" | "jpeg" | "webp"): string {
    return format === "jpeg" ? "jpg" : format;
  }

  /**
   * Generate filename with timestamp
   */
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

  /**
   * Estimate export file size (approximate)
   * Based on stage dimensions và format
   */
  static estimateFileSize(
    stage: Konva.Stage,
    options: Partial<ExportOptions> = {}
  ): number {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    const width = opts.width || stage.width();
    const height = opts.height || stage.height();
    const pixels = width * height * opts.pixelRatio * opts.pixelRatio;

    // Rough estimates (bytes per pixel)
    const bytesPerPixel = {
      png: 3, // Usually smaller due to compression
      jpeg: 0.5, // Very compressed
      webp: 0.3, // Most compressed
    };

    return Math.round(pixels * bytesPerPixel[opts.format]);
  }
}
