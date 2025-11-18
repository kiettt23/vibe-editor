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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type } from "lucide-react";
import { getCanvasManager } from "@/lib/editor/canvas-manager";

interface TextToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
  "Trebuchet MS",
];

const FONT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
];

export function TextToolDialog({ open, onOpenChange }: TextToolDialogProps) {
  const [text, setText] = useState("Your Text Here");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(40);
  const [fontColor, setFontColor] = useState("#000000");

  const handleAddText = () => {
    const canvasManager = getCanvasManager();
    canvasManager.addText(text, {
      fontFamily,
      fontSize,
      fill: fontColor,
    });
    onOpenChange(false);

    // Reset form
    setText("Your Text Here");
    setFontSize(40);
    setFontColor("#000000");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Text</DialogTitle>
          <DialogDescription>
            Customize your text and add it to the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text"
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Size</Label>
              <span className="text-sm text-muted-foreground">
                {fontSize}px
              </span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={12}
              max={200}
              step={1}
            />
          </div>

          {/* Font Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {FONT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`h-10 rounded-md border-2 transition-all ${
                    fontColor === color.value
                      ? "border-primary scale-110"
                      : "border-transparent hover:border-muted-foreground/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFontColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center justify-center rounded-lg border bg-muted/20 p-8">
              <p
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  color: fontColor,
                }}
              >
                {text}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddText}>
            <Type className="mr-2 h-4 w-4" />
            Add Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
