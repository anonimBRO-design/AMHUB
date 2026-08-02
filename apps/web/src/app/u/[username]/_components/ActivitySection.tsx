import { Activity, Award, Heart, Upload } from "lucide-react";

interface ActivitySectionProps {
	username: string;
	displayName: string;
}

export function ActivitySection({
	username,
	displayName,
}: ActivitySectionProps) {
	const activities = [
		{
			id: "1",
			title: "Published new XML preset",
			subtitle: "Smooth Velocity Edit #4",
			time: "2 days ago",
			icon: Upload,
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
		},
		{
			id: "2",
			title: "Reached 1,000 total downloads",
			subtitle: "Community Milestone Achieved",
			time: "1 week ago",
			icon: Award,
			color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
		},
		{
			id: "3",
			title: "Liked 5 presets in Velocity",
			subtitle: "Curating community favorites",
			time: "2 weeks ago",
			icon: Heart,
			color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
		},
	];

	return (
		<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center gap-2">
				<Activity className="w-4 h-4 text-purple-400" />
				<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
					Recent Activity
				</h3>
			</div>

			<div className="space-y-3 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--color-border-subtle)]">
				{activities.map((act) => {
					const Icon = act.icon;
					return (
						<div
							key={act.id}
							className="relative flex items-start gap-3.5 pl-2"
						>
							<div
								className={`p-2 rounded-xl border ${act.color} relative z-10 shrink-0`}
							>
								<Icon className="w-3.5 h-3.5" />
							</div>
							<div className="space-y-0.5 min-w-0">
								<h4 className="text-xs font-bold text-[var(--color-text-primary)]">
									{act.title}
								</h4>
								<p className="text-xs text-[var(--color-text-secondary)]">
									{act.subtitle}
								</p>
								<span className="text-[10px] text-[var(--color-text-tertiary)] block">
									{act.time}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
