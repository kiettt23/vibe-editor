import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Admin Supabase client với Service Role Key
 * CHẠY VỚI QUYỀN ADMIN - BYPASS RLS
 * CHỈ DÙNG CHO:
 * - Webhooks (Stripe, payment providers)
 * - Background jobs
 * - Server-side operations cần full access
 *
 * KHÔNG BAO GIỜ expose Service Role Key ra client!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
