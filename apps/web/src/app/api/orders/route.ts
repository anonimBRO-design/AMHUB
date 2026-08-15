import { createPresetOrder } from "@/dal/orders.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson } from "@/lib/api/validation";
import type { PresetOrder } from "@presethub/types";
import type { NextRequest } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
	preset_id: z.string().uuid(),
	payment_provider: z
		.enum(["qris", "ewallet", "va", "manual"])
		.optional()
		.default("qris"),
});

export async function POST(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, createOrderSchema);

		await enforceRateLimit({
			request,
			scope: "orders:create",
			limit: 10,
			windowMs: 60000,
			userId: profile.id,
		});

		const order = await createPresetOrder(supabase, {
			presetId: body.preset_id,
			buyerId: profile.id,
			paymentProvider: body.payment_provider,
		});

		return apiCreated(order);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const { searchParams } = new URL(request.url);
		const role = searchParams.get("role") || "buyer"; // 'buyer' or 'seller'

		let query = supabase
			.from("preset_orders")
			.select("*, presets (id, title, slug, thumbnail_url)");

		if (role === "seller") {
			query = query.eq("seller_id", profile.id);
		} else {
			query = query.eq("buyer_id", profile.id);
		}

		const { data: orders, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) {
			throw new ApiError({
				code: "internal_server_error",
				message: "Failed to fetch orders",
			});
		}

		return apiResponse(orders as unknown as PresetOrder[]);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
