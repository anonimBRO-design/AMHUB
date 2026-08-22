"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LanguageProvider } from "@/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@presethub/types";
import { AppLayoutTemplate, TopBar } from "@presethub/ui";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { DesktopDock } from "./DesktopDock";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PointerCaptureGuard } from "./PointerCaptureGuard";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutShellProps {
	children: React.ReactNode;
	currentUser: User | null;
	unreadNotificationCount: number;
}

function LayoutShellInner({
	children,
	currentUser,
	unreadNotificationCount: initialUnreadCount,
}: LayoutShellProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
	const { theme } = useTheme();

	const isWelcomePage = pathname === "/";
	const isHomePage = pathname === "/home";
	const showBackButton = !isWelcomePage && !isHomePage;

	const isDarkLiquid = theme === "dark-liquid";
	const isLightLiquid = theme === "light-liquid";
	const isNormal = theme === "normal";

	const handleBackClick = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back();
		} else {
			router.push("/home");
		}
	};

	// Realtime subscription for unread notifications count
	useEffect(() => {
		if (!currentUser?.id) return;
		const supabase = createSupabaseBrowserClient();

		const channel = supabase
			.channel(`layout-notifications-${currentUser.id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "notifications",
					filter: `user_id=${currentUser.id}`,
				},
				() => {
					// Refresh unread count
					fetch("/api/notifications")
						.then((res) => res.json())
						.then((resData) => {
							if (resData?.data?.unreadCount !== undefined) {
								setUnreadCount(resData.data.unreadCount);
							}
						})
						.catch(() => {});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [currentUser?.id]);

	const navUser = currentUser
		? {
				username: currentUser.username,
				displayName: currentUser.display_name,
				avatarUrl: currentUser.avatar_url ?? undefined,
				level: currentUser.level,
				levelName: `Level ${currentUser.level}`,
			}
		: undefined;

	const handleSearchSubmit = (query: string) => {
		if (!query.trim()) return;
		router.push(`/explore?search=${encodeURIComponent(query)}`);
	};

	return (
		<div className="relative min-h-screen max-w-full overflow-hidden transition-colors duration-500">
			{/* Dynamic Theme Wallpaper Background (Desktop Landscape) */}
			{!isNormal && (
				<>
					<div
						className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-90 hidden sm:block"
						style={{
							backgroundImage: isDarkLiquid
								? "url('/wallpapers/liquid-dark.png')"
								: "url('/wallpapers/liquid-light.png')",
						}}
					/>
					{/* Dynamic Theme Wallpaper Background (Mobile Portrait) */}
					<div
						className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-95 sm:hidden"
						style={{
							backgroundImage: isDarkLiquid
								? "url('/wallpapers/liquid-dark-mobile.png')"
								: "url('/wallpapers/liquid-light-mobile.png')",
						}}
					/>
					{/* Subtle Spatial Tint Overlay */}
					<div
						className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
							isLightLiquid ? "bg-white/15" : "bg-black/35"
						}`}
					/>
				</>
			)}

			{/* iOS 27 Spatial Ambient Lighting Orbs */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
				<div
					className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] animate-float-ambient ${
						isDarkLiquid
							? "bg-gradient-to-tr from-purple-600/25 to-indigo-600/20"
							: isLightLiquid
							? "bg-gradient-to-tr from-purple-400/20 to-indigo-300/15"
							: "bg-gradient-to-tr from-purple-600/10 to-transparent"
					}`}
				/>
				<div
					className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] animate-float-ambient ${
						isDarkLiquid
							? "bg-gradient-to-bl from-fuchsia-600/20 to-purple-800/25"
							: isLightLiquid
							? "bg-gradient-to-bl from-purple-400/15 to-pink-300/15"
							: "bg-gradient-to-bl from-indigo-600/10 to-transparent"
					}`}
					style={{ animationDelay: "4s" }}
				/>
			</div>

			<div className="relative z-10">
				{isWelcomePage ? (
					<main>{children}</main>
				) : (
					<>
						<AppLayoutTemplate
							sidebar={null}
							topBar={
								<TopBar
									currentUser={navUser}
									unreadNotificationCount={unreadCount}
									isScrolled={false}
									showBackButton={showBackButton}
									onBackClick={handleBackClick}
									onSearchSubmit={handleSearchSubmit}
									rightContent={
										<div className="flex items-center gap-2">
											<ThemeToggle />
											<LanguageSwitcher variant="compact" />
										</div>
									}
								/>
							}
							bottomNav={null}
						>
							{children}
						</AppLayoutTemplate>

						{/* macOS-style Responsive Floating Dock — Single navigation across mobile and desktop */}
						<DesktopDock
							currentUser={currentUser}
							unreadNotificationCount={unreadCount}
						/>
					</>
				)}
			</div>
		</div>
	);
}

export const LayoutShell: React.FC<LayoutShellProps> = (props) => {
	return (
		<LanguageProvider>
			<AuthProvider currentUser={props.currentUser}>
				<ThemeProvider>
					<PointerCaptureGuard />
					<LayoutShellInner {...props} />
				</ThemeProvider>
			</AuthProvider>
		</LanguageProvider>
	);
};
