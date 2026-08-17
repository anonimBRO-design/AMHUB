import { Skeleton } from "@presethub/ui";

const FILTER_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7"];
const PRESET_IDS = ["ep1", "ep2", "ep3", "ep4", "ep5", "ep6", "ep7", "ep8"];

export default function ExploreLoading() {
	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Explore Presets</h1>
			<div className="flex justify-center">
				<div className="h-12 w-full max-w-2xl rounded-lg bg-[var(--color-bg-elevated)] animate-pulse" />
			</div>
			<div className="flex flex-wrap gap-2 justify-center">
				{FILTER_IDS.map((id) => (
					<div
						key={id}
						className="h-8 w-20 rounded-full bg-[var(--color-bg-elevated)] animate-pulse"
					/>
				))}
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
				{PRESET_IDS.map((id) => (
					<Skeleton key={id} variant="card" />
				))}
			</div>
		</div>
	);
}
