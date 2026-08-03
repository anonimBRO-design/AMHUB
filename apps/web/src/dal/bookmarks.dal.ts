import type { PresetWithCreator } from "@/data/presets";
import { syncPresetCounter } from "./helpers";
import { isMockFallbackEnabled, serveMockFallback } from "./mock-fallback";
import { PRESET_SELECT_WITH_CREATOR, assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";

import { MOCK_BOOKMARKS } from "@/data/mock-data";

export async function listUserBookmarkedPresets(
	client: DalClient,
	userId: string,
): Promise<PresetWithCreator[]> {
	try {
		const { data, error } = await client
			.from("presets")
			.select(`${PRESET_SELECT_WITH_CREATOR}, preset_bookmarks!inner (user_id)`)
			.eq("preset_bookmarks.user_id", userId)
			.eq("status", "published")
			.order("created_at", { ascending: false });

		if (error) throw error;

		if (data && data.length > 0) {
			return data as unknown as PresetWithCreator[];
		}

		if (!isMockFallbackEnabled()) {
			return [];
		}

		return serveMockFallback(
			"listUserBookmarkedPresets",
			() => MOCK_BOOKMARKS as unknown as PresetWithCreator[],
		);
	} catch (error) {
		if (!isMockFallbackEnabled()) throw error;
		return serveMockFallback(
			"listUserBookmarkedPresets",
			() => MOCK_BOOKMARKS as unknown as PresetWithCreator[],
		);
	}
}

export async function bookmarkPreset(
	client: DalClient,
	presetId: string,
	userId: string,
	collectionId: string | null = null,
) {
	await assertPresetExists(client, presetId);

	const { error: insertError } = await client.from("preset_bookmarks").upsert(
		{
			preset_id: presetId,
			user_id: userId,
			collection_id: collectionId,
		} as never,
		{ onConflict: "preset_id,user_id" },
	);

	if (insertError) throw insertError;

	await syncPresetCounter(
		client,
		presetId,
		"preset_bookmarks",
		"bookmark_count",
	);

	return {
		preset_id: presetId,
		bookmarked: true,
		collection_id: collectionId,
	};
}

export async function unbookmarkPreset(
	client: DalClient,
	presetId: string,
	userId: string,
) {
	const { error: deleteError } = await client
		.from("preset_bookmarks")
		.delete()
		.eq("preset_id", presetId)
		.eq("user_id", userId);

	if (deleteError) throw deleteError;

	await syncPresetCounter(
		client,
		presetId,
		"preset_bookmarks",
		"bookmark_count",
	);
}
