"use client";

import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import type { PublicCreatorCardData } from "@/app/api/creators/route";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Filter,
	Loader2,
	RefreshCw,
	Search,
	Sparkles,
	UserCheck,
	UserPlus,
	Users,
	Video,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

interface CreatorsClientProps {
	initialCreators: PublicCreatorCardData[];
	initialTotal: number;
}

type FilterType = "all" | "creators" | "verified";
type SortType = "newest" | "popular" | "followers";

export function CreatorsClient({
	initialCreators,
	initialTotal,
}: CreatorsClientProps) {
	const [creators, setCreators] =
		useState<PublicCreatorCardData[]>(initialCreators);
	const [totalCount, setTotalCount] = useState<number>(initialTotal);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedQuery, setDebouncedQuery] = useState<string>("");
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");
	const [activeSort, setActiveSort] = useState<SortType>("newest");

	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(initialCreators.length < initialTotal);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Follow Action Pending State per user ID
	const [followPendingMap, setFollowPendingMap] = useState<Record<string, boolean>>({});

	// Debounce search input by 300ms
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch creators list from API
	const fetchCreators = useCallback(
		async (
			query: string,
			filter: FilterType,
			sort: SortType,
			targetPage = 1,
			append = false,
		) => {
			if (append) {
				setIsLoadingMore(true);
			} else {
				setIsLoading(true);
			}
			setError(null);

			try {
				const params = new URLSearchParams({
					q: query,
					filter,
					sort,
					page: String(targetPage),
					limit: "12",
				});

				const res = await fetch(`/api/creators?${params.toString()}`);
				const json = await res.json();

				if (!res.ok) {
					throw new Error(json.error?.message || "Failed to load creators");
				}

				const fetchedUsers: PublicCreatorCardData[] = json.data?.users || [];
				const pagination = json.data?.pagination || {
					total: 0,
					has_more: false,
				};

				if (append) {
					setCreators((prev) => [...prev, ...fetchedUsers]);
				} else {
					setCreators(fetchedUsers);
				}

				setTotalCount(pagination.total);
				setHasMore(pagination.has_more);
				setPage(targetPage);
			} catch (err) {
				console.error("Fetch creators failed:", err);
				setError(
					err instanceof Error ? err.message : "Failed to load creators list.",
				);
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
			}
		},
		[],
	);

	// Re-fetch when debounced query, filter, or sort changes
	useEffect(() => {
		fetchCreators(debouncedQuery, activeFilter, activeSort, 1, false);
	}, [debouncedQuery, activeFilter, activeSort, fetchCreators]);

	const handleLoadMore = () => {
		if (hasMore && !isLoadingMore) {
			fetchCreators(
				debouncedQuery,
				activeFilter,
				activeSort,
				page + 1,
				true,
			);
		}
	};

	// Handle Follow / Unfollow Toggle
	const handleFollowToggle = async (
		e: React.MouseEvent,
		creator: PublicCreatorCardData,
	) => {
		e.preventDefault();
		e.stopPropagation();

		const { username, id: creatorId, is_following } = creator;
		if (followPendingMap[creatorId]) return;

		// Optimistic UI Update
		setFollowPendingMap((prev) => ({ ...prev, [creatorId]: true }));
		const nextFollowingState = !is_following;

		setCreators((prev) =>
			prev.map((c) => {
				if (c.id === creatorId) {
					return {
						...c,
						is_following: nextFollowingState,
						follower_count: nextFollowingState
							? c.follower_count + 1
							: Math.max(0, c.follower_count - 1),
					};
				}
				return c;
			}),
		);

		try {
			const method = is_following ? "DELETE" : "POST";
			const res = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
				method,
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error?.message || "Failed to update follow status.");
			}
		} catch (err) {
			console.error("Follow toggle failed:", err);
			// Revert optimistic update on error
			setCreators((prev) =>
				prev.map((c) => {
					if (c.id === creatorId) {
						return {
							...c,
							is_following,
							follower_count: creator.follower_count,
						};
					}
					return c;
				}),
			);
		} finally {
			setFollowPendingMap((prev) => ({ ...prev, [creatorId]: false }));
		}
	};

	return (
		<div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
			{/* Top Glass Header Banner */}
			<div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-purple-600/15 rounded-full blur-[90px]" />

				<div className="space-y-2 relative z-10">
					<div className="flex items-center gap-2 text-xs font-extrabold text-[var(--color-interactive-primary)] uppercase tracking-wider">
						<Users className="w-4 h-4 text-purple-400" />
						<span>Community Directory</span>
					</div>
					<h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
						Jelajahi Kreator & User
					</h1>
					<p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
						Temukan pembuat preset Alight Motion terbaik, ikuti kreator favorit, dan jelajahi karya mereka.
					</p>

					{/* Navigation Tabs */}
					<div className="flex items-center gap-2 pt-2">
						<Link
							href="/explore"
							className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all"
						>
							Presets
						</Link>
						<span className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30">
							Jelajahi Kreator
						</span>
					</div>
				</div>

				<div className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-2xl backdrop-blur-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-wide w-fit">
					<Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
					<span>{totalCount} Total User</span>
				</div>
			</div>

			{/* Search & Control Bar */}
			<div className="space-y-4">
				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Cari kreator berdasarkan username atau nama tampilan..."
						className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)] transition-all shadow-inner"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-white"
						>
							✕
						</button>
					)}
				</div>

				{/* Filter Tabs & Sorting Toolbar */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-bg-surface)] p-2 rounded-2xl border border-[var(--color-border-subtle)]">
					{/* Filter Pills */}
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
						{(
							[
								{ id: "all", label: "Semua" },
								{ id: "creators", label: "Kreator (Ada Video)" },
								{ id: "verified", label: "Terverifikasi ✓" },
							] as const
						).map((f) => (
							<button
								key={f.id}
								type="button"
								onClick={() => setActiveFilter(f.id)}
								className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
									activeFilter === f.id
										? "bg-[var(--color-interactive-primary)] text-white shadow-md shadow-purple-600/20"
										: "bg-transparent text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
								}`}
							>
								{f.label}
							</button>
						))}
					</div>

					{/* Sorting Dropdown */}
					<div className="flex items-center gap-2 px-2 shrink-0">
						<Filter className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
						<span className="text-xs text-[var(--color-text-secondary)] font-medium">Urutkan:</span>
						<select
							value={activeSort}
							onChange={(e) => setActiveSort(e.target.value as SortType)}
							className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-interactive-primary)] font-semibold cursor-pointer"
						>
							<option value="newest">Terbaru</option>
							<option value="popular">Populer</option>
							<option value="followers">Followers Terbanyak</option>
						</select>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			{error ? (
				<div className="p-12 text-center space-y-3 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
					<AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
					<p className="text-sm font-semibold text-rose-400">{error}</p>
					<button
						type="button"
						onClick={() =>
							fetchCreators(debouncedQuery, activeFilter, activeSort, 1, false)
						}
						className="px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold hover:bg-[var(--color-bg-base)] transition-colors"
					>
						Coba Lagi
					</button>
				</div>
			) : isLoading ? (
				/* Loading Skeleton Grid */
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{Array.from({ length: 6 }).map((_, idx) => (
						<div
							key={`skeleton-${idx}`}
							className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 animate-pulse"
						>
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-white/10 shrink-0" />
								<div className="space-y-2 flex-1">
									<div className="w-2/3 h-4 rounded bg-white/10" />
									<div className="w-1/3 h-3 rounded bg-white/5" />
								</div>
							</div>
							<div className="w-full h-10 rounded-xl bg-white/5" />
							<div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
								<div className="h-8 rounded bg-white/5" />
								<div className="h-8 rounded bg-white/5" />
								<div className="h-8 rounded bg-white/5" />
							</div>
						</div>
					))}
				</div>
			) : creators.length === 0 ? (
				/* Empty State */
				<div className="p-16 text-center space-y-3 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-lg">
					<Users className="w-10 h-10 text-[var(--color-text-tertiary)] mx-auto opacity-50" />
					<h3 className="text-base font-extrabold text-[var(--color-text-primary)]">
						{debouncedQuery
							? `Tidak ada kreator yang cocok dengan "${debouncedQuery}"`
							: "Belum ada kreator ditemukan"}
					</h3>
					<p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
						Coba ubah kata kunci pencarian atau ganti kategori filter di atas.
					</p>
					{debouncedQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="px-4 py-2 rounded-xl bg-[var(--color-interactive-primary)] text-xs font-bold text-white shadow-md"
						>
							Bersihkan Pencarian
						</button>
					)}
				</div>
			) : (
				/* Creators Card Grid */
				<div className="space-y-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{creators.map((c) => {
							const avatarUrl = resolveStorageUrl(c.avatar_url);
							const isPending = Boolean(followPendingMap[c.id]);

							return (
								<Link
									key={c.id}
									href={`/u/${c.username}`}
									className="group p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-4"
								>
									{/* Top User Header */}
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-center gap-3.5 min-w-0">
											{/* Avatar */}
											<div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-950 shrink-0 border border-white/10 group-hover:border-purple-500/50 transition-colors shadow-inner">
												{avatarUrl ? (
													<img
														src={avatarUrl}
														alt={c.display_name}
														loading="lazy"
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center font-bold text-white text-base">
														{c.display_name[0]?.toUpperCase() || "U"}
													</div>
												)}
											</div>

											{/* Name & Handle */}
											<div className="min-w-0 space-y-0.5">
												<div className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-interactive-primary)] transition-colors">
													<span className="truncate">{c.display_name}</span>
													{c.is_verified && (
														<span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm">
															✓
														</span>
													)}
												</div>
												<p className="text-xs font-mono text-[var(--color-text-secondary)] truncate">
													@{c.username}
												</p>
											</div>
										</div>

										{/* Follow Action Button */}
										{c.is_self ? (
											<span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] italic px-2 py-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
												Anda
											</span>
										) : (
											<button
												type="button"
												onClick={(e) => handleFollowToggle(e, c)}
												disabled={isPending}
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 shadow-sm ${
													c.is_following
														? "bg-[var(--color-bg-elevated)] text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
														: "bg-[var(--color-interactive-primary)] text-white hover:bg-purple-700"
												}`}
											>
												{isPending ? (
													<Loader2 className="w-3.5 h-3.5 animate-spin" />
												) : c.is_following ? (
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

									{/* Bio Snippet */}
									<p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed min-h-[32px]">
										{c.bio || "Belum ada bio."}
									</p>

									{/* Stats Grid */}
									<div className="grid grid-cols-3 gap-1 pt-3 border-t border-[var(--color-border-subtle)] text-center text-xs">
										<div className="p-1.5 rounded-xl bg-white/[0.02]">
											<div className="font-extrabold text-[var(--color-text-primary)]">
												{c.follower_count}
											</div>
											<div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
												Followers
											</div>
										</div>

										<div className="p-1.5 rounded-xl bg-white/[0.02]">
											<div className="font-extrabold text-[var(--color-text-primary)]">
												{c.following_count}
											</div>
											<div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
												Following
											</div>
										</div>

										<div className="p-1.5 rounded-xl bg-white/[0.02]">
											<div className="font-extrabold text-purple-400 flex items-center justify-center gap-1">
												<Video className="w-3 h-3" />
												<span>{c.preset_count}</span>
											</div>
											<div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">
												Video
											</div>
										</div>
									</div>
								</Link>
							);
						})}
					</div>

					{/* Pagination / Load More Button */}
					{hasMore && (
						<div className="pt-4 text-center">
							<button
								type="button"
								onClick={handleLoadMore}
								disabled={isLoadingMore}
								className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-base)] text-xs font-bold text-[var(--color-text-primary)] transition-all active:scale-95 disabled:opacity-50 shadow-md"
							>
								{isLoadingMore ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin text-purple-400" />
										<span>Memuat...</span>
									</>
								) : (
									<>
										<RefreshCw className="w-4 h-4 text-purple-400" />
										<span>Muat Lebih Banyak Kreator</span>
									</>
								)}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
