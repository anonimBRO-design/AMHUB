import { incrementPresetView } from "@/dal/presets.dal";
import { getApiUser } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
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

		// Jangan tambahkan view jika user adalah guest / incognito (belum login)
		const authContext = await getApiUser();
		if (!authContext?.user?.id) {
			return apiResponse({
				success: false,
				preset_id: presetId,
				message: "Guest and incognito views are not counted.",
			});
		}

		const newCount = await incrementPresetView(
			authContext.supabase,
			presetId,
		);

		return apiResponse({
			success: true,
			preset_id: presetId,
			view_count: newCount,
		});
	} catch (error) {
		return apiErrorResponse(error);
	}
}

