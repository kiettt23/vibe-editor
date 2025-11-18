import { forwardRef } from "react";

export const CanvasWorkspace = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className="flex-1 bg-muted/5 overflow-auto" ref={ref}>
      <div
        id="konva-container"
        className="w-full h-full flex items-center justify-center"
      />
    </div>
  );
});

CanvasWorkspace.displayName = "CanvasWorkspace";
