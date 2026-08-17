import { incrementPresetView } from "@/dal/presets.dal";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: presetId } = validateRouteParams(
			await params,
			routeParamsSchema,
		);
		const supabase = await createSupabaseServerClient();
		const newCount = await incrementPresetView(supabase, presetId);

		return apiResponse({
			success: true,
			preset_id: presetId,
			view_count: newCount,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}
