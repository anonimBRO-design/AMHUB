"use client";

import {
	Award,
	Bell,
	Check,
	Download,
	Heart,
	MessageSquare,
	ShieldAlert,
	UserPlus,
} from "lucide-react";

export interface NotificationItemData {
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

interface NotificationCardProps {
	notification: NotificationItemData;
	onMarkRead: (id: string) => void;
	onClick: (item: NotificationItemData) => void;
}

export function NotificationCard({
	notification,
	onMarkRead,
	onClick,
}: NotificationCardProps) {
	const getIcon = () => {
		switch (notification.type) {
			case "like":
				return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />;
			case "comment":
				return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
			case "follow":
				return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
			case "download":
				return <Download className="w-3.5 h-3.5 text-emerald-400" />;
			case "badge":
			case "challenge":
			case "featured":
				return <Award className="w-3.5 h-3.5 text-amber-400" />;
			default:
				return <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />;
		}
	};

	return (
		<button
			type="button"
			onClick={() => onClick(notification)}
			className={`w-full text-left relative group flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
				!notification.isRead
					? "bg-[var(--color-bg-surface)] border-[var(--color-interactive-primary)]/40 shadow-md"
					: "bg-[var(--color-bg-surface)]/50 border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
			}`}
		>
			{/* Actor Avatar or System Icon */}
			<div className="relative shrink-0 mt-0.5">
				<img
					src={
						notification.actor?.avatarUrl ||
						`https://api.dicebear.com/7.x/identicon/svg?seed=${notification.actor?.username || "system"}`
					}
					alt={notification.actor?.displayName || "Notification"}
					className="w-10 h-10 rounded-full object-cover border border-[var(--color-border-subtle)]"
				/>
				<div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-sm">
					{getIcon()}
				</div>
			</div>

			{/* Body text */}
			<div className="flex-1 min-w-0 space-y-1">
				<div className="flex items-center justify-between gap-2">
					<p className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] leading-snug">
						{notification.actor && (
							<span className="font-bold text-[var(--color-text-primary)] mr-1">
								{notification.actor.displayName}
							</span>
						)}
						{notification.message || "performed an action on your account."}
					</p>
					{!notification.isRead && (
						<span className="w-2.5 h-2.5 rounded-full bg-[var(--color-interactive-primary)] shrink-0 shadow-sm animate-pulse" />
					)}
				</div>

				{notification.preset && (
					<span className="inline-block text-xs font-semibold text-[var(--color-interactive-primary)] truncate max-w-full">
						Preset: "{notification.preset.title}"
					</span>
				)}

				<span className="text-[10px] text-[var(--color-text-tertiary)] block">
					{notification.createdAt}
				</span>
			</div>

			{/* Mark as Read Action Button */}
			{!notification.isRead && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onMarkRead(notification.id);
					}}
					title="Mark as read"
					className="shrink-0 p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
				>
					<Check className="w-4 h-4" />
				</button>
			)}
		</button>
	);
}
