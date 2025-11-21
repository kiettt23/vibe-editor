import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllProjects } from "@/app/actions/projects";
import {
  getUserSubscription,
  getSubscriptionStatus,
} from "@/lib/subscription/get-subscription";
import { HeroHeader } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ProjectList } from "./_components/ProjectList";
import { DashboardHeader } from "./_components/DashboardHeader";
import { TrialActivator } from "./_components/TrialActivator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | VibeEditor",
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

  // Get user subscription from database
  const subscription = await getUserSubscription();
  const subscriptionStatus = await getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-background">
      <TrialActivator />
      <HeroHeader />

      <main className="container mx-auto px-4 py-20 pt-32">
        {/* Header with Create Dialog */}
        <DashboardHeader />

        {/* Projects List - Client Component */}
        <ProjectList
          projects={projects}
          userEmail={user.email}
          subscription={subscription}
          subscriptionStatus={subscriptionStatus}
        />
      </main>

      <Footer />
    </div>
  );
}
