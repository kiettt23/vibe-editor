"use client";

interface CanvasAreaProps {
  zoom: number;
}

export function CanvasArea({ zoom }: CanvasAreaProps) {
  return (
    <div className="flex-1 bg-linear-to-br from-background via-muted/5 to-background overflow-hidden relative">
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
