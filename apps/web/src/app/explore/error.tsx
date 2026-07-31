"use client";

export default function ExploreError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-16">
			<h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
				Something went wrong
			</h2>
			<p className="text-[var(--color-text-secondary)]">{error.message}</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-[var(--radius-md)] bg-[var(--color-interactive-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-interactive-primary-hover)]"
			>
				Try again
			</button>
		</div>
	);
}
