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

  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    logError(error, "uploadImageToStorage");
    return { error: ERROR_MESSAGES.IMAGE_UPLOAD_FAILED };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(data.path);

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

  const path = url.split("/images/").pop();
  if (!path) {
    return { error: "Invalid image URL" };
  }

  const { error } = await supabase.storage.from("images").remove([path]);

  if (error) {
    logError(error, "deleteImageFromStorage");
    return { error: "Không thể xóa ảnh" };
  }

  return { success: true };
}
