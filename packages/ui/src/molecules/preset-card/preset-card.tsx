"use client";

import {
	Bookmark,
	Heart,
	Loader2,
	MessageSquare,
	Share2,
	Trash2,
	UserPlus,
	Volume2,
	VolumeX,
} from "lucide-react";
import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { Badge } from "../../atoms/badge";
import { Button } from "../../atoms/button";
import { cn } from "../../lib/utils";

export interface PresetCardPreset {
	id: string;
	slug: string;
	title: string;
	description?: string;
	thumbnailUrl: string;
	previewVideoUrl?: string;
	category: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	downloadCount: number;
	likeCount: number;
	commentCount: number;
	viewCount: number;
	bookmarkCount?: number;
	creator: {
		id?: string;
		username: string;
		displayName: string;
		avatarUrl?: string;
		isVerified: boolean;
	};
	isFeatured?: boolean;
	trendingRank?: number;
	isLiked?: boolean;
	isBookmarked?: boolean;
	createdAt: string;
	aspectRatio?: "16:9" | "9:16" | "1:1" | string;
	aspectRatios?: string[];
	fileType?: string;
	price?: number;
	isPaid?: boolean;
	currency?: string;
}

const PRESET_PLACEHOLDER_SVG =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'><rect width='100%' height='100%' fill='%2318181b'/><path d='M270 140l80 45-80 45v-90z' fill='%23a855f7'/><text x='50%' y='78%' text-anchor='middle' fill='%23a1a1aa' font-family='sans-serif' font-size='14' font-weight='600'>ALIGHT MOTION PRESET</text></svg>";

function getAspectRatioClass(_preset?: PresetCardPreset): string {
	return "aspect-[9/16]";
}

export interface PresetCardProps extends React.HTMLAttributes<HTMLDivElement> {
	preset: PresetCardPreset;
	variant?: "default" | "featured" | "trending" | "compact";
	showFollow?: boolean;
	isOwner?: boolean;
	onLike?: (presetId: string) => void;
	onBookmark?: (presetId: string) => void;
	onShare?: (presetId: string) => void;
	onFollow?: (presetId: string) => void;
	onDelete?: (presetId: string) => Promise<void> | void;
}

