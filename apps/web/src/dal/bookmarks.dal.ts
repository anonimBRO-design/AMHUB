import type { PresetWithCreator } from "@/data/presets";
import { syncPresetCounter } from "./helpers";
import { createNotification } from "./notifications.dal";
import { PRESET_SELECT_WITH_CREATOR, assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";

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
		return (data ?? []) as unknown as PresetWithCreator[];
	} catch (error) {
		console.error("Failed to list bookmarked presets:", error);
		throw error;
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

	// Trigger Notification for creator
	try {
		const { data: preset } = await client
			.from("presets")
			.select("creator_id, title")
			.eq("id", presetId)
			.maybeSingle();

		if (
			preset &&
			(preset as { creator_id: string }).creator_id &&
			(preset as { creator_id: string }).creator_id !== userId
		) {
			await createNotification(client, {
				userId: (preset as { creator_id: string }).creator_id,
				actorId: userId,
				type: "bookmark",
				presetId,
				message: `saved your preset "${(preset as { title?: string }).title || "Preset"}" to bookmarks`,
			});
		}
	} catch (e) {
		console.error("Failed to trigger bookmark notification", e);
	}

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

	if (deleteError) {
		await syncPresetCounter(
			client,
			presetId,
			"preset_bookmarks",
			"bookmark_count",
		);
		throw deleteError;
	}

	await syncPresetCounter(
		client,
		presetId,
		"preset_bookmarks",
		"bookmark_count",
	);

	// Clean up previous bookmark notification silently
	try {
		await client
			.from("notifications")
			.delete()
			.eq("preset_id", presetId)
			.eq("actor_id", userId)
			.eq("type", "bookmark");
	} catch (e) {
		console.error("Failed to clean up bookmark notification", e);
	}
}
