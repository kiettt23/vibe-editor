import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";

interface UseZoomControlsProps {
  isImageLoaded: boolean;
  enabled?: boolean;
}

/**
 * Hook quản lý zoom controls (keyboard & mouse wheel)
 */
export function useZoomControls({
  isImageLoaded,
  enabled = true,
}: UseZoomControlsProps) {
  const { zoom, setZoom } = useEditorStore();

  const handleZoomIn = useCallback(() => {
    setZoom(zoom + 0.1);
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(zoom - 0.1);
  }, [zoom, setZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

  // Mouse wheel zoom
  useEffect(() => {
    if (!isImageLoaded || !enabled) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05; // Smaller delta for smoother zoom
        setZoom(zoom + delta);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isImageLoaded, zoom, setZoom, enabled]);

  return {
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  };
}
