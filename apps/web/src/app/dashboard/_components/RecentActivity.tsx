import { Clock, Download, Heart, MessageSquare, UserPlus } from "lucide-react";

export function RecentActivity() {
	const activities = [
		{
			id: "1",
			title: "New download on 'Smooth Velocity Edit #4'",
			time: "10 mins ago",
			icon: Download,
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
		},
		{
			id: "2",
			title: "@kuro_edit started following you",
			time: "1 hour ago",
			icon: UserPlus,
			color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
		},
		{
			id: "3",
			title: "@alight_master liked 'Neon Color Grading Pack'",
			time: "3 hours ago",
			icon: Heart,
			color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
		},
		{
			id: "4",
			title: "New comment on '3D Camera Transition'",
			time: "5 hours ago",
			icon: MessageSquare,
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		},
	];

	return (
		<div className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
						<Clock className="w-4 h-4" />
					</div>
					<h3 className="text-base font-bold text-[var(--color-text-primary)]">
						Recent Notifications & Activity
					</h3>
				</div>
			</div>

			<div className="space-y-3">
				{activities.map((act) => {
					const Icon = act.icon;
					return (
						<div
							key={act.id}
							className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/60 text-xs"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className={`p-2 rounded-xl border ${act.color} shrink-0`}>
									<Icon className="w-4 h-4" />
								</div>
								<span className="font-semibold text-[var(--color-text-primary)] truncate">
									{act.title}
								</span>
							</div>
							<span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0 ml-2">
								{act.time}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
