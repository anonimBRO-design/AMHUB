import { getCurrentProfile, requireUser } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditProfileClient } from "../_components/EditProfileClient";

export const metadata: Metadata = {
	title: "Edit Profile | AMHUB",
	description: "Customize your public creator profile, avatar, banner, and social links.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProfilePage() {
	await requireUser();
	const profile = await getCurrentProfile();

	if (!profile) {
		redirect("/auth/login");
	}

	return <EditProfileClient profile={profile} />;
}
