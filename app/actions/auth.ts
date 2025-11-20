"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logError } from "@/lib/error-handler";

export async function loginWithEmailAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email và mật khẩu là bắt buộc" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logError(error, "loginWithEmail");
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signupWithEmailAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    return { error: "Email và mật khẩu là bắt buộc" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    logError(error, "signupWithEmail");
    return { error: "Đăng ký thất bại. Email có thể đã được sử dụng." };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Email đã được sử dụng" };
  }

  // Trial is auto-assigned by database trigger
  // No need to manually call assignTrialToNewUser

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function loginWithMagicLinkAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email là bắt buộc" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    logError(error, "loginWithMagicLink");
    return { error: "Không thể gửi magic link" };
  }

  return { success: "Link đăng nhập đã được gửi đến email của bạn!" };
}

export async function loginWithGoogleAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    logError(error, "loginWithGoogle");
    return { error: "Không thể đăng nhập với Google" };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
