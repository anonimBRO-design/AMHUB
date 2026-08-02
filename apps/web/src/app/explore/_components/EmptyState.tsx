"use client";

import { RotateCcw, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
	searchQuery?: string;
	category?: string;
}

export function EmptyState({ searchQuery, category }: EmptyStateProps) {
	const router = useRouter();

	const handleReset = () => {
		router.push("/explore");
	};

	return (
		<div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 max-w-md mx-auto my-6 shadow-xl">
			<div className="p-4 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)]">
				<SearchX className="w-8 h-8" />
			</div>

			<div className="space-y-1">
				<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
					No Presets Found
				</h3>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					{searchQuery
						? `We couldn't find any presets matching "${searchQuery}".`
						: category
							? `No presets available in the "${category}" category right now.`
							: "No presets match your current filter selection."}
				</p>
			</div>

			<button
				type="button"
				onClick={handleReset}
				className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-semibold text-xs shadow-md shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
			>
				<RotateCcw className="w-4 h-4" />
				<span>Reset Filters</span>
			</button>
		</div>
	);
}
