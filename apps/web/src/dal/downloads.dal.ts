import { XP_REWARDS } from "@/lib/gamification/xp";
import { syncPresetCounter } from "./helpers";
import { createNotification } from "./notifications.dal";
import { assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";
import { awardUserXp } from "./users.dal";

export interface RecordDownloadParams {
	presetId: string;
	userId?: string | null;
	anonymousToken?: string | null;
	ipHash: string;
	userAgentHash?: string | null;
	dedupWindowHours?: number;
}

export interface RecordDownloadResult {
	isUnique: boolean;
	totalDownloads: number;
	uniqueDownloads: number;
}

const DEFAULT_DEDUP_WINDOW_HOURS = 6;

/**
 * Records a preset download with multi-layer identity deduplication:
 * 1. user_id (Authenticated user - highest authority)
 * 2. anonymous_token (Guest client storage token)
 * 3. ip_hash (Fallback anti-abuse signal with time window)
 */
export async function recordPresetDownload(
	client: DalClient,
	params: RecordDownloadParams,
): Promise<RecordDownloadResult> {
	const {
		presetId,
		userId,
		anonymousToken,
		ipHash,
		userAgentHash,
		dedupWindowHours = DEFAULT_DEDUP_WINDOW_HOURS,
	} = params;

	await assertPresetExists(client, presetId);

	const windowMs = dedupWindowHours * 60 * 60 * 1000;
	const windowStartIso = new Date(Date.now() - windowMs).toISOString();

	// 1. Check for duplicate download within sliding window using identity hierarchy
	let isDuplicate = false;

	if (userId) {
		const { data: userPrev } = await client
			.from("preset_downloads")
			.select("id")
			.eq("preset_id", presetId)
			.eq("user_id", userId)
			.gte("created_at", windowStartIso)
			.limit(1)
			.maybeSingle();

		if (userPrev) {
			isDuplicate = true;
		}
	} else if (anonymousToken) {
		const { data: tokenPrev } = await client
			.from("preset_downloads")
			.select("id")
			.eq("preset_id", presetId)
			.eq("anonymous_token", anonymousToken)
			.gte("created_at", windowStartIso)
			.limit(1)
			.maybeSingle();

		if (tokenPrev) {
			isDuplicate = true;
		}
	} else if (ipHash) {
		// Fallback IP check for guest requests without tokens
		const { data: ipPrev } = await client
			.from("preset_downloads")
			.select("id")
			.eq("preset_id", presetId)
			.eq("ip_hash", ipHash)
			.gte("created_at", windowStartIso)
			.limit(1)
			.maybeSingle();

		if (ipPrev) {
			isDuplicate = true;
		}
	}

	const isUnique = !isDuplicate;

	// 2. Insert download record if unique or to retain download audit
	if (isUnique) {
		try {
			await client.from("preset_downloads").insert({
				preset_id: presetId,
				user_id: userId || null,
				anonymous_token: anonymousToken || null,
				ip_hash: ipHash,
				user_agent_hash: userAgentHash || null,
			} as never);

			try {
				const { data: presetObj } = await client
					.from("presets")
					.select("creator_id, title")
					.eq("id", presetId)
					.maybeSingle();

				const creatorId = (presetObj as { creator_id?: string } | null)
					?.creator_id;
				const title = (presetObj as { title?: string } | null)?.title;

				if (creatorId && creatorId !== userId) {
					await createNotification(client, {
						userId: creatorId,
						actorId: userId || undefined,
						type: "download",
						presetId: presetId,
						message: `downloaded your preset "${title || "Preset"}"`,
					});

					// Award creator XP for receiving a download
					awardUserXp(
						client,
						creatorId,
						XP_REWARDS.PRESET_DOWNLOADED,
						"Preset downloaded",
					).catch((err) => {
						console.error("[XP_AWARD_ERROR] Failed to award download XP:", err);
					});
				}
			} catch (e) {
				console.error("Failed to send download notification", e);
			}
		} catch (insertErr) {
			// Table may not yet be migrated
			console.warn("Failed to insert into preset_downloads:", insertErr);
		}
	}

	// 3. Fetch current preset counters
	const { data: presetData } = await client
		.from("presets")
		.select("download_count")
		.eq("id", presetId)
		.maybeSingle();

	const currentTotal =
		(presetData as { download_count?: number } | null)?.download_count ?? 0;
	const currentUnique = currentTotal;

	const newTotal = currentTotal + 1;
	const newUnique = isUnique ? currentUnique + 1 : currentUnique;

	// 4. Update preset counters safely
	await client
		.from("presets")
		.update({
			download_count: newTotal,
		} as never)
		.eq("id", presetId);

	return {
		isUnique,
		totalDownloads: newTotal,
		uniqueDownloads: newUnique,
	};
}

/**
 * Gets unique download stats for a preset or creator.
 */
export async function getPresetDownloadStats(
	client: DalClient,
	presetId: string,
): Promise<{ total: number; unique: number }> {
	const { data: preset } = await client
		.from("presets")
		.select("download_count")
		.eq("id", presetId)
		.maybeSingle();

	const p = preset as {
		download_count?: number;
	} | null;

	const total = p?.download_count ?? 0;
	return {
		total,
		unique: total,
	};
}
