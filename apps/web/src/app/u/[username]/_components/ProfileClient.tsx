"use client";

import { type PresetCardPreset, PresetGrid } from "@presethub/ui";
import { Grid, Info, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { AchievementBadges } from "./AchievementBadges";
import { ActivitySection } from "./ActivitySection";
import { FollowSection } from "./FollowSection";
import { Hero } from "./Hero";
import { ProfileStats } from "./ProfileStats";
import { type ProfileTabType, ProfileTabs } from "./ProfileTabs";

interface ProfileClientProps {
	user: {
		id?: string;
		username: string;
		displayName: string;
		avatarUrl?: string | null;
		bio?: string | null;
		isVerified?: boolean;
		websiteUrl?: string | null;
		tiktokHandle?: string | null;
		instagramHandle?: string | null;
		youtubeUrl?: string | null;
		createdAt?: string;
	};
	isOwnProfile: boolean;
	presets: PresetCardPreset[];
}

export function ProfileClient({
	user,
	isOwnProfile,
	presets,
}: ProfileClientProps) {
	const [activeTab, setActiveTab] = useState<ProfileTabType>("presets");

	// Calculate aggregates
	const totalDownloads = presets.reduce(
		(sum, p) => sum + (p.downloadCount || 0),
		0,
	);
	const totalLikes = presets.reduce((sum, p) => sum + (p.likeCount || 0), 0);

	return (
		<div className="space-y-6 sm:space-y-8 pb-12 max-w-5xl mx-auto">
			{/* Hero Banner Card */}
			<Hero user={user} />

			{/* Actions & Follow Row */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<FollowSection username={user.username} isOwnProfile={isOwnProfile} />
			</div>

			{/* Stats Grid */}
			<ProfileStats
				presetCount={presets.length}
				followerCount={user.isVerified ? 12500 : 850}
				followingCount={140}
				totalDownloads={totalDownloads}
				totalLikes={totalLikes}
			/>

			{/* Sticky Navigation Tabs */}
			<ProfileTabs
				activeTab={activeTab}
				onChangeTab={setActiveTab}
				presetCount={presets.length}
				collectionCount={2}
			/>

			{/* Tab Content Display */}
			{activeTab === "presets" && (
				<section className="space-y-4">
					<div className="flex items-center justify-between px-1">
						<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
							Published Presets ({presets.length})
						</h2>
					</div>

					{presets.length > 0 ? (
						<PresetGrid
							presets={presets}
							isLoading={false}
							hasMore={false}
							onLoadMore={() => {}}
						/>
					) : (
						<div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3">
							<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
								<Grid className="w-6 h-6" />
							</div>
							<h3 className="text-base font-bold text-[var(--color-text-primary)]">
								No Presets Published Yet
							</h3>
							<p className="text-xs text-[var(--color-text-secondary)] max-w-xs">
								@{user.username} hasn't published any Alight Motion presets yet.
								Check back soon!
							</p>
						</div>
					)}
				</section>
			)}

			{activeTab === "collections" && (
				<section className="p-8 text-center rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3">
					<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] w-fit mx-auto">
						<Sparkles className="w-6 h-6 text-purple-400" />
					</div>
					<h3 className="text-base font-bold text-[var(--color-text-primary)]">
						Public Collections
					</h3>
					<p className="text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
						Featured Alight Motion edit bundles and preset collections compiled
						by @{user.username}.
					</p>
				</section>
			)}

			{activeTab === "activity" && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ActivitySection
						username={user.username}
						displayName={user.displayName}
					/>
					<AchievementBadges
						isVerified={user.isVerified}
						totalDownloads={totalDownloads}
						presetCount={presets.length}
					/>
				</div>
			)}

			{activeTab === "about" && (
				<div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4">
					<div className="flex items-center gap-2">
						<Info className="w-5 h-5 text-[var(--color-interactive-primary)]" />
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							About @{user.username}
						</h3>
					</div>
					<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
						{user.bio ||
							`@${user.username} is a Alight Motion creator sharing pro XML and QR code editing presets on PresetHub.`}
					</p>
					<AchievementBadges
						isVerified={user.isVerified}
						totalDownloads={totalDownloads}
						presetCount={presets.length}
					/>
				</div>
			)}
		</div>
	);
}
