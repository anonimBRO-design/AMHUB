"use client";

export default function CollectionsError() {
	return (
		<div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
			<div className="text-center space-y-3">
				<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
					Something went wrong
				</h2>
				<p className="text-sm text-[var(--color-text-secondary)]">
					We could not load your collections. Please try again.
				</p>
				<a
					href="/collections"
					className="inline-block px-4 py-2 rounded-xl bg-[var(--color-interactive-primary)] text-white text-sm font-bold"
				>
					Retry
				</a>
			</div>
		</div>
	);
}
