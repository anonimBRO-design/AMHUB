import { requireApiProfile } from "@/lib/api/auth";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { storageBuckets } from "@/lib/supabase/storage";
import type { NextRequest } from "next/server";
import { z } from "zod";

const deleteUploadSchema = z.object({
	bucket: z.string(),
	path: z.string(),
});

export async function POST(request: NextRequest) {
	try {
		const { supabase, profile } = await requireApiProfile();
		const body = await request.json();
		const { bucket, path } = deleteUploadSchema.parse(body);

		// Verify bucket is allowed
		const bucketValues = Object.values(storageBuckets) as string[];
		if (!bucketValues.includes(bucket)) {
			return apiErrorResponse(new Error("Invalid bucket"));
		}

		// Ensure the user owns the file (Supabase RLS should handle this,
		// but let's be explicit if needed). Actually RLS in supabase/migrations/20260728000000_database_foundation.sql
		// already has policies for storage.objects for delete, which use auth.uid().
		// So we just need to use the user's client.

		const { error } = await supabase.storage.from(bucket).remove([path]);

		if (error) {
			throw error;
		}

		return apiResponse({ success: true });
	} catch (error) {
		return apiErrorResponse(error);
	}
}
