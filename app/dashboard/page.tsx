import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllProjects } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HeroHeader } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ProjectList } from "./_components/ProjectList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | VibeEdit",
  description: "Quản lý các dự án chỉnh sửa ảnh của bạn",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch projects server-side
  const projects = await getAllProjects();

  // Get user subscription (from user_metadata or user_profiles table)
  const subscription = user.user_metadata?.subscription || "free";

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

        {/* Projects List - Client Component */}
        <ProjectList
          projects={projects}
          userEmail={user.email}
          subscription={subscription}
        />
      </main>

      <Footer />
    </div>
  );
}
