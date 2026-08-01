export default function NotificationsLoading() {
	return (
		<div className="space-y-4 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={`notif-${i}`}
						className="h-16 w-full bg-[var(--color-bg-elevated)] rounded-lg"
					/>
				))}
			</div>
		</div>
	);
}
