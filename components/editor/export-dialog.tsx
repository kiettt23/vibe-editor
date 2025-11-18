"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { getCanvasManager } from "@/lib/editor/canvas-manager";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(90);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const canvasManager = getCanvasManager();
      const dataUrl = canvasManager.toDataURL(format, quality / 100);

      // Create download link
      const link = document.createElement("a");
      link.download = `vibedit-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Choose your export settings and download your edited image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={format}
              onValueChange={(value: "png" | "jpeg") => setFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Lossless)</SelectItem>
                <SelectItem value="jpeg">JPEG (Smaller file)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Slider (only for JPEG) */}
          {format === "jpeg" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Quality</Label>
                <span className="text-sm text-muted-foreground">
                  {quality}%
                </span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={10}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size
              </p>
            </div>
          )}

          {/* Watermark Notice (for free tier) */}
          <div className="rounded-lg border border-muted bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Free Plan:</strong> A small watermark will be added to
              your image. Upgrade to Pro to remove it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
