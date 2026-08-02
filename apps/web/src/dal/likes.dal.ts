import type { PresetWithCreator } from "@/data/presets";
import { syncPresetCounter } from "./helpers";
import { PRESET_SELECT_WITH_CREATOR, assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";

import { MOCK_LIKES } from "@/data/mock-data";

export async function listUserLikedPresets(
	client: DalClient,
	userId: string,
): Promise<PresetWithCreator[]> {
	try {
		const { data, error } = await client
			.from("presets")
			.select(`${PRESET_SELECT_WITH_CREATOR}, preset_likes!inner (user_id)`)
			.eq("preset_likes.user_id", userId)
			.eq("status", "published")
			.order("created_at", { ascending: false });

		if (!error && data && data.length > 0) {
			return data as unknown as PresetWithCreator[];
		}
	} catch {
		// Fall through
	}

	return MOCK_LIKES as unknown as PresetWithCreator[];
}

export async function likePreset(
	client: DalClient,
	presetId: string,
	userId: string,
) {
	await assertPresetExists(client, presetId);

	const { error: insertError } = await client
		.from("preset_likes")
		.upsert({ preset_id: presetId, user_id: userId } as never, {
			onConflict: "preset_id,user_id",
		});

	if (insertError) throw insertError;

	await syncPresetCounter(client, presetId, "preset_likes", "like_count");

	return { preset_id: presetId, liked: true };
}

export async function unlikePreset(
	client: DalClient,
	presetId: string,
	userId: string,
) {
	const { error: deleteError } = await client
		.from("preset_likes")
		.delete()
		.eq("preset_id", presetId)
		.eq("user_id", userId);

	if (deleteError) throw deleteError;

	await syncPresetCounter(client, presetId, "preset_likes", "like_count");
}
