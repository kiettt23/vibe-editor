import type { Database } from "@/lib/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

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
