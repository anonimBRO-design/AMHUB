import { getUnreadNotificationCount } from "@/data/notifications";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { Metadata } from "next";
import { LayoutShell } from "./_components/layout-shell";
import "../styles/globals.css";

export const metadata: Metadata = {
	title: {
		default: "AMHUB — Alight Motion Presets & Community",
		template: "%s | AMHUB",
	},
	description:
		"Discover, share, and download pro Alight Motion XML, QR code, and link presets.",
	icons: {
		icon: "/favicon.png",
		shortcut: "/favicon.png",
		apple: "/favicon.png",
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const currentUser = await getCurrentProfile();
	const supabase = await createSupabaseServerClient();

	const resolvedUser = currentUser
		? {
				...currentUser,
				avatar_url: resolveStorageUrl(currentUser.avatar_url) ?? null,
			}
		: null;

	const unreadNotificationCount = currentUser
		? await getUnreadNotificationCount(supabase, currentUser.id)
		: 0;

	return (
		<html lang="en" data-theme="dark">
			<body className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased selection:bg-purple-500/30 selection:text-white">
				<LayoutShell
					currentUser={resolvedUser}
					unreadNotificationCount={unreadNotificationCount}
				>
					{children}
				</LayoutShell>
			</body>
		</html>
	);
}
