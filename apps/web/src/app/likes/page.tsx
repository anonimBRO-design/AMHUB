import { listUserLikedPresets } from "@/dal/likes.dal";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresetGrid } from "@presethub/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Liked Presets | PresetHub",
	description: "View Alight Motion presets you have liked.",
};

export default async function LikesPage() {
	const user = await requireUser();
	const supabase = await createSupabaseServerClient();

	const rawPresets = await listUserLikedPresets(supabase, user.id);
	const presets = rawPresets.map(mapPresetToCardPreset);

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Liked Presets ({presets.length})</h1>
			<PresetGrid
				presets={presets}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
