"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

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

	const filteredNotifications = notifications.filter(
		(n) => filter === "all" || !n.isRead,
	);

	return (
		<div className="md:hidden space-y-4 pb-24">
			<div className="flex items-center justify-between p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-2xl bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
						<Bell className="w-6 h-6" />
					</div>
					<div>
						<h1 className="text-lg font-extrabold text-[var(--color-text-primary)]">
							Notifications
						</h1>
						<p className="text-xs text-[var(--color-text-secondary)] font-medium">
							{notifications.filter((n) => !n.isRead).length} Unread Updates
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={onMarkAllRead}
					className="px-3 py-2 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] active:scale-95 transition-all"
				>
					Mark All Read
				</button>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => setFilter("all")}
					className={`flex-1 min-h-[42px] rounded-2xl text-xs font-bold transition-all shadow-md ${
						filter === "all"
							? "bg-[var(--color-interactive-primary)] text-white"
							: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
					}`}
				>
					All ({notifications.length})
				</button>
				<button
					type="button"
					onClick={() => setFilter("unread")}
					className={`flex-1 min-h-[42px] rounded-2xl text-xs font-bold transition-all shadow-md ${
						filter === "unread"
							? "bg-[var(--color-interactive-primary)] text-white"
							: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
					}`}
				>
					Unread Only
				</button>
			</div>

			<div className="space-y-3">
				{filteredNotifications.map((n) => (
					<div
						key={n.id}
						className={`p-4 rounded-3xl border transition-all flex items-start gap-3 shadow-md ${
							n.isRead
								? "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] opacity-80"
								: "bg-[var(--color-bg-surface)] border-[var(--color-interactive-primary)]/40"
						}`}
					>
						<img
							src={
								n.actor.avatarUrl ||
								`https://api.dicebear.com/7.x/identicon/svg?seed=${n.actor.username}`
							}
							alt={n.actor.displayName}
							className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--color-border-subtle)] shadow-sm"
						/>
						<div className="flex-1 space-y-1 min-w-0">
							<p className="text-xs text-[var(--color-text-primary)] leading-snug">
								<span className="font-bold">{n.actor.displayName}</span>{" "}
								<span className="text-[var(--color-text-secondary)]">
									{n.message}
								</span>
							</p>
							<span className="text-[10px] text-[var(--color-text-tertiary)] font-semibold block">
								{n.timestamp}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
