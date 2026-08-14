import { isAdminProfile } from "@/lib/admin";
import { getApiUser } from "@/lib/api/auth";
import { ensureUserProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./_components/AdminDashboardClient";

export const metadata = {
	title: "Admin Control Center — AMHUB",
	description: "System administration and user management portal for AMHUB.",
};

export default async function AdminPage() {
	const authContext = await getApiUser();

	if (!authContext?.user) {
		redirect("/auth/login");
	}

	const profile = await ensureUserProfile(authContext.user);

	if (!isAdminProfile(profile, authContext.user)) {
		redirect("/home");
	}

	return <AdminDashboardClient currentAdmin={profile} />;
}
