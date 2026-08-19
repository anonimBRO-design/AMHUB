"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, Download, Users, Star, ArrowUpRight, ShieldCheck } from "lucide-react";

interface Creator {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string | null;
	bio: string | null;
	is_verified: boolean;
	follower_count: number;
	preset_count: number;
	unique_download_count: number;
	reputation_score: number;
}

export function LeaderboardClient() {
	const [creators, setCreators] = useState<Creator[]>([]);
	const [sort, setSort] = useState<"score" | "downloads" | "followers">("score");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		fetch(`/api/creators?sort=${sort}&limit=50`)
			.then((res) => res.json())
			.then((data) => {
				if (isMounted && data?.data?.users) {
					setCreators(data.data.users);
				}
			})
			.catch(console.error)
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [sort]);

	return (
		<div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Title Header */}
				<div className="text-center space-y-3">
					<div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
						<Trophy className="w-8 h-8" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-black tracking-tight">
						Creator Leaderboard
					</h1>
					<p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
						Top Alight Motion creators ranked by community trust, quality presets, and engagement.
					</p>
				</div>

				{/* Sort Options */}
				<div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] w-fit mx-auto">
					<button
						type="button"
						onClick={() => setSort("score")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							sort === "score"
								? "bg-[var(--color-interactive-primary)] text-white shadow-md"
								: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
						}`}
					>
						<Star className="w-3.5 h-3.5" />
						Reputation Score
					</button>

					<button
						type="button"
						onClick={() => setSort("downloads")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							sort === "downloads"
								? "bg-[var(--color-interactive-primary)] text-white shadow-md"
								: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
						}`}
					>
						<Download className="w-3.5 h-3.5" />
						Most Downloads
					</button>

					<button
						type="button"
						onClick={() => setSort("followers")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							sort === "followers"
								? "bg-[var(--color-interactive-primary)] text-white shadow-md"
								: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
						}`}
					>
						<Users className="w-3.5 h-3.5" />
						Most Followers
					</button>
				</div>

				{/* Leaderboard Table / Cards */}
				{isLoading ? (
					<div className="py-20 text-center text-sm text-[var(--color-text-secondary)] animate-pulse font-medium">
						Loading leaderboard...
					</div>
				) : creators.length === 0 ? (
					<div className="py-16 text-center text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] rounded-3xl border border-[var(--color-border-subtle)]">
						No creators found.
					</div>
				) : (
					<div className="space-y-3">
						{creators.map((c, index) => {
							const rank = index + 1;
							let badgeStyle = "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]";
							if (rank === 1) badgeStyle = "bg-amber-400 text-amber-950 font-black shadow-lg ring-2 ring-amber-400/50";
							if (rank === 2) badgeStyle = "bg-slate-300 text-slate-900 font-black shadow-md";
							if (rank === 3) badgeStyle = "bg-amber-700/80 text-amber-100 font-black shadow-md";

							return (
								<div
									key={c.id}
									className="flex items-center justify-between p-4 sm:p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-all shadow-sm"
								>
									<div className="flex items-center gap-4">
										<div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${badgeStyle}`}>
											{rank === 1 ? <Award className="w-5 h-5" /> : `#${rank}`}
										</div>

										<img
											src={c.avatar_url || "/anonimbro-avatar.jpeg"}
											alt={c.display_name}
											className="w-12 h-12 rounded-2xl object-cover bg-[var(--color-bg-elevated)] shrink-0 border border-[var(--color-border-subtle)]"
										/>

										<div>
											<div className="flex items-center gap-1.5">
												<h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
													{c.display_name}
												</h3>
												{c.is_verified && (
													<ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
												)}
											</div>
											<p className="text-xs text-[var(--color-text-secondary)] font-mono">
												@{c.username}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-6 text-right">
										<div className="hidden sm:block">
											<span className="block text-xs text-[var(--color-text-secondary)]">Downloads</span>
											<span className="font-bold text-sm text-[var(--color-text-primary)]">
												{c.unique_download_count.toLocaleString()}
											</span>
										</div>

										<div className="hidden sm:block">
											<span className="block text-xs text-[var(--color-text-secondary)]">Followers</span>
											<span className="font-bold text-sm text-[var(--color-text-primary)]">
												{c.follower_count.toLocaleString()}
											</span>
										</div>

										<div>
											<span className="block text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
												Reputation
											</span>
											<span className="font-extrabold text-base text-[var(--color-interactive-primary)]">
												{c.reputation_score} pts
											</span>
										</div>

										<a
											href={`/u/${c.username}`}
											className="p-2 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
										>
											<ArrowUpRight className="w-4 h-4" />
										</a>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
