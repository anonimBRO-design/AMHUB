export default function UploadLoading() {
	return (
		<div className="mx-auto max-w-2xl p-6 space-y-6 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="flex justify-between">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={`step-${i}`}
						className="h-6 w-24 bg-[var(--color-bg-elevated)] rounded"
					/>
				))}
			</div>
			<div className="min-h-[300px] rounded-lg bg-[var(--color-bg-elevated)]" />
		</div>
	);
}
