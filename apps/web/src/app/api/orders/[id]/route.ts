import { updateOrderStatus } from "@/dal/orders.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const updateOrderSchema = z.object({
	status: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]),
	payment_reference: z.string().optional(),
});

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		const { data: order, error } = await supabase
			.from("preset_orders")
			.select("*, presets (id, title, slug, thumbnail_url)")
			.eq("id", id)
			.maybeSingle();

		if (error || !order) {
			throw new ApiError({
				code: "not_found",
				message: "Order not found.",
			});
		}

		const orderData = order as { buyer_id: string; seller_id: string };
		if (
			orderData.buyer_id !== profile.id &&
			orderData.seller_id !== profile.id &&
			!profile.is_staff
		) {
			throw new ApiError({
				code: "forbidden",
				message: "You are not authorized to view this order.",
			});
		}

		return apiResponse(order);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();
		const body = await validateJson(request, updateOrderSchema);

		// Only staff can manually update order status directly
		if (!profile.is_staff) {
			throw new ApiError({
				code: "forbidden",
				message: "Only staff can update order status manually.",
			});
		}

		const updated = await updateOrderStatus(
			supabase,
			id,
			body.status,
			body.payment_reference,
		);

		return apiResponse(updated);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
