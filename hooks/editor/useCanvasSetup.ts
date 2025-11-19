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
        // Calculate canvas size (responsive)
        const containerWidth = Math.max(window.innerWidth - 640, 600);
        const containerHeight = Math.max(window.innerHeight - 64, 400);

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
