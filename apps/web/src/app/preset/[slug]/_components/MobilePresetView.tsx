"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { Bookmark, Download, Heart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommentSection } from "./CommentSection";

interface MobilePresetViewProps {
	preset: PresetCardPreset & {
		fileSize?: string;
		downloadUrl?: string;
		comments?: unknown[];
	};
}

export function MobilePresetView({ preset }: MobilePresetViewProps) {
	const [likesCount, setLikesCount] = useState(preset.likeCount);
	const [isLiked, setIsLiked] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);

	const handleLikeToggle = () => {
		if (isLiked) {
			setLikesCount((c: number) => c - 1);
			setIsLiked(false);
		} else {
			setLikesCount((c: number) => c + 1);
			setIsLiked(true);
		}
	};

	return (
		<div className="md:hidden space-y-5 pb-28">
			<div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-[var(--color-border-subtle)]">
				<img
					src={
						preset.thumbnailUrl ||
						"https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80"
					}
					alt={preset.title}
					className="w-full h-full object-cover"
				/>

				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

				<div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
					<span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-extrabold text-purple-300 uppercase tracking-wider border border-white/10">
						{preset.category}
					</span>
				</div>

				<div className="absolute bottom-4 left-4 right-4 space-y-2 z-10 text-white">
					<h1 className="text-xl font-extrabold tracking-tight leading-snug drop-shadow-md">
						{preset.title}
					</h1>

					<Link
						href={`/u/${preset.creator.username}`}
						className="flex items-center gap-3 pt-2 group"
					>
						<img
							src={
								preset.creator.avatarUrl ||
								`https://api.dicebear.com/7.x/identicon/svg?seed=${preset.creator.username}`
							}
							alt={preset.creator.displayName}
							className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-interactive-primary)] shadow-lg"
						/>
						<div>
							<div className="flex items-center gap-1.5">
								<span className="text-xs font-bold text-white group-hover:underline">
									{preset.creator.displayName}
								</span>
								<ShieldCheck className="w-3.5 h-3.5 text-[var(--color-interactive-primary)]" />
							</div>
							<span className="text-[10px] text-white/70">
								@{preset.creator.username}
							</span>
						</div>
					</Link>
				</div>
			</div>

			<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] space-y-4 shadow-xl">
				<div className="flex items-center justify-between">
					<span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Preset File Specs
					</span>
					<span className="text-xs font-bold text-emerald-400">
						Verified Safe
					</span>
				</div>

				<div className="grid grid-cols-2 gap-3 text-xs">
					<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-0.5">
						<span className="text-[10px] text-[var(--color-text-tertiary)] block">
							Downloads
						</span>
						<span className="font-extrabold text-[var(--color-text-primary)]">
							{preset.downloadCount.toLocaleString()}
						</span>
					</div>
					<div className="p-3 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] space-y-0.5">
						<span className="text-[10px] text-[var(--color-text-tertiary)] block">
							Likes
						</span>
						<span className="font-extrabold text-[var(--color-text-primary)]">
							{likesCount.toLocaleString()}
						</span>
					</div>
				</div>

				<a
					href={preset.downloadUrl || "#"}
					download
					className="flex items-center justify-center gap-2.5 min-h-[52px] w-full rounded-2xl bg-[var(--color-interactive-primary)] text-white font-extrabold text-sm shadow-xl shadow-[var(--color-interactive-primary)]/30 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all"
				>
					<Download className="w-5 h-5" />
					<span>Download Preset ({preset.fileSize || "XML"})</span>
				</a>
			</div>

			<div className="p-5 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				<CommentSection
					presetId={preset.id}
					commentCount={preset.commentCount}
				/>
			</div>

			<div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border-subtle)] shadow-2xl flex items-center justify-between gap-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
				<button
					type="button"
					onClick={handleLikeToggle}
					className={`flex-1 flex items-center justify-center gap-1.5 min-h-[48px] rounded-2xl border text-xs font-bold transition-all ${
						isLiked
							? "bg-rose-500/10 border-rose-500/30 text-rose-400"
							: "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
					}`}
				>
					<Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
					<span>{likesCount}</span>
				</button>

				<button
					type="button"
					onClick={() => setIsBookmarked(!isBookmarked)}
					className={`flex-1 flex items-center justify-center gap-1.5 min-h-[48px] rounded-2xl border text-xs font-bold transition-all ${
						isBookmarked
							? "bg-amber-500/10 border-amber-500/30 text-amber-400"
							: "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
					}`}
				>
					<Bookmark
						className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
					/>
					<span>Save</span>
				</button>

				<a
					href={preset.downloadUrl || "#"}
					download
					className="flex-[2] flex items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-[var(--color-interactive-primary)] text-white font-extrabold text-xs shadow-lg shadow-[var(--color-interactive-primary)]/20 active:scale-95 transition-all"
				>
					<Download className="w-4 h-4" />
					<span>Import Preset</span>
				</a>
			</div>
		</div>
	);
}
