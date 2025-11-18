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

interface EditorStore extends EditorState {
  originalImageSrc: string | null;
  setOriginalImageSrc: (src: string) => void;
  setImageLoaded: (loaded: boolean) => void;

  setStage: (stage: Konva.Stage | null) => void;
  setLayer: (layer: Konva.Layer | null) => void;
  setImageNode: (imageNode: Konva.Image | null) => void;

  currentFilters: FilterSettings;
  updateFilters: (filters: Partial<FilterSettings>) => void;
  resetFilters: () => void;

  currentTransform: TransformState;
  updateTransform: (transform: Partial<TransformState>) => void;
  resetTransform: () => void;

  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  activePanel: EditorPanel | null;
  setActivePanel: (panel: EditorPanel | null) => void;
  togglePanel: (panel: EditorPanel) => void;

  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;

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

  isDirty: false,
  setDirty: (isDirty) => set({ isDirty }),

  reset: () =>
    set({
      ...initialState,
      currentFilters: { ...DEFAULT_FILTER_SETTINGS },
      currentTransform: { ...DEFAULT_TRANSFORM_STATE },
      activeTool: "select",
      activePanel: null,
      isDirty: false,
    }),
}));
