"use client";

import {
	AppLayoutTemplate,
	MobileBottomNav,
	NavigationSidebar,
	TopBar,
} from "@presethub/ui";
import type { User } from "@presethub/types";
import { useRouter } from "next/navigation";
import type React from "react";

interface LayoutShellProps {
	children: React.ReactNode;
	currentUser: User | null;
	unreadNotificationCount: number;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
	children,
	currentUser,
	unreadNotificationCount,
}) => {
	const router = useRouter();

	// Normalize user data for component props if necessary, 
	// or create a mapper function if schemas diverge.
	const navUser = currentUser
		? {
				username: currentUser.username,
				displayName: currentUser.display_name,
				avatarUrl: currentUser.avatar_url ?? undefined,
				level: currentUser.level,
				levelName: `Level ${currentUser.level}`, // Derived from level
			}
		: undefined;

	const handleSearchSubmit = (query: string) => {
		if (!query.trim()) return;
		router.push(`/explore?search=${encodeURIComponent(query)}`);
	};

	return (
		<AppLayoutTemplate
			sidebar={
				navUser ? (
					<NavigationSidebar
						currentUser={navUser}
						activeRoute="/"
						recentActivity={[]}
						trendingTags={[]}
					/>
				) : null
			}
			topBar={
				<TopBar
					currentUser={navUser}
					unreadNotificationCount={unreadNotificationCount}
					isScrolled={false}
					onSearchSubmit={handleSearchSubmit}
				/>
			}
			bottomNav={
				navUser ? (
					<MobileBottomNav
						activeRoute="/"
						currentUser={{
							avatarUrl: navUser.avatarUrl,
							displayName: navUser.displayName,
						}}
					/>
				) : null
			}
		>
			{children}
		</AppLayoutTemplate>
	);
};
