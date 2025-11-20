"use client";

import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface CenteredUploadProps {
  isUploading: boolean;
}

export function CenteredUpload({ isUploading }: CenteredUploadProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-6 max-w-md">
        {/* Upload Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-primary" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {isUploading ? "Đang tải ảnh..." : "Tải ảnh lên"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Click vào nút bên dưới để chọn ảnh
            <br />
            từ máy tính của bạn
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <Button
            size="lg"
            disabled={isUploading}
            onClick={() =>
              document.getElementById("centered-file-input")?.click()
            }
          >
            <Upload className="mr-2 h-5 w-5" />
            Chọn ảnh
          </Button>
        </div>

        {/* Format Hint */}
        <p className="text-xs text-muted-foreground">
          Hỗ trợ: JPG, PNG, WebP, GIF (Max 10MB)
        </p>
      </div>
    </div>
  );
}
