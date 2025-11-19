import { useLayoutEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { FilterManager } from "@/lib/editor/filter-manager";
import { toast } from "sonner";
import type { Project, CanvasState } from "@/types/project";

interface UseProjectLoaderProps {
  initialProject?: Project;
  isCanvasReady: boolean;
}

/**
 * Hook load existing project data vào canvas
 */
export function useProjectLoader({
  initialProject,
  isCanvasReady,
}: UseProjectLoaderProps) {
  const {
    layer,
    setImageNode,
    setImageLoaded,
    setOriginalImageSrc,
    updateFilters,
    updateTransform,
  } = useEditorStore();

  useLayoutEffect(() => {
    if (!initialProject || !isCanvasReady) return;

    const loadProjectData = async () => {
      try {
        const canvasData = initialProject.canvas_data as CanvasState | null;

        if (!canvasData || !canvasData.imageUrl) {
          toast.info("Project chưa có dữ liệu canvas");
          return;
        }

        // Load image from saved URL
        const response = await fetch(canvasData.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "project-image.png", { type: blob.type });

        // Load image vào canvas
        const canvasManager = getCanvasManager();
        await canvasManager.loadImage(file);

        const imageNodeInstance = canvasManager.getImageNode();
        if (imageNodeInstance) {
          setImageNode(imageNodeInstance);
          setImageLoaded(true);
          setOriginalImageSrc(canvasData.imageUrl);

          // Restore filters (skip setting isDirty when loading from database)
          if (canvasData.filters) {
            updateFilters(canvasData.filters, true); // skipDirty=true
            FilterManager.applyFilters(imageNodeInstance, canvasData.filters);
          }

          // Restore transform (including flip offsets)
          if (canvasData.transform) {
            const {
              scaleX = 1,
              scaleY = 1,
              rotation = 0,
              offsetX = 0,
              offsetY = 0,
            } = canvasData.transform;

            imageNodeInstance.scaleX(scaleX);
            imageNodeInstance.scaleY(scaleY);
            imageNodeInstance.rotation(rotation);
            imageNodeInstance.offsetX(offsetX);
            imageNodeInstance.offsetY(offsetY);

            updateTransform(canvasData.transform, true); // skipDirty=true
            layer?.draw();
          }

          toast.success("Đã tải project thành công!");
        }
      } catch (error) {
        console.error("Load project error:", error);
        toast.error("Không thể tải project");
      }
    };

    loadProjectData();
  }, [
    initialProject,
    isCanvasReady,
    layer,
    setImageNode,
    setImageLoaded,
    setOriginalImageSrc,
    updateFilters,
    updateTransform,
  ]);
}