export const PresetCard = React.forwardRef<HTMLDivElement, PresetCardProps>(
	(
		{
			preset,
			variant = "default",
			showFollow,
			isOwner = false,
			onLike,
			onBookmark,
			onShare,
			onFollow,
			onDelete,
			className,
			...props
		},
		ref,
	) => {
		const [isHovered, setIsHovered] = React.useState(false);
		const [prefersReducedMotion, setPrefersReducedMotion] =
			React.useState(false);
		const [isLiked, setIsLiked] = React.useState(Boolean(preset.isLiked));
		const [likeCount, setLikeCount] = React.useState(preset.likeCount ?? 0);
		const [isBookmarked, setIsBookmarked] = React.useState(
			Boolean(preset.isBookmarked),
		);
		const [bookmarkCount, setBookmarkCount] = React.useState(
			preset.bookmarkCount ?? 0,
		);
		const [isMuted, setIsMuted] = React.useState(true);
		const [showDeleteModal, setShowDeleteModal] = React.useState(false);
		const [isDeleting, setIsDeleting] = React.useState(false);
		const [deleteError, setDeleteError] = React.useState<string | null>(null);
		const videoRef = React.useRef<HTMLVideoElement>(null);

		const toggleAudio = (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			if (videoRef.current) {
				const nextMuted = !isMuted;
				videoRef.current.muted = nextMuted;
				setIsMuted(nextMuted);
				if (videoRef.current.paused) {
					videoRef.current.play().catch(() => {});
				}
			}
		};

		React.useEffect(() => {
			if (videoRef.current) {
				videoRef.current.muted = isMuted;
			}
		}, [isMuted]);

		React.useEffect(() => {
			setIsLiked(Boolean(preset.isLiked));
		}, [preset.isLiked]);

		React.useEffect(() => {
			setLikeCount(preset.likeCount ?? 0);
		}, [preset.likeCount]);

		React.useEffect(() => {
			setIsBookmarked(Boolean(preset.isBookmarked));
		}, [preset.isBookmarked]);

		React.useEffect(() => {
			setBookmarkCount(preset.bookmarkCount ?? 0);
		}, [preset.bookmarkCount]);

		React.useEffect(() => {
			const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
			setPrefersReducedMotion(mediaQuery.matches);
			const listener = (e: MediaQueryListEvent) =>
				setPrefersReducedMotion(e.matches);
			mediaQuery.addEventListener("change", listener);
			return () => mediaQuery.removeEventListener("change", listener);
		}, []);

		const hasVideo = Boolean(preset.previewVideoUrl?.trim());
		const hasThumbnail = Boolean(preset.thumbnailUrl?.trim());
		const aspectRatioClass = getAspectRatioClass(preset);

		const handleMouseEnter = () => {
			setIsHovered(true);
			if (videoRef.current) {
				videoRef.current.muted = isMuted;
				videoRef.current.play().catch(() => {
					// Fallback if browser enforces interaction for unmuted play
					if (videoRef.current && !videoRef.current.muted) {
						videoRef.current.muted = true;
						setIsMuted(true);
						videoRef.current.play().catch(() => {});
					}
				});
			}
		};
		const handleMouseLeave = () => {
			setIsHovered(false);
			if (videoRef.current) {
				videoRef.current.pause();
				videoRef.current.currentTime = 0;
			}
		};

		const handleLike = async (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			const nextState = !isLiked;
			setIsLiked(nextState);
			setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

			if (onLike) {
				onLike(preset.id);
			} else {
				try {
					const res = await fetch(`/api/presets/${preset.id}/like`, {
						method: nextState ? "POST" : "DELETE",
					});
					if (!res.ok) {
						if (res.status === 401 && typeof window !== "undefined") {
							window.dispatchEvent(
								new CustomEvent("auth:required", {
									detail: { title: "Sign in to like presets" },
								}),
							);
						}
						setIsLiked(!nextState);
						setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
					}
				} catch {
					setIsLiked(!nextState);
					setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
				}
			}
		};

		const handleBookmark = async (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			const nextState = !isBookmarked;
			setIsBookmarked(nextState);
			setBookmarkCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

			if (onBookmark) {
				onBookmark(preset.id);
			} else {
				try {
					const res = await fetch(`/api/presets/${preset.id}/bookmark`, {
						method: nextState ? "POST" : "DELETE",
					});
					if (!res.ok) {
						if (res.status === 401 && typeof window !== "undefined") {
							window.dispatchEvent(
								new CustomEvent("auth:required", {
									detail: { title: "Sign in to bookmark presets" },
								}),
							);
						}
						setIsBookmarked(!nextState);
						setBookmarkCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
					}
				} catch {
					setIsBookmarked(!nextState);
					setBookmarkCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
				}
			}
		};

		const handleShare = (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			onShare?.(preset.id);
		};

		const handleFollow = (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			onFollow?.(preset.id);
		};

		const handleDelete = async () => {
			setIsDeleting(true);
			setDeleteError(null);
			try {
				if (onDelete) {
					await onDelete(preset.id);
				} else {
					const res = await fetch(`/api/presets/${preset.id}`, {
						method: "DELETE",
					});
					if (!res.ok) {
						const json = await res.json().catch(() => ({}));
						throw new Error(json.error?.message || "Failed to delete preset.");
					}
					window.location.reload();
				}
				setShowDeleteModal(false);
			} catch (err) {
				console.error("Delete preset failed:", err);
				setDeleteError(
					err instanceof Error ? err.message : "Failed to delete preset.",
				);
				setIsDeleting(false);
			}
		};

		return (
			<div
				ref={ref}
				className={cn(
					"group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] w-full max-w-full",
					variant === "featured" &&
						"border-[var(--color-interactive-primary)] hover:border-[var(--color-interactive-primary-hover)]",
					className,
				)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				{/* Full-card Clickable Navigation Overlay */}
				<a
					href={`/preset/${preset.slug}`}
					aria-label={`Open ${preset.title}`}
					className="absolute inset-0 z-10 block cursor-pointer"
				>
					<span className="sr-only">Open {preset.title}</span>
				</a>

				{/* Media Preview Container */}
				<div
					className={cn(
						"relative w-full overflow-hidden shrink-0 bg-[var(--color-bg-base)] flex items-center justify-center pointer-events-none",
						aspectRatioClass,
					)}
				>
					{hasVideo ? (
						<video
							ref={videoRef}
							src={preset.previewVideoUrl}
							poster={
								hasThumbnail ? preset.thumbnailUrl : PRESET_PLACEHOLDER_SVG
							}
							muted={isMuted}
							loop
							playsInline
							className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
						/>
					) : (
						<img
							src={hasThumbnail ? preset.thumbnailUrl : PRESET_PLACEHOLDER_SVG}
							alt={`${preset.title} — ${preset.category} preset`}
							className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
							loading="lazy"
							onError={(e) => {
								const target = e.currentTarget;
								if (target.src !== PRESET_PLACEHOLDER_SVG) {
									target.src = PRESET_PLACEHOLDER_SVG;
								}
							}}
						/>
					)}

					<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)]/80 via-transparent to-black/30 pointer-events-none" />

					{/* Top Badges Overlay */}
					<div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 pointer-events-none z-20">
						<Badge
							variant="fileType"
							value={preset.fileType || "XML"}
							size="sm"
						/>
						<Badge variant="category" value={preset.category} size="sm" />
						<Badge variant="difficulty" value={preset.difficulty} size="sm" />
						{preset.isPaid && (preset.price ?? 0) > 0 ? (
							<span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-amber-400 text-amber-950 border border-amber-300 shadow-sm">
								Rp {(preset.price ?? 0).toLocaleString("id-ID")}
							</span>
						) : (
							<span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-emerald-500/90 text-white border border-emerald-400/40 shadow-sm">
								FREE
							</span>
						)}
					</div>

					{variant === "featured" && (
						<div className="absolute bottom-3 left-3 pointer-events-none z-0 rounded-md bg-purple-900/40 border border-purple-500/40 px-2.5 py-1 text-[var(--font-size-label-sm)] font-bold text-purple-300">
							Featured
						</div>
					)}

					{/* Audio Preview Sound Toggle */}
					{hasVideo && (
						<button
							type="button"
							onClick={toggleAudio}
							onMouseDown={(e) => e.stopPropagation()}
							onTouchStart={(e) => e.stopPropagation()}
							aria-label={
								isMuted ? "Unmute preview audio" : "Mute preview audio"
							}
							className="absolute bottom-2.5 right-2.5 z-30 p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-all opacity-80 group-hover:opacity-100 active:scale-90 shadow-md cursor-pointer pointer-events-auto"
						>
							{isMuted ? (
								<VolumeX className="w-3.5 h-3.5 text-white/80" />
							) : (
								<Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
							)}
						</button>
					)}
				</div>

				{/* Content Section */}
				<div className="flex flex-1 flex-col p-3 sm:p-4 relative">
					{/* Creator Header */}
					<div className="mb-2 sm:mb-3 flex items-center justify-between">
						<div className="flex items-center gap-1.5 sm:gap-2 relative z-20 min-w-0">
							<a
								href={`/u/${preset.creator.username}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0"
							>
								<div
									className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 overflow-hidden rounded-full aspect-square flex items-center justify-center"
									style={{
										width: 24,
										height: 24,
										minWidth: 24,
										minHeight: 24,
										maxWidth: 28,
										maxHeight: 28,
									}}
								>
									<Avatar
										displayName={preset.creator.displayName}
										src={preset.creator.avatarUrl}
										alt={`${preset.creator.displayName}'s profile photo`}
										size="sm"
									/>
								</div>
								<div className="flex items-center gap-1 min-w-0">
									<span className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)] truncate">
										@{preset.creator.username}
									</span>
									{preset.creator.isVerified && (
										<span
											className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-[var(--color-interactive-primary)] text-white text-[8px] font-black shrink-0 shadow-sm"
											title="Verified Creator"
										>
											✓
										</span>
									)}
								</div>
							</a>
						</div>

						{showFollow && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleFollow}
								aria-label="Follow creator"
								className="relative z-20"
							>
								<UserPlus className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Title & Description */}
					<h3 className="mb-1 text-sm sm:text-base font-semibold text-[var(--color-text-primary)] group-hover:text-purple-300 transition-colors line-clamp-1">
						{preset.title}
					</h3>
					<p className="mb-3 text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2">
						{preset.description}
					</p>

					{/* Actions Footer Row */}
					<div className="mt-auto flex items-center justify-between relative z-20">
						<div className="flex items-center gap-1.5 sm:gap-2">
							<button
								type="button"
								onClick={handleLike}
								aria-label={isLiked ? "Unlike preset" : "Like preset"}
								aria-pressed={isLiked}
								className={cn(
									"inline-flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg border text-xs font-bold transition-all active:scale-95 shadow-sm",
									isLiked
										? "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-rose-500/10"
										: "bg-rose-500/[0.08] text-rose-300/90 border-rose-500/25 hover:bg-rose-500/15 hover:border-rose-500/40 hover:text-rose-200",
								)}
							>
								<Heart
									className={cn(
										"h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
										isLiked
											? "fill-rose-500 text-rose-500"
											: "text-rose-400 fill-rose-400/15",
									)}
								/>
								<span className="text-xs font-bold">{likeCount}</span>
							</button>

							<button
								type="button"
								onClick={handleBookmark}
								aria-label={
									isBookmarked ? "Remove bookmark" : "Bookmark preset"
								}
								aria-pressed={isBookmarked}
								className={cn(
									"inline-flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg border text-xs font-bold transition-all active:scale-95 shadow-sm",
									isBookmarked
										? "bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-amber-500/10"
										: "bg-amber-500/[0.08] text-amber-300/90 border-amber-500/25 hover:bg-amber-500/15 hover:border-amber-500/40 hover:text-amber-200",
								)}
							>
								<Bookmark
									className={cn(
										"h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
										isBookmarked
											? "fill-amber-400 text-amber-400"
											: "text-amber-400 fill-amber-400/15",
									)}
								/>
								<span className="text-xs font-bold">{bookmarkCount}</span>
							</button>

							<a
								href={`/preset/${preset.slug}#comments-section`}
								onClick={(e) => e.stopPropagation()}
								aria-label="Lihat Komentar"
								className={cn(
									"inline-flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg border text-xs font-bold transition-all active:scale-95 shadow-sm",
									"bg-blue-500/[0.08] text-blue-300/90 border-blue-500/25 hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-blue-200",
								)}
							>
								<MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400 fill-blue-400/15" />
								<span className="text-xs font-bold">{preset.commentCount ?? 0}</span>
							</a>

							<button
								type="button"
								onClick={handleShare}
								aria-label="Share preset"
								className="inline-flex items-center justify-center h-8 sm:h-8.5 w-8 sm:w-8.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all active:scale-95 shadow-sm"
							>
								<Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							</button>

							{/* Owner Trash Icon Button */}
							{isOwner && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setDeleteError(null);
										setShowDeleteModal(true);
									}}
									aria-label="Delete preset"
									title="Delete preset"
									className="inline-flex items-center justify-center h-8 sm:h-8.5 w-8 sm:w-8.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all active:scale-95 text-xs font-semibold"
								>
									<Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Delete Confirmation Dialog Modal */}
				{showDeleteModal && (
					// biome-ignore lint/a11y/useSemanticElements: modal backdrop overlay
					<div
						role="dialog"
						aria-modal="true"
						tabIndex={-1}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
						onClick={(e) => {
							e.stopPropagation();
							if (!isDeleting) setShowDeleteModal(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Escape" && !isDeleting) {
								e.stopPropagation();
								setShowDeleteModal(false);
							}
						}}
					>
						<div
							role="document"
							className="mx-4 w-full max-w-sm rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4 text-left"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<div className="space-y-2">
								<h3 className="text-lg font-bold text-[var(--color-text-primary)]">
									Delete preset?
								</h3>
								<p className="text-sm text-[var(--color-text-secondary)]">
									Are you sure you want to delete &ldquo;{preset.title}&rdquo;?
									This action cannot be undone.
								</p>
								{deleteError && (
									<p className="text-xs font-semibold text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
										{deleteError}
									</p>
								)}
							</div>

							<div className="flex items-center gap-3 pt-2">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setShowDeleteModal(false);
									}}
									disabled={isDeleting}
									className="flex-1 min-h-[42px] rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-50"
								>
									Cancel
								</button>

								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleDelete();
									}}
									disabled={isDeleting}
									className="flex-1 min-h-[42px] rounded-lg bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
								>
									{isDeleting ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
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
			</div>
		);
	},
);

PresetCard.displayName = "PresetCard";
