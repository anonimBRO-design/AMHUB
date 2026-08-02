import { Award, CheckCircle2, UserPlus, Users } from "lucide-react";
import Link from "next/link";

interface Creator {
	username: string;
	displayName: string;
	avatarUrl: string;
	presetCount: number;
	followerCount: string;
	isVerified?: boolean;
}

const FEATURED_CREATORS: Creator[] = [
	{
		username: "alight_master",
		displayName: "Alight Master",
		avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=alight_master",
		presetCount: 142,
		followerCount: "28.5K",
		isVerified: true,
	},
	{
		username: "velocity_fx",
		displayName: "Velocity FX",
		avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=velocity_fx",
		presetCount: 89,
		followerCount: "19.2K",
		isVerified: true,
	},
	{
		username: "anime_edits_pro",
		displayName: "Kuro Edit",
		avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=kuro_edit",
		presetCount: 64,
		followerCount: "14.8K",
		isVerified: false,
	},
	{
		username: "color_grade_god",
		displayName: "Lumina Motion",
		avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=lumina_motion",
		presetCount: 51,
		followerCount: "11.1K",
		isVerified: true,
	},
];

export function CreatorSection() {
	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<Users className="w-4 h-4" />
					</div>
					<h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						Popular Creators
					</h2>
				</div>
				<span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
					COMMUNITY TOP
				</span>
			</div>

			<div className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pt-1 scrollbar-none select-none [-webkit-overflow-scrolling:touch]">
				{FEATURED_CREATORS.map((creator) => (
					<Link
						key={creator.username}
						href={`/u/${creator.username}`}
						className="snap-start shrink-0 min-w-[200px] sm:min-w-[220px] p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-interactive-primary)]/40 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group"
					>
						<div className="flex flex-col items-center text-center space-y-2.5">
							{/* Avatar with Ring */}
							<div className="relative">
								<img
									src={creator.avatarUrl}
									alt={creator.displayName}
									className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]/50 group-hover:scale-105 transition-transform duration-200"
								/>
								{creator.isVerified && (
									<div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-md">
										<CheckCircle2 className="w-3.5 h-3.5 fill-current" />
									</div>
								)}
							</div>

							{/* Names */}
							<div>
								<h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors line-clamp-1">
									{creator.displayName}
								</h3>
								<p className="text-[11px] text-[var(--color-text-tertiary)]">
									@{creator.username}
								</p>
							</div>

							{/* Stats Badge */}
							<div className="flex items-center justify-between w-full pt-2 text-[11px] border-t border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-medium">
								<span>{creator.presetCount} Presets</span>
								<span className="font-semibold text-purple-400">
									{creator.followerCount} Fans
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
