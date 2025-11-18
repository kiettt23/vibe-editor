"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Trash2,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

// Konva imports
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { FilterManager } from "@/lib/editor/filter-manager";
import { HistoryManager } from "@/lib/editor/history-manager";
import { ExportManager } from "@/lib/editor/export-manager";
import { FILTER_PRESETS } from "@/lib/editor/preset-filters";
import type { EditorSnapshot, FilterSettings } from "@/types/editor";

/**
 * EditorPage - Main editor với Konva.js
 *
 * Architecture:
 * - State-first: Zustand store lưu filters + transform
 * - Konva refs: Stage/Layer/Image (view only, không serialize)
 * - History: Lightweight snapshots (filters + transform)
 * - Flow: Upload → Load → Apply filters → Export
 */
export default function EditorPage() {
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const historyManagerRef = useRef<HistoryManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Zustand store
  const {
    stage,
    imageNode,
    isImageLoaded,
    setStage,
    setLayer,
    setImageNode,
    setOriginalImageSrc,
    setImageLoaded,
    currentFilters,
    updateFilters,
    resetFilters,
    currentTransform,
    updateTransform,
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
    setDirty,
  } = useEditorStore();

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!canvasContainerRef.current || isInitialized) return;

    try {
      const canvasManager = getCanvasManager();
      const containerId = "konva-container";

      // Calculate canvas size (responsive)
      const containerWidth = Math.max(window.innerWidth - 512, 600);
      const containerHeight = Math.max(window.innerHeight - 64, 400);

      canvasManager.initialize(containerId, containerWidth, containerHeight);

      const stageInstance = canvasManager.getStage();
      const layerInstance = canvasManager.getLayer();

      if (stageInstance && layerInstance) {
        setStage(stageInstance);
        setLayer(layerInstance);

        // Initialize history manager
        historyManagerRef.current = new HistoryManager();
        historyManagerRef.current.saveSnapshot({
          filters: currentFilters,
          transform: currentTransform,
          timestamp: Date.now(),
        });

        setCanUndo(false);
        setCanRedo(false);
        setIsInitialized(true);

        toast.success("Canvas sẵn sàng!");
      }
    } catch (error) {
      console.error("Init error:", error);
      toast.error("Không thể khởi tạo canvas");
    }

    // Cleanup on unmount
    return () => {
      const canvasManager = getCanvasManager();
      canvasManager.destroy();
    };
  }, [
    isInitialized,
    currentFilters,
    currentTransform,
    setStage,
    setLayer,
    setCanUndo,
    setCanRedo,
  ]);

  // ============================================================================
  // IMAGE UPLOAD
  // ============================================================================

  const handleImageUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Tối đa 10MB");
      return;
    }

    try {
      const canvasManager = getCanvasManager();
      await canvasManager.loadImage(file);

      const imageNodeInstance = canvasManager.getImageNode();
      if (imageNodeInstance) {
        setImageNode(imageNodeInstance);
        setImageLoaded(true);
        setOriginalImageSrc(URL.createObjectURL(file));

        // Reset về trạng thái ban đầu
        resetFilters();

        // Save initial state
        saveCurrentState();

        toast.success("Đã tải ảnh thành công!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: !isInitialized,
  });

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  const saveCurrentState = () => {
    if (!historyManagerRef.current) return;

    const snapshot: EditorSnapshot = {
      filters: currentFilters,
      transform: currentTransform,
      timestamp: Date.now(),
    };

    historyManagerRef.current.saveSnapshot(snapshot);
    setCanUndo(historyManagerRef.current.canUndo());
    setCanRedo(historyManagerRef.current.canRedo());
    setDirty(true);
  };

  const restoreState = (snapshot: EditorSnapshot) => {
    if (!imageNode) return;

    try {
      // Restore filters
      updateFilters(snapshot.filters);
      FilterManager.applyFilters(imageNode, snapshot.filters);

      // Restore transform
      updateTransform(snapshot.transform);
      const canvasManager = getCanvasManager();
      canvasManager.updateImagePosition(
        snapshot.transform.x,
        snapshot.transform.y
      );
      canvasManager.updateImageScale(
        snapshot.transform.scaleX,
        snapshot.transform.scaleY
      );
      canvasManager.updateImageRotation(snapshot.transform.rotation);
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Không thể khôi phục trạng thái");
    }
  };

  const handleUndo = () => {
    if (!historyManagerRef.current || !canUndo) return;

    const snapshot = historyManagerRef.current.undo();
    if (snapshot) {
      restoreState(snapshot);
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
      toast.success("Đã hoàn tác");
    }
  };

  const handleRedo = () => {
    if (!historyManagerRef.current || !canRedo) return;

    const snapshot = historyManagerRef.current.redo();
    if (snapshot) {
      restoreState(snapshot);
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
      toast.success("Đã làm lại");
    }
  };

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
      saveCurrentState();
    } catch (error) {
      console.error("Filter error:", error);
      toast.error("Không thể áp dụng filter");
    }
  };

  const handleResetFilters = () => {
    if (!imageNode) return;

    resetFilters();
    FilterManager.clearFilters(imageNode);
    saveCurrentState();
    toast.success("Đã reset tất cả filters");
  };

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (!imageNode) {
      toast.error("Vui lòng tải ảnh trước");
      return;
    }

    const canvasManager = getCanvasManager();
    canvasManager.flipImage(direction);
    saveCurrentState();
    toast.success(`Đã lật ảnh ${direction === "horizontal" ? "ngang" : "dọc"}`);
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
    saveCurrentState();
    toast.success(`Đã áp dụng preset: ${preset.name}`);
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
      const filename = ExportManager.generateFilename("vibe-editor", format);
      await ExportManager.downloadImage(stage, filename, {
        format,
        quality: 0.95,
        pixelRatio: 2,
      });

      toast.success(`Đã export: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Không thể export ảnh");
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (
        (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
          ((e.ctrlKey || e.metaKey) && e.key === "y")) &&
        canRedo
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Vibe Editor</h1>
          {isImageLoaded && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Đã tải ảnh
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="default"
            size="sm"
            onClick={() => handleExport("png")}
            disabled={!isImageLoaded}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PNG
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("jpeg")}
            disabled={!isImageLoaded}
          >
            Export JPG
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Upload */}
        <div className="w-64 border-r bg-muted/10">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold">Tải ảnh lên</h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50",
                    !isInitialized && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-2">
                    {isDragActive
                      ? "Thả ảnh vào đây"
                      : "Click hoặc kéo ảnh vào"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP (tối đa 10MB)
                  </p>
                </div>

                {isImageLoaded && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Đã tải ảnh</p>
                    <p className="text-xs text-muted-foreground">
                      Sử dụng các controls bên phải để chỉnh sửa
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 bg-muted/5 overflow-auto"
          ref={canvasContainerRef}
        >
          <div
            id="konva-container"
            className="w-full h-full flex items-center justify-center"
          />
        </div>

        {/* Right Sidebar - Filters */}
        <div className="w-64 border-l bg-muted/10">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold">Filters & Chỉnh sửa</h2>
            </div>

            <ScrollArea className="flex-1">
              <Tabs defaultValue="adjustments" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="adjustments">Chỉnh sửa</TabsTrigger>
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                </TabsList>

                {/* Adjustments Tab */}
                <TabsContent value="adjustments" className="p-4 space-y-4">
                  {/* Blur */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="blur">Làm mờ</Label>
                      <span className="text-xs text-muted-foreground">
                        {currentFilters.blur}
                      </span>
                    </div>
                    <Slider
                      id="blur"
                      min={0}
                      max={50}
                      step={1}
                      value={[currentFilters.blur]}
                      onValueChange={([value]) =>
                        handleFilterChange("blur", value)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="brightness">Độ sáng</Label>
                      <span className="text-xs text-muted-foreground">
                        {currentFilters.brightness > 0 ? "+" : ""}
                        {currentFilters.brightness.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      id="brightness"
                      min={-1}
                      max={1}
                      step={0.01}
                      value={[currentFilters.brightness]}
                      onValueChange={([value]) =>
                        handleFilterChange("brightness", value)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="contrast">Độ tương phản</Label>
                      <span className="text-xs text-muted-foreground">
                        {currentFilters.contrast}
                      </span>
                    </div>
                    <Slider
                      id="contrast"
                      min={-100}
                      max={100}
                      step={1}
                      value={[currentFilters.contrast]}
                      onValueChange={([value]) =>
                        handleFilterChange("contrast", value)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="saturation">Độ bão hòa</Label>
                      <span className="text-xs text-muted-foreground">
                        {currentFilters.saturation > 0 ? "+" : ""}
                        {currentFilters.saturation.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      id="saturation"
                      min={-1}
                      max={1}
                      step={0.01}
                      value={[currentFilters.saturation]}
                      onValueChange={([value]) =>
                        handleFilterChange("saturation", value)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  {/* Hue */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="hue">Sắc độ</Label>
                      <span className="text-xs text-muted-foreground">
                        {currentFilters.hue}°
                      </span>
                    </div>
                    <Slider
                      id="hue"
                      min={0}
                      max={359}
                      step={1}
                      value={[currentFilters.hue]}
                      onValueChange={([value]) =>
                        handleFilterChange("hue", value)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  <Separator />

                  {/* Boolean Filters */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="grayscale">Đen trắng</Label>
                    <Switch
                      id="grayscale"
                      checked={currentFilters.grayscale}
                      onCheckedChange={(checked) =>
                        handleFilterChange("grayscale", checked)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sepia">Sepia</Label>
                    <Switch
                      id="sepia"
                      checked={currentFilters.sepia}
                      onCheckedChange={(checked) =>
                        handleFilterChange("sepia", checked)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="invert">Đảo màu</Label>
                    <Switch
                      id="invert"
                      checked={currentFilters.invert}
                      onCheckedChange={(checked) =>
                        handleFilterChange("invert", checked)
                      }
                      disabled={!isImageLoaded}
                    />
                  </div>

                  <Separator />

                  {/* Flip Controls */}
                  <div className="space-y-2">
                    <Label>Lật ảnh</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlip("horizontal")}
                        disabled={!isImageLoaded}
                      >
                        <FlipHorizontal className="mr-2 h-4 w-4" />
                        Ngang
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlip("vertical")}
                        disabled={!isImageLoaded}
                      >
                        <FlipVertical className="mr-2 h-4 w-4" />
                        Dọc
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Reset */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResetFilters}
                    disabled={!isImageLoaded}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset tất cả
                  </Button>
                </TabsContent>

                {/* Presets Tab */}
                <TabsContent value="presets" className="p-4 space-y-2">
                  {FILTER_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="w-full justify-start h-auto flex-col items-start py-3"
                      onClick={() => handleApplyPreset(preset.name)}
                      disabled={!isImageLoaded}
                    >
                      <span className="font-semibold">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {preset.description}
                      </span>
                    </Button>
                  ))}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
