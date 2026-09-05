"use client";

import { useAuth } from "@/context/AuthContext";
import type { ChallengeEntryWithPreset } from "@/dal/challenges.dal";
import { resolveStorageUrl } from "@/lib/supabase/storage";
import type { Challenge } from "@presethub/types";
import { Check, Clock, Plus, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ChallengesClientProps {
	challenge: Challenge | null;
	entries: ChallengeEntryWithPreset[];
	initialUserVote: string | null;
	isLoggedIn: boolean;
}

interface OwnPreset {
	id: string;
	title: string;
	thumbnail_url?: string | null;
	thumbnailUrl?: string | null;
	status?: string;
}

function useCountdown(endsAt: string) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);
	const diff = Math.max(0, new Date(endsAt).getTime() - now);
	const days = Math.floor(diff / 86400000);
	const hours = Math.floor((diff % 86400000) / 3600000);
	const mins = Math.floor((diff % 3600000) / 60000);
	const secs = Math.floor((diff % 60000) / 1000);
	if (days > 0) return `${days} hari ${hours} jam`;
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export function ChallengesClient({
	challenge,
	entries: initialEntries,
	initialUserVote,
	isLoggedIn,
}: ChallengesClientProps) {
	const router = useRouter();
	const { requireAuth } = useAuth();
	const [entries, setEntries] = useState(initialEntries);
	const [userVote, setUserVote] = useState<string | null>(initialUserVote);
	const [votingId, setVotingId] = useState<string | null>(null);
	const [showSubmit, setShowSubmit] = useState(false);
	const [ownPresets, setOwnPresets] = useState<OwnPreset[] | null>(null);
	const [submittingId, setSubmittingId] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const countdown = useCountdown(
		challenge?.ends_at ?? new Date().toISOString(),
	);
	const enteredIds = useMemo(
		() => new Set(entries.map((e) => e.preset_id)),
		[entries],
	);

	useEffect(() => {
		if (!showSubmit || !isLoggedIn || ownPresets !== null) return;
		fetch("/api/presets/creator?limit=50")
			.then((res) => (res.ok ? res.json() : null))
			.then((json) => {
				const items = (json?.data ?? []) as OwnPreset[];
				setOwnPresets(
					items.filter(
						(p) =>
							(p.status ?? "published") === "published" &&
							!enteredIds.has(p.id),
					),
				);
			})
			.catch(() => setOwnPresets([]));
	}, [showSubmit, isLoggedIn, ownPresets, enteredIds]);

	if (!challenge) {
		return (
			<div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
				<div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
					<Trophy className="w-7 h-7" />
				</div>
				<h1 className="font-display text-2xl font-extrabold text-white">
					Belum ada challenge aktif
				</h1>
				<p className="text-sm text-[var(--color-text-secondary)]">
					Challenge mingguan baru segera diumumkan. Sambil menunggu, jelajahi
					preset komunitas.
				</p>
				<Link
					href="/explore"
					className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-2xl bg-[var(--color-interactive-primary)] text-white text-sm font-bold"
				>
					Jelajahi Preset
				</Link>
			</div>
		);
	}

	const handleVote = (presetId: string) => {
		if (!requireAuth(undefined, "Login untuk vote challenge")) return;
		if (votingId) return;
		const previousVote = userVote;
		const previousEntries = entries;
		// Optimistic update
		setUserVote(presetId);
		setEntries((prev) =>
			prev
				.map((e) => ({
					...e,
					vote_count:
						e.preset_id === presetId
							? e.vote_count + 1
							: e.preset_id === previousVote
								? Math.max(0, e.vote_count - 1)
								: e.vote_count,
				}))
				.sort((a, b) => b.vote_count - a.vote_count),
		);
		setVotingId(presetId);
		const method = previousVote === presetId ? "DELETE" : "POST";
		fetch(`/api/challenges/${challenge.id}/vote`, {
			method,
			headers: { "Content-Type": "application/json" },
			...(method === "POST"
				? { body: JSON.stringify({ preset_id: presetId }) }
				: {}),
		})
			.then((res) => {
				if (!res.ok) throw new Error();
				if (method === "DELETE") setUserVote(null);
			})
			.catch(() => {
				setUserVote(previousVote);
				setEntries(previousEntries);
				setNotice("Gagal menyimpan vote. Coba lagi.");
			})
			.finally(() => setVotingId(null));
	};

	const handleSubmit = (preset: OwnPreset) => {
		if (!requireAuth(undefined, "Login untuk ikut challenge")) return;
		setSubmittingId(preset.id);
		setNotice(null);
		fetch(`/api/challenges/${challenge.id}/entries`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ preset_id: preset.id }),
		})
			.then(async (res) => {
				const json = await res.json().catch(() => null);
				if (!res.ok) {
					throw new Error(json?.error?.message || "Gagal mendaftarkan preset.");
				}
				const thumb = preset.thumbnail_url ?? preset.thumbnailUrl ?? "";
				setEntries((prev) => [
					...prev,
					{
						id: `local-${preset.id}`,
						challenge_id: challenge.id,
						preset_id: preset.id,
						creator_id: "",
						created_at: new Date().toISOString(),
						vote_count: 0,
						preset: {
							id: preset.id,
							slug: "",
							title: preset.title,
							thumbnail_url: thumb,
							like_count: 0,
							download_count: 0,
							creator: {
								id: "",
								username: "kamu",
								display_name: "Kamu",
								avatar_url: null,
							},
						},
					},
				]);
				setOwnPresets((prev) =>
					prev ? prev.filter((p) => p.id !== preset.id) : prev,
				);
				setNotice("Preset berhasil didaftarkan ke challenge!");
			})
			.catch((err: Error) => setNotice(err.message))
			.finally(() => setSubmittingId(null));
	};

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-0 space-y-8">
			{/* Header */}
			<div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-[90px]" />
				<div className="relative z-10 space-y-3">
					<div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
						<span className="inline-flex items-center gap-1.5 text-amber-400">
							<Trophy className="w-4 h-4" />
							Challenge Mingguan
						</span>
						{challenge.theme && (
							<span className="px-2.5 py-1 rounded-md bg-[var(--color-interactive-primary)] text-white capitalize">
								{challenge.theme}
							</span>
						)}
					</div>
					<h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
						{challenge.title}
					</h1>
					{challenge.description && (
						<p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
							{challenge.description}
						</p>
					)}
					<div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-bold">
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
							<Clock className="w-3.5 h-3.5" />
							Berakhir dalam {countdown}
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
							<Users className="w-3.5 h-3.5" />
							{entries.length} peserta
						</span>
						{challenge.prize_text && (
							<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
								<Trophy className="w-3.5 h-3.5" />
								{challenge.prize_text}
							</span>
						)}
					</div>
				</div>
			</div>

			{notice && (
				<p className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-3">
					{notice}
				</p>
			)}

			{/* Leaderboard entries */}
			<section className="space-y-4">
				<div className="flex items-center justify-between px-1">
					<h2 className="font-display text-xl font-bold text-white">
						Papan Peringkat
					</h2>
					<button
						type="button"
						onClick={() => {
							if (!requireAuth(undefined, "Login untuk ikut challenge")) return;
							setShowSubmit((v) => !v);
						}}
						className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[var(--color-interactive-primary)] hover:bg-[var(--color-interactive-primary-hover)] text-white text-xs font-bold transition-all active:scale-95"
					>
						<Plus className="w-4 h-4" />
						Ikut Challenge
					</button>
				</div>

				{showSubmit && (
					<div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-3">
						<h3 className="text-sm font-bold text-[var(--color-text-primary)]">
							Pilih preset untuk didaftarkan
						</h3>
						{!isLoggedIn ? (
							<p className="text-xs text-[var(--color-text-secondary)]">
								Login dulu untuk mengikutkan presetmu.
							</p>
						) : ownPresets === null ? (
							<p className="text-xs text-[var(--color-text-secondary)]">
								Memuat presetmu...
							</p>
						) : ownPresets.length === 0 ? (
							<p className="text-xs text-[var(--color-text-secondary)]">
								Tidak ada preset yang bisa didaftarkan. Upload preset dulu.
							</p>
						) : (
							<div className="space-y-2 max-h-72 overflow-y-auto">
								{ownPresets.map((p) => (
									<div
										key={p.id}
										className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]"
									>
										<div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0">
											{(p.thumbnail_url ?? p.thumbnailUrl) && (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={
														resolveStorageUrl(
															p.thumbnail_url ?? p.thumbnailUrl ?? "",
														) ??
														p.thumbnail_url ??
														p.thumbnailUrl ??
														""
													}
													alt={p.title}
													className="w-full h-full object-cover"
													loading="lazy"
												/>
											)}
										</div>
										<span className="flex-1 text-xs font-bold text-[var(--color-text-primary)] truncate">
											{p.title}
										</span>
										<button
											type="button"
											disabled={submittingId === p.id}
											onClick={() => handleSubmit(p)}
											className="px-4 min-h-[40px] rounded-xl bg-[var(--color-interactive-primary)] text-white text-xs font-bold disabled:opacity-50 shrink-0"
										>
											{submittingId === p.id ? "..." : "Daftarkan"}
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{entries.length === 0 ? (
					<div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-center">
						<p className="text-sm font-bold text-[var(--color-text-primary)]">
							Belum ada peserta
						</p>
						<p className="text-xs text-[var(--color-text-secondary)] mt-1">
							Jadilah yang pertama mengikutkan presetmu!
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{entries.map((entry, idx) => {
							const thumb =
								resolveStorageUrl(entry.preset.thumbnail_url) ??
								entry.preset.thumbnail_url;
							const isVoted = userVote === entry.preset_id;
							const rank = idx + 1;
							return (
								<div
									key={entry.id}
									className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${
										rank === 1
											? "bg-amber-500/[0.07] border-amber-500/40"
											: "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)]"
									}`}
								>
									<span
										className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
											rank === 1
												? "bg-amber-400 text-amber-950"
												: rank === 2
													? "bg-slate-300 text-slate-800"
													: rank === 3
														? "bg-orange-400 text-orange-950"
														: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
										}`}
									>
										{rank}
									</span>
									<Link
										href={
											entry.preset.slug ? `/preset/${entry.preset.slug}` : "#"
										}
										className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black shrink-0"
									>
										{thumb && (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={thumb}
												alt={entry.preset.title}
												className="w-full h-full object-cover"
												loading="lazy"
											/>
										)}
									</Link>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
											{entry.preset.title}
										</p>
										<p className="text-[11px] text-[var(--color-text-secondary)] truncate">
											@{entry.preset.creator.username} • {entry.vote_count} vote
										</p>
									</div>
									<button
										type="button"
										disabled={votingId !== null}
										onClick={() => handleVote(entry.preset_id)}
										className={`inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 shrink-0 ${
											isVoted
												? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
												: "bg-[var(--color-interactive-primary)] hover:bg-[var(--color-interactive-primary-hover)] text-white"
										}`}
									>
										{isVoted && <Check className="w-3.5 h-3.5" />}
										{isVoted ? "Voted" : "Vote"}
									</button>
								</div>
							);
						})}
					</div>
				)}
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => router.push("/explore")}
						className="text-xs text-[var(--color-text-tertiary)] hover:text-white transition-colors"
					>
						← Kembali ke Explore
					</button>
				</div>
			</section>
		</div>
	);
}
