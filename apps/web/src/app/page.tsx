import { getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { WelcomeClient } from "./_components/welcome/WelcomeClient";

export default async function EntryPage() {
	const user = await getCurrentUser();

	if (user) {
		redirect("/home");
	}

	return <WelcomeClient />;
}
