import Konva from "konva";

// ============================================================================
// CORE TYPES
// ============================================================================

export interface EditorState {
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  imageNode: Konva.Image | null;
  originalImageSrc: string | null;
  isImageLoaded: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface FilterSettings {
  blur: number; // 0-100
  brightness: number; // -1 to 1 (Brighten filter)
  contrast: number; // -100 to 100
  saturation: number; // -1 to 1 (0 = no change)
  hue: number; // 0-359 degrees
  grayscale: boolean; // true/false
  sepia: boolean; // true/false
  invert: boolean; // true/false
}

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  blur: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  grayscale: false,
  sepia: false,
  invert: false,
};

// Preset filter configurations
export interface FilterPreset {
  name: string;
  description: string;
  settings: FilterSettings;
}

// ============================================================================
// TRANSFORMATION TYPES
// ============================================================================

export interface TransformState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
}

export const DEFAULT_TRANSFORM_STATE: TransformState = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};

// ============================================================================
// HISTORY TYPES
// ============================================================================

export interface EditorSnapshot {
  filters: FilterSettings;
  transform: TransformState;
  timestamp: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: "png" | "jpeg" | "webp";
  quality: number; // 0-1 for JPEG/WebP
  pixelRatio: number; // 1 = normal, 2 = retina (high quality)
  width?: number; // Optional resize width
  height?: number; // Optional resize height
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: "png",
  quality: 0.95,
  pixelRatio: 2,
};

// ============================================================================
// UI TYPES (kept for compatibility)
// ============================================================================

export interface LayerItem {
  id: string;
  name: string;
  type: "image" | "text" | "shape";
  visible: boolean;
  locked: boolean;
  thumbnail?: string;
}

export type EditorTool =
  | "select"
  | "crop"
  | "text"
  | "shape"
  | "draw"
  | "eraser";

export type EditorPanel =
  | "filters"
  | "adjustments"
  | "layers"
  | "text"
  | "upload"
  | "templates"
  | "stickers";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class EditorError extends Error {
  constructor(
    message: string,
    public code:
      | "IMAGE_LOAD_FAILED"
      | "FILTER_APPLY_FAILED"
      | "EXPORT_FAILED"
      | "HISTORY_ERROR"
      | "CANVAS_INIT_FAILED"
  ) {
    super(message);
    this.name = "EditorError";
  }
}
