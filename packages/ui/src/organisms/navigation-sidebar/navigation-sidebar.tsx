import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { cn } from "../../lib/utils";

export interface NavigationSidebarProps {
	currentUser: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		level: number;
		levelName: string;
	};
	activeRoute: string;
	recentActivity: {
		actor: { username: string; displayName: string; avatarUrl?: string };
		action: string;
		href: string;
		createdAt: string;
	}[];
	trendingTags: string[];
	unreadNotificationCount?: number;
}

export const NavigationSidebar = ({
	currentUser,
	activeRoute,
	recentActivity,
	trendingTags,
	unreadNotificationCount,
}: NavigationSidebarProps) => {
	const navItems = [
		{ label: "Home", href: "/", icon: "⌂" },
		{ label: "Explore", href: "/explore", icon: "🔍" },
		{ label: "Trending", href: "/trending", icon: "🔥" },
		{ label: "Challenges", href: "/challenges", icon: "🏆" },
		{ label: "Bookmarks", href: "/bookmarks", icon: "🔖" },
	];

	return (
		<nav
			aria-label="Main navigation"
			className="fixed left-0 top-0 hidden h-full w-[220px] flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] lg:flex z-[var(--z-sticky)]"
		>
			<div className="flex h-16 items-center px-6">
				<a href="/" aria-label="PresetHub — Home" className="text-xl font-bold">
					PresetHub
				</a>
			</div>

			<a
				href={`/u/${currentUser.username}`}
				className="flex items-center gap-3 px-6 py-4 hover:bg-[var(--color-bg-elevated)]"
			>
				<Avatar
					src={currentUser.avatarUrl}
					alt={`${currentUser.displayName}'s profile photo`}
					displayName={currentUser.displayName}
					size="md"
					level={currentUser.level}
				/>
				<div className="flex flex-col">
					<span className="font-medium text-[var(--color-text-primary)]">
						{currentUser.displayName}
					</span>
					<span className="text-xs text-[var(--color-text-tertiary)]">
						{currentUser.levelName}
					</span>
				</div>
			</a>

			<div className="flex flex-col gap-1 px-4 py-4">
				{navItems.map((item) => {
					const isActive = activeRoute === item.href;
					return (
						<a
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
								isActive &&
									"bg-[var(--color-bg-accent)] text-[var(--color-text-accent)]",
							)}
						>
							<span className="text-xl">{item.icon}</span>
							{item.label}
							{item.label === "Notifications" && unreadNotificationCount && (
								<span className="ml-auto rounded-full bg-[var(--color-interactive-primary)] px-2 py-0.5 text-xs text-white">
									{unreadNotificationCount}
								</span>
							)}
						</a>
					);
				})}
			</div>
		</nav>
	);
};
