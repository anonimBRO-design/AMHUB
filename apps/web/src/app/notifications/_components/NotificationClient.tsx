"use client";

import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
	const { currentUser } = useAuth();
	const [notifications, setNotifications] = useState(initialNotifications);
	const [activeFilter, setActiveFilter] =
		useState<NotificationFilterType>("all");

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	// Realtime listener for incoming notifications
	useEffect(() => {
		if (!currentUser?.id) return;
		const supabase = createSupabaseBrowserClient();

		const channel = supabase
			.channel(`user-notifications-${currentUser.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `user_id=eq.${currentUser.id}`,
				},
				(payload: any) => {
					const newRow = payload.new as {
						id: string;
						type: string;
						message?: string;
						is_read: boolean;
						created_at: string;
					};
					const newNotification: NotificationItemData = {
						id: newRow.id,
						type: newRow.type as NotificationItemData["type"],
						message: newRow.message,
						isRead: newRow.is_read,
						createdAt: new Date(newRow.created_at).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						}),
						rawCreatedAt: newRow.created_at,
					};
					setNotifications((prev) => [newNotification, ...prev]);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [currentUser?.id]);

	const handleMarkRead = async (id: string) => {
		try {
			await fetch("/api/notifications", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
			);
		} catch (e) {
			console.error("Failed to mark notification read", e);
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await fetch("/api/notifications", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ markAll: true }),
			});
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

	const filteredNotifications = useMemo(() => {
		return notifications.filter((item) => {
			if (activeFilter === "unread") return !item.isRead;
			if (activeFilter === "like") return item.type === "like";
			if (activeFilter === "comment") return item.type === "comment";
			if (activeFilter === "follow") return item.type === "follow";
			if (activeFilter === "new_preset") return item.type === "new_preset";
			if (activeFilter === "system")
				return (
					item.type === "system" ||
					item.type === "download_milestone" ||
					item.type === "download"
				);
			return true;
		});
	}, [notifications, activeFilter]);

	// Grouping notifications by Today, Yesterday, Earlier
	const groupedNotifications = useMemo(() => {
		const today: NotificationItemData[] = [];
		const yesterday: NotificationItemData[] = [];
		const earlier: NotificationItemData[] = [];

		const now = new Date();
		const todayStart = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);
		const yesterdayStart = new Date(todayStart);
		yesterdayStart.setDate(yesterdayStart.getDate() - 1);

		for (const item of filteredNotifications) {
			const itemDate = item.rawCreatedAt
				? new Date(item.rawCreatedAt)
				: new Date();
			if (itemDate >= todayStart) {
				today.push(item);
			} else if (itemDate >= yesterdayStart) {
				yesterday.push(item);
			} else {
				earlier.push(item);
			}
		}

		return { today, yesterday, earlier };
	}, [filteredNotifications]);

	return (
		<div className="space-y-6 max-w-3xl mx-auto pb-16 px-4 sm:px-0">
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
						<span>Mark all read</span>
					</button>
				)}
			</div>

			<NotificationFilters
				activeFilter={activeFilter}
				onFilterChange={setActiveFilter}
				unreadCount={unreadCount}
			/>

			{filteredNotifications.length > 0 ? (
				<div className="space-y-6">
					{/* Group Today */}
					{groupedNotifications.today.length > 0 && (
						<div className="space-y-3">
							<h2 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider px-1">
								Today
							</h2>
							{groupedNotifications.today.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									onMarkRead={handleMarkRead}
									onClick={handleClick}
								/>
							))}
						</div>
					)}

					{/* Group Yesterday */}
					{groupedNotifications.yesterday.length > 0 && (
						<div className="space-y-3">
							<h2 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider px-1">
								Yesterday
							</h2>
							{groupedNotifications.yesterday.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									onMarkRead={handleMarkRead}
									onClick={handleClick}
								/>
							))}
						</div>
					)}

					{/* Group Earlier */}
					{groupedNotifications.earlier.length > 0 && (
						<div className="space-y-3">
							<h2 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider px-1">
								Earlier
							</h2>
							{groupedNotifications.earlier.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									onMarkRead={handleMarkRead}
									onClick={handleClick}
								/>
							))}
						</div>
					)}
				</div>
			) : (
				<NotificationEmpty filter={activeFilter} />
			)}
		</div>
	);
}
