"use client";

import type { LeaderboardCreator } from "@/dal/leaderboard.dal";
import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import {
	Crown,
	Download,
	Heart,
	Layers,
	Loader2,
	Medal,
	ShieldCheck,
	Sparkles,
	Trophy,
	UserCheck,
	UserPlus,
} from "lucide-react";
import Link from "next/link";

interface PodiumCardProps {
	creator: LeaderboardCreator;
	rank: 1 | 2 | 3;
	onFollowToggle: (e: React.MouseEvent, creator: LeaderboardCreator) => void;
	isPendingFollow?: boolean;
}

export function PodiumCard({
	creator,
	rank,
	onFollowToggle,
	isPendingFollow = false,
}: PodiumCardProps) {
	const avatarUrl = resolveStorageUrl(creator.avatarUrl);

	// Rank-specific visual themes
	const theme =
		rank === 1
			? {
					order: "order-1 sm:order-2",
					scale:
						"sm:-translate-y-4 shadow-[0_0_35px_rgba(245,158,11,0.2)] border-amber-400/40 bg-gradient-to-b from-amber-500/15 via-[var(--color-bg-surface)] to-[var(--color-bg-surface)]",
					crownBg:
						"bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-lg shadow-amber-400/30",
					badgeLabel: "1st CHAMPION",
					badgeIcon: Crown,
					avatarBorder:
						"border-amber-400 ring-4 ring-amber-400/20 shadow-amber-400/30",
					avatarSize: "w-20 h-20 sm:w-24 sm:h-24",
					podiumHeight: "min-h-[380px] sm:min-h-[420px]",
					textColor: "text-amber-300",
					iconColor: "text-amber-400",
				}
			: rank === 2
				? {
						order: "order-2 sm:order-1",
						scale:
							"shadow-[0_0_25px_rgba(148,163,184,0.15)] border-slate-400/30 bg-gradient-to-b from-slate-400/10 via-[var(--color-bg-surface)] to-[var(--color-bg-surface)]",
						crownBg:
							"bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 shadow-md",
						badgeLabel: "2nd RUNNER UP",
						badgeIcon: Trophy,
						avatarBorder: "border-slate-300 ring-2 ring-slate-300/20",
						avatarSize: "w-16 h-16 sm:w-20 sm:h-20",
						podiumHeight: "min-h-[340px] sm:min-h-[380px]",
						textColor: "text-slate-200",
						iconColor: "text-slate-300",
					}
				: {
						order: "order-3 sm:order-3",
						scale:
							"shadow-[0_0_25px_rgba(217,119,6,0.15)] border-amber-700/40 bg-gradient-to-b from-amber-800/15 via-[var(--color-bg-surface)] to-[var(--color-bg-surface)]",
						crownBg:
							"bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 shadow-md",
						badgeLabel: "3rd PODIUM",
						badgeIcon: Medal,
						avatarBorder: "border-amber-600 ring-2 ring-amber-600/20",
						avatarSize: "w-16 h-16 sm:w-20 sm:h-20",
						podiumHeight: "min-h-[340px] sm:min-h-[380px]",
						textColor: "text-amber-400",
						iconColor: "text-amber-500",
					};

	const BadgeIcon = theme.badgeIcon;

	return (
		<div
			className={`relative flex flex-col justify-between p-5 sm:p-6 rounded-xl border backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-border-strong)] ${theme.order} ${theme.scale} ${theme.podiumHeight}`}
		>
			{/* Top Rank Badge */}
			<div className="flex items-center justify-between gap-2">
				<div
					className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${theme.crownBg}`}
				>
					<BadgeIcon className="w-3.5 h-3.5" />
					<span>{theme.badgeLabel}</span>
				</div>

				<div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-[var(--color-text-secondary)]">
					<Sparkles className="w-3 h-3 text-purple-400" />
					<span>{Math.round(creator.reputationScore)} pts</span>
				</div>
			</div>

			{/* Center Creator Identity */}
			<div className="flex flex-col items-center text-center space-y-3 my-auto py-3">
				<Link href={`/u/${creator.username}`} className="group relative block">
					<div
						className={`relative rounded-xl overflow-hidden ${theme.avatarSize} ${theme.avatarBorder} border-2 group-hover:scale-105 transition-transform shadow-xl`}
					>
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt={creator.displayName}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-purple-900/60 text-white font-extrabold text-xl sm:text-2xl">
								{creator.displayName[0]?.toUpperCase() || "U"}
							</div>
						)}
					</div>

					{/* Small floating rank tag on avatar */}
					<span
						className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-lg ${theme.crownBg} font-black text-xs flex items-center justify-center border-2 border-[var(--color-bg-surface)] shadow-md`}
					>
						#{rank}
					</span>
				</Link>

				<div className="space-y-0.5 max-w-[200px]">
					<Link
						href={`/u/${creator.username}`}
						className="inline-flex items-center gap-1 text-base sm:text-lg font-bold text-[var(--color-text-primary)] hover:text-[var(--color-interactive-primary)] transition-colors truncate"
					>
						<span className="truncate">{creator.displayName}</span>
						{creator.isVerified && (
							<ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
						)}
					</Link>
					<p className="text-xs text-[var(--color-text-tertiary)] font-mono truncate">
						@{creator.username}
					</p>
				</div>

				{creator.bio && (
					<p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed max-w-[220px]">
						{creator.bio}
					</p>
				)}
			</div>

			{/* Bottom Metrics Pill & Action */}
			<div className="space-y-3 pt-3 border-t border-[var(--color-border-subtle)]">
				<div className="grid grid-cols-3 gap-1.5 text-center text-xs">
					<div className="p-2 rounded-lg bg-[var(--color-bg-base)]/80 border border-[var(--color-border-subtle)]/60">
						<div className="font-extrabold text-[var(--color-text-primary)] flex items-center justify-center gap-1">
							<Download className="w-3 h-3 text-emerald-400" />
							<span>{creator.totalDownloads}</span>
						</div>
						<div className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Downloads
						</div>
					</div>

					<div className="p-2 rounded-lg bg-[var(--color-bg-base)]/80 border border-[var(--color-border-subtle)]/60">
						<div className="font-extrabold text-[var(--color-text-primary)] flex items-center justify-center gap-1">
							<Heart className="w-3 h-3 text-rose-400" />
							<span>{creator.likeCount}</span>
						</div>
						<div className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Likes
						</div>
					</div>

					<div className="p-2 rounded-lg bg-[var(--color-bg-base)]/80 border border-[var(--color-border-subtle)]/60">
						<div className="font-extrabold text-[var(--color-text-primary)] flex items-center justify-center gap-1">
							<Layers className="w-3 h-3 text-purple-400" />
							<span>{creator.presetCount}</span>
						</div>
						<div className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Presets
						</div>
					</div>
				</div>

				{/* Follow Button */}
				{creator.isSelf ? (
					<span className="block text-center py-2 rounded-lg bg-white/5 text-[var(--color-text-tertiary)] text-xs font-semibold">
						Profil Kamu
					</span>
				) : (
					<button
						type="button"
						onClick={(e) => onFollowToggle(e, creator)}
						disabled={isPendingFollow}
						className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 ${
							creator.isFollowing
								? "bg-[var(--color-bg-elevated)] text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
								: "bg-[var(--color-interactive-primary)] text-white hover:bg-[var(--color-interactive-primary-hover)] shadow-purple-600/20"
						}`}
					>
						{isPendingFollow ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : creator.isFollowing ? (
							<>
								<UserCheck className="w-3.5 h-3.5" />
								<span>Following</span>
							</>
						) : (
							<>
								<UserPlus className="w-3.5 h-3.5" />
								<span>Follow</span>
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
}
