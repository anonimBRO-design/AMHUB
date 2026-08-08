import { getCurrentProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/auth/login");
	}
	redirect(`/u/${profile.username}`);
}
