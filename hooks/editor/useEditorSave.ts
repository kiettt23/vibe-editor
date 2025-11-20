import { useState, useLayoutEffect, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";
import {
  saveProjectCanvas,
  uploadProjectThumbnail,
} from "@/app/actions/projects";
import type { CanvasState } from "@/types/project";

interface UseEditorSaveProps {
  projectId?: string;
}

/**
 * Hook quản lý save project và unsaved changes warning
 */
export function useEditorSave({ projectId }: UseEditorSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { stage, imageNode, currentFilters, originalImageSrc } =
    useEditorStore();

  // Get current canvas state for saving
  const getCurrentCanvasState = (): Omit<CanvasState, "version"> | null => {
    if (!imageNode || !stage || !originalImageSrc) return null;

    return {
      imageUrl: originalImageSrc,
      filters: currentFilters,
      transform: {
        scaleX: imageNode.scaleX(),
        scaleY: imageNode.scaleY(),
        rotation: imageNode.rotation(),
        x: imageNode.x(),
        y: imageNode.y(),
        // offsetX/Y are always center, no need to save
      },
      width: stage.width(),
      height: stage.height(),
    };
  };

  // Generate thumbnail
  const generateThumbnail = async (): Promise<Blob | null> => {
    if (!stage) return null;

    try {
      const dataUrl = stage.toDataURL({
        pixelRatio: 0.25,
        quality: 0.8,
      });
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      return null;
    }
  };

  // Manual save
  const handleSave = async () => {
    if (!projectId) {
      toast.error("Không có project để lưu");
      return;
    }

    if (!imageNode) {
      toast.error("Chưa có ảnh để lưu");
      return;
    }

    const canvasState = getCurrentCanvasState();
    if (!canvasState) {
      toast.error("Không thể lấy trạng thái canvas");
      return;
    }

    setIsSaving(true);

    try {
      // Save canvas state
      await saveProjectCanvas(projectId, canvasState);

      // Clear dirty state
      useEditorStore.setState({ isDirty: false });
      setLastSaved(new Date());

      // Generate and upload thumbnail (non-blocking)
      const thumbnailBlob = await generateThumbnail();
      if (thumbnailBlob) {
        try {
          await uploadProjectThumbnail(projectId, thumbnailBlob);
        } catch (thumbError) {
          console.error("Thumbnail upload error:", thumbError);
        }
      }

      toast.success("Đã lưu project!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Không thể lưu project");
    } finally {
      setIsSaving(false);
    }
  };

  // Warn before leaving if unsaved changes (browser close/refresh)
  useLayoutEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const state = useEditorStore.getState();
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Warn before navigation (back button)
  useEffect(() => {
    const handlePopState = () => {
      const state = useEditorStore.getState();

      if (state.isDirty) {
        const confirmLeave = window.confirm(
          "Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?"
        );

        if (!confirmLeave) {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return {
    handleSave,
    isSaving,
    lastSaved,
  };
}
