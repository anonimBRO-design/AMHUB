import { listPublishedPresets } from "@/data/presets";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { FeedClient } from "./_components/FeedClient";

export const metadata: Metadata = {
	title: "Feed Video Preset | AMHUB",
	description:
		"Scroll feed video preview preset Alight Motion ala TikTok. Ketuk untuk suara, buka untuk download.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedPage() {
	const supabase = await createSupabaseServerClient();

	let presets: ReturnType<typeof mapPresetToCardPreset>[] = [];
	try {
		const rawPresets = await listPublishedPresets(supabase, {
			hasVideo: true,
			sort: "trending",
			limit: 24,
		});
		presets = rawPresets
			.map((p: unknown) =>
				mapPresetToCardPreset(p as Parameters<typeof mapPresetToCardPreset>[0]),
			)
			.filter((p) => Boolean(p.previewVideoUrl));
	} catch (error) {
		console.error("Failed to load video feed:", error);
	}

	return (
		<FeedClient
			items={presets.map((p) => ({
				id: p.id,
				slug: p.slug,
				title: p.title,
				previewVideoUrl: p.previewVideoUrl as string,
				thumbnailUrl: p.thumbnailUrl,
				likeCount: p.likeCount,
				creatorUsername: p.creator.username,
				creatorDisplayName: p.creator.displayName,
			}))}
		/>
	);
}
