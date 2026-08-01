import { Skeleton } from "@presethub/ui";

const STAT_IDS = ["stat-1", "stat-2", "stat-3", "stat-4"];
const PRESET_IDS = ["dp1", "dp2", "dp3", "dp4"];

export default function DashboardLoading() {
	return (
		<div className="space-y-8 animate-pulse">
			<div className="h-8 w-48 bg-[var(--color-bg-elevated)] rounded" />
			<div className="grid grid-cols-4 gap-4">
				{STAT_IDS.map((id) => (
					<div
						key={id}
						className="h-24 rounded-lg bg-[var(--color-bg-elevated)]"
					/>
				))}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{PRESET_IDS.map((id) => (
					<Skeleton key={id} variant="card" />
				))}
			</div>
		</div>
	);
}
