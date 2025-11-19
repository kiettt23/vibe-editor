import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";
import type Konva from "konva";

interface UseEditorShortcutsProps {
  projectId?: string;
  stage: Konva.Stage | null;
  imageNode: Konva.Image | null;
  isImageLoaded: boolean;
  onSave: () => void;
  onExport: (format: "png" | "jpeg" | "webp") => void;
  onResetAll: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

/**
 * Hook centralized quản lý tất cả keyboard shortcuts
 */
export function useEditorShortcuts({
  projectId,
  stage,
  imageNode,
  isImageLoaded,
  onSave,
  onExport,
  onResetAll,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: UseEditorShortcutsProps) {
  useKeyboardShortcut([
    {
      key: "s",
      ctrl: true,
      description: "Lưu project",
      callback: () => {
        if (projectId && imageNode) {
          onSave();
        } else {
          toast.error("Không có project để lưu");
        }
      },
    },
    {
      key: "e",
      ctrl: true,
      description: "Export ảnh",
      callback: () => {
        if (stage && isImageLoaded) {
          onExport("png");
        } else {
          toast.error("Không có ảnh để export");
        }
      },
    },
    {
      key: "r",
      ctrl: true,
      description: "Reset filters",
      callback: () => {
        if (imageNode) {
          onResetAll();
        }
      },
    },
    {
      key: "=",
      ctrl: true,
      description: "Zoom in",
      callback: () => {
        if (isImageLoaded) {
          onZoomIn();
        }
      },
    },
    {
      key: "-",
      ctrl: true,
      description: "Zoom out",
      callback: () => {
        if (isImageLoaded) {
          onZoomOut();
        }
      },
    },
    {
      key: "0",
      ctrl: true,
      description: "Reset zoom",
      callback: () => {
        if (isImageLoaded) {
          onZoomReset();
        }
      },
    },
    {
      key: "Escape",
      description: "Đóng panel",
      callback: () => {
        const { activePanel, setActivePanel } = useEditorStore.getState();
        if (activePanel) {
          setActivePanel(null);
        }
      },
    },
    {
      key: "k",
      ctrl: true,
      description: "Xem phím tắt",
      callback: () => {
        // Dialog handles this itself
      },
    },
  ]);
}
