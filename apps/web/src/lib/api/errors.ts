import type { ApiErrorBody, ApiErrorCode } from "@presethub/types";
import { ZodError } from "zod";

const statusByCode: Record<ApiErrorCode, number> = {
	bad_request: 400,
	unauthorized: 401,
	forbidden: 403,
	not_found: 404,
	conflict: 409,
	unprocessable_entity: 422,
	rate_limited: 429,
	payload_too_large: 413,
	unsupported_media_type: 415,
	internal_server_error: 500,
};

const defaultMessageByCode: Record<ApiErrorCode, string> = {
	bad_request: "The request could not be processed.",
	unauthorized: "Authentication is required.",
	forbidden: "You do not have permission to perform this action.",
	not_found: "The requested resource was not found.",
	conflict: "The request conflicts with the current resource state.",
	unprocessable_entity: "The request payload failed validation.",
	rate_limited: "Too many requests. Please try again later.",
	payload_too_large: "The uploaded file is too large.",
	unsupported_media_type: "The uploaded file type is not supported.",
	internal_server_error: "An unexpected error occurred.",
};

export interface ApiErrorOptions {
	code: ApiErrorCode;
	message?: string;
	status?: number;
	details?: unknown;
	cause?: unknown;
}

export class ApiError extends Error {
	readonly code: ApiErrorCode;
	readonly status: number;
	readonly details?: unknown;

	constructor({
		code,
		message = defaultMessageByCode[code],
		status = statusByCode[code],
		details,
		cause,
	}: ApiErrorOptions) {
		super(message, { cause });
		this.name = "ApiError";
		this.code = code;
		this.status = status;
		this.details = details;
	}

	toBody(requestId?: string): ApiErrorBody {
		return {
			code: this.code,
			message: this.message,
			details: this.details,
			requestId,
		};
	}
}

export const isApiError = (error: unknown): error is ApiError =>
	error instanceof ApiError;

export const createApiError = (options: ApiErrorOptions) =>
	new ApiError(options);

export function validationError(error: ZodError): ApiError {
	return new ApiError({
		code: "unprocessable_entity",
		details: error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
			code: issue.code,
		})),
	});
}

export function toApiError(error: unknown): ApiError {
	if (isApiError(error)) {
		return error;
	}

	if (error instanceof ZodError) {
		return validationError(error);
	}

	if (error instanceof SyntaxError) {
		return new ApiError({
			code: "bad_request",
			message: "Request body contains invalid JSON.",
			cause: error,
		});
	}

	return new ApiError({
		code: "internal_server_error",
		cause: error,
	});
}

export const apiErrorStatus = (code: ApiErrorCode) => statusByCode[code];
