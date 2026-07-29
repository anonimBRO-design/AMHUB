import { ApiError } from "./errors";

export interface RateLimitOptions {
	key: string;
	limit: number;
	windowMs: number;
	store?: RateLimitStore;
	now?: number;
}

export interface RateLimitResult {
	allowed: boolean;
	limit: number;
	remaining: number;
	resetAt: Date;
	retryAfter?: number;
}

export interface RateLimitRecord {
	count: number;
	resetAt: number;
}

export interface RateLimitStore {
	increment(
		key: string,
		windowMs: number,
		now: number,
	): Promise<RateLimitRecord>;
}

export interface RouteRateLimitOptions {
	request: Request;
	scope: string;
	limit: number;
	windowMs: number;
	userId?: string;
	store?: RateLimitStore;
	now?: number;
}

class MemoryRateLimitStore implements RateLimitStore {
	private readonly records = new Map<string, RateLimitRecord>();

	async increment(
		key: string,
		windowMs: number,
		now: number,
	): Promise<RateLimitRecord> {
		const existing = this.records.get(key);

		if (!existing || existing.resetAt <= now) {
			const record = { count: 1, resetAt: now + windowMs };
			this.records.set(key, record);
			this.cleanup(now);
			return record;
		}

		const record = { ...existing, count: existing.count + 1 };
		this.records.set(key, record);
		return record;
	}

	private cleanup(now: number) {
		for (const [key, record] of this.records.entries()) {
			if (record.resetAt <= now) {
				this.records.delete(key);
			}
		}
	}
}

const globalRateLimitStore = new MemoryRateLimitStore();

export async function checkRateLimit({
	key,
	limit,
	windowMs,
	store = globalRateLimitStore,
	now = Date.now(),
}: RateLimitOptions): Promise<RateLimitResult> {
	const record = await store.increment(key, windowMs, now);
	const remaining = Math.max(limit - record.count, 0);
	const allowed = record.count <= limit;
	const retryAfter = allowed
		? undefined
		: Math.ceil((record.resetAt - now) / 1000);

	return {
		allowed,
		limit,
		remaining,
		resetAt: new Date(record.resetAt),
		retryAfter,
	};
}

export function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for");

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() || "unknown";
	}

	return (
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-real-ip") ??
		"unknown"
	);
}

export function createRateLimitKey({
	request,
	scope,
	userId,
}: Pick<RouteRateLimitOptions, "request" | "scope" | "userId">): string {
	const identity = userId ? `user:${userId}` : `ip:${getClientIp(request)}`;

	return `${scope}:${identity}`;
}

export async function enforceRateLimit({
	request,
	scope,
	limit,
	windowMs,
	userId,
	store,
	now,
}: RouteRateLimitOptions): Promise<RateLimitResult> {
	const result = await checkRateLimit({
		key: createRateLimitKey({ request, scope, userId }),
		limit,
		windowMs,
		store,
		now,
	});

	if (!result.allowed) {
		throw new ApiError({
			code: "rate_limited",
			details: {
				limit: result.limit,
				remaining: result.remaining,
				resetAt: result.resetAt.toISOString(),
				retryAfter: result.retryAfter,
			},
		});
	}

	return result;
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
	return {
		"RateLimit-Limit": String(result.limit),
		"RateLimit-Remaining": String(result.remaining),
		"RateLimit-Reset": String(Math.ceil(result.resetAt.getTime() / 1000)),
		...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
	};
}
