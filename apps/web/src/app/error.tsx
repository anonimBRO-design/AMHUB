"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4 max-w-md mx-auto my-8">
			<div className="p-4 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-xl">
				<AlertTriangle className="w-8 h-8" />
			</div>

			<div className="space-y-1">
				<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
					Something Went Wrong
				</h2>
				<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
					{error.message ||
						"An unexpected error occurred while loading this page."}
				</p>
			</div>

			<button
				type="button"
				onClick={() => reset()}
				className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-lg hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
			>
				<RefreshCw className="w-4 h-4" />
				<span>Reload Page</span>
			</button>
		</div>
	);
}
