"use client";

import { useAuth } from "@/context/AuthContext";
import {
	Bookmark,
	Download,
	Eye,
	Flag,
	Heart,
	Maximize2,
	MessageSquare,
	MoreHorizontal,
	Pause,
	Play,
	Sparkles,
	Trash2,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { BookmarkButton } from "./BookmarkButton";
import { ReportPresetModal } from "./ReportPresetModal";
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
		bookmarkCount?: number;
		commentCount?: number;
		isLiked?: boolean;
		isBookmarked?: boolean;
		aspectRatio?: "16:9" | "9:16" | "1:1" | string;
		aspectRatios?: string[];
		price?: number;
		isPaid?: boolean;
		currency?: string;
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
	const [showReportModal, setShowReportModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isOwner = Boolean(
		currentUserId && preset.creator?.id && currentUserId === preset.creator.id,
	);

	const handleDeletePreset = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(`/api/presets/${preset.id}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error?.message || "Failed to delete preset");
			}
			setShowDeleteDialog(false);
			router.push(
				preset.creator?.username ? `/u/${preset.creator.username}` : "/explore",
			);
			router.refresh();
		} catch (err) {
			console.error("Delete preset failed:", err);
			setIsDeleting(false);
		}
	};

	const [isLiked, setIsLiked] = useState(preset.isLiked ?? false);
	const [likeCount, setLikeCount] = useState(preset.likeCount);
	const [downloadCount, setDownloadCount] = useState(preset.downloadCount);
	const [bookmarkCount, setBookmarkCount] = useState(
		preset.bookmarkCount ?? 0,
	);
	const [viewCount, setViewCount] = useState(preset.viewCount ?? 0);
	const [isPlayingVideo, setIsPlayingVideo] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [showControls, setShowControls] = useState(true);
	const [hasTrackedDownload, setHasTrackedDownload] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { requireAuth } = useAuth();

	// Auto-track and record preset view on mount
	useEffect(() => {
		if (!preset.id) return;
		const key = `am_view_${preset.id}`;
		if (sessionStorage.getItem(key)) return;
		sessionStorage.setItem(key, "1");

		fetch(`/api/presets/${preset.id}/view`, { method: "POST" })
			.then((res) => res.json())
			.then((resData) => {
				if (resData?.data?.view_count !== undefined) {
					setViewCount(resData.data.view_count);
				} else {
					setViewCount((prev) => prev + 1);
				}
			})
			.catch(() => {
				setViewCount((prev) => prev + 1);
			});
	}, [preset.id]);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = isMuted;
		}
	}, [isMuted]);

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

	const handleTimeUpdate = () => {
		if (videoRef.current) {
			setCurrentTime(videoRef.current.currentTime);
			setDuration(videoRef.current.duration || 0);
		}
	};

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!videoRef.current || !duration) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const clickPos = Math.max(
			0,
			Math.min(1, (e.clientX - rect.left) / rect.width),
		);
		videoRef.current.currentTime = clickPos * duration;
		setCurrentTime(clickPos * duration);
	};

	const togglePlayPause = () => {
		if (!videoRef.current) {
			setIsPlayingVideo(true);
			return;
		}
		if (videoRef.current.paused) {
			videoRef.current.play().catch(() => {});
			setIsPlayingVideo(true);
		} else {
			videoRef.current.pause();
			setIsPlayingVideo(false);
		}
	};

	const toggleMute = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!videoRef.current) return;
		const nextMuted = !isMuted;
		videoRef.current.muted = nextMuted;
		setIsMuted(nextMuted);
	};

	const toggleFullscreen = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!containerRef.current) return;
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		} else {
			containerRef.current.requestFullscreen().catch(() => {});
		}
	};

	const triggerControlsVisibility = () => {
		setShowControls(true);
		if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
		controlsTimeoutRef.current = setTimeout(() => {
			if (isPlayingVideo) {
				setShowControls(false);
			}
		}, 3000);
	};

	const formatTime = (secs: number) => {
		if (!secs || isNaN(secs)) return "0:00";
		const m = Math.floor(secs / 60);
		const s = Math.floor(secs % 60);
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};

	return (
		<section className="space-y-6">
			{/* Custom Mobile & Desktop Unified Video Player Container */}
			<div className="relative w-full flex justify-center items-start py-2">
				<div
					ref={containerRef}
					onMouseMove={triggerControlsVisibility}
					onTouchStart={triggerControlsVisibility}
					onClick={togglePlayPause}
					className="relative w-full max-w-[400px] aspect-[9/16] overflow-hidden rounded-3xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] shadow-2xl group shrink-0 cursor-pointer select-none"
				>
					{preset.previewVideoUrl ? (
						<video
							ref={videoRef}
							src={preset.previewVideoUrl}
							poster={preset.thumbnailUrl}
							playsInline
							muted={isMuted}
							loop
							onTimeUpdate={handleTimeUpdate}
							onLoadedMetadata={handleTimeUpdate}
							onPlay={() => setIsPlayingVideo(true)}
							onPause={() => setIsPlayingVideo(false)}
							className="absolute inset-0 w-full h-full object-contain bg-black"
						/>
					) : preset.thumbnailUrl ? (
						<img
							src={preset.thumbnailUrl}
							alt={preset.title}
							className="absolute inset-0 w-full h-full object-contain"
						/>
					) : (
						<div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-indigo-950/60 to-black flex items-center justify-center">
							<Sparkles className="w-16 h-16 text-purple-400 opacity-40 animate-pulse" />
						</div>
					)}

					{/* Subtle Gradient Overlays */}
					<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

					{/* Center Play/Pause Indicator (Shown when paused or hovered) */}
					{!isPlayingVideo && preset.previewVideoUrl && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="p-5 rounded-full bg-[var(--color-interactive-primary)]/90 text-white shadow-2xl backdrop-blur-md scale-100 group-hover:scale-110 transition-transform">
								<Play className="w-10 h-10 fill-current ml-1" />
							</div>
						</div>
					)}

					{/* Top Badges */}
					<div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex flex-wrap items-center gap-1.5 sm:gap-2 z-10 pointer-events-none">
						<span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10 shadow-md">
							{preset.fileType || "XML"}
						</span>
						<span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider bg-[var(--color-interactive-primary)] text-white shadow-md">
							{preset.category}
						</span>
						<span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize bg-white/10 backdrop-blur-md text-white border border-white/10">
							{preset.difficulty}
						</span>
						{preset.isPaid && (preset.price ?? 0) > 0 ? (
							<span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider bg-amber-400 text-amber-950 shadow-md">
								Rp {(preset.price ?? 0).toLocaleString("id-ID")}
							</span>
						) : (
							<span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider bg-emerald-500/90 text-white shadow-md">
								GRATIS
							</span>
						)}
					</div>

					{/* Bottom Custom Video Controls Bar */}
					{preset.previewVideoUrl && (
						<div
							className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 z-20 transition-opacity duration-300 ${
								showControls || !isPlayingVideo
									? "opacity-100"
									: "opacity-0 pointer-events-none"
							}`}
							onClick={(e) => e.stopPropagation()}
						>
							{/* Interactive Progress Bar */}
							<div
								onClick={handleSeek}
								className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer mb-2.5 transition-all overflow-hidden"
							>
								<div
									className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-500 to-[var(--color-interactive-primary)] rounded-full transition-[width] duration-75"
									style={{
										width: `${duration ? (currentTime / duration) * 100 : 0}%`,
									}}
								/>
							</div>

							<div className="flex items-center justify-between text-white text-xs font-medium">
								{/* Left: Play/Pause button + Timestamp */}
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={togglePlayPause}
										className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
										aria-label={isPlayingVideo ? "Pause" : "Play"}
									>
										{isPlayingVideo ? (
											<Pause className="w-4 h-4 fill-current" />
										) : (
											<Play className="w-4 h-4 fill-current ml-0.5" />
										)}
									</button>
									<span className="text-[11px] font-semibold text-white/80 font-mono">
										{formatTime(currentTime)} / {formatTime(duration)}
									</span>
								</div>

								{/* Right: Sound Toggle + Fullscreen */}
								<div className="flex items-center gap-1.5">
									<button
										type="button"
										onClick={toggleMute}
										className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all flex items-center gap-1.5 active:scale-90"
										aria-label={isMuted ? "Unmute audio" : "Mute audio"}
									>
										{isMuted ? (
											<>
												<VolumeX className="w-4 h-4 text-rose-400" />
												<span className="text-[10px] font-bold text-rose-400 hidden sm:inline">
													MUTED
												</span>
											</>
										) : (
											<>
												<Volume2 className="w-4 h-4 text-emerald-400" />
												<span className="text-[10px] font-bold text-emerald-400 hidden sm:inline">
													SOUND ON
												</span>
											</>
										)}
									</button>

									<button
										type="button"
										onClick={toggleFullscreen}
										className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
										aria-label="Fullscreen"
									>
										<Maximize2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Title, Actions & Stats (Outside Video Box) */}
			<div className="space-y-4 px-1">
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
					<div className="space-y-2 flex-1 min-w-0">
						<div className="flex items-center gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
							<Sparkles className="w-4 h-4" />
							<span>Alight Motion Preset</span>
						</div>
						<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
							{preset.title}
						</h1>
					</div>

					{/* Primary Preset Actions (Like, Bookmark, Share) */}
					<div className="flex items-center gap-2 shrink-0 pt-1">
						<button
							type="button"
							onClick={handleLikeToggle}
							aria-label={isLiked ? "Unlike preset" : "Like preset"}
							className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-2xl border transition-all active:scale-95 shadow-sm font-body ${
								isLiked
									? "bg-rose-500/15 text-rose-400 border-rose-500/30"
									: "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]"
							}`}
						>
							<Heart
								className={`w-4 h-4 transition-colors ${
									isLiked ? "fill-rose-500 text-rose-500" : ""
								}`}
							/>
							<span className="text-xs font-bold">{likeCount}</span>
						</button>

						<BookmarkButton
							presetId={preset.id}
							initialBookmarked={preset.isBookmarked}
							count={bookmarkCount}
							onBookmarkChange={(isBookmarked) => {
								setBookmarkCount((prev) =>
									isBookmarked ? prev + 1 : Math.max(0, prev - 1),
								);
							}}
						/>

						{/* Comment Button (Smooth Scroll to Comments) */}
						<button
							type="button"
							onClick={() => {
								const commentElem = document.getElementById("comments-section");
								if (commentElem) {
									commentElem.scrollIntoView({ behavior: "smooth" });
									const inputElem = commentElem.querySelector("input");
									if (inputElem) inputElem.focus();
								}
							}}
							aria-label="Lihat Komentar"
							className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-2xl border transition-all active:scale-95 shadow-sm font-body bg-blue-500/10 text-blue-400 border-blue-500/25 hover:bg-blue-500/20 hover:border-blue-500/40"
						>
							<MessageSquare className="w-4 h-4 fill-blue-400/20 text-blue-400" />
							<span className="text-xs font-bold">{preset.commentCount ?? 0}</span>
						</button>

						<ShareButton title={preset.title} />

						{/* Report Preset Button */}
						<button
							type="button"
							onClick={() => setShowReportModal(true)}
							aria-label="Laporkan Preset"
							title="Laporkan Preset"
							className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-2xl border transition-all active:scale-95 shadow-sm bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)] hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10"
						>
							<Flag className="w-4 h-4" />
						</button>
					</div>
				</div>

				{isOwner && (
					<div className="flex items-center gap-2 pt-1">
						<button
							type="button"
							onClick={() => setShowDeleteDialog(true)}
							className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-xs font-semibold"
						>
							<Trash2 className="w-3.5 h-3.5" />
							<span>Delete Preset</span>
						</button>
					</div>
				)}

				{/* Mobile & Desktop Stats Pills */}
				<div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-[var(--color-text-secondary)]">
					<div className="flex items-center gap-1.5 text-rose-400">
						<Heart className="w-4 h-4 fill-rose-400/20" />
						<span className="font-bold text-[var(--color-text-primary)]">
							{likeCount}
						</span>{" "}
						Likes
					</div>
					<div className="flex items-center gap-1.5 text-amber-400">
						<Bookmark className="w-4 h-4 fill-amber-400/20" />
						<span className="font-bold text-[var(--color-text-primary)]">
							{bookmarkCount}
						</span>{" "}
						Bookmarks
					</div>
					<div className="flex items-center gap-1.5 text-blue-400">
						<MessageSquare className="w-4 h-4 fill-blue-400/20" />
						<span className="font-bold text-[var(--color-text-primary)]">
							{preset.commentCount ?? 0}
						</span>{" "}
						Comments
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
							{viewCount}
						</span>{" "}
						Views
					</div>
				</div>
			</div>

			{showDeleteDialog && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
					onClick={() => !isDeleting && setShowDeleteDialog(false)}
				>
					<div
						className="mx-4 w-full max-w-sm rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="space-y-2">
							<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
								Delete this preset?
							</h3>
							<p className="text-sm text-[var(--color-text-secondary)]">
								This action cannot be undone. The preset and all associated
								files will be permanently removed.
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
										<svg
											className="w-4 h-4 animate-spin"
											viewBox="0 0 24 24"
											fill="none"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
											/>
										</svg>
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

			{showReportModal && (
				<ReportPresetModal
					presetId={preset.id}
					presetTitle={preset.title}
					isOpen={showReportModal}
					onClose={() => setShowReportModal(false)}
				/>
			)}
		</section>
	);
}
