import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-6 text-center">
			<div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-2xl relative flex items-center justify-center">
				<img
					src="/logo.png"
					alt="AMHUB Logo"
					className="w-18 h-18 object-contain rounded-2xl animate-pulse"
				/>
				<Loader2 className="w-6 h-6 text-[var(--color-interactive-primary)] animate-spin absolute -bottom-2 -right-2 bg-[var(--color-bg-surface)] rounded-full p-0.5 border border-[var(--color-border-subtle)]" />
			</div>
			<div className="space-y-1">
				<h2 className="text-base font-extrabold text-[var(--color-text-primary)]">
					AMHUB
				</h2>
				<p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
					Loading Alight Motion Catalog...
				</p>
			</div>
		</div>
	);
}
