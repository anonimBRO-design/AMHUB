import { ApiError } from "@/lib/api/errors";
import type { DalClient } from "./types";
import type { Database } from "@presethub/types";

export function assertExists<T>(
  data: T | null | undefined,
  message = "Resource was not found."
): T {
  if (!data) {
    throw new ApiError({ code: "not_found", message });
  }
  return data;
}

export function handleDuplicateKey(error: unknown, message: string): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  ) {
    throw new ApiError({ code: "conflict", message });
  }
  throw error;
}

type CounterTable = "preset_likes" | "preset_bookmarks" | "comments";
type CounterColumn = "like_count" | "bookmark_count" | "comment_count";

export async function syncPresetCounter(
  client: DalClient,
  presetId: string,
  table: CounterTable,
  counterColumn: CounterColumn
): Promise<void> {
  let query = client
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("preset_id", presetId);

  if (table === "comments") {
    // For comments, exclude removed comments
    query = query.eq("is_removed", false);
  }

  const { count, error: countError } = await query;

  if (!countError && count !== null) {
    await client
      .from("presets")
      .update({ [counterColumn]: count } as Database["public"]["Tables"]["presets"]["Update"])
      .eq("id", presetId);
  }
}
