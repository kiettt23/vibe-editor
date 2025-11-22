"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CanvasAreaProps {
  zoom: number;
  onImageDrop?: (files: File[]) => void;
}

export function CanvasArea({ zoom, onImageDrop }: CanvasAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the container itself
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
    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length > 0 && onImageDrop) {
      onImageDrop(imageFiles);
    }
  };

  return (
    <div
      className={cn(
        "flex-1 bg-linear-to-br from-background via-muted/5 to-background overflow-hidden relative transition-all",
        isDragging && "ring-2 ring-primary ring-inset bg-primary/5"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-50 pointer-events-none">
          <div className="text-center space-y-2">
            <div className="text-2xl font-semibold text-primary">
              Thả ảnh vào đây
            </div>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ PNG, JPG, WebP
            </p>
          </div>
        </div>
      )}

      <div
        id="konva-container"
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center",
          transition: "transform 0.2s ease-out",
        }}
      />
    </div>
  );
}
