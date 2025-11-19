"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  CanvasState,
} from "@/types/project";
import type { Json } from "@/lib/supabase/types";
import { logError } from "@/lib/error-handler";
import { ERROR_MESSAGES, SUBSCRIPTION } from "@/lib/constants";

export async function createProject(data: {
  name: string;
  canvas_data: Json;
  width?: number;
  height?: number;
  thumbnail_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Check project limit for free users
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription")
    .eq("id", user.id)
    .single();

  // NOTE: Supabase type inference issue - profile type inferred as never
  const subscriptionTier =
    (profile as { subscription?: "free" | "pro" } | null)?.subscription ||
    "free";

  if (subscriptionTier === "free") {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count !== null && count >= SUBSCRIPTION.FREE_PROJECT_LIMIT) {
      throw new Error(
        `Bạn đã đạt giới hạn ${SUBSCRIPTION.FREE_PROJECT_LIMIT} dự án. Nâng cấp lên Pro để tạo thêm!`
      );
    }
  }

  const insertData: ProjectInsert = {
    user_id: user.id,
    name: data.name,
    canvas_data: data.canvas_data,
    width: data.width || 1920,
    height: data.height || 1080,
    thumbnail_url: data.thumbnail_url || null,
  };

  // NOTE: Supabase type inference issue - generated types don't match client API
  // This is a known limitation with Supabase v2 typed clients
  const { data: project, error } = await supabase
    .from("projects")
    // @ts-expect-error - Supabase v2 Insert type inference limitation
    .insert(insertData)
    .select()
    .single();

  if (error) {
    logError(error, "createProject");
    throw new Error(ERROR_MESSAGES.PROJECT_CREATE_FAILED);
  }

  revalidatePath("/dashboard");
  return project as Project;
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    canvas_data?: Json;
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
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const updateData: ProjectUpdate = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  // NOTE: Supabase type inference issue - generated types don't match client API
  // Using 'as any' due to Supabase v2 typed client limitation with Insert/Update types
  const { data: project, error } = await supabase
    .from("projects")
    // @ts-expect-error - Supabase v2 Update type inference limitation
    .update(updateData)
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    logError(error, "updateProject");
    throw new Error(ERROR_MESSAGES.PROJECT_UPDATE_FAILED);
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
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    // PGRST116 = No rows found (expected when project doesn't exist or wrong user)
    // Don't log this as error - it's normal behavior
    if (error.code !== "PGRST116") {
      logError(error, "getProject");
    }
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
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    logError(error, "getAllProjects");
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
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Get project to find image URL
  const { data: project } = await supabase
    .from("projects")
    .select("canvas_data")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single<{ canvas_data: { imageUrl?: string } }>();

  // Delete original image from Storage (if exists)
  if (project?.canvas_data?.imageUrl) {
    console.log("🗑️ Deleting project image:", project.canvas_data.imageUrl);
    await deleteProjectImage(project.canvas_data.imageUrl);
  }

  // Delete thumbnail from Storage (if exists)
  const { data: files } = await supabase.storage
    .from("project-thumbnails")
    .list(`thumbnails/${user.id}`);

  if (files) {
    const thumbnailFiles = files
      .filter((f) => f.name.startsWith(projectId))
      .map((f) => `thumbnails/${user.id}/${f.name}`);

    if (thumbnailFiles.length > 0) {
      console.log("🗑️ Deleting thumbnails:", thumbnailFiles);
      await supabase.storage.from("project-thumbnails").remove(thumbnailFiles);
    }
  }

  // Delete project from database
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    logError(error, "deleteProject");
    throw new Error(ERROR_MESSAGES.PROJECT_DELETE_FAILED);
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
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription")
    .eq("id", user.id)
    .single();

  // NOTE: Supabase type inference limitation - profile type is inferred as never
  const isPro =
    (profile as { subscription?: string } | null)?.subscription === "pro";
  const maxProjects = isPro
    ? SUBSCRIPTION.PRO_PROJECT_LIMIT
    : SUBSCRIPTION.FREE_PROJECT_LIMIT;

  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const currentCount = count || 0;
  const canCreate = isPro || currentCount < maxProjects;

  return {
    canCreate,
    currentCount,
    maxProjects,
  };
}

// ============================================================================
// CANVAS SAVE/LOAD ACTIONS
// ============================================================================

