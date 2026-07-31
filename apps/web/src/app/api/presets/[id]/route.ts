import { NextRequest } from "next/server";
import { z } from "zod";
import { validateRouteParams } from "@/lib/api/validation";
import { apiResponse, apiErrorResponse } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";

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

        const { data: preset, error } = await supabase
            .from("presets")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            // PGRST116: Result contains 0 rows (Supabase empty result)
            if (error.code === "PGRST116") {
                throw new ApiError({ code: "not_found" });
            }
            throw error;
        }

        return apiResponse(preset);
    } catch (error) {
        return apiErrorResponse(error);
    }
}
