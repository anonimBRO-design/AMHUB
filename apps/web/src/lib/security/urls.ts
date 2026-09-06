import { ApiError } from "@/lib/api/errors";

const MAX_URL_LENGTH = 2048;

const PRIVATE_HOST_PATTERNS: { pattern: RegExp; label: string }[] = [
	{ pattern: /^localhost$/i, label: "localhost" },
	{ pattern: /\.local$/i, label: ".local" },
	{ pattern: /\.internal$/i, label: ".internal" },
	{ pattern: /^127\./, label: "loopback (127/8)" },
	{ pattern: /^10\./, label: "private (10/8)" },
	{ pattern: /^192\.168\./, label: "private (192.168/16)" },
	{ pattern: /^172\.(1[6-9]|2\d|3[01])\./, label: "private (172.16/12)" },
	{ pattern: /^169\.254\./, label: "link-local (169.254/16)" },
	{ pattern: /^0\./, label: "unspecified (0/8)" },
	{
		pattern: /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
		label: "CGNAT (100.64/10)",
	},
	{ pattern: /^\[?::1\]?$/, label: "IPv6 loopback" },
	{ pattern: /^\[?[fF][cCdD]/, label: "IPv6 ULA (fc00::/7)" },
	{ pattern: /^\[?[fF][eE]8/, label: "IPv6 link-local (fe80::/10)" },
];

function hostIsPrivate(hostname: string): string | null {
	const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
	const hit = PRIVATE_HOST_PATTERNS.find((entry) =>
		entry.pattern.test(normalized),
	);
	return hit?.label ?? null;
}

/**
 * Conservative, static URL safety check used before persisting any user-supplied
 * external URL (am_link / thumbnail / preview). Rejects non-HTTPS, embedded
 * credentials, non-default ports, and literal private/loopback/link-local hosts.
 *
 * Note: DNS names that resolve to private ranges are NOT resolved here (kept
 * server-SSRF-free). am_link is never fetched server-side after this check.
 */
export function assertSafeExternalUrl(
	input: string,
	fieldLabel = "URL",
): string {
	const trimmed = input.trim();
	if (!trimmed) {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} tidak boleh kosong.`,
		});
	}
	if (trimmed.length > MAX_URL_LENGTH) {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} terlalu panjang (maksimum ${MAX_URL_LENGTH} karakter).`,
		});
	}

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} format tidak valid.`,
		});
	}

	if (parsed.protocol !== "https:") {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} harus menggunakan HTTPS.`,
		});
	}

	const { hostname, port, username, password } = parsed;
	if (username || password) {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} tidak boleh menyertakan kredensial.`,
		});
	}

	if (port && port !== "443") {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} hanya mengizinkan port standar (443).`,
		});
	}

	const privateHit = hostIsPrivate(hostname);
	if (privateHit) {
		throw new ApiError({
			code: "bad_request",
			message: `${fieldLabel} menunjuk ke host privat (${privateHit}).`,
		});
	}

	return trimmed;
}
