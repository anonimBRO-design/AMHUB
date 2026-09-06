import { ApiError } from "@/lib/api/errors";
import type { Challenge } from "@presethub/types";
import type { DalClient } from "./types";

export interface ChallengeEntryWithPreset {
	id: string;
	challenge_id: string;
	preset_id: string;
	creator_id: string;
	created_at: string;
	vote_count: number;
	preset: {
		id: string;
		slug: string;
		title: string;
		thumbnail_url: string;
		like_count: number;
		download_count: number;
		creator: {
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
		};
	};
}

export async function getActiveChallenge(
	client: DalClient,
): Promise<Challenge | null> {
	try {
		const { data, error } = await client
			.from("challenges")
			.select("*")
			.eq("is_active", true)
			.order("ends_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error || !data) return null;
		const challenge = data as unknown as Challenge;
		if (new Date(challenge.ends_at).getTime() < Date.now()) return null;
		return challenge;
	} catch {
		return null;
	}
}

export async function listChallengeEntries(
	client: DalClient,
	challengeId: string,
): Promise<ChallengeEntryWithPreset[]> {
	try {
		const [entriesRes, votesRes] = await Promise.all([
			client
				.from("challenge_entries")
				.select(
					`
					id,
					challenge_id,
					preset_id,
					creator_id,
					created_at,
					preset:presets!challenge_entries_preset_id_fkey (
						id,
						slug,
						title,
						thumbnail_url,
						like_count,
						download_count,
						status,
						creator:users!presets_creator_id_fkey (
							id,
							username,
							display_name,
							avatar_url
						)
					)
				`,
				)
				.eq("challenge_id", challengeId)
				.order("created_at", { ascending: true }),
			client
				.from("challenge_votes")
				.select("preset_id")
				.eq("challenge_id", challengeId),
		]);

		if (entriesRes.error) return [];
		const voteCounts = new Map<string, number>();
		for (const v of (votesRes.data ?? []) as { preset_id: string }[]) {
			voteCounts.set(v.preset_id, (voteCounts.get(v.preset_id) ?? 0) + 1);
		}

		const entries = (
			(entriesRes.data ?? []) as unknown as (Omit<
				ChallengeEntryWithPreset,
				"vote_count" | "preset"
			> & {
				preset: ChallengeEntryWithPreset["preset"] & { status?: string };
			})[]
		)
			.filter((e) => e.preset && e.preset.status !== "removed")
			.map((e) => ({
				id: e.id,
				challenge_id: e.challenge_id,
				preset_id: e.preset_id,
				creator_id: e.creator_id,
				created_at: e.created_at,
				vote_count: voteCounts.get(e.preset_id) ?? 0,
				preset: {
					id: e.preset.id,
					slug: e.preset.slug,
					title: e.preset.title,
					thumbnail_url: e.preset.thumbnail_url,
					like_count: e.preset.like_count,
					download_count: e.preset.download_count,
					creator: e.preset.creator,
				},
			}));

		return entries.sort((a, b) => b.vote_count - a.vote_count);
	} catch {
		return [];
	}
}

export async function getUserChallengeVote(
	client: DalClient,
	challengeId: string,
	voterId: string,
): Promise<string | null> {
	try {
		const { data } = await client
			.from("challenge_votes")
			.select("preset_id")
			.eq("challenge_id", challengeId)
			.eq("voter_id", voterId)
			.maybeSingle();
		return (data as { preset_id?: string } | null)?.preset_id ?? null;
	} catch {
		return null;
	}
}

export async function submitChallengeEntry(
	client: DalClient,
	challengeId: string,
	presetId: string,
	creatorId: string,
) {
	const { data: challenge } = await client
		.from("challenges")
		.select("id, is_active, ends_at")
		.eq("id", challengeId)
		.maybeSingle();
	const c = challenge as unknown as {
		is_active?: boolean;
		ends_at?: string;
	} | null;
	if (!c || !c.is_active || new Date(c.ends_at ?? 0).getTime() < Date.now()) {
		throw new ApiError({
			code: "bad_request",
			message: "Challenge sudah berakhir atau tidak aktif.",
		});
	}

	const { data: preset } = await client
		.from("presets")
		.select("id, creator_id, status")
		.eq("id", presetId)
		.maybeSingle();
	const p = preset as unknown as {
		creator_id?: string;
		status?: string;
	} | null;
	if (!p || p.status !== "published") {
		throw new ApiError({
			code: "bad_request",
			message: "Hanya preset yang sudah publish bisa diikutkan.",
		});
	}
	if (p.creator_id !== creatorId) {
		throw new ApiError({
			code: "forbidden",
			message: "Kamu hanya bisa mengikutkan preset milikmu sendiri.",
		});
	}

	const { data, error } = await client
		.from("challenge_entries")
		.insert({
			challenge_id: challengeId,
			preset_id: presetId,
			creator_id: creatorId,
		} as never)
		.select("id")
		.single();

	if (error) {
		if ((error as { code?: string }).code === "23505") {
			throw new ApiError({
				code: "conflict",
				message: "Preset ini sudah terdaftar di challenge.",
			});
		}
		throw new ApiError({
			code: "internal_server_error",
			message: "Gagal mendaftarkan preset ke challenge.",
		});
	}
	return data;
}

export async function voteChallengeEntry(
	client: DalClient,
	challengeId: string,
	presetId: string,
	voterId: string,
) {
	const { data: challenge } = await client
		.from("challenges")
		.select("id, is_active, ends_at")
		.eq("id", challengeId)
		.maybeSingle();
	const c = challenge as unknown as {
		is_active?: boolean;
		ends_at?: string;
	} | null;
	if (!c || !c.is_active || new Date(c.ends_at ?? 0).getTime() < Date.now()) {
		throw new ApiError({
			code: "bad_request",
			message: "Voting challenge ini sudah ditutup.",
		});
	}

	const { data: entry } = await client
		.from("challenge_entries")
		.select("id, creator_id")
		.eq("challenge_id", challengeId)
		.eq("preset_id", presetId)
		.maybeSingle();
	if (!entry) {
		throw new ApiError({
			code: "bad_request",
			message: "Preset tidak terdaftar di challenge ini.",
		});
	}

	// Block self-voting: a user cannot vote for their own challenge entry.
	if ((entry as { creator_id?: string }).creator_id === voterId) {
		throw new ApiError({
			code: "bad_request",
			message: "Kamu tidak bisa memberi vote pada preset milikmu sendiri.",
		});
	}

	const { error } = await client.from("challenge_votes").upsert(
		{
			challenge_id: challengeId,
			preset_id: presetId,
			voter_id: voterId,
		} as never,
		{ onConflict: "challenge_id,voter_id" },
	);
	if (error) {
		throw new ApiError({
			code: "internal_server_error",
			message: "Gagal menyimpan vote.",
		});
	}
}

export async function unvoteChallenge(
	client: DalClient,
	challengeId: string,
	voterId: string,
) {
	const { error } = await client
		.from("challenge_votes")
		.delete()
		.eq("challenge_id", challengeId)
		.eq("voter_id", voterId);
	if (error) {
		throw new ApiError({
			code: "internal_server_error",
			message: "Gagal membatalkan vote.",
		});
	}
}
