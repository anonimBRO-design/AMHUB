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

	const menuItems: DropdownMenuItem[] = [
		{
			type: "item",
			label: "Profile",
			onClick: () => {},
		} as DropdownMenuActionItem,
		{
			type: "item",
			label: "Dashboard",
			onClick: () => {},
		} as DropdownMenuActionItem,
		{
			type: "item",
			label: "Settings",
			onClick: () => {},
		} as DropdownMenuActionItem,
		{
			type: "item",
			label: "Sign out",
			onClick: () => {},
		} as DropdownMenuActionItem,
	];

	return (
		<header
			className={cn(
				"sticky top-0 z-[var(--z-sticky)] flex h-16 w-full items-center justify-between px-6 transition-all",
				isScrolled
					? "bg-[var(--color-bg-surface)]/80 backdrop-blur-md"
					: "bg-[var(--color-bg-surface)]",
			)}
		>
			<a href="/" aria-label="PresetHub — Home" className="text-xl font-bold">
				{pageTitle || "PresetHub"}
			</a>

			<div className="flex items-center gap-4">
				<button
					type="button"
					className="text-[var(--color-text-secondary)]"
					aria-label="Search"
				>
					<Search size={20} />
				</button>
				<button
					type="button"
					className="relative text-[var(--color-text-secondary)]"
					aria-label={`${unreadNotificationCount} unread notifications`}
				>
					<Bell size={20} />
					{unreadNotificationCount > 0 && (
						<span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--color-interactive-danger)]" />
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
