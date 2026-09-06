import { ApiError } from "@/lib/api/errors";
import type { CustomRequest, RequestOffer } from "@presethub/types";
import { createNotification } from "./notifications.dal";
import type { DalClient } from "./types";

const REQUESTER_JOIN = `
	requester:users!custom_requests_requester_id_fkey (
		id, username, display_name, avatar_url
	)
`;

const CREATOR_JOIN = `
	creator:users!request_offers_creator_id_fkey (
		id, username, display_name, avatar_url
	)
`;

export interface CustomRequestWithMeta extends CustomRequest {
	requester: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
	};
	offer_count: number;
}

export interface RequestOfferWithCreator extends RequestOffer {
	creator: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string | null;
	};
}

export async function listRequests(
	client: DalClient,
	params: { status?: string; page?: number; limit?: number } = {},
): Promise<CustomRequestWithMeta[]> {
	const page = params.page ?? 1;
	const limit = Math.min(params.limit ?? 20, 50);
	const from = (page - 1) * limit;
	try {
		let query = client
			.from("custom_requests")
			.select(
				`${REQUESTER_JOIN}, id, requester_id, title, description, budget_min, budget_max, deadline_at, status, created_at, offers:request_offers(count)`,
			)
			.range(from, from + limit - 1)
			.order("created_at", { ascending: false });
		if (params.status) query = query.eq("status", params.status);
		const { data, error } = await query;
		if (error) throw error;
		return (
			(data ?? []) as unknown as (Omit<CustomRequestWithMeta, "offer_count"> & {
				offers: { count: number }[];
			})[]
		).map((r) => ({
			...r,
			offers: undefined,
			offer_count: r.offers?.[0]?.count ?? 0,
		})) as unknown as CustomRequestWithMeta[];
	} catch (error) {
		console.error("Failed to list requests:", error);
		throw error;
	}
}

export async function getRequestById(client: DalClient, id: string) {
	const { data, error } = await client
		.from("custom_requests")
		.select(`${REQUESTER_JOIN}, *`)
		.eq("id", id)
		.maybeSingle();
	if (error) throw error;
	if (!data) {
		throw new ApiError({
			code: "not_found",
			message: "Request tidak ditemukan.",
		});
	}
	return data as unknown as CustomRequestWithMeta;
}

export async function createRequest(
	client: DalClient,
	requesterId: string,
	input: {
		title: string;
		description: string;
		budget_min?: number;
		budget_max: number;
		deadline_at?: string | null;
	},
) {
	if ((input.budget_min ?? 0) > input.budget_max) {
		throw new ApiError({
			code: "bad_request",
			message: "Budget maksimal harus >= budget minimal.",
		});
	}
	const { data, error } = await client
		.from("custom_requests")
		.insert({
			requester_id: requesterId,
			title: input.title,
			description: input.description,
			budget_min: input.budget_min ?? 0,
			budget_max: input.budget_max,
			deadline_at: input.deadline_at ?? null,
			status: "open",
		} as never)
		.select("id")
		.single();
	if (error || !data) {
		throw new ApiError({
			code: "internal_server_error",
			message: "Gagal membuat request.",
		});
	}
	return data;
}

export async function updateRequestStatus(
	client: DalClient,
	id: string,
	userId: string,
	status: "completed" | "cancelled",
	isStaff = false,
) {
	const { data: request } = await client
		.from("custom_requests")
		.select("id, requester_id, status")
		.eq("id", id)
		.maybeSingle();
	const r = request as unknown as {
		requester_id?: string;
		status?: string;
	} | null;
	if (!r) {
		throw new ApiError({
			code: "not_found",
			message: "Request tidak ditemukan.",
		});
	}
	if (r.requester_id !== userId && !isStaff) {
		throw new ApiError({
			code: "forbidden",
			message: "Hanya pemilik request yang bisa mengubah status.",
		});
	}
	if (r.status === "completed") {
		throw new ApiError({
			code: "bad_request",
			message: "Request yang sudah selesai tidak bisa diubah.",
		});
	}
	const { error } = await client
		.from("custom_requests")
		.update({ status } as never)
		.eq("id", id);
	if (error) throw error;
}

export async function listOffers(
	client: DalClient,
	requestId: string,
): Promise<RequestOfferWithCreator[]> {
	const { data, error } = await client
		.from("request_offers")
		.select(`${CREATOR_JOIN}, *`)
		.eq("request_id", requestId)
		.order("created_at", { ascending: true });
	if (error) return [];
	return (data ?? []) as unknown as RequestOfferWithCreator[];
}

