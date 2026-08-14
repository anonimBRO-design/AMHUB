"use client";

import {
	Bookmark,
	Heart,
	Loader2,
	Share2,
	Trash2,
	UserPlus,
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
		const [isLiked, setIsLiked] = React.useState(!!preset.isLiked);
		const [isBookmarked, setIsBookmarked] = React.useState(
			!!preset.isBookmarked,
		);
		const [showDeleteModal, setShowDeleteModal] = React.useState(false);
		const [isDeleting, setIsDeleting] = React.useState(false);
		const [deleteError, setDeleteError] = React.useState<string | null>(null);
		const videoRef = React.useRef<HTMLVideoElement>(null);

		React.useEffect(() => {
			const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
			setPrefersReducedMotion(mediaQuery.matches);
			const listener = (e: MediaQueryListEvent) =>
				setPrefersReducedMotion(e.matches);
			mediaQuery.addEventListener("change", listener);
			return () => mediaQuery.removeEventListener("change", listener);
		}, []);

		const hasVideo = Boolean(
			preset.previewVideoUrl && preset.previewVideoUrl.trim(),
		);
		const hasThumbnail = Boolean(
			preset.thumbnailUrl && preset.thumbnailUrl.trim(),
		);
		const aspectRatioClass = getAspectRatioClass(preset);

		const handleMouseEnter = () => setIsHovered(true);
		const handleMouseLeave = () => {
			setIsHovered(false);
			if (videoRef.current) {
				videoRef.current.pause();
				videoRef.current.currentTime = 0;
			}
		};

		const handleLike = (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			setIsLiked(!isLiked);
			onLike?.(preset.id);
		};

		const handleBookmark = (e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
			setIsBookmarked(!isBookmarked);
			onBookmark?.(preset.id);
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
				/>

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
							autoPlay
							muted
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
					</div>

					{variant === "featured" && (
						<div className="absolute bottom-3 right-3 pointer-events-none z-0 rounded-lg bg-purple-900/40 border border-purple-500/40 px-2.5 py-1 text-[var(--font-size-label-sm)] font-bold text-purple-300">
							Featured
						</div>
					)}
				</div>

				{/* Content Section */}
				<div className="flex flex-1 flex-col p-4 relative">
					{/* Creator Header */}
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2 relative z-20">
							<a
								href={`/u/${preset.creator.username}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-2 hover:opacity-80 transition-opacity"
							>
								<div
									className="w-7 h-7 min-w-7 min-h-7 max-w-7 max-h-7 shrink-0 overflow-hidden rounded-full aspect-square flex items-center justify-center"
									style={{
										width: 28,
										height: 28,
										minWidth: 28,
										minHeight: 28,
										maxWidth: 28,
										maxHeight: 28,
									}}
								>
									<Avatar
										displayName={preset.creator.displayName}
										src={preset.creator.avatarUrl}
										alt={`${preset.creator.displayName}'s profile photo`}
										size="sm"
										isVerified={preset.creator.isVerified}
									/>
								</div>
								<span className="text-[var(--font-size-label-md)] font-medium text-[var(--color-text-primary)]">
									@{preset.creator.username}
								</span>
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
					<h3 className="mb-1 text-[var(--font-size-heading-md)] font-semibold text-[var(--color-text-primary)] group-hover:text-purple-300 transition-colors">
						{preset.title}
					</h3>
					<p className="mb-4 text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)] line-clamp-2">
						{preset.description}
					</p>

					{/* Actions Footer Row */}
					<div className="mt-auto flex items-center justify-between relative z-20">
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLike}
								aria-label={isLiked ? "Unlike preset" : "Like preset"}
								aria-pressed={isLiked}
							>
								<Heart
									className={cn(
										"h-4 w-4 transition-colors",
										isLiked && "fill-rose-500 text-rose-500",
									)}
								/>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={handleBookmark}
								aria-label={
									isBookmarked ? "Remove bookmark" : "Bookmark preset"
								}
								aria-pressed={isBookmarked}
							>
								<Bookmark
									className={cn(
										"h-4 w-4 transition-colors",
										isBookmarked && "fill-purple-400 text-purple-400",
									)}
								/>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={handleShare}
								aria-label="Share preset"
							>
								<Share2 className="h-4 w-4" />
							</Button>

							{/* Owner Trash Icon Button */}
							{isOwner && (
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setDeleteError(null);
										setShowDeleteModal(true);
									}}
									aria-label="Delete preset"
									title="Delete preset"
									className="text-[var(--color-text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Delete Confirmation Dialog Modal */}
				{showDeleteModal && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
						onClick={(e) => {
							e.stopPropagation();
							if (!isDeleting) setShowDeleteModal(false);
						}}
					>
						<div
							className="mx-4 w-full max-w-sm rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-6 shadow-2xl space-y-4 text-left"
							onClick={(e) => e.stopPropagation()}
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
									<p className="text-xs font-semibold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
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
									className="flex-1 min-h-[44px] rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-50"
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
									className="flex-1 min-h-[44px] rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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


