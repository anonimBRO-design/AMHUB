import { requireUser } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import { UploadWizard } from "./_components/UploadWizard";

export const metadata: Metadata = {
	title: "Upload Alight Motion Preset | AMHUB",
	description:
		"Upload and publish your Alight Motion presets to the community.",
};

export default async function UploadPage() {
	await requireUser();

	return <UploadWizard />;
}
