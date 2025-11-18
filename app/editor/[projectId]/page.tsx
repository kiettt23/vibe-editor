"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "@/app/actions/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Project } from "@/types/project";

export default function EditorProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProject();
  }, [params.projectId]);

  const loadProject = async () => {
    try {
      const projectData = await getProject(params.projectId);

      if (!projectData) {
        setError("Không tìm thấy dự án");
        return;
      }

      setProject(projectData);

      // TODO: Load canvas data into editor
      // const canvasManager = getCanvasManager();
      // canvasManager.loadFromJSON(projectData.canvas_data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dự án");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // TODO: Render editor with project data
  // For now, redirect to main editor
  router.push(`/editor?projectId=${params.projectId}`);

  return null;
}
