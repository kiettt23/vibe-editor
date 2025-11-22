"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface UploadPanelProps {
  isCanvasReady: boolean;
  isImageLoaded: boolean;
  isUploading: boolean;
  onImageUpload: (files: File[]) => void;
}

export function UploadPanel({
  isCanvasReady,
  isImageLoaded,
  isUploading,
  onImageUpload,
}: UploadPanelProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImageUpload,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: !isCanvasReady,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (!rejection) return;

      const { errors } = rejection;
      const error = errors[0];

      if (error?.code === "file-too-large") {
        toast.error("File quá lớn! Kích thước tối đa: 10MB", {
          description: "Vui lòng nén ảnh hoặc chọn file nhỏ hơn",
        });
      } else if (error?.code === "file-invalid-type") {
        toast.error("File không hợp lệ! Chỉ hỗ trợ ảnh PNG, JPG, WebP", {
          description: "Vui lòng chọn file ảnh với định dạng đúng",
        });
      } else if (error?.code === "too-many-files") {
        toast.error("Chỉ có thể tải 1 ảnh mỗi lần", {
          description: "Vui lòng chọn lại một file duy nhất",
        });
      } else {
        toast.error("Không thể tải ảnh", {
          description: "Vui lòng thử lại hoặc chọn file khác",
        });
      }
    },
  });

  return (
    <div className="w-72 border-r bg-muted/5">
      <div className="flex h-full flex-col">
        <div className="border-b px-5 py-3.5 bg-card/30">
          <h2 className="text-sm font-semibold text-foreground">Tải ảnh lên</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kéo thả hoặc click để chọn
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/20"
                  : "border-border hover:border-primary/60 hover:bg-primary/5",
                (!isCanvasReady || isUploading) &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} disabled={isUploading} />
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                <Upload
                  className={cn(
                    "h-6 w-6 text-primary",
                    isUploading && "animate-bounce"
                  )}
                />
              </div>
              <p className="text-sm font-medium mb-1.5 text-foreground">
                {isUploading
                  ? "Đang tải lên..."
                  : isDragActive
                  ? "Thả ảnh vào đây"
                  : "Kéo thả hoặc click"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP • Tối đa 10MB
              </p>
            </div>

            {isImageLoaded && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <p className="text-xs font-semibold text-foreground">
                    Ảnh đã tải
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sử dụng panel bên phải để điều chỉnh filters và effects
                </p>
              </div>
            )}

            {!isImageLoaded && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  <p className="text-xs font-semibold text-foreground/70">
                    Chưa có ảnh
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tải ảnh lên để bắt đầu chỉnh sửa với VibeEditor
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="pt-4 space-y-2">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                💡 Tips
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ctrl + S để lưu nhanh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ctrl + E để export</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ctrl + R để reset filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Scroll để zoom in/out</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
