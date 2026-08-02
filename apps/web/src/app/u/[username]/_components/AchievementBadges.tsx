import { Award, Flame, ShieldCheck, Sparkles, Zap } from "lucide-react";

interface AchievementBadgesProps {
	isVerified?: boolean;
	totalDownloads?: number;
	presetCount?: number;
}

export function AchievementBadges({
	isVerified = false,
	totalDownloads = 0,
	presetCount = 0,
}: AchievementBadgesProps) {
	const achievements = [
		{
			id: "verified",
			title: "Verified Creator",
			description: "Official Alight Motion verified creator status.",
			icon: ShieldCheck,
			unlocked: isVerified,
			color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
		},
		{
			id: "downloads",
			title: "10K+ Downloads",
			description: "Surpassed 10,000 total community preset downloads.",
			icon: Zap,
			unlocked: totalDownloads >= 10000 || isVerified,
			color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
		},
		{
			id: "trending",
			title: "Trending Editor",
			description: "Featured in top weekly trending Alight Motion edits.",
			icon: Flame,
			unlocked: presetCount >= 5,
			color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
		},
		{
			id: "pro",
			title: "Pro Contributor",
			description: "Published 10+ high quality XML & QR presets.",
			icon: Award,
			unlocked: presetCount >= 10,
			color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
		},
	];

	return (
		<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center gap-2">
				<Sparkles className="w-4 h-4 text-amber-400" />
				<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
					Achievements & Badges
				</h3>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{achievements.map((badge) => {
					const Icon = badge.icon;
					return (
						<div
							key={badge.id}
							className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
								badge.unlocked
									? "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)]"
									: "bg-[var(--color-bg-base)]/40 border-[var(--color-border-subtle)]/40 opacity-50 grayscale"
							}`}
						>
							<div className={`p-2 rounded-xl border ${badge.color} shrink-0`}>
								<Icon className="w-4 h-4" />
							</div>
							<div className="space-y-0.5 min-w-0">
								<h4 className="text-xs font-bold text-[var(--color-text-primary)]">
									{badge.title}
								</h4>
								<p className="text-[11px] text-[var(--color-text-tertiary)] leading-normal line-clamp-2">
									{badge.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
