"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CenteredUploadProps {
  isUploading: boolean;
  onImageDrop?: (files: File[]) => void;
}

export function CenteredUpload({
  isUploading,
  onImageDrop,
}: CenteredUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0 && onImageDrop) {
      onImageDrop(imageFiles);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center h-full transition-all",
        isDragging && "bg-primary/5 ring-2 ring-primary ring-inset"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4 md:space-y-6 max-w-md px-4">
        {/* Upload Icon */}
        <div
          className={cn(
            "mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center transition-all",
            isDragging && "scale-110 border-primary bg-primary/20"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-lg md:text-2xl font-semibold text-foreground">
            {isUploading
              ? "Đang tải ảnh..."
              : isDragging
              ? "Thả ảnh vào đây"
              : "Tải ảnh lên"}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {isDragging ? (
              <>
                Thả file để upload
                <br />
                Hỗ trợ: JPG, PNG, WebP
              </>
            ) : (
              <>
                <span className="hidden md:inline">
                  Kéo thả ảnh vào đây hoặc click nút bên dưới
                  <br />
                  để chọn ảnh từ máy tính
                </span>
                <span className="md:hidden">Nhấn nút bên dưới để chọn ảnh</span>
              </>
            )}
          </p>
        </div>

        {/* Upload Button */}
        {!isDragging && (
          <div>
            <Button
              size="lg"
              disabled={isUploading}
              onClick={() =>
                document.getElementById("centered-file-input")?.click()
              }
              className="h-12 md:h-14 px-6 md:px-8"
            >
              <Upload className="mr-2 h-5 w-5" />
              Chọn ảnh
            </Button>
          </div>
        )}

        {/* Format Hint */}
        <p className="text-[10px] md:text-xs text-muted-foreground">
          Hỗ trợ: JPG, PNG, WebP, GIF (Max 10MB)
        </p>
      </div>
    </div>
  );
}
