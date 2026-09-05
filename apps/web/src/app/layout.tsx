import { getUnreadNotificationCount } from "@/data/notifications";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { Metadata, Viewport } from "next";
import { PostHogProvider } from "./PostHogProvider";
import { PwaManager } from "./_components/PwaManager";
import { LayoutShell } from "./_components/layout-shell";
import "../styles/globals.css";

export const viewport: Viewport = {
	themeColor: "#00C8FF",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export const metadata: Metadata = {
	title: {
		default: "AMHUB — Alight Motion Presets & Community",
		template: "%s | AMHUB",
	},
	description:
		"Discover, share, and download pro Alight Motion XML, QR code, and link presets.",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "AMHUB",
	},
	icons: {
		icon: "/favicon.png",
		shortcut: "/favicon.png",
		apple: "/apple-touch-icon.png",
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
		<html lang="en" data-theme="dark-liquid">
			<body className="bg-[#08070c] text-[var(--color-text-primary)] antialiased transition-colors duration-500 selection:bg-cyan-500/30 selection:text-white">
				<PostHogProvider currentUser={currentUser}>
					<LayoutShell
						currentUser={resolvedUser}
						unreadNotificationCount={unreadNotificationCount}
					>
						{children}
					</LayoutShell>
					<PwaManager />
				</PostHogProvider>
			</body>
		</html>
	);
}
