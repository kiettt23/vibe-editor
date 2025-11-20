import Konva from "konva";
import { EditorError } from "@/types/editor";

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

  initialize(containerId: string, width: number, height: number): void {
    if (this.stage) {
      this.stage.destroy();
      this.stage = null;
      this.layer = null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new EditorError(
        `Container #${containerId} không tồn tại`,
        "CANVAS_INIT_FAILED"
      );
    }

    this.stage = new Konva.Stage({
      container: containerId,
      width,
      height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  async loadImage(source: string | File): Promise<void> {
    return new Promise((resolve, reject) => {
      const imageObj = new Image();

      imageObj.onload = () => {
        try {
          if (this.imageNode) {
            this.imageNode.destroy();
          }

          if (!this.layer || !this.stage) {
            throw new EditorError(
              "Canvas đã bị destroy hoặc chưa được khởi tạo. Vui lòng refresh trang.",
              "IMAGE_LOAD_FAILED"
            );
          }

          const stageWidth = this.stage.width();
          const stageHeight = this.stage.height();
          const imageRatio = imageObj.width / imageObj.height;
          const stageRatio = stageWidth / stageHeight;

          let width = stageWidth;
          let height = stageHeight;

          if (imageRatio > stageRatio) {
            height = stageWidth / imageRatio;
          } else {
            width = stageHeight * imageRatio;
          }

          const x = stageWidth / 2;
          const y = stageHeight / 2;

          this.imageNode = new Konva.Image({
            image: imageObj,
            x,
            y,
            width,
            height,
            offsetX: width / 2,
            offsetY: height / 2,
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
        imageObj.crossOrigin = "anonymous";
        imageObj.src = source;
      }
    });
  }

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

  updateImagePosition(x: number, y: number): void {
    if (this.imageNode) {
      this.imageNode.position({ x, y });
      this.layer?.draw();
    }
  }

  updateImageScale(scaleX: number, scaleY: number): void {
    if (this.imageNode) {
      this.imageNode.scaleX(scaleX);
      this.imageNode.scaleY(scaleY);
      this.layer?.draw();
    }
  }

  updateImageRotation(rotation: number): void {
    if (this.imageNode) {
      this.imageNode.rotation(rotation);
      this.layer?.draw();
    }
  }

  updateImageOffset(offsetX: number, offsetY: number): void {
    if (this.imageNode) {
      this.imageNode.offsetX(offsetX);
      this.imageNode.offsetY(offsetY);
      this.layer?.draw();
    }
  }

  /**
   * Rotate image around its center point
   * @param angleDelta - Angle to rotate in degrees (positive = clockwise)
   */
  rotateImage(angleDelta: number): void {
    if (!this.imageNode) return;

    const currentRotation = this.imageNode.rotation();
    const newRotation = currentRotation + angleDelta;

    this.imageNode.rotation(newRotation);
    this.layer?.draw();
  }

  flipImage(direction: "horizontal" | "vertical"): void {
    if (!this.imageNode) return;

    if (direction === "horizontal") {
      const currentScaleX = this.imageNode.scaleX();
      this.imageNode.scaleX(currentScaleX * -1);
    } else {
      const currentScaleY = this.imageNode.scaleY();
      this.imageNode.scaleY(currentScaleY * -1);
    }

    this.layer?.draw();
  }

  setDraggable(draggable: boolean): void {
    if (this.imageNode) {
      this.imageNode.draggable(draggable);
    }
  }

  clear(): void {
    if (this.imageNode) {
      this.imageNode.destroy();
      this.imageNode = null;
    }
    this.imageElement = null;
    this.layer?.draw();
  }

  resize(width: number, height: number): void {
    if (this.stage) {
      this.stage.width(width);
      this.stage.height(height);
      this.layer?.draw();
    }
  }

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

export function getCanvasManager(): CanvasManager {
  return CanvasManager.getInstance();
}
