"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const shortcuts = [
  {
    category: "General",
    items: [
      { keys: ["Ctrl", "S"], description: "Lưu project" },
      { keys: ["Ctrl", "E"], description: "Export ảnh" },
      { keys: ["Ctrl", "R"], description: "Reset tất cả" },
      { keys: ["Esc"], description: "Đóng panel" },
    ],
  },
  {
    category: "Zoom",
    items: [
      { keys: ["Ctrl", "+"], description: "Zoom in" },
      { keys: ["Ctrl", "-"], description: "Zoom out" },
      { keys: ["Ctrl", "0"], description: "Reset zoom" },
      { keys: ["Ctrl", "Scroll"], description: "Zoom với chuột" },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open: controlledOpen,
  onOpenChange,
}: KeyboardShortcutsDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K hoặc Ctrl + / để mở shortcuts dialog
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "/")) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Phím tắt</DialogTitle>
          <DialogDescription>
            Danh sách các phím tắt trong VibeEditor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-accent/50 transition-all hover:shadow-sm group"
                  >
                    <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-3 py-1.5 rounded-md bg-gradient-to-b from-muted to-muted/80 border border-border shadow-sm font-mono text-xs font-semibold text-foreground min-w-[2.5rem] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Nhấn{" "}
            <kbd className="px-2.5 py-1 rounded bg-gradient-to-b from-muted to-muted/80 border border-border text-foreground font-mono text-xs font-semibold shadow-sm">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-2.5 py-1 rounded bg-gradient-to-b from-muted to-muted/80 border border-border text-foreground font-mono text-xs font-semibold shadow-sm">
              K
            </kbd>{" "}
            để mở lại
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
