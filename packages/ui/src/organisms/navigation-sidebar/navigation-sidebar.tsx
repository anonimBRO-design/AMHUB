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
		{ label: "Home", href: "/home", icon: "⌂" },
		{ label: "Explore", href: "/explore", icon: "🔍" },
		{ label: "Bookmarks", href: "/bookmarks", icon: "🔖" },
		{ label: "Likes", href: "/likes", icon: "❤️" },
		{ label: "Dashboard", href: "/dashboard", icon: "📊" },
		{ label: "Notifications", href: "/notifications", icon: "🔔" },
		{ label: "Upload", href: "/upload", icon: "➕" },
		{ label: "Credits", href: "/credits", icon: "✨" },
		{ label: "Settings", href: "/settings", icon: "⚙️" },
	];

	return (
		<nav
			aria-label="Main navigation"
			className="fixed left-0 top-0 hidden h-full w-[220px] flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] lg:flex z-[var(--z-sticky)]"
		>
			<div className="flex h-16 items-center px-6 border-b border-[var(--color-border-subtle)]">
				<a
					href="/home"
					aria-label="AMHUB — Home"
					className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
				>
					<img
						src="/logo.png"
						alt="AMHUB Logo"
						width={36}
						height={36}
						className="h-9 w-9 object-contain rounded-lg shrink-0"
						style={{ width: 36, height: 36, maxWidth: 36, maxHeight: 36 }}
					/>

					<span className="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						AMHUB
					</span>
				</a>
			</div>

			<a
				href={`/u/${currentUser.username}`}
				className="flex items-center gap-3 px-6 py-4 hover:bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] transition-colors"
			>
				<Avatar
					src={currentUser.avatarUrl}
					alt={`${currentUser.displayName}'s profile photo`}
					displayName={currentUser.displayName}
					size="md"
					level={currentUser.level}
				/>
				<div className="flex flex-col min-w-0">
					<span className="font-bold text-sm text-[var(--color-text-primary)] truncate">
						{currentUser.displayName}
					</span>
					<span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
						{currentUser.levelName}
					</span>
				</div>
			</a>

			<div className="flex flex-col gap-1 px-4 py-4 overflow-y-auto">
				{navItems.map((item) => {
					const isActive = activeRoute === item.href;
					return (
						<a
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
								isActive &&
									"bg-[var(--color-bg-accent)] text-[var(--color-text-accent)] font-extrabold",
							)}
						>
							<span className="text-lg">{item.icon}</span>
							<span>{item.label}</span>
							{item.label === "Notifications" &&
								!!unreadNotificationCount &&
								unreadNotificationCount > 0 && (
									<span className="ml-auto rounded-full bg-[var(--color-interactive-primary)] px-2 py-0.5 text-[10px] text-white">
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
