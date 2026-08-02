const SKELETON_KEYS = ["nt-sk-1", "nt-sk-2", "nt-sk-3", "nt-sk-4"];

export function NotificationSkeleton() {
	return (
		<div className="space-y-3 animate-pulse">
			{SKELETON_KEYS.map((key) => (
				<div
					key={key}
					className="flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]"
				>
					<div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] shrink-0" />
					<div className="flex-1 space-y-2">
						<div className="h-3.5 bg-[var(--color-bg-elevated)] rounded-md w-3/4" />
						<div className="h-2.5 bg-[var(--color-bg-elevated)] rounded-md w-1/3" />
					</div>
				</div>
			))}
		</div>
	);
}
