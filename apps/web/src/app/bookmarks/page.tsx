import { listUserBookmarkedPresets } from "@/dal/bookmarks.dal";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PresetGrid } from "@presethub/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Bookmarked Presets | PresetHub",
	description: "View your saved and bookmarked Alight Motion presets.",
};

export default async function BookmarksPage() {
	const user = await requireUser();
	const supabase = await createSupabaseServerClient();

	const rawPresets = await listUserBookmarkedPresets(supabase, user.id);
	const presets = rawPresets.map(mapPresetToCardPreset);

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Bookmarks ({presets.length})</h1>
			<PresetGrid
				presets={presets}
				isLoading={false}
				hasMore={false}
				onLoadMore={() => {}}
			/>
		</div>
	);
}
