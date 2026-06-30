import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { cn } from "../../lib/utils";

export interface MobileBottomNavProps {
	activeRoute: string;
	currentUser?: {
		avatarUrl?: string;
		displayName: string;
	};
	unreadNotificationCount?: number;
}

export const MobileBottomNav = ({
	activeRoute,
	currentUser,
	unreadNotificationCount,
}: MobileBottomNavProps) => {
	const navItems = [
		{ label: "Home", href: "/", icon: "⌂" },
		{ label: "Explore", href: "/explore", icon: "🔍" },
		{ label: "Upload", href: "/upload", icon: "⬆", isFab: true },
		{ label: "Challenges", href: "/challenges", icon: "🏆" },
		{ label: "Profile", href: "/profile", icon: "👤" },
	];

	return (
		<nav
			aria-label="Mobile navigation"
			className="fixed bottom-0 left-0 z-[var(--z-sticky)] flex h-16 w-full items-center justify-around border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
		>
			{navItems.map((item) => {
				const isActive = activeRoute === item.href;
				if (item.isFab) {
					return (
						<a
							key={item.href}
							href={item.href}
							aria-label="Upload new preset"
							className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-[var(--color-interactive-primary)] text-white shadow-glow-sm transition-transform hover:scale-95"
						>
							<span className="text-2xl">{item.icon}</span>
						</a>
					);
				}
				return (
					<a
						key={item.href}
						href={item.href}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"flex flex-col items-center gap-1 text-[var(--color-text-secondary)]",
							isActive && "text-[var(--color-text-accent)]",
						)}
					>
						{item.label === "Profile" && currentUser?.avatarUrl ? (
							<Avatar
								src={currentUser.avatarUrl}
								alt={`${currentUser.displayName}'s profile photo`}
								displayName={currentUser.displayName}
								size="xs"
							/>
						) : (
							<span className="text-xl">{item.icon}</span>
						)}
						<span className="text-[10px]">{item.label}</span>
					</a>
				);
			})}
		</nav>
	);
};
