"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Image as ImageIcon, Clock, Trash2, Edit } from "lucide-react";
import { HeroHeader } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import type { User } from "@supabase/supabase-js";
import type { Project } from "@/types/project";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadProjects();
  }, []);

  const checkUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Xóa dự án thất bại");
    }
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
    <div className="min-h-screen bg-background">
      <HeroHeader />

      <main className="container mx-auto px-4 py-20 pt-32">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dự Án Của Bạn</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý và chỉnh sửa các dự án của bạn
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/editor">
              <Plus className="mr-2 h-4 w-4" />
              Tạo Dự Án Mới
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Dự Án</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {user?.user_metadata?.subscription === "pro"
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
                {user?.user_metadata?.subscription === "pro"
                  ? "Pro"
                  : "Miễn Phí"}
              </div>
              {user?.user_metadata?.subscription !== "pro" && (
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                >
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

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
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
                      <img
                        src={project.thumbnail_url}
                        alt={project.name}
                        className="object-cover w-full h-full"
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
                        onClick={() => handleDeleteProject(project.id)}
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
      </main>

      <Footer />
    </div>
  );
}
