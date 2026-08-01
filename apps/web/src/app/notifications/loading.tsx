const SKELETON_IDS = ["n1", "n2", "n3", "n4", "n5"];

export default function NotificationsLoading() {
	return (
		<div className="space-y-4 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="space-y-2">
				{SKELETON_IDS.map((id) => (
					<div
						key={id}
						className="h-16 w-full bg-[var(--color-bg-elevated)] rounded-lg"
					/>
				))}
			</div>
		</div>
	);
}
