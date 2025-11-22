"use server";

import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/error-handler";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function uploadImageToStorageAction(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { error: ERROR_MESSAGES.IMAGE_UPLOAD_FAILED };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: ERROR_MESSAGES.UNAUTHORIZED };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  const filePath = `images/${fileName}`; // Full path in bucket

  const { data, error } = await supabase.storage
    .from("project-thumbnails")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    logError(error, "uploadImageToStorage");
    return { error: ERROR_MESSAGES.IMAGE_UPLOAD_FAILED };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-thumbnails").getPublicUrl(data.path);

  return { success: true, url: publicUrl };
}

export async function deleteImageFromStorageAction(url: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: ERROR_MESSAGES.UNAUTHORIZED };
  }

  // Extract path from URL (after /project-thumbnails/)
  const pathMatch = url.match(/\/project-thumbnails\/(.+)$/);
  if (!pathMatch || !pathMatch[1]) {
    return { error: "Invalid image URL" };
  }
  const path = pathMatch[1];

  const { error } = await supabase.storage
    .from("project-thumbnails")
    .remove([path]);

  if (error) {
    logError(error, "deleteImageFromStorage");
    return { error: "Không thể xóa ảnh" };
  }

  return { success: true };
}
