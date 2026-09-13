const KNOWN_CATEGORIES: Record<string, string> = {
	all: "All Presets",
	jj: "JJ",
	"jj-tipis": "JJ Tipis",
	"jj tipis": "JJ Tipis",
	"jj-melar": "JJ Kenyat-Kenyot",
	"jj melar": "JJ Kenyat-Kenyot",
	"jj-belah": "JJ Belah",
	"jj belah": "JJ Belah",
	"jj-abstract": "JJ Abstract",
	"jj abstract": "JJ Abstract",
	"jj-db": "JJ DB",
	"jj db": "JJ DB",
	"jj-mekdi": "JJ Mekdi",
	"jj mekdi": "JJ Mekdi",
	"jj-kenyal": "JJ Kenyal",
	"jj kenyal": "JJ Kenyal",
	gaming: "Gaming",
	anime: "Anime",
	velocity: "Velocity",
	transition: "Transition",
	color: "Color Grading",
	lyric: "Lyric Video",
	slowmo: "Slowmo",
	"3d": "3D",
	am: "AM",
	xml: "XML",
	dj: "DJ",
	other: "Other",
};

const ACRONYMS = new Set(["jj", "am", "xml", "3d", "dj", "hd", "4k", "db"]);

/**
 * Formats a category slug or string into a clean, display-ready name.
 * Preserves all-caps acronyms like "JJ", "AM", "XML", "3D", "DJ".
 *
 * Example:
 * - "jj" -> "JJ"
 * - "jj-tipis" -> "JJ Tipis"
 * - "jj-melar" -> "JJ Kenyat-Kenyot"
 * - "gaming" -> "Gaming"
 * - "3d" -> "3D"
 */
export function formatCategory(category?: string | null): string {
	if (!category) return "";

	const trimmed = category.trim();
	const normalized = trimmed.toLowerCase();

	// Exact match in known catalog
	if (KNOWN_CATEGORIES[normalized]) {
		return KNOWN_CATEGORIES[normalized];
	}

	// Split by hyphens, underscores, or spaces
	const words = trimmed.split(/[-_\s]+/);
	return words
		.map((word) => {
			const lower = word.toLowerCase();
			if (ACRONYMS.has(lower)) {
				return lower.toUpperCase();
			}
			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join(" ");
}
