import { create } from "zustand";
import Konva from "konva";
import {
  EditorState,
  EditorTool,
  EditorPanel,
  FilterSettings,
  TransformState,
  DEFAULT_FILTER_SETTINGS,
  DEFAULT_TRANSFORM_STATE,
} from "@/types/editor";

/**
 * EditorStore - State-based store cho editor
 *
 * Best practice từ Konva docs:
 * - Lưu APP STATE (filters, transform), không lưu Konva nodes
 * - Konva.Stage và Konva.Image chỉ là view layer, không serialize
 * - State là single source of truth
 */
interface EditorStore extends EditorState {
  // Image state
  originalImageSrc: string | null;
  setOriginalImageSrc: (src: string) => void;
  setImageLoaded: (loaded: boolean) => void;

  // Canvas refs (không serialize)
  setStage: (stage: Konva.Stage | null) => void;
  setLayer: (layer: Konva.Layer | null) => void;
  setImageNode: (imageNode: Konva.Image | null) => void;

  // Filters (app state)
  currentFilters: FilterSettings;
  updateFilters: (filters: Partial<FilterSettings>) => void;
  resetFilters: () => void;

  // Transform (app state)
  currentTransform: TransformState;
  updateTransform: (transform: Partial<TransformState>) => void;
  resetTransform: () => void;

  // UI state
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  activePanel: EditorPanel | null;
  setActivePanel: (panel: EditorPanel | null) => void;
  togglePanel: (panel: EditorPanel) => void;

  // History state
  canUndo: boolean;
  canRedo: boolean;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;

  // App state
  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: EditorState = {
  stage: null,
  layer: null,
  imageNode: null,
  originalImageSrc: null,
  isImageLoaded: false,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  // Filters
  currentFilters: { ...DEFAULT_FILTER_SETTINGS },
  updateFilters: (filters) => {
    const { currentFilters } = get();
    set({
      currentFilters: { ...currentFilters, ...filters },
      isDirty: true,
    });
  },
  resetFilters: () =>
    set({
      currentFilters: { ...DEFAULT_FILTER_SETTINGS },
      isDirty: true,
    }),

  // Transform
  currentTransform: { ...DEFAULT_TRANSFORM_STATE },
  updateTransform: (transform) => {
    const { currentTransform } = get();
    set({
      currentTransform: { ...currentTransform, ...transform },
      isDirty: true,
    });
  },
  resetTransform: () =>
    set({
      currentTransform: { ...DEFAULT_TRANSFORM_STATE },
      isDirty: true,
    }),

  // Image
  setOriginalImageSrc: (src) => set({ originalImageSrc: src }),
  setImageLoaded: (loaded) => set({ isImageLoaded: loaded }),

  // Canvas refs
  setStage: (stage) => set({ stage }),
  setLayer: (layer) => set({ layer }),
  setImageNode: (imageNode) => set({ imageNode }),

  // UI
  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),

  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  togglePanel: (panel) => {
    const { activePanel } = get();
    set({ activePanel: activePanel === panel ? null : panel });
  },

  // History
  canUndo: false,
  canRedo: false,
  setCanUndo: (canUndo) => set({ canUndo }),
  setCanRedo: (canRedo) => set({ canRedo }),

  // App state
  isDirty: false,
  setDirty: (isDirty) => set({ isDirty }),

  // Reset
  reset: () =>
    set({
      ...initialState,
      currentFilters: { ...DEFAULT_FILTER_SETTINGS },
      currentTransform: { ...DEFAULT_TRANSFORM_STATE },
      activeTool: "select",
      activePanel: null,
      canUndo: false,
      canRedo: false,
      isDirty: false,
    }),
}));
