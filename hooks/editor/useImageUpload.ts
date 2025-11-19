import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { toast } from "sonner";
import {
  uploadProjectImage,
  deleteProjectImage,
  saveProjectCanvas,
  uploadProjectThumbnail,
} from "@/app/actions/projects";
import type { Project, CanvasState } from "@/types/project";

interface UseImageUploadProps {
  projectId?: string;
  initialProject?: Project;
  onUploadSuccess?: () => void;
}

/**
 * Hook quản lý upload và load image
 */
export function useImageUpload({
  projectId,
  initialProject,
  onUploadSuccess,
}: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const {
    stage,
    currentFilters,
    setImageNode,
    setImageLoaded,
    setOriginalImageSrc,
    resetFilters,
    setDirty,
  } = useEditorStore();

  const handleImageUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Tối đa 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Delete old image first (if replacing)
      const canvasData = initialProject?.canvas_data as CanvasState | null;
      const oldImageUrl = canvasData?.imageUrl;

      if (oldImageUrl) {
        console.log("🗑️ Deleting old image:", oldImageUrl);
        try {
          await deleteProjectImage(oldImageUrl);
          console.log("✅ Old image deleted from Storage");
        } catch (deleteError) {
          console.warn("⚠️ Failed to delete old image:", deleteError);
        }
      }

      const canvasManager = getCanvasManager();
      await canvasManager.loadImage(file);

      const imageNodeInstance = canvasManager.getImageNode();
      if (imageNodeInstance) {
        setImageNode(imageNodeInstance);
        setImageLoaded(true);

        // Upload image to Storage FIRST to get permanent URL
        let imageUrl: string;
        if (projectId) {
          try {
            toast.info("Đang upload ảnh...");
            imageUrl = await uploadProjectImage(projectId, file);
            console.log("✅ Image uploaded to Storage:", imageUrl);
          } catch (uploadError) {
            console.error("Failed to upload image:", uploadError);
            toast.error("Không thể upload ảnh");
            setIsUploading(false);
            return;
          }
        } else {
          imageUrl = URL.createObjectURL(file);
        }

        setOriginalImageSrc(imageUrl);
        resetFilters();
        setDirty(true);

        toast.success("Đã tải ảnh thành công!");

        // Auto-save on first upload
        const isFirstUpload = !oldImageUrl;
        if (isFirstUpload && projectId && stage) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvasState: Omit<CanvasState, "version"> = {
              imageUrl,
              filters: currentFilters,
              transform: {
                scaleX: imageNodeInstance.scaleX(),
                scaleY: imageNodeInstance.scaleY(),
                rotation: imageNodeInstance.rotation(),
                x: imageNodeInstance.x(),
                y: imageNodeInstance.y(),
                offsetX: imageNodeInstance.offsetX(),
                offsetY: imageNodeInstance.offsetY(),
              },
              width: stage.width(),
              height: stage.height(),
            };

            await saveProjectCanvas(projectId, canvasState);
            useEditorStore.setState({ isDirty: false });

            // Generate thumbnail
            const dataUrl = stage.toDataURL({
              pixelRatio: 0.25,
              quality: 0.8,
            });
            const response = await fetch(dataUrl);
            const thumbnailBlob = await response.blob();
            await uploadProjectThumbnail(projectId, thumbnailBlob);

            toast.success("Đã lưu ảnh tự động!");
          } catch (autoSaveError) {
            console.error("Auto-save error:", autoSaveError);
          }
        }

        onUploadSuccess?.();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleImageUpload,
    isUploading,
  };
}
