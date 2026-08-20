import { listCollections } from "@/dal/collections.dal";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./_components/CollectionsClient";

export const metadata: Metadata = {
	title: "Collections | AMHUB",
	description:
		"Curate, organize, and explore collections of Alight Motion presets.",
};

export default async function CollectionsPage() {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/auth/login?redirectTo=/collections");
	}

	const supabase = await createSupabaseServerClient();
	const { items } = await listCollections(supabase, {
		page: 1,
		limit: 50,
		owner_id: profile.id,
		currentUserId: profile.id,
	});

	return (
		<CollectionsClient
			initialCollections={items as any}
			currentUserId={profile.id}
		/>
	);
}
