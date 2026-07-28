export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ApiLogContext {
	requestId?: string;
	method?: string;
	path?: string;
	userId?: string;
	route?: string;
	metadata?: Record<string, unknown>;
}

export function createRequestId() {
	return crypto.randomUUID();
}

export function getRequestContext(
	request: Request,
	context: Omit<ApiLogContext, "method" | "path"> = {},
): ApiLogContext {
	const url = new URL(request.url);

	return {
		...context,
		method: request.method,
		path: url.pathname,
	};
}

export function logApiEvent(
	level: LogLevel,
	message: string,
	context: ApiLogContext = {},
) {
	if (level === "debug" && process.env.NODE_ENV === "production") {
		return;
	}

	const payload = {
		level,
		message,
		timestamp: new Date().toISOString(),
		...context,
	};

	if (level === "error") {
		console.error(payload);
		return;
	}

	if (level === "warn") {
		console.warn(payload);
		return;
	}

	console.info(payload);
}

export const apiLogger = {
	debug: (message: string, context?: ApiLogContext) =>
		logApiEvent("debug", message, context),
	info: (message: string, context?: ApiLogContext) =>
		logApiEvent("info", message, context),
	warn: (message: string, context?: ApiLogContext) =>
		logApiEvent("warn", message, context),
	error: (message: string, context?: ApiLogContext) =>
		logApiEvent("error", message, context),
};
