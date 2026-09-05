"use client";

import {
	Award,
	Bookmark,
	Check,
	Download,
	Heart,
	MessageSquare,
	ShieldAlert,
	Sparkles,
	UserPlus,
} from "lucide-react";

export interface NotificationItemData {
	id: string;
	type:
		| "like"
		| "comment"
		| "follow"
		| "download"
		| "bookmark"
		| "download_milestone"
		| "new_preset"
		| "system";
	actor?: { username: string; displayName: string; avatarUrl?: string | null };
	preset?: { slug: string; title: string; thumbnailUrl?: string | null };
	message?: string;
	isRead: boolean;
	createdAt: string;
	rawCreatedAt?: string;
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
				return <UserPlus className="w-3.5 h-3.5 text-cyan-400" />;
			case "new_preset":
				return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
			case "bookmark":
				return <Bookmark className="w-3.5 h-3.5 text-amber-400" />;
			case "download":
			case "download_milestone":
				return <Download className="w-3.5 h-3.5 text-emerald-400" />;
			case "system":
				return <Award className="w-3.5 h-3.5 text-amber-400" />;
			default:
				return <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />;
		}
	};

	return (
		<button
			type="button"
			onClick={() => onClick(notification)}
			className={`w-full text-left relative group flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] select-none ${
				!notification.isRead
					? "bg-[var(--color-bg-surface)] border-[var(--color-interactive-primary)]/40 shadow-md"
					: "bg-[var(--color-bg-surface)]/50 border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
			}`}
		>
			{/* Actor Avatar or System Icon */}
			<div className="relative shrink-0 mt-0.5">
				{notification.actor?.avatarUrl ? (
					<img
						src={notification.actor.avatarUrl}
						alt={notification.actor.displayName}
						className="w-10 h-10 rounded-full object-cover border border-[var(--color-border-subtle)]"
					/>
				) : (
					<div className="w-10 h-10 rounded-full bg-cyan-600/30 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
						{(notification.actor?.displayName || "AM")
							.slice(0, 2)
							.toUpperCase()}
					</div>
				)}
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
					<div className="flex items-center gap-2 pt-0.5">
						{notification.preset.thumbnailUrl && (
							<img
								src={notification.preset.thumbnailUrl}
								alt={notification.preset.title}
								className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
							/>
						)}
						<span className="inline-block text-xs font-semibold text-[var(--color-interactive-primary)] truncate max-w-full">
							"{notification.preset.title}"
						</span>
					</div>
				)}

				<span className="text-[10px] text-[var(--color-text-tertiary)] block pt-0.5">
					{notification.createdAt}
				</span>
			</div>

			{/* Mark as Read Action */}
			{!notification.isRead && (
				<span
					className="shrink-0 p-2 rounded-xl text-[var(--color-text-tertiary)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
					title="Mark as read"
					data-mark-read={notification.id}
					onPointerDown={(e) => {
						e.stopPropagation();
						e.preventDefault();
						onMarkRead(notification.id);
					}}
				>
					<Check className="w-4 h-4" />
				</span>
			)}
		</button>
	);
}
