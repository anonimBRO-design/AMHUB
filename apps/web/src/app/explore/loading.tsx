import { Skeleton } from "@presethub/ui";

export default function ExploreLoading() {
	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Explore Presets</h1>
			<div className="flex justify-center">
				<div className="h-12 w-full max-w-2xl rounded-lg bg-[var(--color-bg-elevated)] animate-pulse" />
			</div>
			<div className="flex flex-wrap gap-2 justify-center">
				{Array.from({ length: 7 }).map((_, i) => (
					<div
						key={`filter-${i}`}
						className="h-8 w-20 rounded-full bg-[var(--color-bg-elevated)] animate-pulse"
					/>
				))}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={`preset-${i}`} variant="card" />
				))}
			</div>
		</div>
	);
}
