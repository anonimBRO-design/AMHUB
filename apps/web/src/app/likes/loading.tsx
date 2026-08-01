import { Skeleton } from "@presethub/ui";

export default function LikesLoading() {
	return (
		<div className="space-y-8 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={`preset-${i}`} variant="card" />
				))}
			</div>
		</div>
	);
}
