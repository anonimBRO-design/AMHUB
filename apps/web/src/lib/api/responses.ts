import type { ApiMeta, ApiResponse } from "@presethub/types";
import { NextResponse } from "next/server";
import { type ApiError, toApiError } from "./errors";

export interface ApiResponseInit extends ResponseInit {
	meta?: ApiMeta;
	requestId?: string;
}

export function apiResponse<T>(
	data: T,
	{ meta, requestId, status = 200, ...init }: ApiResponseInit = {},
) {
	const body = {
		data,
		error: null,
		meta: {
			...meta,
			requestId: requestId ?? meta?.requestId,
		},
	} satisfies ApiResponse<T>;

	return NextResponse.json(body, { ...init, status });
}

export function apiCreated<T>(data: T, init?: ApiResponseInit) {
	return apiResponse(data, { ...init, status: 201 });
}

export function apiNoContent(init?: ResponseInit) {
	return new NextResponse(null, { ...init, status: 204 });
}

export function apiErrorResponse(error: unknown, init: ApiResponseInit = {}) {
	const apiError: ApiError = toApiError(error);
	const body = {
		data: null,
		error: apiError.toBody(init.requestId ?? init.meta?.requestId),
		meta: init.meta,
	} satisfies ApiResponse<never>;

	return NextResponse.json(body, {
		...init,
		status: init.status ?? apiError.status,
	});
}
