import { redirect } from "next/navigation";
import { getProject } from "@/app/actions/projects";
import { EditorWorkspace } from "../_components/EditorWorkspace";
import type { Metadata } from "next";

interface EditorProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({
  params,
}: EditorProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProject(projectId);

  return {
    title: project ? `${project.name} | Editor` : "Editor | VibeEditor",
    description: "Chỉnh sửa dự án của bạn",
  };
}

export default async function EditorProjectPage({
  params,
}: EditorProjectPageProps) {
  const { projectId } = await params;

  // Fetch project server-side
  const project = await getProject(projectId);

  if (!project) {
    redirect("/dashboard");
  }

  // Pass project data to client component
  return <EditorWorkspace projectId={projectId} initialProject={project} />;
}
