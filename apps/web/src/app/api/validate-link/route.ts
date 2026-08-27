import { enforceRateLimit } from "@/lib/api/rate-limit";
import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = [
	"alight.link",
	"am.link",
	"alightmotion.com",
	"alightcreative.com", // Alight Creative share links
	"drive.google.com",
	"dropbox.com",
	"mediafire.com",
	"github.com",
];

/**
 * Validates that a host does not point to loopback, private networks, or cloud metadata services.
 */
function isPrivateOrInternalHost(hostname: string): boolean {
	const h = hostname.toLowerCase().trim();

	if (
		h === "localhost" ||
		h.endsWith(".localhost") ||
		h.endsWith(".local") ||
		h.endsWith(".internal") ||
		h.endsWith(".lan") ||
		h === "0.0.0.0"
	) {
		return true;
	}

	// Check IPv4 ranges
	const ipv4Match = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (ipv4Match) {
		const [, a, b] = ipv4Match.map(Number);
		// 127.0.0.0/8 (loopback)
		if (a === 127 || a === 10 || a === 0) return true;
		// 172.16.0.0/12 (private)
		if (a === 172 && b >= 16 && b <= 31) return true;
		// 192.168.0.0/16 (private)
		if (a === 192 && b === 168) return true;
		// 169.254.0.0/16 (link-local & AWS/GCP/Azure cloud metadata)
		if (a === 169 && b === 254) return true;
		return false;
	}

	// Check IPv6 ranges
	const cleanIpv6 = h.replace(/^\[|\]$/g, "");
	if (
		cleanIpv6 === "::1" ||
		cleanIpv6 === "::" ||
		cleanIpv6.startsWith("fe80:") ||
		cleanIpv6.startsWith("fc") ||
		cleanIpv6.startsWith("fd")
	) {
		return true;
	}

	return false;
}

export async function POST(req: NextRequest) {
	try {
		// Rate limit to prevent using AMHUB as a proxy or DDoS reflector
		try {
			await enforceRateLimit({
				request: req,
				scope: "validate-link",
				limit: 30,
				windowMs: 60_000,
			});
		} catch {
			return NextResponse.json(
				{
					reachable: false,
					message: "Rate limit exceeded. Please try again later.",
				},
				{ status: 429 },
			);
		}

		const body = await req.json();
		const { url } = body;

		if (!url || typeof url !== "string") {
			return NextResponse.json(
				{ reachable: false, message: "URL is required." },
				{ status: 400 },
			);
		}

		let parsedUrl: URL;
		try {
			parsedUrl = new URL(url);
		} catch {
			return NextResponse.json(
				{ reachable: false, message: "Invalid URL syntax." },
				{ status: 400 },
			);
		}

		if (parsedUrl.protocol !== "https:") {
			return NextResponse.json(
				{ reachable: false, message: "URL must use HTTPS protocol." },
				{ status: 400 },
			);
		}

		// Disallow non-standard ports to prevent port scanning internal services
		if (parsedUrl.port && parsedUrl.port !== "443") {
			return NextResponse.json(
				{ reachable: false, message: "Non-standard ports are not allowed." },
				{ status: 400 },
			);
		}

		const hostname = parsedUrl.hostname.toLowerCase();

		// Prevent SSRF against loopback, private networks, and cloud instance metadata
		if (isPrivateOrInternalHost(hostname)) {
			return NextResponse.json(
				{
					reachable: false,
					message: "Access to private or internal addresses is forbidden.",
				},
				{ status: 403 },
			);
		}

		const isSupported = ALLOWED_DOMAINS.some(
			(d) => hostname === d || hostname.endsWith(`.${d}`),
		);

		if (!isSupported && !parsedUrl.pathname.toLowerCase().endsWith(".xml")) {
			return NextResponse.json(
				{
					reachable: false,
					message: `Unsupported domain "${hostname}". Only Alight Motion, Google Drive, Dropbox, Mediafire, and GitHub links are supported.`,
				},
				{ status: 400 },
			);
		}

		// Lightweight HEAD/GET fetch with 3.5s timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3500);

		try {
			const res = await fetch(url, {
				method: "HEAD",
				signal: controller.signal,
				headers: {
					"User-Agent": "AMHUB-LinkValidator/1.0",
				},
			});
			clearTimeout(timeoutId);

			if (res.ok || res.status === 301 || res.status === 302) {
				return NextResponse.json({
					reachable: true,
					status: res.status,
					message: "Link reachable and supported",
				});
			}

			if (res.status === 404) {
				return NextResponse.json({
					reachable: false,
					status: 404,
					message:
						"Link returned 404 Not Found. The preset link may have expired.",
				});
			}

			if (res.status === 403) {
				return NextResponse.json({
					reachable: false,
					status: 403,
					message:
						"Link returned 403 Forbidden. Access to this preset link is restricted.",
				});
			}

			return NextResponse.json({
				reachable: false,
				status: res.status,
				message: `Link returned HTTP error status ${res.status}.`,
			});
		} catch (fetchErr: unknown) {
			clearTimeout(timeoutId);
			if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
				return NextResponse.json({
					reachable: false,
					message: "Network request timed out. Could not reach server.",
				});
			}
			// Many shortener/drive links block HEAD, try lightweight GET fallback with Range request & timeout
			const getController = new AbortController();
			const getTimeoutId = setTimeout(() => getController.abort(), 3000);
			try {
				const getRes = await fetch(url, {
					method: "GET",
					signal: getController.signal,
					headers: {
						"User-Agent": "AMHUB-LinkValidator/1.0",
						Range: "bytes=0-1024",
					},
				});
				clearTimeout(getTimeoutId);
				if (
					getRes.ok ||
					getRes.status === 206 ||
					getRes.status === 301 ||
					getRes.status === 302
				) {
					return NextResponse.json({
						reachable: true,
						status: getRes.status,
						message: "Link reachable",
					});
				}
			} catch {
				clearTimeout(getTimeoutId);
			}

			return NextResponse.json({
				reachable: true, // Allow valid format if client network is restricted
				status: 200,
				message: "Valid URL format",
			});
		}
	} catch (e: unknown) {
		return NextResponse.json(
			{
				reachable: false,
				message: e instanceof Error ? e.message : "Validation failed.",
			},
			{ status: 500 },
		);
	}
}
