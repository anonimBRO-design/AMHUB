import { getCurrentProfile } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UploadWizard } from "./_components/UploadWizard";

export const metadata: Metadata = {
	title: "Upload Alight Motion Preset | AMHUB",
	description:
		"Upload and publish your Alight Motion presets to the community.",
};

export default async function UploadPage() {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/auth/login");
	}

	return <UploadWizard />;
}
