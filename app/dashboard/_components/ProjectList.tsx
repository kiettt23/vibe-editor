"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Image as ImageIcon, Clock, Trash2, Edit } from "lucide-react";
import { deleteProject } from "@/app/actions/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  userEmail?: string;
  subscription?: string;
}

export function ProjectList({
  projects: initialProjects,
  subscription,
}: ProjectListProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dự án "${projectName}"?`)) return;

    setDeletingId(projectId);

    startTransition(async () => {
      try {
        await deleteProject(projectId);
        setProjects(projects.filter((p) => p.id !== projectId));
        toast.success("Xóa dự án thành công!");
        router.refresh();
      } catch {
        toast.error("Không thể xóa dự án");
        setDeletingId(null);
      }
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Dự Án</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscription === "pro"
                ? "Không giới hạn"
                : `${projects.length}/5 dự án miễn phí`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gói Đăng Ký</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription === "pro" ? "Pro" : "Miễn Phí"}
            </div>
            {subscription !== "pro" && (
              <Button asChild variant="link" size="sm" className="px-0 h-auto">
                <Link href="/pricing">Nâng cấp lên Pro →</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hoạt Động Gần Đây
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.length > 0 ? "Hôm nay" : "Chưa có"}
            </div>
            <p className="text-xs text-muted-foreground">
              {projects.length > 0
                ? `Cập nhật: ${formatDate(projects[0].updated_at)
                    .split(",")[1]
                    .trim()}`
                : "Tạo dự án đầu tiên của bạn"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tất Cả Dự Án</h2>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
            <p className="text-muted-foreground mb-6">
              Bắt đầu tạo dự án đầu tiên của bạn ngay bây giờ
            </p>
            <Button asChild>
              <Link href="/editor">
                <Plus className="mr-2 h-4 w-4" />
                Tạo Dự Án Mới
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <Card key={project.id} className="group overflow-hidden">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {project.thumbnail_url ? (
                    <Image
                      src={project.thumbnail_url}
                      alt={project.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                      unoptimized={project.thumbnail_url.includes("supabase")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/editor/${project.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh Sửa
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDeleteProject(project.id, project.name)
                      }
                      disabled={isPending && deletingId === project.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-base truncate">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatDate(project.updated_at)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
