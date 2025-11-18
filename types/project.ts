import type { Database } from "@/lib/supabase/types";
import type { FilterSettings, TransformState } from "./editor";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

// ============================================================================
// CANVAS STATE - For saving/loading editor state
// ============================================================================

export interface CanvasState {
  imageUrl: string; // Supabase Storage URL
  filters: FilterSettings;
  transform: TransformState;
  width: number;
  height: number;
  version: string; // For future migrations (e.g., "1.0")
}

// ============================================================================
// PROJECT METADATA
// ============================================================================

export interface ProjectWithMetadata extends Project {
  isAutosaving?: boolean;
  lastSavedAt?: string;
}

export interface CreateProjectPayload {
  name: string;
  canvas_data: object;
  width?: number;
  height?: number;
  thumbnail_url?: string;
}

export interface UpdateProjectPayload {
  id: string;
  name?: string;
  canvas_data?: object;
  width?: number;
  height?: number;
  thumbnail_url?: string;
}
