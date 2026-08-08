"use client";

import {
	Bell,
	Clock,
	Download,
	Heart,
	MessageSquare,
	UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationItem {
	id: string;
	type: "like" | "comment" | "follow" | "download" | "system";
	message?: string | null;
	created_at: string;
	actor?: {
		username: string;
		display_name: string;
	} | null;
	preset?: {
		title: string;
		slug: string;
	} | null;
}

export function RecentActivity() {
	const [activities, setActivities] = useState<NotificationItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		async function fetchActivity() {
			try {
				const res = await fetch("/api/notifications");
				if (res.ok) {
					const json = await res.json();
					if (isMounted && Array.isArray(json.data)) {
						setActivities(json.data.slice(0, 5));
					}
				}
			} catch (err) {
				console.error("Failed to load activity:", err);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		fetchActivity();
		return () => {
			isMounted = false;
		};
	}, []);

	function getIconAndColor(type: NotificationItem["type"]) {
		switch (type) {
			case "download":
				return {
					icon: Download,
					color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
				};
			case "like":
				return {
					icon: Heart,
					color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
				};
			case "follow":
				return {
					icon: UserPlus,
					color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
				};
			case "comment":
				return {
					icon: MessageSquare,
					color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
				};
			default:
				return {
					icon: Bell,
					color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
				};
		}
	}

	function formatTitle(item: NotificationItem) {
		const actorName =
			item.actor?.display_name || `@${item.actor?.username || "Someone"}`;
		const presetTitle = item.preset?.title
			? `'${item.preset.title}'`
			: "your preset";

		switch (item.type) {
			case "like":
				return `${actorName} liked ${presetTitle}`;
			case "download":
				return `New download on ${presetTitle}`;
			case "follow":
				return `${actorName} started following you`;
			case "comment":
				return `${actorName} commented on ${presetTitle}`;
			default:
				return item.message || "New activity notification";
		}
	}

	return (
		<div className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg h-full flex flex-col justify-between">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
							<Clock className="w-4 h-4" />
						</div>
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							Recent Notifications
						</h3>
					</div>
				</div>

				{isLoading ? (
					<div className="p-8 text-center text-xs text-[var(--color-text-tertiary)] animate-pulse">
						Loading notifications...
					</div>
				) : activities.length === 0 ? (
					<div className="p-8 text-center rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-1">
						<p className="text-xs font-bold text-[var(--color-text-primary)]">
							No Recent Activity
						</p>
						<p className="text-[11px] text-[var(--color-text-secondary)]">
							Notifications will appear here when users interact with your
							account.
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{activities.map((act) => {
							const { icon: Icon, color } = getIconAndColor(act.type);
							return (
								<div
									key={act.id}
									className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs"
								>
									<div className="flex items-center gap-3 min-w-0">
										<div className={`p-2 rounded-xl border ${color} shrink-0`}>
											<Icon className="w-4 h-4" />
										</div>
										<span className="font-semibold text-[var(--color-text-primary)] truncate">
											{formatTitle(act)}
										</span>
									</div>
									<span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0 ml-2">
										{new Date(act.created_at).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
