"use client";

import { useLanguage } from "@/i18n";
import { CheckCircle2, Users } from "lucide-react";
import Link from "next/link";

export interface CreatorItem {
	id?: string;
	username: string;
	display_name: string;
	avatar_url?: string | null;
	is_verified?: boolean;
	preset_count?: number;
	follower_count?: number;
}

interface CreatorSectionProps {
	creators?: CreatorItem[];
}

export function CreatorSection({ creators = [] }: CreatorSectionProps) {
	const { t } = useLanguage();

	if (!creators || creators.length === 0) {
		return (
			<section className="space-y-4">
				<div className="flex items-center gap-2 px-1">
					<div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<Users className="w-4 h-4" />
					</div>
					<h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						Popular Creators
					</h2>
				</div>
				<div className="p-8 text-center rounded-3xl bg-[#0f0e14]/50 border border-white/[0.08] backdrop-blur-xl">
					<p className="text-sm font-semibold text-[var(--color-text-tertiary)]">
						No community creators yet. Upload your first preset to get featured!
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<Users className="w-4 h-4" />
					</div>
					<h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						Popular Creators ({creators.length})
					</h2>
				</div>
				<span className="font-display text-xs font-semibold tracking-wider text-[var(--color-text-tertiary)]">
					COMMUNITY TOP
				</span>
			</div>

			<div className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pt-1 scrollbar-none select-none [-webkit-overflow-scrolling:touch]">
				{creators.map((creator) => (
					<Link
						key={creator.username}
						href={`/u/${creator.username}`}
						className="snap-start shrink-0 min-w-[200px] sm:min-w-[220px] p-4.5 rounded-3xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_0_24px_rgba(124,58,237,0.15)] hover:-translate-y-0.5 active:scale-[0.97] group"
					>
						<div className="flex flex-col items-center text-center space-y-2.5">
							{/* Avatar with Ring */}
							<div className="relative">
								{creator.avatar_url ? (
									<img
										src={creator.avatar_url}
										alt={creator.display_name}
										className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]/50 group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="w-14 h-14 rounded-full bg-purple-600/30 border-2 border-purple-500/50 flex items-center justify-center font-bold text-white text-lg">
										{creator.display_name.slice(0, 2).toUpperCase()}
									</div>
								)}
								{creator.is_verified && (
									<div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-md">
										<CheckCircle2 className="w-3.5 h-3.5 fill-current" />
									</div>
								)}
							</div>

							{/* Names */}
							<div>
								<h3 className="font-display text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors line-clamp-1">
									{creator.display_name}
								</h3>
								<p className="font-body text-[11px] text-[var(--color-text-tertiary)]">
									@{creator.username}
								</p>
							</div>

							{/* Stats Badge */}
							<div className="flex items-center justify-between w-full pt-2.5 text-[11px] border-t border-white/[0.08] text-[var(--color-text-secondary)] font-medium font-body">
								<span>{creator.preset_count ?? 0} Presets</span>
								<span className="font-semibold text-purple-400">
									{(creator.follower_count ?? 0) > 1000
										? `${((creator.follower_count ?? 0) / 1000).toFixed(1)}K`
										: (creator.follower_count ?? 0)}{" "}
									Fans
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
