"use client";

import { Bell, CheckCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	NotificationCard,
	type NotificationItemData,
} from "./NotificationCard";
import { NotificationEmpty } from "./NotificationEmpty";
import {
	type NotificationFilterType,
	NotificationFilters,
} from "./NotificationFilters";

interface NotificationClientProps {
	initialNotifications: NotificationItemData[];
}

export function NotificationClient({
	initialNotifications,
}: NotificationClientProps) {
	const router = useRouter();
	const [notifications, setNotifications] = useState(initialNotifications);
	const [activeFilter, setActiveFilter] =
		useState<NotificationFilterType>("all");

	const unreadCount = notifications.filter((n) => !n.isRead).length;

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

	const handleMarkAllRead = async () => {
		try {
			await fetch("/api/notifications/read-all", { method: "POST" });
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		} catch (e) {
			console.error("Failed to mark all read", e);
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		}
	};

	const handleClick = (item: NotificationItemData) => {
		if (!item.isRead) {
			handleMarkRead(item.id);
		}

		if (item.preset) {
			router.push(`/preset/${item.preset.slug}`);
		} else if (item.actor) {
			router.push(`/u/${item.actor.username}`);
		}
	};

	const filteredNotifications = notifications.filter((item) => {
		if (activeFilter === "unread") return !item.isRead;
		if (activeFilter === "like") return item.type === "like";
		if (activeFilter === "comment") return item.type === "comment";
		if (activeFilter === "follow") return item.type === "follow";
		if (activeFilter === "system")
			return item.type === "system" || item.type === "badge";
		return true;
	});

	return (
		<div className="space-y-6 max-w-3xl mx-auto pb-12">
			{/* Header Bar */}
			<div className="flex items-center justify-between px-1">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
						<Bell className="w-4 h-4" />
						<span>Activity Hub</span>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
						Notifications
					</h1>
				</div>

				{unreadCount > 0 && (
					<button
						type="button"
						onClick={handleMarkAllRead}
						className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-semibold text-xs border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all"
					>
						<CheckCheck className="w-4 h-4 text-emerald-400" />
						<span className="hidden sm:inline">Mark all read</span>
					</button>
				)}
			</div>

			{/* Sticky Category Filters */}
			<NotificationFilters
				activeFilter={activeFilter}
				onFilterChange={setActiveFilter}
				unreadCount={unreadCount}
			/>

			{/* Notification List Feed */}
			{filteredNotifications.length > 0 ? (
				<div className="space-y-3">
					{filteredNotifications.map((notification) => (
						<NotificationCard
							key={notification.id}
							notification={notification}
							onMarkRead={handleMarkRead}
							onClick={handleClick}
						/>
					))}
				</div>
			) : (
				<NotificationEmpty filter={activeFilter} />
			)}
		</div>
	);
}
