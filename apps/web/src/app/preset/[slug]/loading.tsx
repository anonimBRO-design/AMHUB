export default function PresetDetailLoading() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-8 animate-pulse">
			<div className="md:col-span-3 aspect-video bg-[var(--color-bg-elevated)] rounded-lg" />
			<div className="md:col-span-2 space-y-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-[var(--color-bg-elevated)]" />
					<div className="h-4 w-32 bg-[var(--color-bg-elevated)] rounded" />
				</div>
				<div className="h-8 w-3/4 bg-[var(--color-bg-elevated)] rounded" />
				<div className="h-16 w-full bg-[var(--color-bg-elevated)] rounded" />
				<div className="h-12 w-full bg-[var(--color-bg-elevated)] rounded-lg" />
			</div>
		</div>
	);
}
