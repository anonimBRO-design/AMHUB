import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { cn } from "../../lib/utils";

export interface NotificationItemProps {
	notification: {
		id: string;
		type:
			| "like"
			| "comment"
			| "follow"
			| "download"
			| "badge"
			| "challenge"
			| "featured"
			| "system";
		actor?: { username: string; displayName: string; avatarUrl?: string };
		preset?: { slug: string; title: string; thumbnailUrl?: string };
		badge?: {
			name: string;
			iconUrl?: string;
			rarity: "common" | "rare" | "epic" | "legendary";
		};
		message?: string;
		isRead: boolean;
		createdAt: string;
	};
	onClick: (notification: NotificationItemProps["notification"]) => void;
	onMarkRead?: (id: string) => void;
}

export const NotificationItem = ({
	notification,
	onClick,
	onMarkRead,
}: NotificationItemProps) => {
	const handleClick = () => {
		if (!notification.isRead && onMarkRead) {
			onMarkRead(notification.id);
		}
		onClick(notification);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"flex w-full items-start gap-[var(--space-3)] p-[var(--space-3)] text-left transition-colors hover:bg-[var(--color-bg-elevated)]",
				!notification.isRead &&
					"bg-[var(--color-bg-accent)] border-l-4 border-[var(--color-interactive-primary)]",
			)}
		>
			{notification.actor && (
				<Avatar
					src={notification.actor.avatarUrl}
					alt={`${notification.actor.displayName}'s profile photo`}
					displayName={notification.actor.displayName}
					size="sm"
				/>
			)}
			<div className="flex flex-col gap-[var(--space-0_5)]">
				<p className="body-md text-[var(--color-text-primary)]">
					{notification.message}
				</p>
				<span className="body-xs text-[var(--color-text-tertiary)]">
					{notification.createdAt}
				</span>
			</div>
		</button>
	);
};
