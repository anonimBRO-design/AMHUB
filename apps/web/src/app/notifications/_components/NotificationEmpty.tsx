import { CheckCircle2 } from "lucide-react";

interface NotificationEmptyProps {
	filter: string;
}

export function NotificationEmpty({ filter }: NotificationEmptyProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3 max-w-md mx-auto my-6 shadow-lg">
			<div className="p-4 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)]">
				<CheckCircle2 className="w-8 h-8 text-emerald-400" />
			</div>

			<div className="space-y-1">
				<h3 className="text-base font-bold text-[var(--color-text-primary)]">
					You're all caught up.
				</h3>
				<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
					{filter === "all"
						? "You don't have any new notifications right now."
						: `No ${filter} notifications found in your activity feed.`}
				</p>
			</div>
		</div>
	);
}
