"use client";

import { Button } from "@/components/ui/button";
import { Upload, Sliders, RotateCw, Sparkles, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ToolbarTab =
  | "upload"
  | "filters"
  | "transform"
  | "presets"
  | "help";

interface VerticalToolbarProps {
  activeTab: ToolbarTab;
  onTabChange: (tab: ToolbarTab) => void;
  isImageLoaded: boolean;
  onUploadClick?: () => void;
}

const tools = [
  {
    id: "upload" as ToolbarTab,
    icon: Upload,
    label: "Upload",
    tooltip: "Tải ảnh lên",
    requireImage: false,
  },
  {
    id: "filters" as ToolbarTab,
    icon: Sliders,
    label: "Filters",
    tooltip: "Điều chỉnh filters",
    requireImage: true,
  },
  {
    id: "transform" as ToolbarTab,
    icon: RotateCw,
    label: "Transform",
    tooltip: "Xoay và lật ảnh",
    requireImage: true,
  },
  {
    id: "presets" as ToolbarTab,
    icon: Sparkles,
    label: "Presets",
    tooltip: "Các filter presets",
    requireImage: true,
  },
];

export function VerticalToolbar({
  activeTab,
  onTabChange,
  isImageLoaded,
  onUploadClick,
}: VerticalToolbarProps) {
  const handleToolClick = (toolId: ToolbarTab) => {
    if (toolId === "upload" && onUploadClick) {
      onUploadClick();
    } else {
      onTabChange(toolId);
    }
  };
  return (
    <div className="w-16 border-r bg-card/30 flex flex-col">
      {/* Tools */}
      <TooltipProvider>
        <div className="flex-1 flex flex-col gap-1 p-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            const isDisabled = tool.requireImage && !isImageLoaded;

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToolClick(tool.id)}
                    disabled={isDisabled}
                    className={`h-12 w-12 relative transition-all ${
                      isActive
                        ? "bg-linear-to-br from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute inset-0 rounded-md border-2 border-white/30" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Help - Bottom */}
        <div className="p-2 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTabChange("help")}
                className={`h-12 w-12 ${
                  activeTab === "help"
                    ? "bg-muted text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Trợ giúp và phím tắt</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
