import { getPresetById } from "@/dal/presets.dal";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function GET(
	request: NextRequest,
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
