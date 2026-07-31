import type { DalClient } from "./types";
import { syncPresetCounter } from "./helpers";
import { assertPresetExists, PRESET_SELECT_WITH_CREATOR } from "./presets.dal";
import type { PresetWithCreator } from "@/data/presets";

export async function listUserBookmarkedPresets(
  client: DalClient,
  userId: string
): Promise<PresetWithCreator[]> {
  const { data, error } = await client
    .from("presets")
    .select(
      `${PRESET_SELECT_WITH_CREATOR}, preset_bookmarks!inner (user_id)`
    )
    .eq("preset_bookmarks.user_id", userId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PresetWithCreator[];
}

export async function bookmarkPreset(
  client: DalClient,
  presetId: string,
  userId: string,
  collectionId: string | null = null
) {
  await assertPresetExists(client, presetId);

  const { error: insertError } = await client
    .from("preset_bookmarks")
    .upsert(
      { preset_id: presetId, user_id: userId, collection_id: collectionId },
      { onConflict: "preset_id,user_id" }
    );

  if (insertError) throw insertError;

  await syncPresetCounter(client, presetId, "preset_bookmarks", "bookmark_count");

  return {
    preset_id: presetId,
    bookmarked: true,
    collection_id: collectionId,
  };
}

export async function unbookmarkPreset(
  client: DalClient,
  presetId: string,
  userId: string
) {
  const { error: deleteError } = await client
    .from("preset_bookmarks")
    .delete()
    .eq("preset_id", presetId)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  await syncPresetCounter(client, presetId, "preset_bookmarks", "bookmark_count");
}
