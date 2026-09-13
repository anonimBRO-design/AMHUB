export interface ParsedPresetMetadata {
	soundTitle: string | null;
	tiktokUrl: string | null;
	sultanPackUrl: string | null;
	socialLockEnabled: boolean;
	cleanDescription: string;
}

/**
 * Parses embedded creator metadata from preset description and tags safely.
 * Allows creators to specify sound title, TikTok sound link, Sultan Pack link,
 * and Social Lock preferences without requiring breaking DB schema changes.
 */
export function parsePresetMetadata(
	description?: string | null,
	tags: string[] = [],
): ParsedPresetMetadata {
	let soundTitle: string | null = null;
	let tiktokUrl: string | null = null;
	let sultanPackUrl: string | null = null;
	let socialLockEnabled = true;

	if (tags.includes("no-social-lock") || tags.includes("social_lock:off")) {
		socialLockEnabled = false;
	}

	let cleanDesc = description || "";

	if (cleanDesc.includes("<!-- amhub:no-social-lock -->")) {
		socialLockEnabled = false;
		cleanDesc = cleanDesc.replace("<!-- amhub:no-social-lock -->", "").trim();
	}

	// Extract Sound Title: "🎵 Sound: ..." or "Soundtrack: ..."
	const soundMatch = cleanDesc.match(
		/(?:🎵\s*Sound|Soundtrack|Sound\s*TikTok)\s*:\s*([^\n\r]+)/i,
	);
	if (soundMatch && soundMatch[1]) {
		soundTitle = soundMatch[1].trim();
	}

	// Extract TikTok URL: "https://vt.tiktok.com/..." or "https://www.tiktok.com/..."
	const tiktokMatch = cleanDesc.match(
		/(https?:\/\/(?:vt\.|www\.)?tiktok\.com\/[^\s\n\r]+)/i,
	);
	if (tiktokMatch && tiktokMatch[1]) {
		tiktokUrl = tiktokMatch[1].trim();
	}

	// Extract Sultan Pack URL: "💎 Paket Sultan: https://..."
	const sultanMatch = cleanDesc.match(
		/(?:💎\s*Paket\s*Sultan|Asset\s*Pack|Mentahan\s*Full)\s*:\s*(https?:\/\/[^\s\n\r]+)/i,
	);
	if (sultanMatch && sultanMatch[1]) {
		sultanPackUrl = sultanMatch[1].trim();
	}

	return {
		soundTitle,
		tiktokUrl,
		sultanPackUrl,
		socialLockEnabled,
		cleanDescription: cleanDesc,
	};
}
