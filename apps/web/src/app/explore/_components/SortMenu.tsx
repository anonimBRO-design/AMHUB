"use client";

import {
	ArrowUpDown,
	Clock,
	Download,
	Flame,
	Heart,
	Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_OPTIONS = [
	{ label: "Newest", value: "created_at", icon: Sparkles },
	{ label: "Oldest", value: "oldest", icon: Clock },
	{ label: "Most Downloaded", value: "most_downloaded", icon: Download },
	{ label: "Most Liked", value: "most_liked", icon: Heart },
	{ label: "Trending", value: "trending", icon: Flame },
];

export function SortMenu() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeSort = searchParams.get("sort") ?? "created_at";
	const [, startTransition] = useTransition();

	const handleSortClick = (sortVal: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (sortVal === "created_at") {
			params.delete("sort");
		} else {
			params.set("sort", sortVal);
		}
		startTransition(() => {
			router.push(`/explore?${params.toString()}`);
		});
	};

	return (
		<div className="flex items-center gap-2 overflow-x-auto snap-x scrollbar-none py-1 text-xs select-none">
			<div className="flex items-center gap-1 text-[var(--color-text-tertiary)] font-bold shrink-0 pr-1">
				<ArrowUpDown className="w-3.5 h-3.5" />
				<span className="uppercase tracking-wider text-[10px]">Sort:</span>
			</div>

			{SORT_OPTIONS.map((option) => {
				const Icon = option.icon;
				const isActive = activeSort === option.value;
				return (
					<button
						key={option.value}
						type="button"
						onClick={() => handleSortClick(option.value)}
						className={`snap-start shrink-0 inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl border transition-all duration-200 active:scale-95 text-xs font-semibold ${
							isActive
								? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-[var(--color-interactive-primary)]/50 shadow-sm"
								: "bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-secondary)]"
						}`}
					>
						<Icon
							className={`w-3.5 h-3.5 ${isActive ? "text-[var(--color-interactive-primary)]" : ""}`}
						/>
						<span>{option.label}</span>
					</button>
				);
			})}
		</div>
	);
}
