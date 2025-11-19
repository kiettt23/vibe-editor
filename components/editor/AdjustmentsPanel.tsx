"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlipHorizontal, FlipVertical, RotateCw, Trash2 } from "lucide-react";
import { FILTER_PRESETS } from "@/lib/editor/preset-filters";
import type { FilterSettings } from "@/types/editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdjustmentsPanelProps {
  isImageLoaded: boolean;
  currentFilters: FilterSettings;
  onFilterChange: (
    filterType: keyof FilterSettings,
    value: number | boolean
  ) => void;
  onFlip: (direction: "horizontal" | "vertical") => void;
  onRotate: (angle: number) => void;
  onApplyPreset: (presetName: string) => void;
  onReset: () => void;
}

export function AdjustmentsPanel({
  isImageLoaded,
  currentFilters,
  onFilterChange,
  onFlip,
  onRotate,
  onApplyPreset,
  onReset,
}: AdjustmentsPanelProps) {
  return (
    <div className="w-80 border-l bg-muted/5">
      <div className="flex h-full flex-col">
        <div className="border-b px-5 py-3.5 bg-card/30">
          <h2 className="text-sm font-semibold text-foreground">
            Điều chỉnh & Filters
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tùy chỉnh filters và effects
          </p>
        </div>

        <ScrollArea className="flex-1">
          <Tabs defaultValue="adjustments" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mx-5 my-3">
              <TabsTrigger value="adjustments" className="text-xs">
                Filters
              </TabsTrigger>
              <TabsTrigger value="transform" className="text-xs">
                Transform
              </TabsTrigger>
              <TabsTrigger value="presets" className="text-xs">
                Presets
              </TabsTrigger>
            </TabsList>

            {/* Filters Tab */}
            <TabsContent value="adjustments" className="px-5 py-4 space-y-5">
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
                  onValueChange={([value]) => onFilterChange("blur", value)}
                  disabled={!isImageLoaded}
                  className="cursor-pointer"
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
                    onFilterChange("brightness", value)
                  }
                  disabled={!isImageLoaded}
                  className="cursor-pointer"
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
                  onValueChange={([value]) => onFilterChange("contrast", value)}
                  disabled={!isImageLoaded}
                  className="cursor-pointer"
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
                    onFilterChange("saturation", value)
                  }
                  disabled={!isImageLoaded}
                  className="cursor-pointer"
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
                  onValueChange={([value]) => onFilterChange("hue", value)}
                  disabled={!isImageLoaded}
                  className="cursor-pointer"
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
                      onFilterChange("grayscale", checked)
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
                      onFilterChange("sepia", checked)
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
                      onFilterChange("invert", checked)
                    }
                    disabled={!isImageLoaded}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Transform Tab */}
            <TabsContent value="transform" className="px-5 py-4 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  Flip
                </p>
                <TooltipProvider>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFlip("horizontal")}
                          disabled={!isImageLoaded}
                          className="h-10 text-xs"
                        >
                          <FlipHorizontal className="mr-1.5 h-4 w-4" />
                          Ngang
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Lật ảnh theo chiều ngang</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFlip("vertical")}
                          disabled={!isImageLoaded}
                          className="h-10 text-xs"
                        >
                          <FlipVertical className="mr-1.5 h-4 w-4" />
                          Dọc
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Lật ảnh theo chiều dọc</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>

              <Separator className="my-5" />

              {/* Rotate */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  Rotate
                </p>
                <TooltipProvider>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRotate(-90)}
                          disabled={!isImageLoaded}
                          className="h-10 text-xs"
                        >
                          <RotateCw className="mr-1.5 h-4 w-4 rotate-180" />
                          -90°
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xoay ngược chiều kim đồng hồ</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRotate(90)}
                          disabled={!isImageLoaded}
                          className="h-10 text-xs"
                        >
                          <RotateCw className="mr-1.5 h-4 w-4" />
                          +90°
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xoay theo chiều kim đồng hồ</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </TabsContent>

            {/* Presets Tab */}
            <TabsContent value="presets" className="px-5 py-4 space-y-2">
              {FILTER_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="w-full justify-start h-auto flex-col items-start py-3 px-4 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                  onClick={() => onApplyPreset(preset.name)}
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

        {/* Footer - Reset Button */}
        <div className="border-t p-4 bg-card/30">
          <Button
            variant="outline"
            className="w-full h-10 text-xs hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
            onClick={onReset}
            disabled={!isImageLoaded}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Reset tất cả (Ctrl + R)
          </Button>
        </div>
      </div>
    </div>
  );
}
