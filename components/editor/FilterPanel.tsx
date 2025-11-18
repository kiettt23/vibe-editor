import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, FlipHorizontal, FlipVertical } from "lucide-react";
import type { FilterSettings, FilterPreset } from "@/types/editor";

interface FilterPanelProps {
  isImageLoaded: boolean;
  currentFilters: FilterSettings;
  filterPresets: FilterPreset[];
  onFilterChange: (
    filterType: keyof FilterSettings,
    value: number | boolean
  ) => void;
  onFlip: (direction: "horizontal" | "vertical") => void;
  onApplyPreset: (presetName: string) => void;
  onReset: () => void;
}

export function FilterPanel({
  isImageLoaded,
  currentFilters,
  filterPresets,
  onFilterChange,
  onFlip,
  onApplyPreset,
  onReset,
}: FilterPanelProps) {
  return (
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

            <TabsContent value="adjustments" className="p-4 space-y-4">
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
                  onValueChange={([value]) => onFilterChange("blur", value)}
                  disabled={!isImageLoaded}
                />
              </div>

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
                    onFilterChange("brightness", value)
                  }
                  disabled={!isImageLoaded}
                />
              </div>

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
                  onValueChange={([value]) => onFilterChange("contrast", value)}
                  disabled={!isImageLoaded}
                />
              </div>

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
                    onFilterChange("saturation", value)
                  }
                  disabled={!isImageLoaded}
                />
              </div>

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
                  onValueChange={([value]) => onFilterChange("hue", value)}
                  disabled={!isImageLoaded}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="grayscale">Đen trắng</Label>
                <Switch
                  id="grayscale"
                  checked={currentFilters.grayscale}
                  onCheckedChange={(checked) =>
                    onFilterChange("grayscale", checked)
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
                    onFilterChange("sepia", checked)
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
                    onFilterChange("invert", checked)
                  }
                  disabled={!isImageLoaded}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Lật ảnh</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFlip("horizontal")}
                    disabled={!isImageLoaded}
                  >
                    <FlipHorizontal className="mr-2 h-4 w-4" />
                    Ngang
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFlip("vertical")}
                    disabled={!isImageLoaded}
                  >
                    <FlipVertical className="mr-2 h-4 w-4" />
                    Dọc
                  </Button>
                </div>
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={onReset}
                disabled={!isImageLoaded}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset tất cả
              </Button>
            </TabsContent>

            <TabsContent value="presets" className="p-4 space-y-2">
              {filterPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="w-full justify-start h-auto flex-col items-start py-3"
                  onClick={() => onApplyPreset(preset.name)}
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
  );
}