/**
 * Save canvas state to project
 * Updates canvas_data JSON and optionally thumbnail
 */
export async function saveProjectCanvas(
  projectId: string,
  canvasData: Omit<CanvasState, "version">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Validate canvas data
  if (!canvasData.imageUrl) {
    throw new Error("Image URL is required");
  }

  // Prepare canvas state with version
  const canvasState = {
    ...canvasData,
    version: "1.0",
  };

  // Update project with new canvas data
  // NOTE: Supabase type inference issue with JSON fields
  const { data: project, error } = await supabase
    .from("projects")
    // @ts-expect-error - Supabase v2 JSON field type inference limitation
    .update({
      canvas_data: canvasState,
      width: canvasData.width,
      height: canvasData.height,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    logError(error, "saveProjectCanvas");
    throw new Error("Không thể lưu project");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/editor/${projectId}`);

  return project;
}

/**
 * Upload project thumbnail
 * Separate action for thumbnail upload (after generating from canvas)
 */
export async function uploadProjectThumbnail(
  projectId: string,
  thumbnailBlob: Blob
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  try {
    // Generate unique filename
    const fileName = `${projectId}-${Date.now()}.png`;
    const filePath = `thumbnails/${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("project-thumbnails")
      .upload(filePath, thumbnailBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      logError(uploadError, "uploadProjectThumbnail");
      // Don't throw - make thumbnail optional
      console.warn("Thumbnail upload failed, continuing without thumbnail");
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-thumbnails").getPublicUrl(filePath);

    // Update project with thumbnail URL
    const { error: updateError } = await supabase
      .from("projects")
      // @ts-expect-error - Supabase v2 Update type inference limitation
      .update({ thumbnail_url: publicUrl })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      logError(updateError, "uploadProjectThumbnail - update");
      // Don't throw - thumbnail is optional
      console.warn("Thumbnail URL update failed");
      return null;
    }

    revalidatePath("/dashboard");
    return publicUrl;
  } catch (error) {
    // Catch any unexpected errors - make thumbnail fully optional
    logError(error, "uploadProjectThumbnail - unexpected");
    console.warn("Thumbnail upload failed completely, continuing without it");
    return null;
  }
}

/**
 * Upload original full-size image to Storage
 * Returns public URL for saving to canvas_data
 */
export async function uploadProjectImage(
  projectId: string,
  imageFile: File
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Generate unique filename
  const fileExt = imageFile.name.split(".").pop() || "png";
  const fileName = `${projectId}-${Date.now()}.${fileExt}`;
  const filePath = `images/${user.id}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("project-thumbnails")
    .upload(filePath, imageFile, {
      contentType: imageFile.type,
      upsert: true,
    });

  if (uploadError) {
    logError(uploadError, "uploadProjectImage");
    throw new Error("Không thể upload ảnh lên Storage");
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("project-thumbnails").getPublicUrl(filePath);

  return publicUrl;
}

// ============================================================================
// USER SUBSCRIPTION
// ============================================================================

/**
 * Get user subscription tier for features like watermark
 */
export async function getUserSubscription(): Promise<"free" | "pro"> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "free";
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription")
    .eq("id", user.id)
    .single();

  const isPro =
    (profile as { subscription?: string } | null)?.subscription === "pro";

  return isPro ? "pro" : "free";
}

// ============================================================================
// IMAGE MANAGEMENT
// ============================================================================

/**
 * Delete image from Storage bucket
 * Used when replacing project image
 */
export async function deleteProjectImage(imageUrl: string) {
  const supabase = await createClient();

  try {
    // Parse URL to get file path
    // Example URL: https://abc.supabase.co/storage/v1/object/public/project-thumbnails/user-id/file.png
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/project-thumbnails\/(.+)$/);

    if (!pathMatch) {
      console.warn("Invalid image URL format:", imageUrl);
      return false;
    }

    const filePath = pathMatch[1];
    console.log("Deleting file from Storage:", filePath);

    const { error } = await supabase.storage
      .from("project-thumbnails")
      .remove([filePath]);

    if (error) {
      console.warn("Storage delete error:", error);
      return false;
    }

    console.log("Image deleted successfully from Storage");
    return true;
  } catch (error) {
    console.warn("Error parsing/deleting image:", error);
    return false;
  }
}

// ============================================================================
