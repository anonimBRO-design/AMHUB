"use client";

import { BarChart3, Download, Eye, Heart, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";

type Timeframe = "7d" | "30d" | "90d";

interface TopPresetItem {
	id: string;
	title: string;
	slug: string;
	thumbnail_url: string;
	download_count: number;
	like_count: number;
	view_count: number;
	status: string;
	created_at: string;
}

interface AnalyticsData {
	timeframe: Timeframe;
	hasData: boolean;
	topPresets: TopPresetItem[];
	likesOverTime: { date: string; count: number }[];
}

interface AnalyticsChartProps {
	initialData?: AnalyticsData;
}

export function AnalyticsChart({ initialData }: AnalyticsChartProps) {
	const [timeframe, setTimeframe] = useState<Timeframe>("7d");
	const [data, setData] = useState<AnalyticsData | null>(initialData || null);
	const [isLoading, setIsLoading] = useState(!initialData);

	useEffect(() => {
		let isMounted = true;
		async function fetchAnalytics() {
			setIsLoading(true);
			try {
				const res = await fetch(
					`/api/dashboard/analytics?timeframe=${timeframe}`,
				);
				if (res.ok) {
					const json = await res.json();
					if (isMounted && json.data) {
						setData(json.data);
					}
				}
			} catch (error) {
				console.error("Failed to fetch analytics:", error);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		fetchAnalytics();

		return () => {
			isMounted = false;
		};
	}, [timeframe]);

	if (isLoading) {
		return (
			<div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-lg animate-pulse min-h-[300px] flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
				Loading analytics from database...
			</div>
		);
	}

	if (!data || !data.hasData) {
		return <EmptyState type="analytics" />;
	}

	const maxLikes = Math.max(1, ...data.likesOverTime.map((item) => item.count));

	return (
		<div className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-6 shadow-lg">
			{/* Header & Filter Pills */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
						<BarChart3 className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-base font-bold text-[var(--color-text-primary)]">
							Performance Analytics
						</h3>
						<p className="text-xs text-[var(--color-text-secondary)]">
							Real Supabase activity & top content
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs font-semibold select-none w-fit">
					{(["7d", "30d", "90d"] as Timeframe[]).map((tf) => (
						<button
							key={tf}
							type="button"
							onClick={() => setTimeframe(tf)}
							className={`px-3 py-1 rounded-xl transition-all ${
								timeframe === tf
									? "bg-[var(--color-interactive-primary)] text-white shadow-sm"
									: "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
							}`}
						>
							{tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
						</button>
					))}
				</div>
			</div>

			{/* Likes over time real chart */}
			{data.likesOverTime.length > 0 ? (
				<div className="space-y-2">
					<span className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
						<Heart className="w-3.5 h-3.5 text-rose-400" /> Like Activity Over
						Time
					</span>
					<div className="h-36 flex items-end justify-between gap-2 px-2 pt-4 border-b border-[var(--color-border-subtle)] pb-2">
						{data.likesOverTime.map((item) => {
							const heightPct = Math.round((item.count / maxLikes) * 100);
							return (
								<div
									key={item.date}
									className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
								>
									<div
										className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-rose-500/30 to-rose-500 group-hover:opacity-90 transition-all duration-300 relative"
										style={{ height: `${Math.max(10, heightPct)}%` }}
									>
										<div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
											{item.count} likes
										</div>
									</div>
									<span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] truncate w-full text-center">
										{item.date.slice(5)}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			) : null}

			{/* Top Performing Presets */}
			{data.topPresets.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
						<Trophy className="w-4 h-4 text-amber-400" />
						<span>Top Performing Presets</span>
					</div>

					<div className="space-y-2">
						{data.topPresets.map((preset) => (
							<div
								key={preset.id}
								className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] hover:border-[var(--color-interactive-primary)]/40 transition-all"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--color-bg-surface)] shrink-0 border border-[var(--color-border-subtle)]">
										<Image
											src={preset.thumbnail_url || "/placeholder.jpg"}
											alt={preset.title}
											fill
											className="object-cover"
										/>
									</div>
									<div className="min-w-0">
										<Link
											href={`/preset/${preset.slug}`}
											className="text-xs font-bold text-[var(--color-text-primary)] hover:text-[var(--color-interactive-primary)] truncate block"
										>
											{preset.title}
										</Link>
										<span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-tertiary)]">
											{preset.status}
										</span>
									</div>
								</div>

								<div className="flex items-center gap-3 shrink-0 text-xs text-[var(--color-text-secondary)] font-semibold">
									<span className="flex items-center gap-1">
										<Download className="w-3 h-3 text-emerald-400" />
										{preset.download_count}
									</span>
									<span className="flex items-center gap-1">
										<Heart className="w-3 h-3 text-rose-400" />
										{preset.like_count}
									</span>
									<span className="flex items-center gap-1">
										<Eye className="w-3 h-3 text-blue-400" />
										{preset.view_count}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
