import { requireUser } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import { UploadForm } from "./_components/upload-form";

export const metadata: Metadata = {
	title: "Upload Preset | PresetHub",
	description: "Upload and publish your Alight Motion presets to the community.",
};

export default async function UploadPage() {
	await requireUser();

	return <UploadForm />;
}
