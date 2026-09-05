import { Download, Eye, Grid, Heart, UserCheck, Users } from "lucide-react";

interface StatsCardsProps {
	stats: {
		totalDownloads: number;
		totalLikes: number;
		followerCount: number;
		followingCount: number;
		totalViews: number;
		presetCount: number;
	};
}

export function StatsCards({ stats }: StatsCardsProps) {
	const cards = [
		{
			label: "Total Presets",
			value: stats.presetCount,
			icon: Grid,
			color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
		},
		{
			label: "Total Downloads",
			value: stats.totalDownloads,
			icon: Download,
			color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
		},
		{
			label: "Total Likes",
			value: stats.totalLikes,
			icon: Heart,
			color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
		},
		{
			label: "Total Views",
			value: stats.totalViews,
			icon: Eye,
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		},
		{
			label: "Followers",
			value: stats.followerCount,
			icon: Users,
			color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
		},
		{
			label: "Following",
			value: stats.followingCount,
			icon: UserCheck,
			color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
		},
	];

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<div
						key={card.label}
						className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-2 shadow-md hover:border-[var(--color-interactive-primary)]/30 transition-all"
					>
						<div className="flex items-center justify-between">
							<span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
								{card.label}
							</span>
							<div className={`p-1.5 rounded-xl border ${card.color}`}>
								<Icon className="w-3.5 h-3.5" />
							</div>
						</div>
						<p className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)]">
							{card.value.toLocaleString()}
						</p>
					</div>
				);
			})}
		</div>
	);
}
