import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

// Fallback salt if APP_SECRET / HASH_SALT is not configured in env
const DEFAULT_SALT = "amhub-anti-abuse-secure-salt-2026";

/**
 * Extracts the real client IP address from standard proxy/CDN headers.
 * Handles Cloudflare (cf-connecting-ip), standard reverse proxies (x-forwarded-for),
 * and direct connections.
 */
export function getClientIp(request: NextRequest): string {
	const cfIp = request.headers.get("cf-connecting-ip");
	if (cfIp) return cfIp.trim();

	const xForwardedFor = request.headers.get("x-forwarded-for");
	if (xForwardedFor) {
		// First IP in comma-separated list is the client
		const parts = xForwardedFor.split(",");
		if (parts[0]) return parts[0].trim();
	}

	const xRealIp = request.headers.get("x-real-ip");
	if (xRealIp) return xRealIp.trim();

	return "127.0.0.1";
}

/**
 * Generates a one-way HMAC-SHA256 hash of an IP address.
 * Never stores or exposes raw client IPs to the database or public clients.
 *
 * Salt resolution: explicit salt > IP_HASH_SALT env > static default.
 * NOTE: SUPABASE_SERVICE_ROLE_KEY must NOT be used here — reusing the database
 * service key as a hashing salt weakens it and links hashes to credentials.
 */
export function hashIp(ip: string, customSalt?: string): string {
	const salt = customSalt || process.env.IP_HASH_SALT || DEFAULT_SALT;
	return createHmac("sha256", salt).update(ip.trim()).digest("hex");
}

/**
 * Hashes client User-Agent header for supplementary fingerprinting.
 */
export function hashUserAgent(userAgent: string | null): string | null {
	if (!userAgent) return null;
	const salt = process.env.IP_HASH_SALT || DEFAULT_SALT;
	return createHmac("sha256", salt)
		.update(userAgent.trim())
		.digest("hex")
		.slice(0, 32);
}
