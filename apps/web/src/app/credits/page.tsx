import type { Metadata } from "next";
import { CreditsClient } from "./_components/CreditsClient";

export const metadata: Metadata = {
	title: "Credits & Acknowledgments | AMHUB",
	description:
		"Learn about the creator, tech stack, and AI contributors behind the AMHUB platform.",
};

export default function CreditsPage() {
	return <CreditsClient />;
}
