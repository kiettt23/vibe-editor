"use client";

import { Upload } from "lucide-react";

interface CanvasAreaProps {
  isImageLoaded: boolean;
  zoom: number;
}

export function CanvasArea({ isImageLoaded, zoom }: CanvasAreaProps) {
  return (
    <div className="flex-1 bg-linear-to-br from-background via-muted/5 to-background overflow-hidden relative">
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center space-y-4 px-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Upload className="h-10 w-10 text-primary/60" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                Tải ảnh lên để bắt đầu
              </p>
              <p className="text-sm text-muted-foreground">
                Kéo thả file vào panel bên trái hoặc click để chọn
              </p>
            </div>
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
