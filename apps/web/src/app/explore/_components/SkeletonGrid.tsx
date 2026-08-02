import { Skeleton } from "@presethub/ui";

const SKELETON_IDS = [
	"sk-1",
	"sk-2",
	"sk-3",
	"sk-4",
	"sk-5",
	"sk-6",
	"sk-7",
	"sk-8",
];

export function SkeletonGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
			{SKELETON_IDS.map((id) => (
				<Skeleton key={id} variant="card" />
			))}
		</div>
	);
}
