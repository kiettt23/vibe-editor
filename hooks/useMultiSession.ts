"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAllSessions,
  getActiveSession,
  saveSession,
  removeSession,
  setActiveSession,
  type SessionInfo,
} from "@/lib/supabase/session-manager";
import { useRouter } from "next/navigation";

export function useMultiSession() {
  const [sessions, setSessions] = useState<SessionInfo[]>(() =>
    getAllSessions()
  );
  const [activeSession, setActiveSessionState] = useState<SessionInfo | null>(
    () => getActiveSession()
  );
  const router = useRouter();

  const loadSessions = () => {
    const allSessions = getAllSessions();
    const active = getActiveSession();
    setSessions(allSessions);
    setActiveSessionState(active);
  };

  /**
   * Save current logged-in user as a session
   */
  const saveCurrentSession = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get user profile for additional info
    const { data: profile } = (await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()) as { data: { full_name?: string } | null };

    const sessionInfo: SessionInfo = {
      id: user.id, // Use user ID as session ID
      userId: user.id,
      email: user.email!,
      fullName: profile?.full_name || user.email?.split("@")[0],
      avatarUrl: user.user_metadata?.avatar_url,
      createdAt: new Date().toISOString(),
    };

    saveSession(sessionInfo);
    loadSessions();
  };

  /**
   * Switch to a different session
   */
  const switchSession = async (sessionId: string) => {
    setActiveSession(sessionId);

    // Reload page to reinitialize Supabase client with new session
    router.refresh();
    window.location.reload();
  };

  /**
   * Remove a session (logout that account)
   */
  const removeSessionById = async (sessionId: string) => {
    // If removing active session, need to sign out from Supabase
    if (activeSession?.id === sessionId) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    removeSession(sessionId);
    loadSessions();

    // If removed active session, reload page
    if (activeSession?.id === sessionId) {
      router.push("/login");
    }
  };

  return {
    sessions,
    activeSession,
    saveCurrentSession,
    switchSession,
    removeSession: removeSessionById,
    refreshSessions: loadSessions,
  };
}
