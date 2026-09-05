"use client";

import type {
	LeaderboardCreator,
	LeaderboardMetric,
	LeaderboardPeriod,
	LeaderboardResponse,
} from "@/dal/leaderboard.dal";
import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import {
	AlertTriangle,
	ArrowUpRight,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Crown,
	Download,
	Flame,
	Heart,
	Layers,
	Loader2,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	Trophy,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PodiumCard } from "./PodiumCard";

interface LeaderboardClientProps {
	initialData: LeaderboardResponse;
}

const PERIODS = [
	{ id: "weekly", label: "Minggu Ini", icon: Flame },
	{ id: "monthly", label: "Bulan Ini", icon: Calendar },
	{ id: "all_time", label: "Sepanjang Masa", icon: Trophy },
] as const;

const METRICS = [
	{
		id: "score",
		label: "🏆 Skor Reputasi",
		desc: "Kombinasi kualitas & aktivitas",
	},
	{
		id: "downloads",
		label: "📥 Total Downloads",
		desc: "Preset paling banyak dipakai",
	},
	{ id: "likes", label: "❤️ Quality Likes", desc: "Paling disukai komunitas" },
	{
		id: "presets",
		label: "📁 Paling Produktif",
		desc: "Upload preset terbanyak",
	},
] as const;

