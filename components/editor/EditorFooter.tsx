"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Keyboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorFooterProps {
  isImageLoaded: boolean;
  isDirty: boolean;
}

const shortcuts = [
  { keys: "Ctrl + S", label: "Lưu" },
  { keys: "Ctrl + E", label: "Export" },
  { keys: "Ctrl + R", label: "Reset" },
  { keys: "Ctrl + +", label: "Zoom in" },
  { keys: "Ctrl + -", label: "Zoom out" },
  { keys: "Ctrl + 0", label: "Reset zoom" },
];

export function EditorFooter({ isImageLoaded, isDirty }: EditorFooterProps) {
  return (
    <div className="flex h-8 items-center justify-between border-t px-4 bg-muted/30 text-xs">
      {/* Left: Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isImageLoaded ? "bg-green-500" : "bg-muted-foreground/30"
            }`}
          />
          <span className="text-muted-foreground">
            {isImageLoaded ? "Sẵn sàng" : "Chưa tải ảnh"}
          </span>
        </div>

        {isDirty && (
          <>
            <Separator orientation="vertical" className="h-3" />
            <Badge
              variant="outline"
              className="h-5 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
            >
              Chưa lưu
            </Badge>
          </>
        )}
      </div>

      {/* Right: Keyboard Shortcuts */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Keyboard className="h-3.5 w-3.5" />
              <span>Phím tắt</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="p-3">
            <div className="space-y-1.5">
              <p className="font-semibold text-xs mb-2">Phím tắt</p>
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  <span className="text-muted-foreground">
                    {shortcut.label}
                  </span>
                  <kbd className="px-2 py-0.5 rounded bg-muted font-mono text-xs">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
