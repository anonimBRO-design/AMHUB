import type { Metadata } from "next";
import { TermsClient } from "./_components/TermsClient";

export const metadata: Metadata = {
	title: "Terms of Service | AMHUB",
	description:
		"Read the Terms of Service and guidelines for using the AMHUB Alight Motion Preset platform.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TermsPage() {
	return <TermsClient />;
}
