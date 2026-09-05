import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import type { NextRequest } from "next/server";

/**
 * Affiliate stats for the logged-in user: paid orders attributed
 * via their referral link + total commission earned.
 */
export async function GET(_request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();

		const { data, error } = await supabase
			.from("preset_orders")
			.select("referrer_commission")
			.eq("referrer_id", profile.id)
			.eq("payment_status", "paid")
			.limit(5000);

		if (error) throw error;

		const rows = (data ?? []) as { referrer_commission?: number | string }[];
		const totalCommission = rows.reduce(
			(sum, r) => sum + (Number(r.referrer_commission) || 0),
			0,
		);

		return apiResponse({
			totalReferrals: rows.length,
			totalCommission,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
