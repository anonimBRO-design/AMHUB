import {
	getCreatorBalance,
	listCreatorWithdrawals,
	requestCreatorWithdrawal,
} from "@/dal/withdrawals.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiCreated, apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson } from "@/lib/api/validation";
import type { WithdrawalPaymentMethod } from "@presethub/types";
import type { NextRequest } from "next/server";
import { z } from "zod";

const createWithdrawalSchema = z.object({
	amount: z.coerce
		.number()
		.int()
		.min(20000, "Minimum penarikan adalah Rp 20.000"),
	payment_method: z.enum([
		"dana",
		"gopay",
		"ovo",
		"bca",
		"bri",
		"mandiri",
	] as const),
	account_name: z
		.string()
		.trim()
		.min(2, "Nama akun/rekening tidak valid")
		.max(100),
	account_number: z
		.string()
		.trim()
		.min(5, "Nomor akun/rekening minimal 5 digit")
		.max(30),
});

export async function GET(_request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();

		const [balance, withdrawals] = await Promise.all([
			getCreatorBalance(supabase, profile.id),
			listCreatorWithdrawals(supabase, profile.id),
		]);

		return apiResponse({
			balance,
			withdrawals,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();

		await enforceRateLimit({
			request,
			scope: "withdrawals:create",
			limit: 5,
			windowMs: 60_000,
			userId: profile.id,
		});

		const body = await validateJson(request, createWithdrawalSchema);

		const created = await requestCreatorWithdrawal(supabase, {
			creatorId: profile.id,
			amount: body.amount,
			paymentMethod: body.payment_method as WithdrawalPaymentMethod,
			accountName: body.account_name,
			accountNumber: body.account_number,
		});

		return apiCreated(created);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
