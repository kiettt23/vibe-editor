"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
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
  deleteProjectImage,
  uploadProjectImage,
} from "@/app/actions/projects";
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
    updateTransform,
    resetFilters,
    resetTransform,
    setDirty,
  } = useEditorStore();

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useLayoutEffect(() => {
    if (!canvasContainerRef.current || isCanvasReady) return;

    let mounted = true;

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

        if (stageInstance && layerInstance && mounted) {
          setStage(stageInstance);
          setLayer(layerInstance);

          // Schedule state update after render to avoid cascading renders
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

    // Cleanup on unmount - Destroy Konva stage to prevent multiple instances
    return () => {
      mounted = false;
      // Don't destroy canvas here - it breaks hot reload in dev mode
      // Canvas will be destroyed on page navigation via browser
    };
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

          // Restore filters (skip setting isDirty when loading from database)
          if (canvasData.filters) {
            updateFilters(canvasData.filters, true); // skipDirty=true
            FilterManager.applyFilters(imageNodeInstance, canvasData.filters);
          }

          // Restore transform (including flip offsets, skip isDirty when loading)
          if (canvasData.transform) {
            const {
              scaleX = 1,
              scaleY = 1,
              rotation = 0,
              offsetX = 0,
              offsetY = 0,
            } = canvasData.transform;
            imageNodeInstance.scaleX(scaleX);
            imageNodeInstance.scaleY(scaleY);
            imageNodeInstance.rotation(rotation);
            imageNodeInstance.offsetX(offsetX);
            imageNodeInstance.offsetY(offsetY);

            // Update transform state without marking as dirty (loading from DB)
            updateTransform(canvasData.transform, true); // skipDirty=true
            layer?.draw();
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
    updateTransform,
    layer,
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
      // Delete old image first (if replacing)
      const canvasData = initialProject?.canvas_data as CanvasState | null;
      const oldImageUrl = canvasData?.imageUrl;

      if (oldImageUrl) {
        console.log("🗑️ Deleting old image:", oldImageUrl);
        try {
          const deleted = await deleteProjectImage(oldImageUrl);
          if (deleted) {
            console.log("✅ Old image deleted from Storage");
          }
        } catch (deleteError) {
          console.warn("⚠️ Failed to delete old image:", deleteError);
          // Continue anyway - don't block new upload
        }
      }

      const canvasManager = getCanvasManager();
      await canvasManager.loadImage(file);

      const imageNodeInstance = canvasManager.getImageNode();
      if (imageNodeInstance) {
        setImageNode(imageNodeInstance);
        setImageLoaded(true);

        // Upload image to Storage FIRST to get permanent URL
        let imageUrl: string;
        if (projectId) {
          try {
            toast.info("Đang upload ảnh...");
            imageUrl = await uploadProjectImage(projectId, file);
            console.log("✅ Image uploaded to Storage:", imageUrl);
          } catch (uploadError) {
            console.error("Failed to upload image:", uploadError);
            toast.error("Không thể upload ảnh");
            return;
          }
        } else {
          // Fallback to blob URL if no projectId (shouldn't happen)
          imageUrl = URL.createObjectURL(file);
        }

        setOriginalImageSrc(imageUrl);

        // Reset về trạng thái ban đầu
        resetFilters();

        // Save initial state (mark as dirty for manual save later)
        saveCurrentState();

        toast.success("Đã tải ảnh thành công!");

        // Auto-save on first upload (if project has no image yet)
        // Use oldImageUrl from earlier check (already have canvasData)
        const isFirstUpload = !oldImageUrl;
        if (isFirstUpload && projectId && stage) {
          try {
            // Wait a bit for canvas to stabilize
            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvasState: Omit<CanvasState, "version"> = {
              imageUrl, // Now this is a Storage URL, not blob URL
              filters: currentFilters,
              transform: {
                scaleX: imageNodeInstance.scaleX(),
                scaleY: imageNodeInstance.scaleY(),
                rotation: imageNodeInstance.rotation(),
                x: imageNodeInstance.x(),
                y: imageNodeInstance.y(),
                offsetX: imageNodeInstance.offsetX(),
                offsetY: imageNodeInstance.offsetY(),
              },
              width: stage.width(),
              height: stage.height(),
            };

            // Save to database
            await saveProjectCanvas(projectId, canvasState);

            // Clear dirty flag after auto-save
            useEditorStore.setState({ isDirty: false });
            setLastSaved(new Date());

            // Generate and upload thumbnail
            const thumbnailBlob = await generateThumbnail();
            if (thumbnailBlob) {
              await uploadProjectThumbnail(projectId, thumbnailBlob);
            }

            toast.success("Đã lưu ảnh tự động!");
          } catch (autoSaveError) {
            console.error("Auto-save error:", autoSaveError);
            // Don't show error - user can still save manually
            // Keep isDirty=true so warning shows
          }
        }
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
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: !isCanvasReady,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (!rejection) return;

      const { errors } = rejection;
      const error = errors[0];

      if (error?.code === "file-too-large") {
        toast.error("File quá lớn! Tối đa 10MB");
      } else if (error?.code === "file-invalid-type") {
        toast.error("Chỉ chấp nhận file ảnh (PNG, JPG, WebP)");
      } else {
        toast.error("File không hợp lệ");
      }
    },
  });

  // ============================================================================
  // STATE MANAGEMENT & SAVE
  // ============================================================================

  const saveCurrentState = () => {
    // Mark canvas as dirty (has unsaved changes)
    setDirty(true);
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
        offsetX: imageNode.offsetX(), // Include offset for flip
        offsetY: imageNode.offsetY(), // Include offset for flip
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

      // Clear dirty state in Zustand store immediately after successful save
      useEditorStore.setState({ isDirty: false });
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

  // Warn before leaving if unsaved changes (browser close/refresh)
  useLayoutEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Read isDirty from store directly (Zustand state, not React state)
      const state = useEditorStore.getState();
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []); // Empty deps - read from Zustand store directly

  // Warn before navigation (back button, internal links)
  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const state = useEditorStore.getState();

      if (state.isDirty) {
        const confirmLeave = window.confirm(
          "Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?"
        );

        if (!confirmLeave) {
          // Prevent navigation by pushing state back
          window.history.pushState(null, "", window.location.href);
        }
        // If user clicks OK, isDirty is still true but we allow navigation
        // This is expected - user chose to discard changes
      }
    };

    // Add INITIAL state to history ONCE (not on every render)
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // Empty deps - only run once on mount  // Generate thumbnail from current canvas
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
      {/* Header - Compact & Modern */}
      <div className="flex h-12 items-center justify-between border-b px-4 bg-card/50 backdrop-blur-sm">
        {/* Left: Logo + Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">VE</span>
            </div>
            <span className="text-sm font-semibold text-foreground/90">
              VibeEditor
            </span>
          </div>

          {isImageLoaded && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Đã tải ảnh
              </span>
            </div>
          )}

          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Lưu lúc {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {projectId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!isImageLoaded || isSaving}
              className="h-8 px-3"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs">Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  <span className="text-xs">Lưu</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={() => handleExport("png")}
            disabled={!isImageLoaded}
            className="h-8 px-3"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">PNG</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("jpeg")}
            disabled={!isImageLoaded}
            className="h-8 px-3"
          >
            <span className="text-xs">JPG</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Upload Panel */}
        <div className="w-72 border-r bg-muted/5">
          <div className="flex h-full flex-col">
            <div className="border-b px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground/90">
                Tải ảnh lên
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5 space-y-4">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/60 hover:bg-primary/5",
                    !isCanvasReady && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1.5 text-foreground">
                    {isDragActive ? "Thả ảnh vào đây" : "Kéo thả hoặc click"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP • Tối đa 10MB
                  </p>
                </div>

                {isImageLoaded && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <p className="text-xs font-semibold text-foreground">
                        Ảnh đã tải
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sử dụng panel bên phải để điều chỉnh filters và effects
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="flex-1 bg-linear-to-br from-background via-muted/5 to-background overflow-auto relative"
          ref={canvasContainerRef}
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-3 px-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tải ảnh lên để bắt đầu chỉnh sửa
                </p>
              </div>
            </div>
          )}
          <div
            id="konva-container"
            className="w-full h-full flex items-center justify-center"
          />
        </div>

        {/* Right Sidebar - Adjustments */}
        <div className="w-72 border-l bg-muted/5">
          <div className="flex h-full flex-col">
            <div className="border-b px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground/90">
                Điều chỉnh & Filters
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <Tabs defaultValue="adjustments" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mx-5 my-3">
                  <TabsTrigger value="adjustments" className="text-xs">
                    Tùy chỉnh
                  </TabsTrigger>
                  <TabsTrigger value="presets" className="text-xs">
                    Presets
                  </TabsTrigger>
                </TabsList>

                {/* Adjustments Tab */}
                <TabsContent
                  value="adjustments"
                  className="px-5 py-4 space-y-5"
                >
                  {/* Blur */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="blur"
                        className="text-xs font-medium text-foreground/80"
                      >
                        Làm mờ
                      </Label>
                      <span className="text-xs font-semibold text-primary tabular-nums">
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
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="brightness"
                        className="text-xs font-medium text-foreground/80"
                      >
                        Độ sáng
                      </Label>
                      <span className="text-xs font-semibold text-primary tabular-nums">
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
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="contrast"
                        className="text-xs font-medium text-foreground/80"
                      >
                        Độ tương phản
                      </Label>
                      <span className="text-xs font-semibold text-primary tabular-nums">
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
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="saturation"
                        className="text-xs font-medium text-foreground/80"
                      >
                        Độ bão hòa
                      </Label>
                      <span className="text-xs font-semibold text-primary tabular-nums">
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
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="hue"
                        className="text-xs font-medium text-foreground/80"
                      >
                        Sắc độ
                      </Label>
                      <span className="text-xs font-semibold text-primary tabular-nums">
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

                  <Separator className="my-5" />

                  {/* Effects Toggle */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Effects
                    </p>

                    <div className="flex items-center justify-between py-2">
                      <Label
                        htmlFor="grayscale"
                        className="text-xs font-medium text-foreground/80 cursor-pointer"
                      >
                        Đen trắng
                      </Label>
                      <Switch
                        id="grayscale"
                        checked={currentFilters.grayscale}
                        onCheckedChange={(checked) =>
                          handleFilterChange("grayscale", checked)
                        }
                        disabled={!isImageLoaded}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <Label
                        htmlFor="sepia"
                        className="text-xs font-medium text-foreground/80 cursor-pointer"
                      >
                        Sepia
                      </Label>
                      <Switch
                        id="sepia"
                        checked={currentFilters.sepia}
                        onCheckedChange={(checked) =>
                          handleFilterChange("sepia", checked)
                        }
                        disabled={!isImageLoaded}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <Label
                        htmlFor="invert"
                        className="text-xs font-medium text-foreground/80 cursor-pointer"
                      >
                        Đảo màu
                      </Label>
                      <Switch
                        id="invert"
                        checked={currentFilters.invert}
                        onCheckedChange={(checked) =>
                          handleFilterChange("invert", checked)
                        }
                        disabled={!isImageLoaded}
                      />
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Transform */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Transform
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlip("horizontal")}
                        disabled={!isImageLoaded}
                        className="h-9 text-xs"
                      >
                        <FlipHorizontal className="mr-1.5 h-3.5 w-3.5" />
                        Ngang
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlip("vertical")}
                        disabled={!isImageLoaded}
                        className="h-9 text-xs"
                      >
                        <FlipVertical className="mr-1.5 h-3.5 w-3.5" />
                        Dọc
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Reset All */}
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs"
                    onClick={handleResetFilters}
                    disabled={!isImageLoaded}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Reset tất cả
                  </Button>
                </TabsContent>

                {/* Presets Tab */}
                <TabsContent value="presets" className="px-5 py-4 space-y-2">
                  {FILTER_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="w-full justify-start h-auto flex-col items-start py-3 px-4 hover:bg-primary/5 hover:border-primary/30"
                      onClick={() => handleApplyPreset(preset.name)}
                      disabled={!isImageLoaded}
                    >
                      <span className="text-xs font-semibold text-foreground">
                        {preset.name}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
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
