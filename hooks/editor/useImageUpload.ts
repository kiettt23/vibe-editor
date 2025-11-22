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
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error("File quá lớn! Kích thước tối đa: 10MB", {
        description: `File của bạn: ${fileSizeMB}MB. Vui lòng nén ảnh hoặc chọn file nhỏ hơn.`,
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("File không hợp lệ! Chỉ hỗ trợ ảnh PNG, JPG, WebP", {
        description: `File của bạn: ${file.type}. Vui lòng chọn file ảnh với định dạng đúng.`,
      });
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

      // Load image into canvas FIRST (synchronous render)
      const canvasManager = getCanvasManager();
      console.log("📸 Loading image into canvas...");
      await canvasManager.loadImage(file);

      const imageNodeInstance = canvasManager.getImageNode();
      if (!imageNodeInstance) {
        throw new Error("Canvas không thể render ảnh. Vui lòng thử lại.");
      }

      // Update store immediately to show image in canvas
      setImageNode(imageNodeInstance);
      setImageLoaded(true);
      console.log("✅ Image rendered in canvas");

      // Upload image to Storage in background
      let imageUrl: string;
      if (projectId) {
        try {
          toast.info("Đang upload ảnh...");
          imageUrl = await uploadProjectImage(projectId, file);
          console.log("✅ Image uploaded to Storage:", imageUrl);
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          toast.error("Không thể tải ảnh lên server", {
            description:
              "Vui lòng kiểm tra kết nối mạng và thử lại. Nếu lỗi vẫn tiếp diễn, hãy liên hệ hỗ trợ.",
          });
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
              // offsetX/Y are always center, no need to save
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
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        if (error.message.includes("canvas")) {
          toast.error("Lỗi canvas khi tải ảnh", {
            description: "Vui lòng refresh trang và thử lại.",
          });
        } else if (error.message.includes("network")) {
          toast.error("Lỗi kết nối mạng", {
            description: "Vui lòng kiểm tra kết nối internet và thử lại.",
          });
        } else {
          toast.error("Không thể tải ảnh", {
            description:
              error.message || "Lỗi không xác định. Vui lòng thử lại.",
          });
        }
      } else {
        toast.error("Không thể tải ảnh", {
          description:
            "Lỗi không xác định. Vui lòng thử lại hoặc chọn file khác.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleImageUpload,
    isUploading,
  };
}
