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
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
			{SKELETON_IDS.map((id) => (
				<Skeleton key={id} variant="card" />
			))}
		</div>
	);
}
