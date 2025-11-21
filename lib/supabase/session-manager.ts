/**
 * Multi-Session Manager for Supabase
 * Allows users to switch between multiple logged-in accounts
 */

export interface SessionInfo {
  id: string; // Unique session ID
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = "vibe-sessions";
const ACTIVE_SESSION_KEY = "vibe-active-session";

/**
 * Get all saved sessions
 */
export function getAllSessions(): SessionInfo[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Get active session ID
 */
export function getActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

/**
 * Set active session
 */
export function setActiveSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
}

/**
 * Save a new session
 */
export function saveSession(session: SessionInfo): void {
  if (typeof window === "undefined") return;

  const sessions = getAllSessions();

  // Check if session already exists
  const existingIndex = sessions.findIndex((s) => s.id === session.id);

  if (existingIndex >= 0) {
    // Update existing session
    sessions[existingIndex] = session;
  } else {
    // Add new session
    sessions.push(session);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  setActiveSession(session.id);
}

/**
 * Remove a session
 */
export function removeSession(sessionId: string): void {
  if (typeof window === "undefined") return;

  const sessions = getAllSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // If removed session was active, switch to first remaining session
  const activeId = getActiveSessionId();
  if (activeId === sessionId) {
    if (filtered.length > 0) {
      setActiveSession(filtered[0].id);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }
}

/**
 * Get active session info
 */
export function getActiveSession(): SessionInfo | null {
  const activeId = getActiveSessionId();
  if (!activeId) return null;

  const sessions = getAllSessions();
  return sessions.find((s) => s.id === activeId) || null;
}

/**
 * Clear all sessions (logout all)
 */
export function clearAllSessions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}
