"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { Upload, Sliders } from "lucide-react";
import { FloatingToolbarButton } from "./FloatingToolbarButton";
import { AdjustmentsPanel } from "./AdjustmentsPanel";
import { FilterSettings } from "@/types/editor";
import { cn } from "@/lib/utils";

interface MobileEditorLayoutProps {
  // Upload overlay (pass as children)
  children?: React.ReactNode;

  // State
  isImageLoaded: boolean;
  isPro: boolean;

  // Upload handler
  onUploadClick: () => void;

  // Adjustments panel props (same as desktop)
  activeTab: "filters" | "transform" | "presets";
  onTabChange: (tab: "filters" | "transform" | "presets") => void;

  // Filter props
  currentFilters: FilterSettings;
  onFilterChange: (
    filter: keyof FilterSettings,
    value: number | boolean
  ) => void;
  onApplyPreset: (preset: string) => void;
  onResetFilters: () => void;

  // Transform props (no currentTransform needed - AdjustmentsPanel manages it internally)
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate: (angle: number) => void;
}

export function MobileEditorLayout({
  children,
  isImageLoaded,
  isPro,
  onUploadClick,
  activeTab,
  onTabChange,
  currentFilters,
  onFilterChange,
  onApplyPreset,
  onResetFilters,
  onFlipHorizontal,
  onFlipVertical,
  onRotate,
}: MobileEditorLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Upload Overlay */}
      {children && (
        <div className="absolute inset-0 bg-background/95 flex items-center justify-center pointer-events-auto">
          {children}
        </div>
      )}

      {/* Floating Action Buttons - Bottom Corner */}
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 pointer-events-auto">
        {/* Upload Button - Always visible */}
        <FloatingToolbarButton
          icon={Upload}
          label="Tải ảnh lên"
          onClick={onUploadClick}
          active={false}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        />

        {/* Adjustments Drawer Button - Only when image loaded */}
        {isImageLoaded && (
          <FloatingToolbarButton
            icon={Sliders}
            label="Điều chỉnh"
            onClick={() => setIsDrawerOpen(true)}
            active={isDrawerOpen}
          />
        )}
      </div>

      {/* Adjustments Drawer with Tabs */}
      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        dismissible={true}
        modal={true}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "flex flex-col rounded-t-[20px]",
              "bg-background border-t",
              "h-[80vh]"
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3 border-b shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Adjustments Panel Content - Native Scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="pb-6">
                <AdjustmentsPanel
                  isImageLoaded={isImageLoaded}
                  isPro={isPro}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  currentFilters={currentFilters}
                  onFilterChange={onFilterChange}
                  onFlip={(direction) => {
                    if (direction === "horizontal") onFlipHorizontal();
                    else onFlipVertical();
                  }}
                  onRotate={onRotate}
                  onApplyPreset={onApplyPreset}
                  onReset={onResetFilters}
                  isMobileSheet={true}
                />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
