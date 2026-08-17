import { Skeleton } from "@presethub/ui";

const SKELETON_IDS = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];

export default function LikesLoading() {
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
