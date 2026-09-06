import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { calculatePresetPayout } from "@/lib/monetization/payout";
import type { PresetOrder } from "@presethub/types";
import { createNotification } from "./notifications.dal";
import { assertPresetExists } from "./presets.dal";
import type { DalClient } from "./types";
import { awardUserXp } from "./users.dal";

export interface CreateOrderParams {
	presetId: string;
	buyerId: string;
	paymentProvider?: string;
	licenseType?: "personal" | "commercial";
	referrerId?: string | null;
}

/**
 * Generates human-readable, unpredictable order number (e.g. ORD-20260816-AB12)
 * using CSPRNG output so order numbers cannot be enumerated within a date range.
 */
function generateOrderNumber(): string {
	const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const randomSuffix = randomBytes(2).toString("hex").toUpperCase();
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
	const licenseType =
		params.licenseType === "commercial" ? "commercial" : "personal";

	// 1. Fetch preset details
	const { data: presetData, error: presetError } = await client
		.from("presets")
		.select(
			"id, title, creator_id, price, is_paid, currency, status, commercial_price",
		)
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
		commercial_price?: number;
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

	// 2. Check if buyer already purchased this preset (same license = conflict,
	// different license = allowed upgrade path)
	const { data: existingPaidOrder } = await client
		.from("preset_orders")
		.select("id, order_number, payment_status, license_type")
		.eq("preset_id", presetId)
		.eq("buyer_id", buyerId)
		.eq("payment_status", "paid")
		.maybeSingle();

	const existingLicense = (
		existingPaidOrder as { license_type?: string } | null
	)?.license_type;
	if (existingPaidOrder && existingLicense === licenseType) {
		throw new ApiError({
			code: "conflict",
			message: "You have already purchased this preset.",
		});
	}

	// 2b. Resolve gross amount from the chosen license tier
	let grossAmount = preset.price ?? 0;
	if (licenseType === "commercial") {
		if ((preset.commercial_price ?? 0) <= 0) {
			throw new ApiError({
				code: "bad_request",
				message: "Lisensi komersial tidak ditawarkan untuk preset ini.",
			});
		}
		grossAmount = preset.commercial_price as number;
	}

	// 3. Compute 90:10 monetization split (5% of net to referrer, from platform share)
	const referrerId =
		params.referrerId &&
		params.referrerId !== buyerId &&
		params.referrerId !== preset.creator_id
			? params.referrerId
			: null;
	const payout = calculatePresetPayout({
		grossAmount,
		currency: preset.currency || "IDR",
		paymentProvider,
		hasReferrer: Boolean(referrerId),
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
			license_type: licenseType,
			referrer_id: referrerId,
			referrer_commission: payout.referrerCommissionAmount,
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
): Promise<{
	hasAccess: boolean;
	isPaid: boolean;
	price: number;
	license: "personal" | "commercial" | null;
}> {
	const { data: preset } = await client
		.from("presets")
		.select("creator_id, is_paid, price")
		.eq("id", presetId)
		.maybeSingle();

	if (!preset) {
		return { hasAccess: false, isPaid: false, price: 0, license: null };
	}

	const p = preset as { creator_id: string; is_paid?: boolean; price?: number };
	const isPaid = Boolean(p.is_paid && (p.price ?? 0) > 0);
	const price = p.price ?? 0;

	if (!isPaid) {
		return { hasAccess: true, isPaid: false, price: 0, license: null };
	}

	if (userId && p.creator_id === userId) {
		return { hasAccess: true, isPaid: true, price, license: null };
	}

	if (!userId) {
		return { hasAccess: false, isPaid: true, price, license: null };
	}

	try {
		const { data: order } = await client
			.from("preset_orders")
			.select("id, license_type")
			.eq("preset_id", presetId)
			.eq("buyer_id", userId)
			.eq("payment_status", "paid")
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		const license =
			(order as { license_type?: string } | null)?.license_type === "commercial"
				? ("commercial" as const)
				: order
					? ("personal" as const)
					: null;

		return {
			hasAccess: Boolean(order),
			isPaid: true,
			price,
			license,
		};
	} catch (error) {
		console.error("Failed to check user preset access:", error);
		// Fail-closed: never grant access on an unexpected database error.
		return {
			hasAccess: false,
			isPaid: true,
			price,
			license: null,
		};
	}
}

/**
 * Retrieves an order by its unique human-readable order number (e.g. AM-20260827-XXXX)
 */
export async function getOrderByOrderNumber(
	client: DalClient,
	orderNumber: string,
): Promise<PresetOrder | null> {
	const { data, error } = await client
		.from("preset_orders")
		.select("*, presets (id, title, slug, thumbnail_url)")
		.eq("order_number", orderNumber)
		.maybeSingle();

	if (error || !data) return null;
	return data as unknown as PresetOrder;
}

/**
 * Fulfills a paid order: marks paid, records payment reference, sends notifications to buyer and seller, and awards XP.
 */
export async function fulfillPaidOrder(
	client: DalClient,
	orderId: string,
	paymentReference?: string,
): Promise<PresetOrder> {
	const updated = await updateOrderStatus(
		client,
		orderId,
		"paid",
		paymentReference,
	);

	// Trigger notifications and XP asynchronously
	try {
		const { data: orderDetails } = await client
			.from("preset_orders")
			.select(
				"buyer_id, seller_id, preset_id, creator_payout_amount, presets (title)",
			)
			.eq("id", orderId)
			.maybeSingle();

		if (orderDetails) {
			const o = orderDetails as any;
			const presetTitle = o.presets?.title || "Preset";

			// 1. Notify buyer
			await createNotification(client, {
				userId: o.buyer_id,
				type: "system",
				presetId: o.preset_id,
				message: `Pembayaran sukses! Preset "${presetTitle}" sekarang dapat diunduh.`,
			});

			// 2. Notify seller
			await createNotification(client, {
				userId: o.seller_id,
				actorId: o.buyer_id,
				type: "download",
				presetId: o.preset_id,
				message: `Preset "${presetTitle}" kamu telah dibeli! Saldo Rp ${o.creator_payout_amount?.toLocaleString("id-ID")} berhasil ditambahkan.`,
			});

			// 3. Award XP to seller (+50 XP for selling a preset)
			await awardUserXp(client, o.seller_id, 50, "Preset sold");
		}
	} catch (e) {
		console.error("Failed to process post-payment order fulfillment:", e);
	}

	return updated;
}
