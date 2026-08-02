import { MOCK_CREATORS } from "@/data/mock-data";
import { CheckCircle2, Users } from "lucide-react";
import Link from "next/link";

export function CreatorSection() {
	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<Users className="w-4 h-4" />
					</div>
					<h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
						Popular Creators ({MOCK_CREATORS.length})
					</h2>
				</div>
				<span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
					COMMUNITY TOP
				</span>
			</div>

			<div className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory pb-2 pt-1 scrollbar-none select-none [-webkit-overflow-scrolling:touch]">
				{MOCK_CREATORS.map((creator) => (
					<Link
						key={creator.username}
						href={`/u/${creator.username}`}
						className="snap-start shrink-0 min-w-[200px] sm:min-w-[220px] p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-interactive-primary)]/40 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group"
					>
						<div className="flex flex-col items-center text-center space-y-2.5">
							{/* Avatar with Ring */}
							<div className="relative">
								<img
									src={creator.avatar_url}
									alt={creator.display_name}
									className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]/50 group-hover:scale-105 transition-transform duration-200"
								/>
								{creator.is_verified && (
									<div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-md">
										<CheckCircle2 className="w-3.5 h-3.5 fill-current" />
									</div>
								)}
							</div>

							{/* Names */}
							<div>
								<h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors line-clamp-1">
									{creator.display_name}
								</h3>
								<p className="text-[11px] text-[var(--color-text-tertiary)]">
									@{creator.username}
								</p>
							</div>

							{/* Stats Badge */}
							<div className="flex items-center justify-between w-full pt-2 text-[11px] border-t border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-medium">
								<span>{creator.preset_count} Presets</span>
								<span className="font-semibold text-purple-400">
									{(creator.follower_count / 1000).toFixed(1)}K Fans
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
