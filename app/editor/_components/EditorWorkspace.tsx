"use client";

import { useEditorStore } from "@/store/editor-store";
import { toast } from "sonner";

// Custom hooks
import { useCanvasSetup } from "@/hooks/editor/useCanvasSetup";
import { useImageUpload } from "@/hooks/editor/useImageUpload";
import { useProjectLoader } from "@/hooks/editor/useProjectLoader";
import { useEditorSave } from "@/hooks/editor/useEditorSave";
import { useZoomControls } from "@/hooks/editor/useZoomControls";
import { useEditorShortcuts } from "@/hooks/editor/useEditorShortcuts";

// Components
import { EditorHeader } from "@/components/editor/EditorHeader";
import { UploadPanel } from "@/components/editor/UploadPanel";
import { CanvasArea } from "@/components/editor/CanvasArea";
import { AdjustmentsPanel } from "@/components/editor/AdjustmentsPanel";
import { EditorFooter } from "@/components/editor/EditorFooter";
import { KeyboardShortcutsDialog } from "@/components/editor/KeyboardShortcutsDialog";

// Managers
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { FilterManager } from "@/lib/editor/filter-manager";
import { ExportManager } from "@/lib/editor/export-manager";
import { FILTER_PRESETS } from "@/lib/editor/preset-filters";

import type { Project } from "@/types/project";
import type { FilterSettings } from "@/types/editor";

interface EditorWorkspaceProps {
  projectId?: string;
  initialProject?: Project;
}

/**
 * EditorWorkspace - Main editor orchestrator (Refactored)
 *
 * IMPROVEMENTS:
 * - Split into smaller components (Header, Upload, Canvas, Adjustments)
 * - Extract logic into custom hooks (useCanvasSetup, useImageUpload, etc.)
 * - Add zoom controls
 * - Add rotate tool
 * - Improved UI/UX with tooltips and animations
 * - Better keyboard shortcuts
 */
export function EditorWorkspace({
  projectId,
  initialProject,
}: EditorWorkspaceProps = {}) {
  // Custom hooks
  const { isCanvasReady, containerRef } = useCanvasSetup();
  const { handleSave, isSaving, lastSaved } = useEditorSave({ projectId });

  // Zustand store
  const {
    stage,
    layer,
    imageNode,
    isImageLoaded,
    currentFilters,
    updateFilters,
    resetFilters,
    resetTransform,
    setDirty,
    isDirty,
  } = useEditorStore();

  // Zoom controls (with mouse wheel support)
  const { zoom, handleZoomIn, handleZoomOut, handleZoomReset } =
    useZoomControls({
      isImageLoaded,
      enabled: true,
    });

  // Image upload
  const { handleImageUpload, isUploading } = useImageUpload({
    projectId,
    initialProject,
  });

  // Project loader
  useProjectLoader({ initialProject, isCanvasReady });

  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================

  const handleFilterChange = (
    filterType: keyof FilterSettings,
    value: number | boolean
  ) => {
    if (!imageNode) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    const newFilters = { ...currentFilters, [filterType]: value };
    updateFilters(newFilters);

    try {
      FilterManager.applyFilters(imageNode, newFilters);
      setDirty(true);
    } catch (error) {
      console.error("Filter error:", error);
      toast.error("Không thể áp dụng filter");
    }
  };

  const handleApplyPreset = (presetName: string) => {
    if (!imageNode) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    const preset = FILTER_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    updateFilters(preset.settings);
    FilterManager.applyFilters(imageNode, preset.settings);
    setDirty(true);
    toast.success(`Đã áp dụng preset: ${preset.name}`);
  };

  // ============================================================================
  // TRANSFORM HANDLERS
  // ============================================================================

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (!imageNode) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    const canvasManager = getCanvasManager();
    canvasManager.flipImage(direction);
    setDirty(true);
    toast.success(`Đã lật ảnh ${direction === "horizontal" ? "ngang" : "dọc"}`);
  };

  const handleRotate = (angle: number) => {
    if (!imageNode) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    const canvasManager = getCanvasManager();
    canvasManager.rotateImage(angle);
    setDirty(true);
    toast.success(`Đã xoay ${angle > 0 ? "+" : ""}${angle}°`);
  };

  const handleResetAll = () => {
    if (!imageNode) return;

    // Reset filters
    resetFilters();
    FilterManager.clearFilters(imageNode);

    // Reset transform (including flip & rotation)
    resetTransform();
    imageNode.scaleX(1);
    imageNode.scaleY(1);
    imageNode.rotation(0);
    // Keep offset at center (set during image load)
    imageNode.offsetX(imageNode.width() / 2);
    imageNode.offsetY(imageNode.height() / 2);

    layer?.draw();
    setDirty(true);
    toast.success("Đã reset tất cả");
  };

  // ============================================================================
  // EXPORT
  // ============================================================================

  const handleExport = async (format: "png" | "jpeg" | "webp" = "png") => {
    if (!stage || !isImageLoaded) {
      toast.error("Không có ảnh để export");
      return;
    }

    try {
      // Check user subscription for watermark
      const { getUserSubscription } = await import("@/app/actions/projects");
      const subscription = await getUserSubscription();
      const isFree = subscription === "free";

      const filename = ExportManager.generateFilename("vibe-editor", format);
      await ExportManager.downloadImage(
        stage,
        filename,
        {
          format,
          quality: 0.95,
          pixelRatio: 2,
        },
        isFree
      );

      toast.success(
        isFree
          ? `Đã export với watermark (nâng cấp Pro để bỏ watermark)`
          : `Đã export: ${filename}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Không thể export ảnh");
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEditorShortcuts({
    projectId,
    stage,
    imageNode,
    isImageLoaded,
    onSave: handleSave,
    onExport: handleExport,
    onResetAll: handleResetAll,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-screen flex-col bg-background" ref={containerRef}>
      {/* Header */}
      <EditorHeader
        projectId={projectId}
        isImageLoaded={isImageLoaded}
        isSaving={isSaving}
        lastSaved={lastSaved}
        zoom={zoom}
        onSave={handleSave}
        onExport={handleExport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Upload Panel */}
        <UploadPanel
          isCanvasReady={isCanvasReady}
          isImageLoaded={isImageLoaded}
          isUploading={isUploading}
          onImageUpload={handleImageUpload}
        />

        {/* Canvas Area */}
        <CanvasArea isImageLoaded={isImageLoaded} zoom={zoom} />

        {/* Right Sidebar - Adjustments */}
        <AdjustmentsPanel
          isImageLoaded={isImageLoaded}
          currentFilters={currentFilters}
          onFilterChange={handleFilterChange}
          onFlip={handleFlip}
          onRotate={handleRotate}
          onApplyPreset={handleApplyPreset}
          onReset={handleResetAll}
        />
      </div>

      {/* Footer */}
      <EditorFooter isImageLoaded={isImageLoaded} isDirty={isDirty} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog />
    </div>
  );
}
