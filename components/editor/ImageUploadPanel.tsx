import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

interface ImageUploadPanelProps {
  isInitialized: boolean;
  isImageLoaded: boolean;
  isDragActive: boolean;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
}

export function ImageUploadPanel({
  isInitialized,
  isImageLoaded,
  isDragActive,
  getRootProps,
  getInputProps,
}: ImageUploadPanelProps) {
  return (
    <div className="w-64 border-r bg-muted/10">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h2 className="font-semibold">Tải ảnh lên</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                !isInitialized && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-2">
                {isDragActive ? "Thả ảnh vào đây" : "Click hoặc kéo ảnh vào"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP (tối đa 10MB)
              </p>
            </div>

            {isImageLoaded && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Đã tải ảnh</p>
                <p className="text-xs text-muted-foreground">
                  Sử dụng các controls bên phải để chỉnh sửa
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
