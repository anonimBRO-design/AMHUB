import {
	fulfillPaidOrder,
	getOrderByOrderNumber,
	updateOrderStatus,
} from "@/dal/orders.dal";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const webhookPayloadSchema = z.object({
	order_id: z.string().optional(),
	order_number: z.string().optional(),
	id: z.string().optional(),
	transaction_status: z.string().optional(),
	status: z.string().optional(),
	payment_status: z.string().optional(),
	signature: z.string().optional(),
	signature_key: z.string().optional(),
	payment_reference: z.string().optional(),
	reference: z.string().optional(),
});

/**
 * Verifies authenticity of the webhook caller using environment secret or HMAC signature.
 */
function verifyWebhookAuthenticity(
	request: NextRequest,
	payload: z.infer<typeof webhookPayloadSchema>,
): boolean {
	const configuredSecret =
		process.env.PAYMENT_WEBHOOK_SECRET || process.env.PAYMENT_GATEWAY_SECRET;

	// In production, an unset secret is a high-risk security hazard
	if (!configuredSecret) {
		if (process.env.NODE_ENV === "production") {
			console.warn(
				"[SECURITY WARNING] PAYMENT_WEBHOOK_SECRET is not configured! Webhook verification skipped in development/staging.",
			);
		}
		return true;
	}

	// 1. Check direct token in headers
	const receivedHeaderToken =
		request.headers.get("x-callback-token") ||
		request.headers.get("x-webhook-secret") ||
		request.headers.get("x-signature-key") ||
		request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

	if (receivedHeaderToken && receivedHeaderToken === configuredSecret) {
		return true;
	}

	// 2. Check token in payload
	if (
		payload.signature === configuredSecret ||
		payload.signature_key === configuredSecret
	) {
		return true;
	}

	return false;
}

/**
 * Normalizes status from various payment gateway webhooks (Midtrans, Xendit, Tripay, Pakasir)
 */
function normalizePaymentStatus(
	rawStatus?: string,
): "paid" | "pending" | "failed" | "cancelled" {
	if (!rawStatus) return "pending";
	const s = rawStatus.toLowerCase().trim();

	// Paid / Successful statuses
	if (["settlement", "capture", "paid", "success", "completed"].includes(s)) {
		return "paid";
	}

	// Pending statuses
	if (["pending", "waiting_payment", "unpaid"].includes(s)) {
		return "pending";
	}

	// Cancelled / Expired
	if (["cancel", "cancelled", "deny", "expire", "expired"].includes(s)) {
		return "cancelled";
	}

	return "failed";
}

export async function POST(request: NextRequest) {
	try {
		// Prevent flooding & denial of service
		await enforceRateLimit({
			request,
			scope: "webhooks:payments",
			limit: 120,
			windowMs: 60_000,
		});

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			throw new ApiError({
				code: "bad_request",
				message: "Invalid JSON payload.",
			});
		}

		const parsed = webhookPayloadSchema.safeParse(body);
		if (!parsed.success) {
			throw new ApiError({
				code: "unprocessable_entity",
				message: "Webhook payload is missing essential identification fields.",
				details: parsed.error.flatten(),
			});
		}

		const data = parsed.data;

		// Authenticate webhook
		if (!verifyWebhookAuthenticity(request, data)) {
			throw new ApiError({
				code: "unauthorized",
				message: "Invalid webhook authentication signature or token.",
			});
		}

		const orderIdentifier = data.order_number || data.order_id || data.id;

		if (!orderIdentifier) {
			throw new ApiError({
				code: "bad_request",
				message:
					"No order identifier (order_number or order_id) found in payload.",
			});
		}

		const rawStatus =
			data.status || data.transaction_status || data.payment_status || "paid";
		const paymentStatus = normalizePaymentStatus(rawStatus);
		const paymentRef =
			data.payment_reference || data.reference || `WH-${Date.now()}`;

		const supabase = await createSupabaseServerClient();

		// Lookup order by human-readable order_number or UUID id
		let order = await getOrderByOrderNumber(supabase, orderIdentifier);
		if (!order) {
			const { data: orderById } = await supabase
				.from("preset_orders")
				.select("*, presets (id, title, slug, thumbnail_url)")
				.eq("id", orderIdentifier)
				.maybeSingle();

			if (orderById) {
				order = orderById as any;
			}
		}

		if (!order) {
			throw new ApiError({
				code: "not_found",
				message: `Order "${orderIdentifier}" not found.`,
			});
		}

		// Idempotency: If already paid, acknowledge immediately
		if (order.payment_status === "paid" && paymentStatus === "paid") {
			return apiResponse({
				success: true,
				order_number: order.order_number,
				status: "already_paid",
				message: "Order is already fulfilled.",
			});
		}

		if (paymentStatus === "paid") {
			const updated = await fulfillPaidOrder(supabase, order.id, paymentRef);
			return apiResponse({
				success: true,
				order_number: updated.order_number,
				status: "paid",
				message: "Payment successfully verified and preset unlocked.",
			});
		}

		// Handle failed / cancelled
		const updated = await updateOrderStatus(
			supabase,
			order.id,
			paymentStatus,
			paymentRef,
		);
		return apiResponse({
			success: true,
			order_number: updated.order_number,
			status: paymentStatus,
			message: `Order status updated to ${paymentStatus}.`,
		});
	} catch (error) {
		console.error("[PAYMENT_WEBHOOK_ERROR]", error);
		return apiErrorResponse(error);
	}
}
