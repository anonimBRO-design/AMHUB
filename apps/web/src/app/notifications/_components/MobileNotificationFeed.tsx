"use client";

import { Bell, Check } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export interface MobileNotificationItem {
	id: string;
	type: string;
	isRead: boolean;
	timestamp: string;
	actor: {
		username: string;
		displayName: string;
		avatarUrl?: string;
	};
	message: string;
}

interface MobileNotificationFeedProps {
	notifications: MobileNotificationItem[];
	onMarkAllRead: () => void;
}

export function MobileNotificationFeed({
	notifications,
	onMarkAllRead,
}: MobileNotificationFeedProps) {
	const [filter, setFilter] = useState<"all" | "unread">("all");
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const filteredNotifications = notifications.filter((n) =>
		filter === "all" ? true : !n.isRead,
	);

	return (
		<div className="md:hidden space-y-6 px-4 pb-32 pt-4">
			{/* Header Card */}
			<div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-xl border border-[var(--color-border-subtle)]">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-interactive-primary/10 p-2.5">
							<Bell className="w-7 h-7 text-interactive-primary" />
						</div>
						<div>
							<h1 className="text-xl font-bold">Activity</h1>
							<p className="text-[15px] font-medium text-tertiary">
								{unreadCount} unread
							</p>
						</div>
					</div>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={onMarkAllRead}
							className="flex min-h-[48px] items-center gap-2 rounded-2xl bg-surface-hover px-4 text-sm font-bold active:scale-95 transition-transform"
						>
							<Check className="w-4 h-4" />
							Mark Read
						</button>
					)}
				</div>

				{/* Filter Tabs */}
				<div className="flex gap-2 rounded-2xl bg-background p-1 border border-[var(--color-border-subtle)]">
					<button
						type="button"
						onClick={() => setFilter("all")}
						className={`flex-1 min-h-[48px] rounded-xl text-sm font-bold transition-colors ${
							filter === "all" ? "bg-surface shadow-sm" : "text-tertiary"
						}`}
					>
						All Activity
					</button>
					<button
						type="button"
						onClick={() => setFilter("unread")}
						className={`flex-1 min-h-[48px] rounded-xl text-sm font-bold transition-colors ${
							filter === "unread" ? "bg-surface shadow-sm" : "text-tertiary"
						}`}
					>
						Unread
					</button>
				</div>
			</div>

			{/* Notification List */}
			<div className="space-y-3">
				{filteredNotifications.map((notif) => (
					<div
						key={notif.id}
						className={`flex gap-4 rounded-2xl p-4 transition-colors ${
							notif.isRead
								? "bg-surface border border-[var(--color-border-subtle)]"
								: "bg-interactive-primary/5 border border-interactive-primary/20"
						}`}
					>
						<div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-surface-hover">
							{notif.actor.avatarUrl ? (
								<Image
									src={notif.actor.avatarUrl}
									alt={notif.actor.displayName}
									fill
									className="object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-surface-hover text-lg font-bold">
									{notif.actor.displayName.charAt(0)}
								</div>
							)}
						</div>

						<div className="flex-1 space-y-1">
							<div className="flex items-start justify-between gap-2">
								<span className="text-[15px] font-bold">
									{notif.actor.displayName}
								</span>
								<span className="flex-shrink-0 text-sm font-medium text-tertiary">
									{notif.timestamp}
								</span>
							</div>
							<p className="text-[15px] leading-snug text-secondary">
								{notif.message}
							</p>
						</div>

						{!notif.isRead && (
							<div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-interactive-primary" />
						)}
					</div>
				))}
				{filteredNotifications.length === 0 && (
					<div className="py-12 text-center">
						<p className="text-[15px] font-semibold text-tertiary">
							No notifications
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
