"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Upload,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

// Konva imports
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { FilterManager } from "@/lib/editor/filter-manager";
import { ExportManager } from "@/lib/editor/export-manager";
import { FILTER_PRESETS } from "@/lib/editor/preset-filters";
import type { FilterSettings } from "@/types/editor";

import type { Project, CanvasState } from "@/types/project";
import {
  saveProjectCanvas,
  uploadProjectThumbnail,
} from "@/app/actions/projects";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

interface EditorWorkspaceProps {
  projectId?: string;
  initialProject?: Project;
}

/**
 * EditorWorkspace - Main editor orchestrator
 *
 * Architecture:
 * - State-first: Zustand store lưu filters + transform
 * - Konva refs: Stage/Layer/Image (view only, không serialize)
 * - Flow: Upload → Load → Apply filters → Export
 */
export function EditorWorkspace({
  projectId,
  initialProject,
}: EditorWorkspaceProps = {}) {
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Zustand store
  const {
    stage,
    layer,
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
    resetTransform,
    setDirty,
  } = useEditorStore();

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useLayoutEffect(() => {
    if (!canvasContainerRef.current || isCanvasReady) return;

    const initCanvas = () => {
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

          // Schedule state update after render to avoid cascading renders
          queueMicrotask(() => {
            setIsCanvasReady(true);
            toast.success("Canvas sẵn sàng!");
          });
        }
      } catch (error) {
        console.error("Init error:", error);
        toast.error("Không thể khởi tạo canvas");
      }
    };

    initCanvas();

    // Cleanup on unmount
    // NOTE: Không destroy stage vì nó có thể được reuse khi component re-render
    // Chỉ destroy khi thực sự rời khỏi editor page (handled by router)
  }, [isCanvasReady, setStage, setLayer]);

  // ============================================================================
  // PROJECT LOAD - Load existing project data
  // ============================================================================

  useLayoutEffect(() => {
    if (!initialProject || !isCanvasReady) return;

    const loadProjectData = async () => {
      try {
        const canvasData = initialProject.canvas_data as CanvasState | null;

        if (!canvasData || !canvasData.imageUrl) {
          toast.info("Project chưa có dữ liệu canvas");
          return;
        }

        // Load image from saved URL
        const response = await fetch(canvasData.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "project-image.png", { type: blob.type });

        // Load image vào canvas
        const canvasManager = getCanvasManager();
        await canvasManager.loadImage(file);

        const imageNodeInstance = canvasManager.getImageNode();
        if (imageNodeInstance) {
          setImageNode(imageNodeInstance);
          setImageLoaded(true);
          setOriginalImageSrc(canvasData.imageUrl);

          // Restore filters
          if (canvasData.filters) {
            updateFilters(canvasData.filters);
            FilterManager.applyFilters(imageNodeInstance, canvasData.filters);
          }

          toast.success("Đã tải project thành công!");
        }
      } catch (error) {
        console.error("Load project error:", error);
        toast.error("Không thể tải project");
      }
    };

    loadProjectData();
  }, [
    initialProject,
    isCanvasReady,
    setImageNode,
    setImageLoaded,
    setOriginalImageSrc,
    updateFilters,
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
    disabled: !isCanvasReady,
  });

  // ============================================================================
  // STATE MANAGEMENT & SAVE
  // ============================================================================

  const saveCurrentState = () => {
    // Mark canvas as dirty (has unsaved changes)
    setDirty(true);

    // Trigger auto-save if project exists
    if (projectId) {
      debouncedAutoSave();
    }
  };

  // Get current canvas state for saving
  const getCurrentCanvasState = (): Omit<CanvasState, "version"> | null => {
    if (!imageNode || !stage) return null;

    // Get original image URL from store
    const { originalImageSrc } = useEditorStore.getState();
    if (!originalImageSrc) return null;

    return {
      imageUrl: originalImageSrc,
      filters: currentFilters,
      transform: {
        scaleX: imageNode.scaleX(),
        scaleY: imageNode.scaleY(),
        rotation: imageNode.rotation(),
        x: imageNode.x(),
        y: imageNode.y(),
      },
      width: stage.width(),
      height: stage.height(),
    };
  };

  // Manual save
  const handleSave = async () => {
    if (!projectId) {
      toast.error("Không có project để lưu");
      return;
    }

    if (!imageNode) {
      toast.error("Chưa có ảnh để lưu");
      return;
    }

    const canvasState = getCurrentCanvasState();
    if (!canvasState) {
      toast.error("Không thể lấy trạng thái canvas");
      return;
    }

    setIsSaving(true);

    try {
      // Save canvas state first
      await saveProjectCanvas(projectId, canvasState);
      setDirty(false);
      setLastSaved(new Date());

      // Generate and upload thumbnail (non-blocking)
      const thumbnailBlob = await generateThumbnail();
      if (thumbnailBlob) {
        try {
          await uploadProjectThumbnail(projectId, thumbnailBlob);
        } catch (thumbError) {
          console.error("Thumbnail upload error:", thumbError);
          // Don't show error to user since save succeeded
        }
      }

      toast.success("Đã lưu project!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Không thể lưu project");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save (debounced)
  const autoSave = async () => {
    if (!projectId || !imageNode) return;

    const canvasState = getCurrentCanvasState();
    if (!canvasState) return;

    try {
      await saveProjectCanvas(projectId, canvasState);
      setDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save error:", error);
      // Don't show error toast for auto-save failures (silent)
    }
  };

  const debouncedAutoSave = useDebounce(autoSave, 3000);

  // Generate thumbnail from current canvas
  const generateThumbnail = async (): Promise<Blob | null> => {
    if (!stage) return null;

    try {
      // Export canvas as data URL with smaller size
      const dataUrl = stage.toDataURL({
        pixelRatio: 0.25, // 25% of original size for thumbnail
        quality: 0.8,
      });

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      return null;
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

    // Reset filters
    resetFilters();
    FilterManager.clearFilters(imageNode);

    // Reset transform (including flip)
    resetTransform();
    imageNode.scaleX(1);
    imageNode.scaleY(1);
    imageNode.rotation(0);
    imageNode.offsetX(0);
    imageNode.offsetY(0);

    layer?.draw();
    saveCurrentState();
    toast.success("Đã reset tất cả");
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
        isFree // Add watermark for free users
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

  useKeyboardShortcut([
    {
      key: "s",
      ctrl: true,
      description: "Lưu project",
      callback: () => {
        if (projectId && imageNode) {
          handleSave();
        } else {
          toast.error("Không có project để lưu");
        }
      },
    },
    {
      key: "e",
      ctrl: true,
      description: "Export ảnh",
      callback: () => {
        if (stage && isImageLoaded) {
          handleExport("png");
        } else {
          toast.error("Không có ảnh để export");
        }
      },
    },
    {
      key: "r",
      ctrl: true,
      description: "Reset filters",
      callback: () => {
        if (imageNode) {
          handleResetFilters();
        }
      },
    },
    {
      key: "Escape",
      description: "Đóng panel",
      callback: () => {
        const { activePanel, setActivePanel } = useEditorStore.getState();
        if (activePanel) {
          setActivePanel(null);
        }
      },
    },
  ]);

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
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Đã lưu {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {projectId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={!isImageLoaded || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </>
              )}
            </Button>
          )}

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
                    !isCanvasReady && "opacity-50 cursor-not-allowed"
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
