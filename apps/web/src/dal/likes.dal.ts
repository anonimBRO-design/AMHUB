import type { DalClient } from "./types";
import { syncPresetCounter } from "./helpers";
import { assertPresetExists } from "./presets.dal";

export async function likePreset(
  client: DalClient,
  presetId: string,
  userId: string
) {
  await assertPresetExists(client, presetId);

  const { error: insertError } = await client
    .from("preset_likes")
    .upsert({ preset_id: presetId, user_id: userId }, { onConflict: "preset_id,user_id" });

  if (insertError) throw insertError;

  await syncPresetCounter(client, presetId, "preset_likes", "like_count");

  return { preset_id: presetId, liked: true };
}

export async function unlikePreset(
  client: DalClient,
  presetId: string,
  userId: string
) {
  const { error: deleteError } = await client
    .from("preset_likes")
    .delete()
    .eq("preset_id", presetId)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  await syncPresetCounter(client, presetId, "preset_likes", "like_count");
}
