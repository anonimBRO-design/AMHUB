"use client";

import { Bell, Search } from "lucide-react";
import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { cn } from "../../lib/utils";
import {
	DropdownMenu,
	type DropdownMenuActionItem,
	type DropdownMenuItem,
} from "../../overlays/dropdown-menu";

export interface TopBarProps {
	currentUser?: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		level: number;
	};
	pageTitle?: string;
	unreadNotificationCount: number;
	isScrolled: boolean;
	onSearchSubmit: (query: string) => void;
}

export const TopBar = ({
	currentUser,
	pageTitle,
	unreadNotificationCount,
	isScrolled,
	onSearchSubmit,
}: TopBarProps) => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const navigateTo = (path: string) => {
		window.location.href = path;
	};

	const menuItems: DropdownMenuItem[] = [
		{
			type: "item",
			label: "Profile",
			onClick: () => currentUser && navigateTo(`/u/${currentUser.username}`),
		} as DropdownMenuActionItem,
		{
			type: "item",
			label: "Dashboard",
			onClick: () => navigateTo("/dashboard"),
		} as DropdownMenuActionItem,
		{
			type: "item",
			label: "Settings",
			onClick: () => navigateTo("/settings"),
		} as DropdownMenuActionItem,
		{
			type: "item",
			label: "Sign out",
			onClick: () => navigateTo("/auth/logout"),
		} as DropdownMenuActionItem,
	];

	return (
		<header
			className={cn(
				"sticky top-0 z-[var(--z-sticky)] flex h-16 w-full items-center justify-between px-4 sm:px-6 transition-all",
				isScrolled
					? "bg-[var(--color-bg-surface)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)]"
					: "bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)]",
			)}
		>
			<a
				href="/"
				aria-label="AMHUB — Home"
				className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
			>
				<img
					src="/logo.png"
					alt="AMHUB Logo"
					className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-lg"
				/>
				<span className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
					{pageTitle || "AMHUB"}
				</span>
			</a>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => navigateTo("/explore")}
					className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2 rounded-xl"
					aria-label="Search"
				>
					<Search size={20} />
				</button>
				<button
					type="button"
					onClick={() => navigateTo("/notifications")}
					className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2 rounded-xl"
					aria-label={`${unreadNotificationCount} unread notifications`}
				>
					<Bell size={20} />
					{unreadNotificationCount > 0 && (
						<span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-interactive-danger)]" />
					)}
				</button>
				{currentUser && (
					<DropdownMenu
						isOpen={isMenuOpen}
						onOpenChange={setIsMenuOpen}
						items={menuItems}
						trigger={
							<button type="button" aria-label="Open menu">
								<Avatar
									src={currentUser.avatarUrl}
									alt={`${currentUser.displayName}'s profile photo`}
									displayName={currentUser.displayName}
									size="sm"
								/>
							</button>
						}
					/>
				)}
			</div>
		</header>
	);
};
