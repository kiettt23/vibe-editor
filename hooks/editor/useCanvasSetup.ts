import { useLayoutEffect, useState, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { toast } from "sonner";

/**
 * Hook quản lý việc initialize Konva canvas
 */
export function useCanvasSetup(containerId: string = "konva-container") {
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const { setStage, setLayer } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isCanvasReady) return;

    let mounted = true;

    const initCanvas = () => {
      try {
        // Calculate canvas size (responsive for mobile and desktop)
        const isMobile = window.innerWidth < 768;
        const containerWidth = isMobile
          ? window.innerWidth - 32 // Mobile: full width minus padding
          : Math.max(window.innerWidth - 640, 600); // Desktop: minus sidebars
        const containerHeight = isMobile
          ? window.innerHeight - 128 // Mobile: minus header + footer
          : Math.max(window.innerHeight - 128, 400); // Desktop: minus header + footer

        const canvasManager = getCanvasManager();
        canvasManager.initialize(containerId, containerWidth, containerHeight);

        const stageInstance = canvasManager.getStage();
        const layerInstance = canvasManager.getLayer();

        if (stageInstance && layerInstance && mounted) {
          setStage(stageInstance);
          setLayer(layerInstance);

          queueMicrotask(() => {
            if (mounted) {
              setIsCanvasReady(true);
              toast.success("Canvas sẵn sàng!");
            }
          });
        }

        // Listen for window resize to adjust canvas
        const handleResize = () => {
          const isMobile = window.innerWidth < 768;
          const newWidth = isMobile
            ? window.innerWidth - 32
            : Math.max(window.innerWidth - 640, 600);
          const newHeight = isMobile
            ? window.innerHeight - 128
            : Math.max(window.innerHeight - 128, 400);

          canvasManager.resize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (error) {
        console.error("Init error:", error);
        if (mounted) {
          toast.error("Không thể khởi tạo canvas");
        }
      }
    };

    initCanvas();

    return () => {
      mounted = false;
    };
  }, [isCanvasReady, containerId, setStage, setLayer]);

  return { isCanvasReady, containerRef };
}
