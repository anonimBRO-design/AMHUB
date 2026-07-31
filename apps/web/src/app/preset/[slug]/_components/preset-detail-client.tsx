"use client";

import { type PresetCardPreset, PresetDetail } from "@presethub/ui";

interface PresetDetailClientProps {
	preset: PresetCardPreset & {
		fileType: "flstudio" | "ableton" | "logic" | "studioone";
	};
	relatedPresets: PresetCardPreset[];
}

export function PresetDetailClient({
	preset,
	relatedPresets,
}: PresetDetailClientProps) {
	const handleLike = async () => {
		try {
			await fetch(`/api/presets/${preset.id}/like`, { method: "POST" });
		} catch (e) {
			console.error("Failed to like preset", e);
		}
	};

	const handleBookmark = async () => {
		try {
			await fetch(`/api/presets/${preset.id}/bookmark`, { method: "POST" });
		} catch (e) {
			console.error("Failed to bookmark preset", e);
		}
	};

	const handleFollow = async () => {
		try {
			await fetch(`/api/users/${preset.creator.username}/follow`, {
				method: "POST",
			});
		} catch (e) {
			console.error("Failed to follow creator", e);
		}
	};

	return (
		<PresetDetail
			preset={preset}
			onLike={handleLike}
			onBookmark={handleBookmark}
			onFollow={handleFollow}
			relatedPresets={relatedPresets}
		/>
	);
}
