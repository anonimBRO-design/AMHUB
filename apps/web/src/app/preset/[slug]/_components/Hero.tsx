"use client";

import { useAuth } from "@/context/AuthContext";
import { Download, Eye, Heart, Play, Sparkles, MoreHorizontal, Trash2 } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkButton } from "./BookmarkButton";
import { ShareButton } from "./ShareButton";

interface HeroProps {
	preset: {
		id: string;
		title: string;
		description?: string | null;
		thumbnailUrl: string;
		previewVideoUrl?: string | null;
		category: string;
		difficulty: "beginner" | "intermediate" | "advanced";
		fileType?: string;
		downloadCount: number;
		likeCount: number;
		viewCount: number;
		isLiked?: boolean;
		isBookmarked?: boolean;
		aspectRatio?: "16:9" | "9:16" | "1:1" | string;
		aspectRatios?: string[];
		creator: {
			id?: string;
			username?: string;
			displayName?: string;
		};
	};
	currentUserId?: string;
}

export function Hero({ preset, currentUserId }: HeroProps) {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isOwner = Boolean(currentUserId && preset.creator?.id && currentUserId === preset.creator.id);

	const handleDeletePreset = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(`/api/presets/${preset.id}`, { method: "DELETE" });
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error?.message || "Failed to delete preset");
			}
			setShowDeleteDialog(false);
			router.push(preset.creator?.username ? `/u/${preset.creator.username}` : "/explore");
			router.refresh();
		} catch (err) {
			console.error("Delete preset failed:", err);
			setIsDeleting(false);
		}
	};

	const [isLiked, setIsLiked] = useState(preset.isLiked ?? false);
	const [likeCount, setLikeCount] = useState(preset.likeCount);
	const [downloadCount, setDownloadCount] = useState(preset.downloadCount);
	const [isPlayingVideo, setIsPlayingVideo] = useState(false);
	const [hasTrackedDownload, setHasTrackedDownload] = useState(false);
	const { requireAuth } = useAuth();

	const ratioClass = "aspect-[9/16] max-w-sm mx-auto";

	const handleLikeToggle = async () => {
		if (!requireAuth(undefined, "Sign in to like presets")) return;
		const nextState = !isLiked;
		setIsLiked(nextState);
		setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

		try {
			const response = await fetch(`/api/presets/${preset.id}/like`, {
				method: nextState ? "POST" : "DELETE",
			});
			if (!response.ok) throw new Error("Failed to toggle like");
			posthog.capture(nextState ? "preset_liked" : "preset_unliked", {
				preset_id: preset.id,
				category: preset.category,
				difficulty: preset.difficulty,
			});
		} catch (e) {
			console.error("Failed to toggle like", e);
			setIsLiked(!nextState);
			setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
		}
	};

	const handleTrackDownload = async () => {
		if (hasTrackedDownload) return;
		setHasTrackedDownload(true);
		setDownloadCount((prev) => prev + 1);

		try {
			await fetch(`/api/presets/${preset.id}/download`, { method: "POST" });
		} catch (e) {
			console.error("Failed to track download", e);
		}
	};

	return (
		<section className="space-y-4">
			{/* Media Preview Container */}
			<div
				className={`relative w-full overflow-hidden rounded-3xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-2xl group shrink-0 ${ratioClass}`}
			>
				{isPlayingVideo && preset.previewVideoUrl ? (
					<video
						autoPlay
						muted
						controls
						playsInline
						className="absolute inset-0 w-full h-full object-cover"
					>
						<source src={preset.previewVideoUrl} type="video/mp4" />
					</video>
				) : (
					<>
						{preset.thumbnailUrl ? (
							<img
								src={preset.thumbnailUrl}
								alt={preset.title}
								className="absolute inset-0 w-full h-full object-cover"
							/>
						) : (
							<div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-indigo-950/60 to-black flex items-center justify-center">
								<Sparkles className="w-16 h-16 text-purple-400 opacity-40 animate-pulse" />
							</div>
						)}
						{/* Gradient Overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] via-black/20 to-transparent" />

						{/* Play Video Trigger */}
						{preset.previewVideoUrl && (
							<button
								type="button"
								onClick={() => setIsPlayingVideo(true)}
								className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] opacity-90 group-hover:opacity-100 transition-opacity"
							>
								<div className="p-4 rounded-full bg-[var(--color-interactive-primary)] text-white shadow-xl shadow-[var(--color-interactive-primary)]/40 hover:scale-110 active:scale-95 transition-all">
									<Play className="w-8 h-8 fill-current ml-1" />
								</div>
							</button>
						)}
					</>
				)}

				{/* Top Badges */}
				<div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
					<span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-md">
						{preset.fileType || "XML"}
					</span>
					<span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white shadow-md">
						{preset.category}
					</span>
					<span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-white/10 backdrop-blur-md text-white border border-white/10">
						{preset.difficulty}
					</span>
				</div>

				{/* Quick Actions (Desktop Top Right) */}
				<div className="absolute top-4 right-4 hidden sm:flex items-center gap-2 z-10">
					<button
						type="button"
						onClick={handleLikeToggle}
						aria-label={isLiked ? "Unlike preset" : "Like preset"}
						className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-2xl backdrop-blur-md border transition-all active:scale-95 ${
							isLiked
								? "bg-rose-500/20 text-rose-400 border-rose-500/30"
								: "bg-black/50 text-white border-white/10 hover:bg-black/70"
						}`}
					>
						<Heart className={`w-4 h-4 ${isLiked ? "fill-rose-400" : ""}`} />
						<span className="text-xs font-bold">{likeCount}</span>
					</button>

					<BookmarkButton
						presetId={preset.id}
						initialBookmarked={preset.isBookmarked}
					/>
					<ShareButton title={preset.title} />
				</div>
			</div>

			{/* Title & Stats */}
			<div className="space-y-2 px-1">
				<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
					<Sparkles className="w-4 h-4" />
					<span>Alight Motion Preset</span>
				</div>
				<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
					{preset.title}
				</h1>
				{preset.description && (
					<p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
						{preset.description}
					</p>
				)}

				{isOwner && (
					<div className="flex items-center gap-2 pt-1">
						<button
							type="button"
							onClick={() => setShowDeleteDialog(true)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-xs font-semibold"
						>
							<Trash2 className="w-3.5 h-3.5" />
							<span>Delete Preset</span>
						</button>
					</div>
				)}

				{/* Mobile Stats Pills */}
				<div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-[var(--color-text-secondary)]">
					<div className="flex items-center gap-1.5 text-rose-400">
						<Heart className="w-4 h-4 fill-rose-400/20" />
						<span className="font-bold text-[var(--color-text-primary)]">
							{likeCount}
						</span>{" "}
						Likes
					</div>
					<div className="flex items-center gap-1.5 text-emerald-400">
						<Download className="w-4 h-4" />
						<span className="font-bold text-[var(--color-text-primary)]">
							{downloadCount}
						</span>{" "}
						Downloads
					</div>
					<div className="flex items-center gap-1.5 text-blue-400">
						<Eye className="w-4 h-4" />
						<span className="font-bold text-[var(--color-text-primary)]">
							{preset.viewCount}
						</span>{" "}
						Views
					</div>
				</div>
			</div>

			{showDeleteDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteDialog(false)}>
					<div className="mx-4 w-full max-w-sm rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
						<div className="space-y-2">
							<h3 className="text-lg font-bold text-[var(--color-text-primary)]">Delete this preset?</h3>
							<p className="text-sm text-[var(--color-text-secondary)]">
								This action cannot be undone. The preset and all associated files will be permanently removed.
							</p>
						</div>
						<div className="flex items-center gap-3 pt-2">
							<button
								type="button"
								onClick={() => setShowDeleteDialog(false)}
								disabled={isDeleting}
								className="flex-1 min-h-[44px] rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDeletePreset}
								disabled={isDeleting}
								className="flex-1 min-h-[44px] rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{isDeleting ? (
									<>
										<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
										<span>Deleting...</span>
									</>
								) : (
									<span>Delete</span>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
