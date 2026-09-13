"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n";
import {
	CheckCircle2,
	Coffee,
	ExternalLink,
	Globe,
	Instagram,
	ShieldCheck,
	Sparkles,
	UserCheck,
	UserPlus,
	Youtube,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TipCreatorModal } from "./TipCreatorModal";

interface CreatorCardProps {
	creator: {
		id?: string;
		username: string;
		displayName: string;
		avatarUrl?: string | null;
		isVerified?: boolean;
		bio?: string | null;
		followerCount?: number;
		presetCount?: number;
		isFollowing?: boolean;
		websiteUrl?: string | null;
		tiktokHandle?: string | null;
		instagramHandle?: string | null;
		youtubeUrl?: string | null;
	};
}

export function CreatorCard({ creator }: CreatorCardProps) {
	const { t } = useLanguage();
	const { currentUser, requireAuth } = useAuth();
	const isOwnProfile = Boolean(
		currentUser &&
			((creator.id && currentUser.id === creator.id) ||
				currentUser.username.toLowerCase() === creator.username.toLowerCase()),
	);

	const [isFollowing, setIsFollowing] = useState(
		isOwnProfile ? false : (creator.isFollowing ?? false),
	);
	const [followerCount, setFollowerCount] = useState(
		creator.followerCount ?? 0,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [showTipModal, setShowTipModal] = useState(false);

	const handleFollowToggle = async () => {
		if (isOwnProfile) return;
		if (!requireAuth(undefined, t.presetDetail.signInToFollow)) return;
		setIsLoading(true);
		const nextState = !isFollowing;
		setIsFollowing(nextState);
		setFollowerCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

		try {
			const res = await fetch(`/api/users/${creator.username}/follow`, {
				method: nextState ? "POST" : "DELETE",
			});
			if (!res.ok) throw new Error("Failed to toggle follow");
		} catch (e) {
			console.error("Failed to toggle follow", e);
			setIsFollowing(!nextState);
			setFollowerCount((prev) =>
				!nextState ? prev + 1 : Math.max(0, prev - 1),
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Determine donation link if available (Saweria/Trakteer/website)
	const donationUrl =
		creator.websiteUrl &&
		(creator.websiteUrl.includes("saweria.co") ||
			creator.websiteUrl.includes("trakteer.id") ||
			creator.websiteUrl.includes("sociabuzz.com") ||
			creator.websiteUrl.includes("ko-fi.com"))
			? creator.websiteUrl
			: null;

	return (
		<div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center justify-between gap-4">
				<Link
					href={`/u/${creator.username}`}
					className="flex items-center gap-3 group min-w-0"
				>
					<div className="relative shrink-0">
						{creator.avatarUrl ? (
							<img
								src={creator.avatarUrl}
								alt={creator.displayName}
								className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl object-cover border-2 border-[var(--color-interactive-primary)]/40 group-hover:scale-105 transition-transform"
							/>
						) : (
							<div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-cyan-600/30 border-2 border-cyan-500/40 text-white font-bold text-base flex items-center justify-center">
								{creator.displayName.slice(0, 2).toUpperCase()}
							</div>
						)}
					</div>

					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							<h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors truncate">
								{creator.displayName}
							</h3>
							{creator.isVerified && (
								<ShieldCheck className="w-4 h-4 text-[var(--color-interactive-primary)] shrink-0" />
							)}
						</div>
						<p className="text-xs text-[var(--color-text-tertiary)] truncate">
							@{creator.username}
						</p>
					</div>
				</Link>

				{isOwnProfile ? (
					<Link
						href="/settings/profile"
						className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-lg text-xs font-bold bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-all active:scale-95 shrink-0"
					>
						<span>{t.presetDetail.editProfile}</span>
					</Link>
				) : (
					<button
						type="button"
						onClick={handleFollowToggle}
						disabled={isLoading}
						className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-lg text-xs font-bold transition-all active:scale-95 shrink-0 ${
							isFollowing
								? "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
								: "bg-[var(--color-interactive-primary)] text-white hover:bg-[var(--color-interactive-primary-hover)] shadow-md shadow-[var(--color-interactive-primary)]/20"
						}`}
					>
						{isFollowing ? (
							<>
								<UserCheck className="w-4 h-4 text-emerald-400" />
								<span>{t.presetDetail.following}</span>
							</>
						) : (
							<>
								<UserPlus className="w-4 h-4" />
								<span>{t.presetDetail.follow}</span>
							</>
						)}
					</button>
				)}
			</div>

			{/* Creator Stats Row */}
			<div className="flex items-center justify-between pt-3 text-xs border-t border-[var(--color-border-subtle)]/60 text-[var(--color-text-secondary)] font-medium font-body">
				<span>{creator.presetCount ?? 0} {t.presetDetail.presets}</span>
				<span className="font-semibold text-cyan-400">
					{followerCount > 1000
						? `${(followerCount / 1000).toFixed(1)}K`
						: followerCount}{" "}
					{t.presetDetail.fans}
				</span>
			</div>

			{creator.bio && (
				<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-2 border-t border-[var(--color-border-subtle)]/60 line-clamp-2">
					{creator.bio}
				</p>
			)}

			{/* Tipping & Support Action */}
			{!isOwnProfile && (
				<div className="pt-2 flex items-center gap-2">
					<button
						type="button"
						onClick={() => setShowTipModal(true)}
						className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-400/15 to-orange-400/15 hover:from-amber-400/25 hover:to-orange-400/25 text-amber-400 border border-amber-400/30 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
					>
						<Coffee className="w-4 h-4 text-amber-400" />
						<span>{t.presetDetail.traktirKreator}</span>
					</button>

					{donationUrl && (
						<a
							href={donationUrl}
							target="_blank"
							rel="noopener noreferrer"
							title={t.presetDetail.supportCreator}
							className="flex items-center justify-center gap-1 min-h-[38px] px-3 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:text-amber-300 border border-[var(--color-border-subtle)] text-xs font-semibold transition-all active:scale-95 shrink-0"
						>
							<span className="text-[11px]">SociaBuzz / Saweria</span>
							<ExternalLink className="w-3 h-3 opacity-60" />
						</a>
					)}
				</div>
			)}

			{/* Joki / Commission Edit Shortcut */}
			{!isOwnProfile && (
				<div className="pt-1">
					<Link
						href={`/requests?creator=${encodeURIComponent(creator.username)}`}
						className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-indigo-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
					>
						<Sparkles className="w-3.5 h-3.5 text-cyan-400" />
						<span>{t.presetDetail.orderJokiEdit}</span>
					</Link>
				</div>
			)}

			<TipCreatorModal
				isOpen={showTipModal}
				onClose={() => setShowTipModal(false)}
				creator={creator}
			/>
		</div>
	);
}
