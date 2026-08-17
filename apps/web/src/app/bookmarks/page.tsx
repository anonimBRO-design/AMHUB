import { listUserBookmarkedPresets } from "@/dal/bookmarks.dal";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { BookmarksClient } from "./_components/BookmarksClient";

export const metadata: Metadata = {
	title: "Bookmarked Presets | AMHUB",
	description: "View your saved and bookmarked Alight Motion presets.",
};

export default async function BookmarksPage() {
	const user = await requireUser();
	const supabase = await createSupabaseServerClient();

	const rawPresets = await listUserBookmarkedPresets(supabase, user.id);
	const presets = rawPresets.map((p) => ({
		...mapPresetToCardPreset(p),
		isBookmarked: true,
	}));

	return <BookmarksClient initialPresets={presets} />;
}
