"use client";

import { NotificationItem } from "@presethub/ui";
import { useState } from "react";

export interface NotificationListItem {
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
}

interface NotificationListProps {
	initialNotifications: NotificationListItem[];
}

export function NotificationList({
	initialNotifications,
}: NotificationListProps) {
	const [notifications, setNotifications] = useState(initialNotifications);

	const handleMarkRead = async (id: string) => {
		try {
			await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
			);
		} catch (e) {
			console.error("Failed to mark notification read", e);
		}
	};

	const handleClick = (item: NotificationListItem) => {
		if (item.preset) {
			window.location.href = `/preset/${item.preset.slug}`;
		} else if (item.actor) {
			window.location.href = `/u/${item.actor.username}`;
		}
	};

	if (notifications.length === 0) {
		return (
			<div className="p-8 text-center text-[var(--color-text-secondary)]">
				No notifications yet.
			</div>
		);
	}

	return (
		<div className="divide-y divide-[var(--color-border-subtle)] rounded-lg border border-[var(--color-border-subtle)] overflow-hidden">
			{notifications.map((notification) => (
				<NotificationItem
					key={notification.id}
					notification={notification}
					onClick={handleClick}
					onMarkRead={handleMarkRead}
				/>
			))}
		</div>
	);
}
