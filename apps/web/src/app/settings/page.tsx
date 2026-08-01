import { getCurrentProfile, requireUser } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "./_components/settings-form";

export const metadata: Metadata = {
	title: "Account Settings | PresetHub",
	description: "Manage your PresetHub account settings and profile details.",
};

export default async function SettingsPage() {
	await requireUser();
	const profile = await getCurrentProfile();

	if (!profile) {
		redirect("/auth/login");
	}

	return <SettingsForm profile={profile} />;
}
