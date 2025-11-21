import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getActiveSessionId } from "./session-manager";

export function createClient() {
  // Get active session ID from session manager
  // Each session has its own auth token in localStorage
  const sessionId = getActiveSessionId() || "default";

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use different storage key for each session
        storageKey: `sb-${sessionId}-auth-token`,
        // Persist session across page reloads
        persistSession: true,
      },
    }
  );
}
