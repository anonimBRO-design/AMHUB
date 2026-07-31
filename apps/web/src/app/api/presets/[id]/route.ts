import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRouteParams } from "@/lib/api/validation";
import { apiResponse, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPresetById } from "@/dal/presets.dal";

const routeParamsSchema = z.object({
    id: z.string().uuid(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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
