import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface EditorToolbarProps {
  isImageLoaded: boolean;
  onExport: (format: "png" | "jpeg" | "webp") => void;
}

export function EditorToolbar({ isImageLoaded, onExport }: EditorToolbarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Vibe Editor</h1>
        {isImageLoaded && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            ✓ Đã tải ảnh
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onExport("png")}
          disabled={!isImageLoaded}
        >
          <Download className="mr-2 h-4 w-4" />
          Export PNG
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("jpeg")}
          disabled={!isImageLoaded}
        >
          Export JPG
        </Button>
      </div>
    </div>
  );
}
