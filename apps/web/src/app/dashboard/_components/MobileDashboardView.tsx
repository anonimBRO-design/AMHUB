"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { PresetGrid } from "@presethub/ui";
import { Download, Heart, Sparkles, Upload } from "lucide-react";
import Link from "next/link";

interface MobileDashboardViewProps {
	user: {
		displayName: string;
		username: string;
		level?: number;
	};
	userPresets: PresetCardPreset[];
}

export function MobileDashboardView({
	user,
	userPresets,
}: MobileDashboardViewProps) {
	const totalDownloads = userPresets.reduce(
		(acc, p) => acc + (p.downloadCount || 0),
		0,
	);
	const totalLikes = userPresets.reduce(
		(acc, p) => acc + (p.likeCount || 0),
		0,
	);

	return (
		<div className="md:hidden space-y-4 pb-24">
			<div className="p-5 rounded-3xl bg-gradient-to-br from-[var(--color-interactive-primary)] to-purple-900 text-white space-y-3 shadow-xl">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
						Level {user.level ?? 1} Creator
					</span>
					<Sparkles className="w-4 h-4 text-amber-300" />
				</div>
				<div>
					<h1 className="text-xl font-extrabold">{user.displayName}</h1>
					<p className="text-xs text-purple-200">@{user.username}</p>
				</div>

				<Link
					href="/upload"
					className="flex items-center justify-center gap-2 min-h-[48px] w-full rounded-2xl bg-white text-[var(--color-interactive-primary)] font-extrabold text-xs shadow-lg active:scale-95 transition-all"
				>
					<Upload className="w-4 h-4" />
					<span>Upload New Preset</span>
				</Link>
			</div>

			<div className="grid grid-cols-2 gap-3 text-xs">
				<div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-1 shadow-md">
					<div className="flex items-center gap-2 text-emerald-400">
						<Download className="w-4 h-4" />
						<span className="font-bold text-[10px] uppercase">Downloads</span>
					</div>
					<span className="text-xl font-black text-[var(--color-text-primary)] block">
						{totalDownloads.toLocaleString()}
					</span>
				</div>

				<div className="p-4 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-1 shadow-md">
					<div className="flex items-center gap-2 text-rose-400">
						<Heart className="w-4 h-4" />
						<span className="font-bold text-[10px] uppercase">Likes</span>
					</div>
					<span className="text-xl font-black text-[var(--color-text-primary)] block">
						{totalLikes.toLocaleString()}
					</span>
				</div>
			</div>

			<div className="space-y-3">
				<h2 className="text-sm font-extrabold text-[var(--color-text-primary)] px-1">
					My Published Content ({userPresets.length})
				</h2>
				<PresetGrid
					presets={userPresets}
					isLoading={false}
					hasMore={false}
					onLoadMore={() => {}}
				/>
			</div>
		</div>
	);
}
