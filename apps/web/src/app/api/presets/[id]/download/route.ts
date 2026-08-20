import { recordPresetDownload } from "@/dal/downloads.dal";
import { checkUserPresetAccess } from "@/dal/orders.dal";
import { parseStoragePath } from "@/dal/presets.dal";
import { getClientIp, hashIp, hashUserAgent } from "@/lib/anti-abuse/ip-hash";
import { getApiUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { apiErrorResponse, apiResponse } from "@/lib/api/responses";
import { validateRouteParams } from "@/lib/api/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/supabase/storage";
import type { PresetDownloadResponse } from "@presethub/types";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: presetId } = validateRouteParams(
			await params,
			routeParamsSchema,
		);
		const supabase = await createSupabaseServerClient();
		const authContext = await getApiUser();
		const currentUserId = authContext?.user?.id || null;

		// 1. Rate Limit download attempts (max 60 download events per minute)
		await enforceRateLimit({
			request,
			scope: "preset:download",
			limit: 60,
			windowMs: 60000,
			userId: currentUserId || undefined,
		});

		// 2. Access control: Check if preset is paid and if user has access
		const access = await checkUserPresetAccess(
			supabase,
			presetId,
			currentUserId,
		);
		if (!access.hasAccess) {
			throw new ApiError({
				code: "forbidden",
				message: "This is a paid preset. Please purchase it to download.",
				details: { is_paid: true, price: access.price },
			});
		}

		// 3. Extract or generate anonymous token for guest tracking
		let anonymousToken: string | null = null;
		try {
			const body = await request.json().catch(() => null);
			if (body && typeof body === "object" && "anonymous_token" in body) {
				anonymousToken = String(body.anonymous_token);
			}
		} catch {
			// Body is optional
		}

		if (!anonymousToken) {
			anonymousToken =
				request.headers.get("x-anonymous-token") ||
				request.cookies.get("am_anon_token")?.value ||
				null;
		}

		// 4. Client network identifiers (never stored as raw IP)
		const clientIp = getClientIp(request);
		const ipHash = hashIp(clientIp);
		const userAgentHash = hashUserAgent(request.headers.get("user-agent"));

		// 5. Atomic multi-layer unique download recording
		const { data: presetDataRaw } = await supabase
			.from("presets")
			.select("file_url, am_link")
			.eq("id", presetId)
			.maybeSingle();
		const presetData = presetDataRaw as unknown as {
			file_url: string | null;
			am_link: string | null;
		} | null;

		let downloadUrl: string | undefined = undefined;
		if (presetData?.file_url) {
			const parsed = parseStoragePath(presetData.file_url);
			if (parsed) {
				try {
					downloadUrl = await createSignedDownloadUrl(parsed.path);
				} catch (e) {
					console.error("Failed to generate signed download URL", e);
				}
			} else {
				downloadUrl = presetData.file_url;
			}
		} else if (presetData?.am_link) {
			downloadUrl = presetData.am_link;
		}

		const downloadResult = await recordPresetDownload(supabase, {
			presetId,
			userId: currentUserId,
			anonymousToken,
			ipHash,
			userAgentHash,
			dedupWindowHours: 6,
		});

		const responseData: PresetDownloadResponse = {
			success: true,
			preset_id: presetId,
			is_unique: downloadResult.isUnique,
			total_downloads: downloadResult.totalDownloads,
			unique_downloads: downloadResult.uniqueDownloads,
			download_url: downloadUrl,
			anonymous_token: anonymousToken || undefined,
		};

		return apiResponse(responseData);
	} catch (error) {
		return apiErrorResponse(error);
	}
}
