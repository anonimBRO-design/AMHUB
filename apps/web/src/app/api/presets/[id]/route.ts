import {
	deletePresetByOwner,
	getPresetById,
	updatePresetByOwner,
} from "@/dal/presets.dal";
import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateJson, validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

const updatePresetSchema = z.object({
	title: z.string().min(1).max(100).optional(),
	description: z.string().max(2000).optional(),
	category: z.string().optional(),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
	tags: z.array(z.string()).max(10).optional(),
	style: z.array(z.string()).max(10).optional(),
	status: z.enum(["pending", "published", "rejected", "removed"]).optional(),
	price: z.number().min(0).max(10000000).optional(),
	is_paid: z.boolean().optional(),
	currency: z.string().optional(),
});

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const supabase = await createSupabaseServerClient();

		const preset = await getPresetById(supabase, id);

		return apiResponse(preset);
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
		const body = await validateJson(request, updatePresetSchema);

		const updated = await updatePresetByOwner(supabase, profile.id, id, body);

		return apiResponse(updated);
	} catch (error) {
		return apiErrorResponse(error);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = validateRouteParams(await params, routeParamsSchema);
		const { supabase, profile } = await requireApiProfile();

		const result = await deletePresetByOwner(supabase, profile.id, id);

		return apiResponse(result);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
