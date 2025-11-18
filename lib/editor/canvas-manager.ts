import Konva from "konva";
import { EditorError } from "@/types/editor";

/**
 * CanvasManager - Quản lý Konva Stage và Image loading
 *
 * Best practices từ Konva docs:
 * - Stage → Layer → Image hierarchy
 * - Native Image object + Konva.Image wrapper
 * - Simple async/await pattern cho image loading
 * - Stage và Layer không được serialize, chỉ image config được lưu
 */
export class CanvasManager {
  private static instance: CanvasManager | null = null;
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private imageNode: Konva.Image | null = null;
  private imageElement: HTMLImageElement | null = null;

  private constructor() {}

  static getInstance(): CanvasManager {
    if (!CanvasManager.instance) {
      CanvasManager.instance = new CanvasManager();
    }
    return CanvasManager.instance;
  }

  /**
   * Initialize Konva Stage và Layer
   * @param containerId - ID của DOM element container
   * @param width - Chiều rộng canvas
   * @param height - Chiều cao canvas
   */
  initialize(containerId: string, width: number, height: number): void {
    // Cleanup existing stage nếu có
    if (this.stage) {
      this.stage.destroy();
    }

    this.stage = new Konva.Stage({
      container: containerId,
      width,
      height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  /**
   * Load image từ URL hoặc File
   * Pattern từ Konva docs: native Image + onload callback
   *
   * @param source - URL string hoặc File object
   * @returns Promise resolve khi image đã load xong
   */
  async loadImage(source: string | File): Promise<void> {
    return new Promise((resolve, reject) => {
      const imageObj = new Image();

      imageObj.onload = () => {
        try {
          // Cleanup old image nếu có
          if (this.imageNode) {
            this.imageNode.destroy();
          }

          if (!this.layer || !this.stage) {
            throw new EditorError(
              "Canvas chưa được khởi tạo",
              "IMAGE_LOAD_FAILED"
            );
          }

          // Tính toán size để fit vào canvas (maintain aspect ratio)
          const stageWidth = this.stage.width();
          const stageHeight = this.stage.height();
          const imageRatio = imageObj.width / imageObj.height;
          const stageRatio = stageWidth / stageHeight;

          let width = stageWidth;
          let height = stageHeight;

          if (imageRatio > stageRatio) {
            // Image rộng hơn canvas
            height = stageWidth / imageRatio;
          } else {
            // Image cao hơn canvas
            width = stageHeight * imageRatio;
          }

          // Center image
          const x = (stageWidth - width) / 2;
          const y = (stageHeight - height) / 2;

          // Create Konva Image node
          this.imageNode = new Konva.Image({
            image: imageObj,
            x,
            y,
            width,
            height,
            draggable: false,
          });

          this.imageElement = imageObj;
          this.layer.add(this.imageNode);
          this.layer.draw();

          resolve();
        } catch (error) {
          reject(
            new EditorError(
              `Không thể render image: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
              "IMAGE_LOAD_FAILED"
            )
          );
        }
      };

      imageObj.onerror = () => {
        reject(new EditorError("Không thể load image", "IMAGE_LOAD_FAILED"));
      };

      // Handle File hoặc URL
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageObj.src = e.target?.result as string;
        };
        reader.onerror = () => {
          reject(new EditorError("Không thể đọc file", "IMAGE_LOAD_FAILED"));
        };
        reader.readAsDataURL(source);
      } else {
        // CORS handling
        imageObj.crossOrigin = "anonymous";
        imageObj.src = source;
      }
    });
  }

  /**
   * Get current Konva objects
   */
  getStage(): Konva.Stage | null {
    return this.stage;
  }

  getLayer(): Konva.Layer | null {
    return this.layer;
  }

  getImageNode(): Konva.Image | null {
    return this.imageNode;
  }

  getImageElement(): HTMLImageElement | null {
    return this.imageElement;
  }

  /**
   * Update image position (for drag/transform)
   */
  updateImagePosition(x: number, y: number): void {
    if (this.imageNode) {
      this.imageNode.position({ x, y });
      this.layer?.draw();
    }
  }

  /**
   * Update image scale
   */
  updateImageScale(scaleX: number, scaleY: number): void {
    if (this.imageNode) {
      this.imageNode.scaleX(scaleX);
      this.imageNode.scaleY(scaleY);
      this.layer?.draw();
    }
  }

  /**
   * Update image rotation (degrees)
   */
  updateImageRotation(rotation: number): void {
    if (this.imageNode) {
      this.imageNode.rotation(rotation);
      this.layer?.draw();
    }
  }

  /**
   * Flip image horizontal hoặc vertical
   * Pattern từ Konva docs: dùng negative scale
   */
  flipImage(direction: "horizontal" | "vertical"): void {
    if (!this.imageNode) return;

    if (direction === "horizontal") {
      this.imageNode.scaleX(this.imageNode.scaleX() * -1);
    } else {
      this.imageNode.scaleY(this.imageNode.scaleY() * -1);
    }

    this.layer?.draw();
  }

  /**
   * Enable/disable drag
   */
  setDraggable(draggable: boolean): void {
    if (this.imageNode) {
      this.imageNode.draggable(draggable);
    }
  }

  /**
   * Clear canvas (remove image)
   */
  clear(): void {
    if (this.imageNode) {
      this.imageNode.destroy();
      this.imageNode = null;
    }
    this.imageElement = null;
    this.layer?.draw();
  }

  /**
   * Resize stage (responsive)
   */
  resize(width: number, height: number): void {
    if (this.stage) {
      this.stage.width(width);
      this.stage.height(height);
      this.layer?.draw();
    }
  }

  /**
   * Cleanup everything
   */
  destroy(): void {
    if (this.stage) {
      this.stage.destroy();
      this.stage = null;
      this.layer = null;
      this.imageNode = null;
      this.imageElement = null;
    }
  }
}

// Export singleton getter
export function getCanvasManager(): CanvasManager {
  return CanvasManager.getInstance();
}
