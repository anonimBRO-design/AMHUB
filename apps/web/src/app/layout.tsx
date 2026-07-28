import { LayoutShell } from "./_components/layout-shell";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { getUnreadNotificationCount } from "@/data/notifications";
import "../styles/globals.css";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const currentUser = await getCurrentProfile();
	const supabase = await createSupabaseServerClient();

	const unreadNotificationCount = currentUser
		? await getUnreadNotificationCount(supabase, currentUser.id)
		: 0;

	return (
		<html lang="en">
			<body className="bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]">
				<LayoutShell currentUser={currentUser} unreadNotificationCount={unreadNotificationCount}>
					{children}
				</LayoutShell>
			</body>
		</html>
	);
}
