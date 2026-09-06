import { ApiError } from "@/lib/api/errors";
import type {
	CreatorWithdrawal,
	WithdrawalPaymentMethod,
} from "@presethub/types";
import type { DalClient } from "./types";

export interface CreatorBalance {
	totalEarnings: number;
	totalWithdrawn: number;
	availableBalance: number;
	currency: string;
}

export interface RequestWithdrawalParams {
	creatorId: string;
	amount: number;
	paymentMethod: WithdrawalPaymentMethod;
	accountName: string;
	accountNumber: string;
}

/**
 * Calculates a creator's current financial balance based on paid orders and active withdrawals.
 */
export async function getCreatorBalance(
	client: DalClient,
	creatorId: string,
): Promise<CreatorBalance> {
	// 1. Fetch total earnings from paid orders where this creator is the seller
	const { data: paidOrders, error: ordersError } = await client
		.from("preset_orders")
		.select("creator_payout_amount")
		.eq("seller_id", creatorId)
		.eq("payment_status", "paid");

	if (ordersError) {
		console.error("Failed to query creator orders for balance:", ordersError);
		throw new ApiError({
			code: "internal_server_error",
			message: "Could not calculate creator earnings.",
		});
	}

	const totalEarnings = (paidOrders ?? []).reduce(
		(sum, order) =>
			sum +
			Number(
				(order as { creator_payout_amount?: number }).creator_payout_amount ??
					0,
			),
		0,
	);

	// 2. Fetch total withdrawals (pending, processing, completed)
	let totalWithdrawn = 0;
	try {
		const { data: withdrawals, error: withdrawError } = await client
			.from("creator_withdrawals")
			.select("amount, status")
			.eq("creator_id", creatorId)
			.in("status", ["pending", "processing", "completed"]);

		if (withdrawError) {
			console.warn("Creator withdrawals table query warning:", withdrawError);
		} else {
			totalWithdrawn = (withdrawals ?? []).reduce(
				(sum, w) => sum + Number((w as { amount?: number }).amount ?? 0),
				0,
			);
		}
	} catch {
		// Table might not exist if migration hasn't run yet in dev
		console.warn("Creator withdrawals table not found.");
	}

	const availableBalance = Math.max(
		0,
		Number((totalEarnings - totalWithdrawn).toFixed(2)),
	);

	return {
		totalEarnings: Number(totalEarnings.toFixed(2)),
		totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
		availableBalance,
		currency: "IDR",
	};
}

/**
 * Fetches historical withdrawal requests for a creator.
 */
export async function listCreatorWithdrawals(
	client: DalClient,
	creatorId: string,
): Promise<CreatorWithdrawal[]> {
	try {
		const { data, error } = await client
			.from("creator_withdrawals")
			.select("*")
			.eq("creator_id", creatorId)
			.order("created_at", { ascending: false });

		if (error) {
			console.warn("Failed to fetch creator withdrawals:", error);
			return [];
		}

		return (data ?? []) as unknown as CreatorWithdrawal[];
	} catch {
		return [];
	}
}

/**
 * Submits a new withdrawal request after validating minimum amount and available balance.
 */
export async function requestCreatorWithdrawal(
	client: DalClient,
	params: RequestWithdrawalParams,
): Promise<CreatorWithdrawal> {
	const { creatorId, amount, paymentMethod, accountName, accountNumber } =
		params;

	// 1. Minimum withdrawal validation
	if (amount < 20000) {
		throw new ApiError({
			code: "bad_request",
			message: "Minimum penarikan saldo adalah Rp 20.000.",
		});
	}

	// 2. Balance validation
	const balance = await getCreatorBalance(client, creatorId);
	if (amount > balance.availableBalance) {
		throw new ApiError({
			code: "bad_request",
			message: `Saldo tidak mencukupi. Saldo tersedia: Rp ${balance.availableBalance.toLocaleString("id-ID")}`,
		});
	}

	// 3. Insert withdrawal request
	const { data: created, error } = await client
		.from("creator_withdrawals")
		.insert({
			creator_id: creatorId,
			amount,
			payment_method: paymentMethod,
			account_name: accountName.trim(),
			account_number: accountNumber.trim(),
			status: "pending",
		} as never)
		.select("*")
		.single();

	if (error || !created) {
		console.error("Failed to create withdrawal request:", error);
		throw new ApiError({
			code: "internal_server_error",
			message: "Gagal memproses pengajuan penarikan dana.",
		});
	}

	return created as unknown as CreatorWithdrawal;
}
