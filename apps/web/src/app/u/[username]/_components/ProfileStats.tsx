import { Download, Grid, Heart, UserCheck, Users } from "lucide-react";

interface ProfileStatsProps {
	presetCount: number;
	followerCount: number;
	followingCount: number;
	totalDownloads?: number;
	totalLikes?: number;
}

export function ProfileStats({
	presetCount,
	followerCount,
	followingCount,
	totalDownloads = 0,
	totalLikes = 0,
}: ProfileStatsProps) {
	const stats = [
		{
			label: "Presets",
			value: presetCount,
			icon: Grid,
			color: "text-indigo-400",
		},
		{
			label: "Followers",
			value: followerCount,
			icon: Users,
			color: "text-purple-400",
		},
		{
			label: "Following",
			value: followingCount,
			icon: UserCheck,
			color: "text-blue-400",
		},
		{
			label: "Downloads",
			value: totalDownloads,
			icon: Download,
			color: "text-emerald-400",
		},
		{ label: "Likes", value: totalLikes, icon: Heart, color: "text-rose-400" },
	];

	return (
		<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-md transition-all hover:border-[var(--color-interactive-primary)]/30"
					>
						<div
							className={`flex items-center gap-1.5 font-extrabold text-base sm:text-xl ${stat.color}`}
						>
							<Icon className="w-4 h-4 hidden sm:inline" />
							<span>{stat.value.toLocaleString()}</span>
						</div>
						<span className="text-[10px] sm:text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">
							{stat.label}
						</span>
					</div>
				);
			})}
		</div>
	);
}
