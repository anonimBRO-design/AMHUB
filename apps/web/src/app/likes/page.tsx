import { listUserLikedPresets } from "@/dal/likes.dal";
import { mapPresetToCardPreset } from "@/lib/mappers";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { LikesClient } from "./_components/LikesClient";

export const metadata: Metadata = {
	title: "Liked Presets | PresetHub",
	description: "View Alight Motion presets you have liked.",
};

export default async function LikesPage() {
	const user = await requireUser();
	const supabase = await createSupabaseServerClient();

	const rawPresets = await listUserLikedPresets(supabase, user.id);
	const presets = rawPresets.map(mapPresetToCardPreset);

	return <LikesClient initialPresets={presets} />;
}
