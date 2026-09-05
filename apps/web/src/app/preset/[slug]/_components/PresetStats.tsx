"use client";

import {
	Activity,
	Bookmark,
	Download,
	Eye,
	Heart,
	MessageSquare,
	Percent,
	Users,
} from "lucide-react";

interface PresetStatsProps {
	views: number;
	downloads: number;
	uniqueDownloads?: number;
	likes: number;
	bookmarks: number;
	comments: number;
}

function formatCount(n: number): string {
	return n.toLocaleString("id-ID");
}

function formatPercent(numerator: number, denominator: number): string {
	if (!denominator || denominator <= 0) return "0%";
	const pct = (numerator / denominator) * 100;
	return `${pct >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10}%`;
}

export function PresetStats({
	views,
	downloads,
	uniqueDownloads,
	likes,
	bookmarks,
	comments,
}: PresetStatsProps) {
	const cells = [
		{ icon: Eye, label: "Dilihat", value: views, color: "text-sky-400" },
		{
			icon: Download,
			label: "Diunduh",
			value: downloads,
			color: "text-emerald-400",
		},
		{
			icon: Users,
			label: "Pengunduh Unik",
			value: uniqueDownloads ?? downloads,
			color: "text-teal-400",
		},
		{ icon: Heart, label: "Suka", value: likes, color: "text-rose-400" },
		{
			icon: Bookmark,
			label: "Disimpan",
			value: bookmarks,
			color: "text-amber-400",
		},
		{
			icon: MessageSquare,
			label: "Komentar",
			value: comments,
			color: "text-blue-400",
		},
	];

	const engagementRate = formatPercent(likes + bookmarks + comments, views);
	const downloadRate = formatPercent(uniqueDownloads ?? downloads, views);

	return (
		<section className="p-5 sm:p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg">
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
					<Activity className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
						Statistik Preset
					</h2>
					<p className="text-xs text-[var(--color-text-secondary)]">
						Performa preset ini di AMHUB
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
				{cells.map((cell) => {
					const Icon = cell.icon;
					return (
						<div
							key={cell.label}
							className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-base)]/70 border border-[var(--color-border-subtle)]/60"
						>
							<Icon className={`w-4.5 h-4.5 ${cell.color} shrink-0`} />
							<div className="min-w-0">
								<span className="block text-base font-extrabold text-[var(--color-text-primary)] tabular-nums truncate">
									{formatCount(cell.value)}
								</span>
								<span className="block text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
									{cell.label}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs">
				<span className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
					<Percent className="w-3.5 h-3.5 text-cyan-400" />
					Engagement:{" "}
					<strong className="text-[var(--color-text-primary)]">
						{engagementRate}
					</strong>
				</span>
				<span className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
					<Download className="w-3.5 h-3.5 text-emerald-400" />
					Konversi unduh:{" "}
					<strong className="text-[var(--color-text-primary)]">
						{downloadRate}
					</strong>
				</span>
			</div>
		</section>
	);
}
