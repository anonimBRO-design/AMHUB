"use client";

import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, ShieldCheck, UserCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
	};
}

export function CreatorCard({ creator }: CreatorCardProps) {
	const [isFollowing, setIsFollowing] = useState(creator.isFollowing ?? false);
	const [followerCount, setFollowerCount] = useState(
		creator.followerCount ?? 0,
	);
	const [isLoading, setIsLoading] = useState(false);
	const { requireAuth } = useAuth();

	const handleFollowToggle = async () => {
		if (!requireAuth(undefined, "Sign in to follow creators")) return;
		setIsLoading(true);
		const nextState = !isFollowing;
		setIsFollowing(nextState);
		setFollowerCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

		try {
			await fetch(`/api/users/${creator.username}/follow`, {
				method: nextState ? "POST" : "DELETE",
			});
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

	return (
		<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
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
								className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[var(--color-interactive-primary)]/40 group-hover:scale-105 transition-transform"
							/>
						) : (
							<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-600/30 border-2 border-purple-500/40 text-white font-bold text-base flex items-center justify-center">
								{creator.displayName.slice(0, 2).toUpperCase()}
							</div>
						)}
						{creator.isVerified && (
							<div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-md">
								<CheckCircle2 className="w-3.5 h-3.5 fill-current" />
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

				<button
					type="button"
					onClick={handleFollowToggle}
					disabled={isLoading}
					className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-2xl text-xs font-bold transition-all active:scale-95 shrink-0 ${
						isFollowing
							? "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
							: "bg-[var(--color-interactive-primary)] text-white hover:bg-[var(--color-interactive-primary-hover)] shadow-md shadow-[var(--color-interactive-primary)]/20"
					}`}
				>
					{isFollowing ? (
						<>
							<UserCheck className="w-4 h-4 text-emerald-400" />
							<span>Following</span>
						</>
					) : (
						<>
							<UserPlus className="w-4 h-4" />
							<span>Follow</span>
						</>
					)}
				</button>
			</div>

			{/* Creator Stats Row */}
			<div className="flex items-center justify-between pt-3 text-xs border-t border-[var(--color-border-subtle)]/60 text-[var(--color-text-secondary)] font-medium font-body">
				<span>{creator.presetCount ?? 0} Presets</span>
				<span className="font-semibold text-purple-400">
					{followerCount > 1000
						? `${(followerCount / 1000).toFixed(1)}K`
						: followerCount}{" "}
					Fans
				</span>
			</div>

			{creator.bio && (
				<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-2 border-t border-[var(--color-border-subtle)]/60 line-clamp-2">
					{creator.bio}
				</p>
			)}
		</div>
	);
}
