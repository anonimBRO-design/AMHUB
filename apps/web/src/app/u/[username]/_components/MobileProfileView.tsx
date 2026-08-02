"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Share2, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface MobileProfileViewProps {
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		bio?: string;
		isVerified?: boolean;
		level?: number;
		presetsCount?: number;
		followersCount?: number;
		followingCount?: number;
		totalDownloads?: number;
		totalLikes?: number;
	};
	presets: PresetCardPreset[];
}

export function MobileProfileView({ user, presets }: MobileProfileViewProps) {
	const [activeTab, setActiveTab] = useState<"presets" | "about">("presets");
	const [isFollowing, setIsFollowing] = useState(false);

	return (
		<div className="md:hidden space-y-5 pb-24">
			<div className="relative rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-hidden shadow-xl text-center pb-6 space-y-4">
				<div className="h-28 w-full bg-gradient-to-r from-[var(--color-interactive-primary)] via-purple-900 to-indigo-950 relative" />

				<div className="relative -mt-14 inline-block">
					<img
						src={
							user.avatarUrl ||
							`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
						}
						alt={user.displayName}
						className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-bg-surface)] shadow-2xl mx-auto"
					/>
					{user.isVerified && (
						<ShieldCheck className="absolute bottom-1 right-1 w-6 h-6 text-[var(--color-interactive-primary)] fill-current bg-[var(--color-bg-surface)] rounded-full" />
					)}
				</div>

				<div className="px-4 space-y-1">
					<h1 className="text-xl font-extrabold text-[var(--color-text-primary)]">
						{user.displayName}
					</h1>
					<p className="text-xs font-bold text-[var(--color-text-tertiary)]">
						@{user.username}
					</p>
					{user.bio && (
						<p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-1 max-w-xs mx-auto">
							{user.bio}
						</p>
					)}
				</div>

				<div className="grid grid-cols-4 gap-2 px-6 py-3 border-y border-[var(--color-border-subtle)] text-center text-xs">
					<div>
						<span className="font-extrabold text-sm text-[var(--color-text-primary)] block">
							{user.presetsCount ?? presets.length}
						</span>
						<span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Presets
						</span>
					</div>
					<div>
						<span className="font-extrabold text-sm text-[var(--color-text-primary)] block">
							{user.followersCount ?? 128}
						</span>
						<span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Followers
						</span>
					</div>
					<div>
						<span className="font-extrabold text-sm text-[var(--color-text-primary)] block">
							{user.totalDownloads ?? 450}
						</span>
						<span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Downloads
						</span>
					</div>
					<div>
						<span className="font-extrabold text-sm text-[var(--color-text-primary)] block">
							{user.totalLikes ?? 320}
						</span>
						<span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
							Likes
						</span>
					</div>
				</div>

				<div className="flex items-center justify-center gap-3 px-6">
					<button
						type="button"
						onClick={() => setIsFollowing(!isFollowing)}
						className={`flex-1 min-h-[48px] rounded-2xl text-xs font-extrabold shadow-lg transition-all ${
							isFollowing
								? "bg-[var(--color-bg-base)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
								: "bg-[var(--color-interactive-primary)] text-white shadow-[var(--color-interactive-primary)]/20"
						}`}
					>
						{isFollowing ? "Following" : "Follow Creator"}
					</button>

					<button
						type="button"
						onClick={() => {
							if (navigator.share) {
								navigator.share({
									title: `@${user.username} on AMHUB`,
									url: window.location.href,
								});
							}
						}}
						className="p-3 min-h-[48px] rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
						aria-label="Share profile"
					>
						<Share2 className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="flex items-center border-b border-[var(--color-border-subtle)] text-xs font-bold">
				<button
					type="button"
					onClick={() => setActiveTab("presets")}
					className={`flex-1 py-3 text-center border-b-2 transition-all ${
						activeTab === "presets"
							? "border-[var(--color-interactive-primary)] text-[var(--color-interactive-primary)]"
							: "border-transparent text-[var(--color-text-tertiary)]"
					}`}
				>
					Published Presets ({presets.length})
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("about")}
					className={`flex-1 py-3 text-center border-b-2 transition-all ${
						activeTab === "about"
							? "border-[var(--color-interactive-primary)] text-[var(--color-interactive-primary)]"
							: "border-transparent text-[var(--color-text-tertiary)]"
					}`}
				>
					About Creator
				</button>
			</div>

			{activeTab === "presets" ? (
				<PresetGrid
					presets={presets}
					isLoading={false}
					hasMore={false}
					onLoadMore={() => {}}
				/>
			) : (
				<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3 text-xs text-[var(--color-text-secondary)]">
					<h3 className="font-bold text-[var(--color-text-primary)] text-sm">
						About {user.displayName}
					</h3>
					<p>{user.bio || "No bio provided."}</p>
					<div className="pt-2 text-[10px] text-[var(--color-text-tertiary)]">
						Creator Level: Level {user.level ?? 1}
					</div>
				</div>
			)}
		</div>
	);
}