export function LeaderboardClient({ initialData }: LeaderboardClientProps) {
	const [data, setData] = useState<LeaderboardResponse>(initialData);
	const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>(
		initialData.period || "weekly",
	);
	const [activeMetric, setActiveMetric] = useState<LeaderboardMetric>(
		initialData.metric || "score",
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Optimistic Follow Map
	const [followPendingMap, setFollowPendingMap] = useState<
		Record<string, boolean>
	>({});

	const fetchLeaderboard = useCallback(
		async (period: LeaderboardPeriod, metric: LeaderboardMetric) => {
			setIsLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					period,
					metric,
					limit: "50",
				});

				const res = await fetch(`/api/leaderboard?${params.toString()}`);
				const json = await res.json();

				if (!res.ok) {
					throw new Error(json.error?.message || "Failed to load leaderboard");
				}

				if (json.data) {
					setData(json.data);
				}
			} catch (err) {
				console.error("Leaderboard fetch error:", err);
				setError(
					err instanceof Error
						? err.message
						: "Gagal memuat ranking leaderboard",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const handlePeriodChange = (period: LeaderboardPeriod) => {
		setActivePeriod(period);
		fetchLeaderboard(period, activeMetric);
	};

	const handleMetricChange = (metric: LeaderboardMetric) => {
		setActiveMetric(metric);
		fetchLeaderboard(activePeriod, metric);
	};

	// Handle Follow Action
	const handleFollowToggle = async (
		e: React.MouseEvent,
		creator: LeaderboardCreator,
	) => {
		e.preventDefault();
		e.stopPropagation();

		const { username, id: creatorId, isFollowing } = creator;
		if (followPendingMap[creatorId]) return;

		setFollowPendingMap((prev) => ({ ...prev, [creatorId]: true }));
		const nextState = !isFollowing;

		// Optimistically update topThree and rankings
		const updateList = (list: LeaderboardCreator[]) =>
			list.map((c) =>
				c.id === creatorId
					? {
							...c,
							isFollowing: nextState,
							followerCount: nextState
								? c.followerCount + 1
								: Math.max(0, c.followerCount - 1),
						}
					: c,
			);

		setData((prev) => ({
			...prev,
			topThree: updateList(prev.topThree),
			rankings: updateList(prev.rankings),
		}));

		try {
			const method = isFollowing ? "DELETE" : "POST";
			const res = await fetch(
				`/api/users/${encodeURIComponent(username)}/follow`,
				{ method },
			);

			if (!res.ok) {
				throw new Error("Failed to toggle follow status");
			}
		} catch (err) {
			console.error("Follow error:", err);
			// Rollback on failure
			const rollbackList = (list: LeaderboardCreator[]) =>
				list.map((c) =>
					c.id === creatorId
						? {
								...c,
								isFollowing,
								followerCount: creator.followerCount,
							}
						: c,
				);
			setData((prev) => ({
				...prev,
				topThree: rollbackList(prev.topThree),
				rankings: rollbackList(prev.rankings),
			}));
		} finally {
			setFollowPendingMap((prev) => ({ ...prev, [creatorId]: false }));
		}
	};

	const hasTopThree = data.topThree && data.topThree.length > 0;
	const hasRankings = data.rankings && data.rankings.length > 0;

	return (
		<div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
			{/* Top Glass Header Banner */}
			<div className="relative overflow-hidden p-6 sm:p-8 rounded-xl backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px]" />
				<div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/15 rounded-full blur-[100px]" />

				<div className="space-y-2 relative z-10">
					<div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
						<Crown className="w-4 h-4" />
						<span>Hall of Fame & Top Charts</span>
					</div>
					<h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
						Creator Leaderboard
					</h1>
					<p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
						Peringkat creator Alight Motion terbaik di AMHUB berdasarkan karya
						terpopuler, unduhan terbanyak, dan reputasi komunitas.
					</p>

					{/* Navigation Switch Tabs */}
					<div className="flex items-center gap-2 pt-2">
						<span className="px-4 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-black shadow-md shadow-amber-400/20 flex items-center gap-1.5">
							<Trophy className="w-3.5 h-3.5" />
							<span>Leaderboard</span>
						</span>
						<Link
							href="/creators"
							className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
						>
							Semua Kreator
						</Link>
						<Link
							href="/explore"
							className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
						>
							Preset Viral
						</Link>
					</div>
				</div>

				<div className="relative z-10 flex flex-col items-start sm:items-end gap-1.5 px-4 py-3 rounded-lg backdrop-blur-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 w-fit">
					<div className="flex items-center gap-1.5 font-bold">
						<Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
						<span>Update Otomatis</span>
					</div>
					<span className="text-[11px] text-amber-200/70 font-mono">
						{data.totalCreators} Creator Terdaftar
					</span>
				</div>
			</div>

			{/* Filter & Metric Selector Toolbar */}
			<div className="space-y-3">
				{/* 1. Period Selector (Weekly, Monthly, All-Time) */}
				<div className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] overflow-x-auto no-scrollbar">
					{PERIODS.map((p) => {
						const Icon = p.icon;
						const isActive = activePeriod === p.id;
						return (
							<button
								key={p.id}
								type="button"
								onClick={() => handlePeriodChange(p.id)}
								className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
									isActive
										? "bg-[var(--color-interactive-primary)] text-white shadow-md shadow-cyan-600/25"
										: "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
								}`}
							>
								<Icon className="w-3.5 h-3.5" />
								<span>{p.label}</span>
							</button>
						);
					})}
				</div>

				{/* 2. Metric Pills */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{METRICS.map((m) => {
						const isActive = activeMetric === m.id;
						return (
							<button
								key={m.id}
								type="button"
								onClick={() => handleMetricChange(m.id)}
								className={`p-3 rounded-lg border text-left transition-all ${
									isActive
										? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10"
										: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-white"
								}`}
							>
								<div className="text-xs font-extrabold text-[var(--color-text-primary)]">
									{m.label}
								</div>
								<div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 truncate">
									{m.desc}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Main Leaderboard Section */}
			{error ? (
				<div className="p-12 text-center space-y-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
					<AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
					<p className="text-sm font-semibold text-rose-400">{error}</p>
					<button
						type="button"
						onClick={() => fetchLeaderboard(activePeriod, activeMetric)}
						className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] text-xs font-bold hover:bg-[var(--color-bg-base)] transition-colors"
					>
						Coba Lagi
					</button>
				</div>
			) : isLoading ? (
				<div className="p-16 text-center space-y-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
					<Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
					<p className="text-xs font-bold text-[var(--color-text-secondary)]">
						Memperbarui Peringkat Leaderboard...
					</p>
				</div>
			) : !hasTopThree && !hasRankings ? (
				/* Empty State */
				<div className="p-16 text-center space-y-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg">
					<Trophy className="w-12 h-12 text-amber-400 mx-auto opacity-40" />
					<h3 className="text-base font-extrabold text-[var(--color-text-primary)]">
						Belum Ada Data Peringkat
					</h3>
					<p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
						Jadilah creator pertama yang mengunggah preset di AMHUB dan rebut
						posisi #1 di Podium Leaderboard!
					</p>
					<Link
						href="/upload"
						className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--color-interactive-primary)] text-white text-xs font-bold shadow-md shadow-cyan-600/30"
					>
						<span>Upload Preset Sekarang</span>
						<ArrowUpRight className="w-4 h-4" />
					</Link>
				</div>
			) : (
				<div className="space-y-10">
					{/* 🏆 Top 3 Podium Section */}
					{hasTopThree && (
						<div className="space-y-4">
							<div className="flex items-center justify-between px-1">
								<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
									<Crown className="w-4 h-4 text-amber-400" />
									<span>Top 3 Champions</span>
								</div>
								<span className="text-[11px] text-[var(--color-text-tertiary)]">
									Kandidat Juara Periode Ini
								</span>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-end">
								{/* Rank 2 (Silver) */}
								{data.topThree[1] && (
									<PodiumCard
										creator={data.topThree[1]}
										rank={2}
										onFollowToggle={handleFollowToggle}
										isPendingFollow={Boolean(
											followPendingMap[data.topThree[1].id],
										)}
									/>
								)}

								{/* Rank 1 (Gold) */}
								{data.topThree[0] && (
									<PodiumCard
										creator={data.topThree[0]}
										rank={1}
										onFollowToggle={handleFollowToggle}
										isPendingFollow={Boolean(
											followPendingMap[data.topThree[0].id],
										)}
									/>
								)}

								{/* Rank 3 (Bronze) */}
								{data.topThree[2] && (
									<PodiumCard
										creator={data.topThree[2]}
										rank={3}
										onFollowToggle={handleFollowToggle}
										isPendingFollow={Boolean(
											followPendingMap[data.topThree[2].id],
										)}
									/>
								)}
							</div>
						</div>
					)}

					{/* 📊 Rankings Table (Rank 4 to 50) */}
					{hasRankings && (
						<div className="space-y-4">
							<div className="flex items-center justify-between px-1">
								<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
									<Trophy className="w-4 h-4 text-cyan-400" />
									<span>Peringkat 4 - 50</span>
								</div>
								<span className="text-[11px] text-[var(--color-text-tertiary)]">
									{data.rankings.length} Creator
								</span>
							</div>

							<div className="space-y-2.5">
								{data.rankings.map((c) => {
									const avatarUrl = resolveStorageUrl(c.avatarUrl);
									const isPending = Boolean(followPendingMap[c.id]);

									return (
										<div
											key={c.id}
											className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all shadow-sm gap-3"
										>
											{/* Left: Rank Number + Creator Info */}
											<div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
												{/* Rank Pill */}
												<span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-xs sm:text-sm font-black text-[var(--color-text-primary)] flex items-center justify-center shrink-0">
													#{c.rank}
												</span>

												{/* Creator Avatar & Name */}
												<Link
													href={`/u/${c.username}`}
													className="flex items-center gap-3 min-w-0 group-hover:opacity-90 transition-opacity"
												>
													<div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-cyan-900/40 border border-white/10 shrink-0">
														{avatarUrl ? (
															<img
																src={avatarUrl}
																alt={c.displayName}
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">
																{c.displayName[0]?.toUpperCase() || "U"}
															</div>
														)}
													</div>

													<div className="min-w-0 space-y-0.5">
														<div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-interactive-primary)] transition-colors truncate">
															<span className="truncate">{c.displayName}</span>
															{c.isVerified && (
																<ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
															)}
														</div>
														<p className="text-[11px] font-mono text-[var(--color-text-tertiary)] truncate">
															@{c.username}
														</p>
													</div>
												</Link>
											</div>

											{/* Right: Metrics + Follow Action */}
											<div className="flex items-center gap-3 sm:gap-6 shrink-0">
												{/* Stats Pills (Hidden on very small mobile) */}
												<div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-[var(--color-text-secondary)] font-body">
													<div
														className="flex items-center gap-1 text-emerald-400"
														title="Total Downloads"
													>
														<Download className="w-3.5 h-3.5" />
														<span>{c.totalDownloads}</span>
													</div>
													<div
														className="flex items-center gap-1 text-rose-400"
														title="Total Likes"
													>
														<Heart className="w-3.5 h-3.5" />
														<span>{c.likeCount}</span>
													</div>
													<div
														className="flex items-center gap-1 text-cyan-400"
														title="Preset Count"
													>
														<Layers className="w-3.5 h-3.5" />
														<span>{c.presetCount}</span>
													</div>
												</div>

												{/* Score Badge */}
												<div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold text-amber-300 shrink-0">
													{Math.round(c.reputationScore)} pts
												</div>

												{/* Follow Action */}
												{c.isSelf ? (
													<span className="text-[11px] text-[var(--color-text-tertiary)] italic px-2 py-1 bg-white/5 rounded-md">
														Kamu
													</span>
												) : (
													<button
														type="button"
														onClick={(e) => handleFollowToggle(e, c)}
														disabled={isPending}
														className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm shrink-0 ${
															c.isFollowing
																? "bg-[var(--color-bg-elevated)] text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
																: "bg-[var(--color-interactive-primary)] text-white hover:bg-[var(--color-interactive-primary-hover)]"
														}`}
													>
														{isPending ? (
															<Loader2 className="w-3.5 h-3.5 animate-spin" />
														) : c.isFollowing ? (
															<span>Following</span>
														) : (
															<span>Follow</span>
														)}
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
