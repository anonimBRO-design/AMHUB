import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 p-6 text-center">
			<div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl relative">
				<Loader2 className="w-8 h-8 text-[var(--color-interactive-primary)] animate-spin" />
				<Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
			</div>
			<p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
				Loading Alight Motion Catalog...
			</p>
		</div>
	);
}
