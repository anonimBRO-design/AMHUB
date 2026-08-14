"use client";

import { Bookmark, Heart, Share2, UserPlus } from "lucide-react";
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
}

const PRESET_PLACEHOLDER_SVG =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'><rect width='100%' height='100%' fill='%2318181b'/><path d='M270 140l80 45-80 45v-90z' fill='%23a855f7'/><text x='50%' y='78%' text-anchor='middle' fill='%23a1a1aa' font-family='sans-serif' font-size='14' font-weight='600'>ALIGHT MOTION PRESET</text></svg>";

function getAspectRatioClass(preset: PresetCardPreset): string {
	const rawRatio =
		preset.aspectRatio ||
		(Array.isArray(preset.aspectRatios) && preset.aspectRatios.length > 0
			? preset.aspectRatios[0]
			: undefined);

	if (rawRatio === "9:16" || rawRatio === "portrait") {
		return "aspect-[9/16]";
	}
	if (rawRatio === "1:1" || rawRatio === "square") {
		return "aspect-square";
	}
	return "aspect-[16/9]";
}

interface PresetCardProps extends React.HTMLAttributes<HTMLDivElement> {
	preset: PresetCardPreset;
	variant?: "default" | "featured" | "trending" | "compact";
	showFollow?: boolean;
	onLike?: (presetId: string) => void;
	onBookmark?: (presetId: string) => void;
	onShare?: (presetId: string) => void;
	onFollow?: (presetId: string) => void;
}

export const PresetCard = React.forwardRef<HTMLDivElement, PresetCardProps>(
	(
		{
			preset,
			variant = "default",
			showFollow,
			onLike,
			onBookmark,
			onShare,
			onFollow,
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
			setIsLiked(!isLiked);
			onLike?.(preset.id);
		};

		const handleBookmark = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsBookmarked(!isBookmarked);
			onBookmark?.(preset.id);
		};

		const handleShare = (e: React.MouseEvent) => {
			e.stopPropagation();
			onShare?.(preset.id);
		};

		const handleFollow = (e: React.MouseEvent) => {
			e.stopPropagation();
			onFollow?.(preset.id);
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
				<a href={`/preset/${preset.slug}`} className="absolute inset-0 z-0">
					<span className="sr-only">{preset.title}</span>
				</a>

				<div
					className={cn(
						"relative w-full overflow-hidden shrink-0 bg-[var(--color-bg-base)]",
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
							className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
						/>
					) : (
						<img
							src={hasThumbnail ? preset.thumbnailUrl : PRESET_PLACEHOLDER_SVG}
							alt={`${preset.title} — ${preset.category} preset`}
							className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
							loading="lazy"
							onError={(e) => {
								const target = e.currentTarget;
								if (target.src !== PRESET_PLACEHOLDER_SVG) {
									target.src = PRESET_PLACEHOLDER_SVG;
								}
							}}
						/>
					)}

					<div className="absolute inset-0 bg-[var(--color-bg-base)]/80 group-hover:bg-[var(--color-bg-base)]/60 transition-opacity duration-300 pointer-events-none" />

					<div className="absolute left-3 top-3 flex gap-2 z-10">
						<Badge variant="category" value={preset.category} size="sm" />
						<Badge variant="difficulty" value={preset.difficulty} size="sm" />
					</div>

					{variant === "featured" && (
						<div className="absolute bottom-3 right-3 z-10 rounded-lg bg-purple-900/40 border border-purple-500/40 px-2.5 py-1 text-[var(--font-size-label-sm)] font-bold text-purple-300">
							Featured
						</div>
					)}
				</div>

				<div className="flex flex-1 flex-col p-4 relative z-10">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Avatar
								displayName={preset.creator.displayName}
								src={preset.creator.avatarUrl}
								alt={`${preset.creator.displayName}'s profile photo`}
								size="sm"
								isVerified={preset.creator.isVerified}
							/>
							<span className="text-[var(--font-size-label-md)] font-medium text-[var(--color-text-primary)]">
								@{preset.creator.username}
							</span>
						</div>
						{showFollow && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleFollow}
								aria-label="Follow creator"
							>
								<UserPlus className="h-4 w-4" />
							</Button>
						)}
					</div>

					<h3 className="mb-1 text-[var(--font-size-heading-md)] font-semibold text-[var(--color-text-primary)] group-hover:text-purple-300 transition-colors">
						{preset.title}
					</h3>
					<p className="mb-4 text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)] line-clamp-2">
						{preset.description}
					</p>

					<div className="mt-auto flex items-center gap-2">
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
							aria-label={isBookmarked ? "Remove bookmark" : "Bookmark preset"}
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
					</div>
				</div>
			</div>
		);
	},
);

PresetCard.displayName = "PresetCard";
