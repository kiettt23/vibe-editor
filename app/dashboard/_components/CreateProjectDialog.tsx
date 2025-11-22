"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/app/actions/projects";
import type { Json } from "@/lib/supabase/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên dự án");
      return;
    }

    setIsCreating(true);

    try {
      // Create project with initial empty state
      const initialCanvasState = {
        imageUrl: "",
        filters: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          hue: 0,
          blur: 0,
          grayscale: false,
          sepia: false,
          invert: false,
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          x: 0,
          y: 0,
        },
        width: 1920,
        height: 1080,
      };

      const result = await createProject({
        name: formData.name.trim(),
        canvas_data: initialCanvasState as unknown as Json,
        width: 1920,
        height: 1080,
      });

      if (result.error) {
        toast.error(result.error);
        setIsCreating(false);
        return;
      }

      if (result.data) {
        toast.success("Đã tạo dự án thành công!");
        onOpenChange(false);

        // Redirect to editor
        router.push(`/editor/${result.data.id}`);
      }
    } catch (error) {
      console.error("Create project error:", error);
      toast.error("Không thể tạo dự án. Vui lòng thử lại.");
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo Dự Án Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho dự án của bạn. Bạn có thể chỉnh sửa sau.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên dự án <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Ảnh nghỉ dưỡng mùa hè"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isCreating}
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="description"
                placeholder="Thêm mô tả cho dự án..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={isCreating}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo Dự Án
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
