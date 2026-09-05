/**
 * Alight Motion version helpers.
 *
 * Versions are stored zero-padded (`005.000.001`) so plain lexicographic
 * string comparison in Postgres matches semantic version ordering.
 */

const VERSION_PATTERN = /^(\d{1,3})(?:\.(\d{1,3}))?(?:\.(\d{1,3}))?$/;

function padPart(part: string | undefined): string {
	return (part ?? "0").padStart(3, "0");
}

/**
 * Normalize a free-form version ("5", "5.0", "5.0.1") to "005.000.001".
 * Returns null when the input is not a valid numeric dotted version.
 */
export function normalizeAmVersion(
	version: string | null | undefined,
): string | null {
	if (!version) return null;
	const trimmed = version.trim();
	if (!trimmed) return null;
	const match = VERSION_PATTERN.exec(trimmed);
	if (!match) return null;
	return `${padPart(match[1])}.${padPart(match[2])}.${padPart(match[3])}`;
}

/**
 * Format a stored version back for display ("005.000.001" -> "5.0.1").
 * Tolerates non-normalized legacy values. Returns null for empty input.
 */
export function formatAmVersion(
	version: string | null | undefined,
): string | null {
	if (!version) return null;
	const trimmed = version.trim();
	if (!trimmed) return null;
	const parts = trimmed.split(".").map((p) => {
		const n = Number.parseInt(p, 10);
		return Number.isNaN(n) ? null : String(n);
	});
	if (parts.some((p) => p === null)) return trimmed;
	// Drop trailing ".0" groups for a compact label, keep at least major.minor
	while (parts.length > 2 && parts[parts.length - 1] === "0") {
		parts.pop();
	}
	return (parts as string[]).join(".");
}

/**
 * Human-readable compatibility range, e.g. "AM 5.0+", "AM 4.2 – 5.1".
 * Returns null when no version info is set.
 */
export function formatAmVersionRange(
	min: string | null | undefined,
	max: string | null | undefined,
): string | null {
	const formattedMin = formatAmVersion(min);
	const formattedMax = formatAmVersion(max);
	if (formattedMin && formattedMax)
		return `AM ${formattedMin} – ${formattedMax}`;
	if (formattedMin) return `AM ${formattedMin}+`;
	if (formattedMax) return `Hingga AM ${formattedMax}`;
	return null;
}
