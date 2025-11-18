"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Layers,
  Image as ImageIcon,
  Type,
  Crop,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createProject,
  updateProject,
  getProject,
} from "@/app/actions/projects";
import { toast } from "sonner";
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { HistoryManager } from "@/lib/editor/history-manager";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { ExportDialog } from "@/components/editor/export-dialog";
import { PresetFiltersPanel } from "@/components/editor/preset-filters-panel";
import { TextToolDialog } from "@/components/editor/text-tool-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditorPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId");

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const historyManagerRef = useRef<HistoryManager | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    projectId
  );
  const [projectName, setProjectName] = useState("Dự án chưa lưu");
  const [user, setUser] = useState<any>(null);

  const {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    activeTool,
    setActiveTool,
    currentFilters,
    updateFilters,
    resetFilters,
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
  } = useEditorStore();

  // Initialize canvas
  useEffect(() => {
    if (canvasContainerRef.current && !isCanvasReady) {
      const canvasManager = getCanvasManager();
      const canvasElement = document.getElementById(
        "editor-canvas"
      ) as HTMLCanvasElement;

      if (canvasElement) {
        const canvas = canvasManager.initialize(canvasElement, {
          width: 800,
          height: 600,
        });

        // Initialize history manager
        if (canvas) {
          historyManagerRef.current = new HistoryManager(canvas);
          setCanUndo(historyManagerRef.current.canUndo());
          setCanRedo(historyManagerRef.current.canRedo());
        }

        setIsCanvasReady(true);
      }
    }
  }, [isCanvasReady, setCanUndo, setCanRedo]);

  // Upload image handler
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        const canvasManager = getCanvasManager();
        await canvasManager.addImage(imageUrl);
      };

      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    noClick: false,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl/Cmd + Shift + Z = Redo OR Ctrl/Cmd + Y = Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveProject();
      }

      // Delete key = Delete selected object
      if (e.key === "Delete" || e.key === "Backspace") {
        const canvasManager = getCanvasManager();
        canvasManager.deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  // Apply filters
  const handleFilterChange = (filterType: string, value: number | boolean) => {
    const canvasManager = getCanvasManager();
    const newFilters = { ...currentFilters, [filterType]: value };
    updateFilters(newFilters);
    canvasManager.applyFilters(newFilters);
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (historyManagerRef.current && canUndo) {
      historyManagerRef.current.undo();
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
    }
  };

  const handleRedo = () => {
    if (historyManagerRef.current && canRedo) {
      historyManagerRef.current.redo();
      setCanUndo(historyManagerRef.current.canUndo());
      setCanRedo(historyManagerRef.current.canRedo());
    }
  };

  // Check user authentication
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // Load project if projectId exists
  useEffect(() => {
    if (isCanvasReady && projectId && user) {
      loadProjectData(projectId);
    }
  }, [isCanvasReady, projectId, user]);

  const loadProjectData = async (id: string) => {
    try {
      const project = await getProject(id);
      if (project) {
        setProjectName(project.name);
        setCurrentProjectId(project.id);

        const canvasManager = getCanvasManager();
        canvasManager.loadFromJSON(JSON.stringify(project.canvas_data));

        toast.success(`Đã tải dự án: ${project.name}`);
      }
    } catch (error) {
      toast.error("Không thể tải dự án");
    }
  };

  const handleSaveProject = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu dự án");
      return;
    }

    setIsSaving(true);
    try {
      const canvasManager = getCanvasManager();
      const canvasData = canvasManager.toJSON();
      const thumbnail = await canvasManager.toDataURL("png");

      if (currentProjectId) {
        // Update existing project
        await updateProject(currentProjectId, {
          canvas_data: canvasData as any,
          thumbnail_url: thumbnail,
        });

        toast.success("Dự án đã được cập nhật");
      } else {
        // Create new project
        const name = prompt("Tên dự án:", projectName) || projectName;
        const project = (await createProject({
          name,
          canvas_data: canvasData as any,
          thumbnail_url: thumbnail,
        })) as any;

        setCurrentProjectId(project.id);
        setProjectName(project.name);

        toast.success(`Dự án "${project.name}" đã được tạo`);
      }
    } catch (error) {
      toast.error("Không thể lưu dự án");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">VibeEdit</h1>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">{projectName}</span>
          {currentProjectId && (
            <span className="text-xs text-muted-foreground/60">(đã lưu)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {user && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProject}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />

      {/* Text Tool Dialog */}
      <TextToolDialog open={showTextDialog} onOpenChange={setShowTextDialog} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-muted/10">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold">Tools</h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 p-4">
                <Button
                  variant={activeTool === "select" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("select")}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select
                </Button>

                <Button
                  variant={activeTool === "text" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTool("text");
                    setShowTextDialog(true);
                  }}
                >
                  <Type className="mr-2 h-4 w-4" />
                  Text
                </Button>

                <Button
                  variant={activeTool === "crop" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTool("crop")}
                >
                  <Crop className="mr-2 h-4 w-4" />
                  Crop
                </Button>

                <Separator className="my-4" />

                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {isDragActive ? "Drop here" : "Upload Image"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or drag and drop
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-muted/5">
          <div
            ref={canvasContainerRef}
            className="flex h-full items-center justify-center p-8"
          >
            <canvas
              id="editor-canvas"
              className="border border-border shadow-lg bg-white"
            />
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 border-l bg-muted/10">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold">Properties</h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-6 p-4">
                <Tabs defaultValue="adjustments">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                    <TabsTrigger value="presets">Presets</TabsTrigger>
                  </TabsList>

                  <TabsContent value="adjustments" className="space-y-4 mt-4">
                    {/* Filters Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Filters</h3>

                      {/* Blur */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="blur" className="text-sm">
                            Blur
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {currentFilters.blur ?? 0}
                          </span>
                        </div>
                        <Slider
                          id="blur"
                          min={0}
                          max={100}
                          step={1}
                          value={[currentFilters.blur ?? 0]}
                          onValueChange={([value]) =>
                            handleFilterChange("blur", value)
                          }
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="brightness" className="text-sm">
                            Brightness
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {(currentFilters.brightness ?? 0) > 0 ? "+" : ""}
                            {currentFilters.brightness ?? 0}
                          </span>
                        </div>
                        <Slider
                          id="brightness"
                          min={-100}
                          max={100}
                          step={1}
                          value={[currentFilters.brightness ?? 0]}
                          onValueChange={([value]) =>
                            handleFilterChange("brightness", value)
                          }
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="contrast" className="text-sm">
                            Contrast
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {(currentFilters.contrast ?? 0) > 0 ? "+" : ""}
                            {currentFilters.contrast ?? 0}
                          </span>
                        </div>
                        <Slider
                          id="contrast"
                          min={-100}
                          max={100}
                          step={1}
                          value={[currentFilters.contrast ?? 0]}
                          onValueChange={([value]) =>
                            handleFilterChange("contrast", value)
                          }
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="saturation" className="text-sm">
                            Saturation
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {(currentFilters.saturation ?? 0) > 0 ? "+" : ""}
                            {currentFilters.saturation ?? 0}
                          </span>
                        </div>
                        <Slider
                          id="saturation"
                          min={-100}
                          max={100}
                          step={1}
                          value={[currentFilters.saturation ?? 0]}
                          onValueChange={([value]) =>
                            handleFilterChange("saturation", value)
                          }
                        />
                      </div>

                      {/* Grayscale */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="grayscale" className="text-sm">
                          Grayscale
                        </Label>
                        <Switch
                          id="grayscale"
                          checked={currentFilters.grayscale}
                          onCheckedChange={(checked) =>
                            handleFilterChange("grayscale", checked)
                          }
                        />
                      </div>

                      <Separator />

                      {/* Flip Controls */}
                      <div className="space-y-2">
                        <Label className="text-sm">Flip</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              handleFilterChange("flipX", !currentFilters.flipX)
                            }
                          >
                            Horizontal
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              handleFilterChange("flipY", !currentFilters.flipY)
                            }
                          >
                            Vertical
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Reset Button */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          resetFilters();
                          const canvasManager = getCanvasManager();
                          canvasManager.clearFilters();
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset All Filters
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="presets" className="mt-4">
                    <PresetFiltersPanel />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
