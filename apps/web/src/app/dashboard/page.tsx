import {
	getCreatorAnalytics,
	getCreatorDashboardStats,
	listCreatorPresetsPaginated,
} from "@/dal/presets.dal";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardClient } from "./_components/DashboardClient";

export const metadata: Metadata = {
	title: "Creator Dashboard | AMHUB",
	description:
		"View your preset analytics, downloads, likes, and manage your published content.",
};

export default async function DashboardPage() {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/auth/login");
	}

	const supabase = await createSupabaseServerClient();

	const [stats, initialPresetsResult, analytics] = await Promise.all([
		getCreatorDashboardStats(supabase, profile.id),
		listCreatorPresetsPaginated(supabase, profile.id, { page: 1, limit: 12 }),
		getCreatorAnalytics(supabase, profile.id, "7d"),
	]);

	const dashboardUserData = {
		displayName: profile.display_name,
		username: profile.username,
		avatarUrl: resolveStorageUrl(profile.avatar_url),
	};

	const initialPresets = initialPresetsResult.items.map((preset) => ({
		id: preset.id,
		title: preset.title,
		slug: preset.slug,
		description: preset.description,
		thumbnail_url: preset.thumbnail_url,
		file_type: preset.file_type as "xml" | "qr" | "link",
		category: preset.category,
		difficulty: (preset.difficulty || "beginner") as
			| "beginner"
			| "intermediate"
			| "advanced",
		tags: preset.tags || [],
		download_count: preset.download_count,
		like_count: preset.like_count,
		view_count: preset.view_count,
		status: preset.status as "pending" | "published" | "rejected" | "removed",
		created_at: preset.created_at,
	}));

	return (
		<DashboardClient
			user={dashboardUserData}
			stats={stats}
			initialPresets={initialPresets}
			initialAnalytics={analytics}
		/>
	);
}
