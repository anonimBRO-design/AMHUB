export default function SettingsLoading() {
	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="space-y-4">
				<div className="h-10 w-full bg-[var(--color-bg-elevated)] rounded" />
				<div className="h-24 w-full bg-[var(--color-bg-elevated)] rounded" />
				<div className="h-10 w-full bg-[var(--color-bg-elevated)] rounded" />
			</div>
		</div>
	);
}
