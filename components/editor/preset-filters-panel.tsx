"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  PRESET_FILTERS,
  applyPresetWithIntensity,
} from "@/lib/editor/filters/presets";
import { getCanvasManager } from "@/lib/editor/canvas-manager";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export function PresetFiltersPanel() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);

  const handleApplyPreset = (presetId: string) => {
    const canvasManager = getCanvasManager();
    const preset = PRESET_FILTERS.find((p) => p.id === presetId);

    if (!preset) return;

    const config = applyPresetWithIntensity(preset, intensity);
    canvasManager.applyFilters(config);
    setSelectedPreset(presetId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <Label className="text-sm font-semibold">Preset Filters</Label>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-2 gap-2">
          {PRESET_FILTERS.map((preset) => (
            <Button
              key={preset.id}
              variant={selectedPreset === preset.id ? "default" : "outline"}
              className="h-auto flex-col gap-2 p-3"
              onClick={() => handleApplyPreset(preset.id)}
            >
              <div className="h-16 w-full rounded-md bg-linear-to-br from-primary/20 to-primary/5" />
              <span className="text-xs font-medium">{preset.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {selectedPreset && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Intensity</Label>
              <span className="text-xs text-muted-foreground">
                {intensity}%
              </span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={([value]) => {
                setIntensity(value);
                if (selectedPreset) {
                  handleApplyPreset(selectedPreset);
                }
              }}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </>
      )}
    </div>
  );
}
