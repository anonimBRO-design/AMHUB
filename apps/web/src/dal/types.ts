import type { PresetHubSupabaseClient } from "@/lib/supabase/client";

export type DalClient = PresetHubSupabaseClient;

export interface DalPaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface DalPaginatedResult<T> {
  data: T[];
  total: number;
}
