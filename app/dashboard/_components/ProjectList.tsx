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
import type { SubscriptionStatus } from "@/types/subscription";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ProBadge } from "@/components/shared/pro-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useBillingPortal } from "@/hooks/useBillingPortal";

interface ProjectListProps {
  projects: Project[];
  userEmail?: string;
  subscription?: string;
  subscriptionStatus: SubscriptionStatus;
}

export function ProjectList({
  projects: initialProjects,
  subscription,
  subscriptionStatus,
}: ProjectListProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Real-time subscription check (đồng bộ với Editor)
  // Ưu tiên client-side check để luôn đồng bộ với DB
  const { isPro: isClientPro, isLoading: isSubLoading } = useSubscription();
  const { openBillingPortal, isLoading: isPortalLoading } = useBillingPortal();

  // Use client-side subscription after initial load completes
  // This ensures dashboard syncs with database changes immediately
  const displayIsPro = !isSubLoading ? isClientPro : subscription === "pro";

  // DEBUG: Log subscription status
  console.log("[Dashboard] Subscription Status:", subscriptionStatus);

  const handleDeleteClick = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;

    setDeletingId(projectToDelete.id);

    startTransition(async () => {
      try {
        await deleteProject(projectToDelete.id);
        setProjects(projects.filter((p) => p.id !== projectToDelete.id));
        toast.success("Xóa dự án thành công!");
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
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
              {displayIsPro
                ? "Không giới hạn"
                : `${projects.length}/5 dự án miễn phí`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gói Đăng Ký</CardTitle>
            {displayIsPro && <ProBadge />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {displayIsPro ? "Pro" : "Miễn Phí"}
            </div>
            {displayIsPro ? (
              <div className="space-y-2">
                {subscriptionStatus.willCancelAtPeriodEnd ? (
                  <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                    ⚠️ Gói sẽ hết hạn vào{" "}
                    {subscriptionStatus.expiresAt
                      ? new Date(
                          subscriptionStatus.expiresAt
                        ).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {subscriptionStatus.isTrial
                      ? `Trial: còn ${subscriptionStatus.daysRemaining} ngày`
                      : subscriptionStatus.daysRemaining !== null
                      ? `Còn ${subscriptionStatus.daysRemaining} ngày`
                      : "Không giới hạn"}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={openBillingPortal}
                  disabled={isPortalLoading}
                >
                  <Settings className="mr-1.5 h-3 w-3" />
                  {subscriptionStatus.willCancelAtPeriodEnd
                    ? "Gia hạn ngay"
                    : "Quản lý gói"}
                </Button>
              </div>
            ) : (
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tất Cả Dự Án</h2>
          {!displayIsPro && (
            <p className="text-sm text-muted-foreground">
              {projects.length} / 5 dự án
            </p>
          )}
        </div>

        {/* Project Limit Warning for Free Users */}
        {!displayIsPro && projects.length >= 4 && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              {projects.length >= 5 ? (
                <>
                  Bạn đã đạt giới hạn <strong>5 dự án</strong> của gói Miễn Phí.
                  Nâng cấp lên{" "}
                  <Link
                    href="/pricing"
                    className="underline font-semibold hover:text-primary"
                  >
                    Pro
                  </Link>{" "}
                  để tạo không giới hạn dự án!
                </>
              ) : (
                <>
                  Bạn sắp đạt giới hạn của gói Miễn Phí ({5 - projects.length}{" "}
                  dự án còn lại). Nâng cấp lên{" "}
                  <Link
                    href="/pricing"
                    className="underline font-semibold hover:text-primary"
                  >
                    Pro
                  </Link>{" "}
                  để không giới hạn!
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
            <p className="text-muted-foreground mb-6">
              Bắt đầu tạo dự án đầu tiên của bạn ngay bây giờ
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Dự Án Mới
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
                        handleDeleteClick(project.id, project.name)
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

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={projectToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isPending && deletingId === projectToDelete?.id}
      />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
