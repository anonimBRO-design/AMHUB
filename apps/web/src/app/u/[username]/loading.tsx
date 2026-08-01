const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export default function ProfileLoading() {
	return (
		<div className="space-y-6 animate-pulse">
			<div className="h-48 w-full bg-[var(--color-bg-elevated)] rounded-t-lg" />
			<div className="px-6 pb-6 space-y-4">
				<div className="flex items-end gap-4 -mt-12">
					<div className="h-24 w-24 rounded-full bg-[var(--color-bg-elevated)] border-4 border-[var(--color-bg-surface)]" />
					<div className="space-y-2 pb-2">
						<div className="h-6 w-48 bg-[var(--color-bg-elevated)] rounded" />
						<div className="h-4 w-32 bg-[var(--color-bg-elevated)] rounded" />
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
				{SKELETON_IDS.map((id) => (
					<div
						key={id}
						className="h-64 rounded-lg bg-[var(--color-bg-elevated)]"
					/>
				))}
			</div>
		</div>
	);
}
