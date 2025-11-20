"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Download,
  Save,
  Loader2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorHeaderProps {
  projectId?: string;
  isImageLoaded: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  zoom: number;
  onSave: () => void;
  onExport: (format: "png" | "jpeg" | "webp") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function EditorHeader({
  projectId,
  isImageLoaded,
  isSaving,
  lastSaved,
  zoom,
  onSave,
  onExport,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: EditorHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4 bg-card/50 backdrop-blur-sm">
      {/* Left: Logo + Status */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">VE</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-none">
              Vibe Editor
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Chỉnh sửa ảnh chuyên nghiệp
            </span>
          </div>
        </Link>

        {isImageLoaded && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Đã tải ảnh
            </span>
          </div>
        )}

        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Lưu lúc {lastSaved.toLocaleTimeString("vi-VN")}
          </span>
        )}
      </div>

      {/* Center: Zoom Controls */}
      {isImageLoaded && (
        <TooltipProvider>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/50 border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onZoomOut}
                  disabled={zoom <= 0.1}
                  className="h-7 w-7 p-0"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom out (Ctrl + -)</p>
              </TooltipContent>
            </Tooltip>

            <button
              onClick={onZoomReset}
              className="min-w-[60px] text-xs font-semibold text-foreground hover:text-primary transition-colors"
            >
              {Math.round(zoom * 100)}%
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onZoomIn}
                  disabled={zoom >= 3}
                  className="h-7 w-7 p-0"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in (Ctrl + +)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}

      {/* Right: Actions */}
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {projectId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  disabled={!isImageLoaded || isSaving}
                  className="h-9 px-3"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      <span className="text-xs">Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      <span className="text-xs">Lưu</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lưu project (Ctrl + S)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Export Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={!isImageLoaded}
                    className="h-9 px-3"
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    <span className="text-xs">Export</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export ảnh (Ctrl + E)</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onExport("png")}>
                <Download className="mr-2 h-4 w-4" />
                <span className="text-xs">PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("jpeg")}>
                <Download className="mr-2 h-4 w-4" />
                <span className="text-xs">JPG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("webp")}>
                <Download className="mr-2 h-4 w-4" />
                <span className="text-xs">WebP</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </div>
  );
}
