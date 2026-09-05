/**
 * AMHUB Monetization & Payout Calculation Engine.
 *
 * Implements the 90:10 Net Revenue Split model:
 * 1. Gross payment
 * 2. Deduct payment processor fee (e.g. Midtrans/Xendit QRIS / E-Wallet)
 * 3. Calculate Net Amount
 * 4. Creator receives 90% of Net Amount
 * 5. AMHUB receives 10% of Net Amount
 */

export interface PayoutCalculationInput {
	grossAmount: number;
	currency?: string;
	paymentProvider?: "qris" | "ewallet" | "va" | "manual" | string;
	customProcessorFee?: number;
	/** Affiliate referrer present: 5% of net goes to referrer (from platform share) */
	hasReferrer?: boolean;
}

export interface PayoutCalculationResult {
	grossAmount: number;
	currency: string;
	processorFee: number;
	netAmount: number;
	creatorPayoutAmount: number; // 90% of net
	platformFeeAmount: number; // 10% of net (minus referrer share)
	referrerCommissionAmount: number; // 5% of net when referred, else 0
	creatorPercentage: number; // 90
	platformPercentage: number; // 10
}

/** Affiliate commission: 5% of net, deducted from the platform share */
export const AFFILIATE_COMMISSION_RATE = 0.05;

/**
 * Standard Indonesian Payment Gateway Fee structures (Midtrans/Xendit reference)
 */
export const PAYMENT_FEE_RATES: Record<
	string,
	{ percent: number; fixed: number; minFee: number }
> = {
	qris: { percent: 0.007, fixed: 0, minFee: 0 }, // QRIS 0.7%
	ewallet: { percent: 0.015, fixed: 0, minFee: 0 }, // E-wallet ~1.5%
	va: { percent: 0, fixed: 4000, minFee: 4000 }, // Virtual Account Rp 4.000 flat
	manual: { percent: 0, fixed: 0, minFee: 0 }, // Internal / direct testing
};

/**
 * Calculates processor fee based on provider rate rules.
 */
export function calculateProcessorFee(
	grossAmount: number,
	provider = "qris",
	customFee?: number,
): number {
	if (grossAmount <= 0) return 0;
	if (typeof customFee === "number" && customFee >= 0) return customFee;

	const rate =
		PAYMENT_FEE_RATES[provider.toLowerCase()] || PAYMENT_FEE_RATES.qris;
	const fee = grossAmount * rate.percent + rate.fixed;
	const finalFee = Math.max(rate.minFee, fee);

	return Number(finalFee.toFixed(2));
}

/**
 * Calculates the complete 90:10 monetization split for a given order amount.
 */
export function calculatePresetPayout(
	input: PayoutCalculationInput,
): PayoutCalculationResult {
	const grossAmount = Math.max(0, Number(input.grossAmount || 0));
	const currency = input.currency || "IDR";

	if (grossAmount === 0) {
		return {
			grossAmount: 0,
			currency,
			processorFee: 0,
			netAmount: 0,
			creatorPayoutAmount: 0,
			platformFeeAmount: 0,
			referrerCommissionAmount: 0,
			creatorPercentage: 90,
			platformPercentage: 10,
		};
	}

	const processorFee = calculateProcessorFee(
		grossAmount,
		input.paymentProvider || "qris",
		input.customProcessorFee,
	);

	const netAmount = Math.max(
		0,
		Number((grossAmount - processorFee).toFixed(2)),
	);

	// 90% Creator / 10% Platform split
	const creatorPayoutAmount = Number((netAmount * 0.9).toFixed(2));
	// Affiliate referrer takes 5% of net from the platform share
	const referrerCommissionAmount = input.hasReferrer
		? Number((netAmount * AFFILIATE_COMMISSION_RATE).toFixed(2))
		: 0;
	// Ensure platform gets the exact remainder to prevent 1-cent discrepancy
	const platformFeeAmount = Number(
		(netAmount - creatorPayoutAmount - referrerCommissionAmount).toFixed(2),
	);

	return {
		grossAmount,
		currency,
		processorFee,
		netAmount,
		creatorPayoutAmount,
		platformFeeAmount,
		referrerCommissionAmount,
		creatorPercentage: 90,
		platformPercentage: 10,
	};
}
