"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
	message?: string;
	onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4 max-w-md mx-auto my-6 shadow-xl">
			<div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
				<AlertTriangle className="w-8 h-8" />
			</div>

			<div className="space-y-1">
				<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
					Unable to Load Presets
				</h3>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					{message ||
						"An unexpected error occurred while fetching explore presets."}
				</p>
			</div>

			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] font-semibold text-xs hover:border-[var(--color-border-strong)] active:scale-95 transition-all"
				>
					<RefreshCw className="w-4 h-4" />
					<span>Try Again</span>
				</button>
			)}
		</div>
	);
}
