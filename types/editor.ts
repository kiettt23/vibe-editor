import type * as fabric from "fabric";

export interface EditorState {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  isDirty: boolean;
  isSaving: boolean;
}

export interface FilterConfig {
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: boolean;
  flipX?: boolean;
  flipY?: boolean;
}

export interface PresetFilter {
  id: string;
  name: string;
  thumbnail?: string;
  config: FilterConfig;
}

export interface HistoryState {
  canvasJSON: string;
  timestamp: number;
}

export interface ExportOptions {
  format: "png" | "jpg" | "jpeg";
  quality?: number;
  width?: number;
  height?: number;
  removeWatermark?: boolean;
}

export interface CropOptions {
  aspectRatio?: number | "free" | "1:1" | "4:3" | "16:9" | "9:16";
  width?: number;
  height?: number;
}

export interface TextOptions {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textAlign?: "left" | "center" | "right";
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  backgroundColor?: string;
}

export interface LayerItem {
  id: string;
  type: "image" | "text" | "shape";
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  fabricObject: fabric.Object;
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
