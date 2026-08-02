"use client";

import {
	Bell,
	Heart,
	MessageSquare,
	ShieldAlert,
	UserPlus,
} from "lucide-react";

export type NotificationFilterType =
	| "all"
	| "unread"
	| "like"
	| "comment"
	| "follow"
	| "system";

interface NotificationFiltersProps {
	activeFilter: NotificationFilterType;
	onFilterChange: (filter: NotificationFilterType) => void;
	unreadCount: number;
}

export function NotificationFilters({
	activeFilter,
	onFilterChange,
	unreadCount,
}: NotificationFiltersProps) {
	const filters = [
		{ id: "all" as const, label: "All", icon: Bell },
		{ id: "unread" as const, label: "Unread", count: unreadCount, icon: Bell },
		{ id: "like" as const, label: "Likes", icon: Heart },
		{ id: "comment" as const, label: "Comments", icon: MessageSquare },
		{ id: "follow" as const, label: "Follows", icon: UserPlus },
		{ id: "system" as const, label: "System", icon: ShieldAlert },
	];

	return (
		<div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-1 text-xs select-none sticky top-16 z-20 backdrop-blur-md bg-[var(--color-bg-base)]/80">
			{filters.map((filter) => {
				const Icon = filter.icon;
				const isActive = activeFilter === filter.id;

				return (
					<button
						key={filter.id}
						type="button"
						onClick={() => onFilterChange(filter.id)}
						className={`shrink-0 inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-2xl border font-semibold transition-all active:scale-95 ${
							isActive
								? "bg-[var(--color-interactive-primary)] text-white border-[var(--color-interactive-primary)] shadow-md"
								: "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<Icon
							className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[var(--color-text-tertiary)]"}`}
						/>
						<span>{filter.label}</span>
						{typeof filter.count === "number" && filter.count > 0 && (
							<span
								className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
									isActive
										? "bg-white text-[var(--color-interactive-primary)]"
										: "bg-[var(--color-interactive-primary)] text-white"
								}`}
							>
								{filter.count}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
