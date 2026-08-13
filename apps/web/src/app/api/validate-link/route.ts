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

export async function POST(req: NextRequest) {
	try {
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

		const hostname = parsedUrl.hostname.toLowerCase();
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

		// Lightweight HEAD/GET fetch with 4s timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 4000);

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
			// Many shortener/drive links block HEAD, try lightweight GET fallback
			try {
				const getRes = await fetch(url, {
					method: "GET",
					headers: { "User-Agent": "AMHUB-LinkValidator/1.0" },
				});
				if (getRes.ok || getRes.status === 301 || getRes.status === 302) {
					return NextResponse.json({
						reachable: true,
						status: getRes.status,
						message: "Link reachable",
					});
				}
			} catch {
				// Fallthrough
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
