// @ts-nocheck - Supabase type inference issues with Database types
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Project } from "@/types/project";

export async function createProject(data: {
  name: string;
  canvas_data: any;
  width?: number;
  height?: number;
  thumbnail_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const insertData = {
    user_id: user.id,
    name: data.name,
    canvas_data: data.canvas_data,
    width: data.width || 1920,
    height: data.height || 1080,
    thumbnail_url: data.thumbnail_url || null,
  };

  const { data: project, error } = await (supabase
    .from("projects")
    .insert(insertData as any)
    .select()
    .single() as any);

  if (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }

  revalidatePath("/dashboard");
  return project;
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    canvas_data?: any;
    width?: number;
    height?: number;
    thumbnail_url?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  // @ts-ignore - Supabase type inference issue
  const { data: project, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/editor/${projectId}`);
  return project;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  return project;
}

export async function getAllProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return projects || [];
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }

  revalidatePath("/dashboard");
}

export async function checkProjectLimit(): Promise<{
  canCreate: boolean;
  currentCount: number;
  maxProjects: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user profile to check subscription
  const { data: profile } = await (supabase
    .from("user_profiles")
    .select("subscription")
    .eq("id", user.id)
    .single() as any);

  const isPro = (profile as any)?.subscription === "pro";
  const maxProjects = isPro ? Infinity : 5;

  // Count current projects
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const currentCount = count || 0;
  const canCreate = isPro || currentCount < maxProjects;

  return {
    canCreate,
    currentCount,
    maxProjects: isPro ? 999 : maxProjects,
  };
}
