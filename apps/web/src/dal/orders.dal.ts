import { ApiError } from "@/lib/api/errors";
import { calculatePresetPayout } from "@/lib/monetization/payout";
import type { PresetOrder } from "@presethub/types";
import { assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";

export interface CreateOrderParams {
	presetId: string;
	buyerId: string;
	paymentProvider?: string;
}

/**
 * Generates human-readable, unique order number (e.g. ORD-20260816-AB12)
 */
function generateOrderNumber(): string {
	const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `AM-${dateStr}-${randomSuffix}`;
}

/**
 * Creates an order for a paid preset with 90:10 payout calculations.
 */
export async function createPresetOrder(
	client: DalClient,
	params: CreateOrderParams,
): Promise<PresetOrder> {
	const { presetId, buyerId, paymentProvider = "qris" } = params;

	// 1. Fetch preset details
	const { data: presetData, error: presetError } = await client
		.from("presets")
		.select("id, title, creator_id, price, is_paid, currency, status")
		.eq("id", presetId)
		.maybeSingle();

	if (presetError || !presetData) {
		throw new ApiError({
			code: "not_found",
			message: "Preset not found.",
		});
	}

	const preset = presetData as unknown as {
		id: string;
		title: string;
		creator_id: string;
		price: number;
		is_paid: boolean;
		currency: string;
		status: string;
	};

	if (preset.status !== "published") {
		throw new ApiError({
			code: "bad_request",
			message: "Preset is not available for purchase.",
		});
	}

	if (preset.creator_id === buyerId) {
		throw new ApiError({
			code: "bad_request",
			message: "You cannot purchase your own preset.",
		});
	}

	if (!preset.is_paid || (preset.price ?? 0) <= 0) {
		throw new ApiError({
			code: "bad_request",
			message: "This preset is free and does not require an order.",
		});
	}

	// 2. Check if buyer already purchased this preset
	const { data: existingPaidOrder } = await client
		.from("preset_orders")
		.select("id, order_number, payment_status")
		.eq("preset_id", presetId)
		.eq("buyer_id", buyerId)
		.eq("payment_status", "paid")
		.maybeSingle();

	if (existingPaidOrder) {
		throw new ApiError({
			code: "conflict",
			message: "You have already purchased this preset.",
		});
	}

	// 3. Compute 90:10 monetization split
	const payout = calculatePresetPayout({
		grossAmount: preset.price,
		currency: preset.currency || "IDR",
		paymentProvider,
	});

	const orderNumber = generateOrderNumber();

	// 4. Insert order
	const { data: order, error: insertError } = await client
		.from("preset_orders")
		.insert({
			order_number: orderNumber,
			preset_id: preset.id,
			buyer_id: buyerId,
			seller_id: preset.creator_id,
			gross_amount: payout.grossAmount,
			currency: payout.currency,
			payment_provider: paymentProvider,
			payment_status: "pending",
			processor_fee: payout.processorFee,
			net_amount: payout.netAmount,
			creator_payout_amount: payout.creatorPayoutAmount,
			platform_fee_amount: payout.platformFeeAmount,
		} as never)
		.select("*")
		.single();

	if (insertError || !order) {
		console.error("Failed to create preset order:", insertError);
		throw new ApiError({
			code: "internal_server_error",
			message: "Could not initialize preset order.",
		});
	}

	return order as unknown as PresetOrder;
}

/**
 * Updates order payment status (e.g. from payment gateway webhook or admin).
 */
export async function updateOrderStatus(
	client: DalClient,
	orderId: string,
	status: "pending" | "paid" | "failed" | "refunded" | "cancelled",
	paymentReference?: string,
): Promise<PresetOrder> {
	const updatePayload: Record<string, unknown> = {
		payment_status: status,
		updated_at: new Date().toISOString(),
	};

	if (status === "paid") {
		updatePayload.paid_at = new Date().toISOString();
	}
	if (paymentReference) {
		updatePayload.payment_reference = paymentReference;
	}

	const { data: updated, error } = await client
		.from("preset_orders")
		.update(updatePayload as never)
		.eq("id", orderId)
		.select("*")
		.single();

	if (error || !updated) {
		throw new ApiError({
			code: "not_found",
			message: "Order not found or update failed.",
		});
	}

	return updated as unknown as PresetOrder;
}

/**
 * Checks if a user has access to a preset (owner or verified purchaser or free preset).
 */
export async function checkUserPresetAccess(
	client: DalClient,
	presetId: string,
	userId?: string | null,
): Promise<{ hasAccess: boolean; isPaid: boolean; price: number }> {
	const { data: preset } = await client
		.from("presets")
		.select("creator_id, is_paid, price")
		.eq("id", presetId)
		.maybeSingle();

	if (!preset) {
		return { hasAccess: false, isPaid: false, price: 0 };
	}

	const p = preset as { creator_id: string; is_paid: boolean; price: number };

	if (!p.is_paid || p.price <= 0) {
		return { hasAccess: true, isPaid: false, price: 0 };
	}

	if (userId && p.creator_id === userId) {
		return { hasAccess: true, isPaid: true, price: p.price };
	}

	if (!userId) {
		return { hasAccess: false, isPaid: true, price: p.price };
	}

	const { data: order } = await client
		.from("preset_orders")
		.select("id")
		.eq("preset_id", presetId)
		.eq("buyer_id", userId)
		.eq("payment_status", "paid")
		.maybeSingle();

	return {
		hasAccess: Boolean(order),
		isPaid: true,
		price: p.price,
	};
}
