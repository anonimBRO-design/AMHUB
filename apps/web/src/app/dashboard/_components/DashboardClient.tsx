"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Grid, Sparkles } from "lucide-react";
import { AnalyticsChart } from "./AnalyticsChart";
import { DashboardHero } from "./DashboardHero";
import { MobileDashboardView } from "./MobileDashboardView";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { StatsCards } from "./StatsCards";

interface DashboardClientProps {
	user: {
		displayName: string;
		username: string;
		avatarUrl?: string | null;
	};
	stats: {
		totalDownloads: number;
		totalLikes: number;
		followerCount: number;
		totalViews: number;
		presetCount: number;
	};
	presets: PresetCardPreset[];
}

export function DashboardClient({
	user,
	stats,
	presets,
}: DashboardClientProps) {
	return (
		<div>
			{/* Dedicated Native Mobile Composition (max-width: 768px) */}
			<MobileDashboardView user={user} userPresets={presets} />

			{/* Desktop and Tablet Layout (Hidden on Mobile) */}
			<div className="hidden md:block space-y-6 sm:space-y-8 pb-12 max-w-6xl mx-auto">
				<DashboardHero user={user} />
				<QuickActions username={user.username} />
				<StatsCards stats={stats} />

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<AnalyticsChart />
					</div>
					<div>
						<RecentActivity />
					</div>
				</div>

				<section className="space-y-4">
					<div className="flex items-center justify-between px-1">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-xl bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border border-[var(--color-interactive-primary)]/20">
								<Grid className="w-4 h-4" />
							</div>
							<h2 className="text-lg font-bold text-[var(--color-text-primary)]">
								Manage Your Published Presets ({presets.length})
							</h2>
						</div>
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
							<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] w-fit mx-auto">
								<Sparkles className="w-6 h-6 text-purple-400" />
							</div>
							<h3 className="text-base font-bold text-[var(--color-text-primary)]">
								No Presets Uploaded Yet
							</h3>
							<p className="text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
								Start sharing your Alight Motion XML, QR, and link presets with
								the community.
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
