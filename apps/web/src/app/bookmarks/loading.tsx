import { Skeleton } from "@presethub/ui";

const SKELETON_IDS = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"];

export default function BookmarksLoading() {
	return (
		<div className="space-y-8 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
				{SKELETON_IDS.map((id) => (
					<Skeleton key={id} variant="card" />
				))}
			</div>
		</div>
	);
}
