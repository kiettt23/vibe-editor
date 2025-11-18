import { create } from "zustand";
import type * as fabric from "fabric";
import type {
  EditorState,
  EditorTool,
  EditorPanel,
  FilterConfig,
} from "@/types/editor";

interface EditorStore extends EditorState {
  // Canvas
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setSelectedObject: (obj: fabric.Object | null) => void;

  // Zoom & Pan
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;

  // Canvas Size
  setCanvasSize: (width: number, height: number) => void;

  // Active Tool
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;

  // Active Panel
  activePanel: EditorPanel | null;
  setActivePanel: (panel: EditorPanel | null) => void;
  togglePanel: (panel: EditorPanel) => void;

  // Filters
  currentFilters: FilterConfig;
  updateFilters: (filters: Partial<FilterConfig>) => void;
  resetFilters: () => void;

  // Dirty State
  setDirty: (isDirty: boolean) => void;
  setSaving: (isSaving: boolean) => void;

  // History
  canUndo: boolean;
  canRedo: boolean;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: EditorState = {
  canvas: null,
  selectedObject: null,
  zoom: 1,
  canvasWidth: 1920,
  canvasHeight: 1080,
  isDirty: false,
  isSaving: false,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,
  activeTool: "select",
  activePanel: null,
  currentFilters: {},
  canUndo: false,
  canRedo: false,

  setCanvas: (canvas) => set({ canvas }),
  setSelectedObject: (obj) => set({ selectedObject: obj }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  zoomIn: () => {
    const { zoom } = get();
    set({ zoom: Math.min(5, zoom + 0.1) });
  },
  zoomOut: () => {
    const { zoom } = get();
    set({ zoom: Math.max(0.1, zoom - 0.1) });
  },
  resetZoom: () => set({ zoom: 1 }),
  fitToScreen: () => {
    // Will be implemented with canvas reference
    set({ zoom: 1 });
  },

  setCanvasSize: (width, height) =>
    set({ canvasWidth: width, canvasHeight: height }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setActivePanel: (panel) => set({ activePanel: panel }),
  togglePanel: (panel) => {
    const { activePanel } = get();
    set({ activePanel: activePanel === panel ? null : panel });
  },

  updateFilters: (filters) => {
    const { currentFilters } = get();
    set({ currentFilters: { ...currentFilters, ...filters }, isDirty: true });
  },
  resetFilters: () => set({ currentFilters: {}, isDirty: true }),

  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),

  setCanUndo: (canUndo) => set({ canUndo }),
  setCanRedo: (canRedo) => set({ canRedo }),

  reset: () =>
    set({ ...initialState, activeTool: "select", activePanel: null }),
}));
