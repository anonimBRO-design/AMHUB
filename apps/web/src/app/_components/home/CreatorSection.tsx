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
						{t.home.popularCreators}
					</h2>
				</div>
				<div className="p-8 text-center rounded-3xl bg-[#0f0e14]/50 border border-white/[0.08] backdrop-blur-xl">
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
					<div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<Users className="w-4 h-4" />
					</div>
					<h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						{t.home.popularCreators}
					</h2>
				</div>
				<span className="font-display text-xs font-semibold tracking-wider text-[var(--color-interactive-primary)] uppercase">
					{t.home.communityTop}
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{creators.map((creator) => (
					<Link
						key={creator.username}
						href={`/u/${creator.username}`}
						className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 active:scale-[0.98]"
					>
						<div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-purple-500/40 shrink-0">
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
								<h3 className="font-bold text-sm text-[var(--color-text-primary)] truncate">
									{creator.display_name}
								</h3>
								{creator.is_verified && (
									<CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
								)}
							</div>
							<p className="text-xs text-[var(--color-text-tertiary)] truncate">
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