export async function submitOffer(
	client: DalClient,
	requestId: string,
	creatorId: string,
	input: { price: number; message?: string; eta_days?: number },
) {
	const { data: request } = await client
		.from("custom_requests")
		.select("id, requester_id, status, title")
		.eq("id", requestId)
		.maybeSingle();
	const r = request as unknown as {
		requester_id?: string;
		status?: string;
		title?: string;
	} | null;
	if (!r) {
		throw new ApiError({
			code: "not_found",
			message: "Request tidak ditemukan.",
		});
	}
	if (r.status !== "open") {
		throw new ApiError({
			code: "bad_request",
			message: "Request ini sudah tidak menerima penawaran.",
		});
	}
	if (r.requester_id === creatorId) {
		throw new ApiError({
			code: "bad_request",
			message: "Kamu tidak bisa menawar request milikmu sendiri.",
		});
	}

	const { data: existing } = await client
		.from("request_offers")
		.select("id, status")
		.eq("request_id", requestId)
		.eq("creator_id", creatorId)
		.maybeSingle();
	const ex = existing as { id?: string; status?: string } | null;
	if (ex && ex.status === "accepted") {
		throw new ApiError({
			code: "conflict",
			message: "Penawaranmu sudah diterima untuk request ini.",
		});
	}

	let result;
	if (ex?.id) {
		const { data, error } = await client
			.from("request_offers")
			.update({
				price: input.price,
				message: input.message ?? null,
				eta_days: input.eta_days ?? null,
				status: "pending",
			} as never)
			.eq("id", ex.id)
			.select("id")
			.single();
		if (error) throw error;
		result = data;
	} else {
		const { data, error } = await client
			.from("request_offers")
			.insert({
				request_id: requestId,
				creator_id: creatorId,
				price: input.price,
				message: input.message ?? null,
				eta_days: input.eta_days ?? null,
				status: "pending",
			} as never)
			.select("id")
			.single();
		if (error) throw error;
		result = data;
	}

	await createNotification(client, {
		userId: r.requester_id as string,
		actorId: creatorId,
		type: "system",
		message: `menawar Rp ${input.price.toLocaleString("id-ID")} untuk request "${r.title}"`,
	}).catch(() => null);

	return result;
}

export async function decideOffer(
	client: DalClient,
	requestId: string,
	offerId: string,
	requesterId: string,
	action: "accept" | "reject",
	isStaff = false,
) {
	const { data: request } = await client
		.from("custom_requests")
		.select("id, requester_id, status")
		.eq("id", requestId)
		.maybeSingle();
	const r = request as unknown as {
		requester_id?: string;
		status?: string;
	} | null;
	if (!r) {
		throw new ApiError({
			code: "not_found",
			message: "Request tidak ditemukan.",
		});
	}
	if (r.requester_id !== requesterId && !isStaff) {
		throw new ApiError({
			code: "forbidden",
			message: "Hanya pemilik request yang bisa memutuskan.",
		});
	}
	if (r.status !== "open" && !isStaff) {
		throw new ApiError({
			code: "bad_request",
			message: "Request ini sudah tidak terbuka.",
		});
	}

	const { data: offer } = await client
		.from("request_offers")
		.select("id, creator_id, status, price")
		.eq("id", offerId)
		.eq("request_id", requestId)
		.maybeSingle();
	const o = offer as unknown as {
		creator_id?: string;
		status?: string;
		price?: number;
	} | null;
	if (!o || o.status !== "pending") {
		throw new ApiError({
			code: "bad_request",
			message: "Penawaran sudah tidak valid.",
		});
	}

	if (action === "accept") {
		// Atomic gate: only one concurrent accept can move the request
		// open -> in_progress. The loser gets 0 rows back and aborts
		// before touching any offer.
		if (!isStaff) {
			const { data: gated, error: gateError } = await client
				.from("custom_requests")
				.update({ status: "in_progress" } as never)
				.eq("id", requestId)
				.eq("status", "open")
				.select("id")
				.maybeSingle();
			if (gateError) throw gateError;
			if (!gated) {
				throw new ApiError({
					code: "conflict",
					message: "Request ini sudah tidak terbuka.",
				});
			}
		} else {
			await client
				.from("custom_requests")
				.update({ status: "in_progress" } as never)
				.eq("id", requestId);
		}
		const { data: accepted, error: updateError } = await client
			.from("request_offers")
			.update({ status: "accepted" } as never)
			.eq("id", offerId)
			.eq("request_id", requestId)
			.eq("status", "pending")
			.select("id")
			.maybeSingle();
		if (updateError) throw updateError;
		if (!accepted) {
			// Compensation: release the gate so the request doesn't get stuck
			// in_progress with no accepted offer (e.g. offer withdrawn mid-flight).
			if (!isStaff) {
				await client
					.from("custom_requests")
					.update({ status: "open" } as never)
					.eq("id", requestId)
					.eq("status", "in_progress");
			}
			throw new ApiError({
				code: "conflict",
				message: "Penawaran sudah tidak valid.",
			});
		}
		await client
			.from("request_offers")
			.update({ status: "rejected" } as never)
			.eq("request_id", requestId)
			.eq("status", "pending")
			.neq("id", offerId);
		await createNotification(client, {
			userId: o.creator_id as string,
			actorId: requesterId,
			type: "system",
			message: `menerima penawaranmu Rp ${(o.price ?? 0).toLocaleString("id-ID")}. Segera kerjakan presetnya!`,
		}).catch(() => null);
	} else {
		const { data: rejected, error: updateError } = await client
			.from("request_offers")
			.update({ status: "rejected" } as never)
			.eq("id", offerId)
			.eq("status", "pending")
			.select("id")
			.maybeSingle();
		if (updateError) throw updateError;
		if (!rejected) {
			throw new ApiError({
				code: "conflict",
				message: "Penawaran sudah tidak valid.",
			});
		}
	}
}

export async function withdrawOffer(
	client: DalClient,
	requestId: string,
	offerId: string,
	creatorId: string,
) {
	const { data: offer } = await client
		.from("request_offers")
		.select("id, creator_id, status")
		.eq("id", offerId)
		.eq("request_id", requestId)
		.maybeSingle();
	const o = offer as unknown as {
		creator_id?: string;
		status?: string;
	} | null;
	if (!o || o.creator_id !== creatorId || o.status !== "pending") {
		throw new ApiError({
			code: "bad_request",
			message: "Penawaran tidak bisa ditarik.",
		});
	}
	await client
		.from("request_offers")
		.update({ status: "withdrawn" } as never)
		.eq("id", offerId);
}
