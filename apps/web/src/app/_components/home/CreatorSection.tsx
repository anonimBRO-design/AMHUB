"use client";

import { useLanguage } from "@/i18n";
import { CheckCircle2, ChevronRight, Crown, Trophy, Users } from "lucide-react";
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
				<div className="flex items-center justify-between px-1">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
							<Users className="w-4 h-4" />
						</div>
						<h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
							{t.home.popularCreators}
						</h2>
					</div>
					<Link
						href="/leaderboard"
						className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
					>
						<Trophy className="w-3.5 h-3.5" />
						<span>Leaderboard</span>
						<ChevronRight className="w-3 h-3" />
					</Link>
				</div>
				<div className="p-8 text-center rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
					<p className="text-sm font-semibold text-[var(--color-text-tertiary)]">
						{t.home.noCreators}
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
						<Crown className="w-4 h-4" />
					</div>
					<h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						{t.home.popularCreators}
					</h2>
				</div>
				<Link
					href="/leaderboard"
					className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all shadow-sm group"
				>
					<Trophy className="w-3.5 h-3.5 text-amber-400" />
					<span>Buka Leaderboard</span>
					<ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
				</Link>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{creators.map((creator) => (
					<Link
						key={creator.username}
						href={`/u/${creator.username}`}
						className="group flex items-center gap-3.5 p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-300 active:scale-[0.98] shadow-sm"
					>
						<div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-purple-500/40 shrink-0 bg-purple-900/30">
							{creator.avatar_url ? (
								<img
									src={creator.avatar_url}
									alt={creator.display_name}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform"
								/>
							) : (
								<div className="w-full h-full bg-purple-600/40 flex items-center justify-center text-white font-bold text-sm">
									{creator.display_name?.slice(0, 2).toUpperCase()}
								</div>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-1.5">
								<h3 className="font-bold text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-interactive-primary)] transition-colors">
									{creator.display_name}
								</h3>
								{creator.is_verified && (
									<CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
								)}
							</div>
							<p className="text-xs text-[var(--color-text-tertiary)] font-mono truncate">
								@{creator.username}
							</p>
							<div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
								<span>
									{creator.preset_count ?? 0} {t.common.presets}
								</span>
								<span>•</span>
								<span>
									{creator.follower_count ?? 0} {t.common.followers}
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
