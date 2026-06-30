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

		const showVideo =
			isHovered && !prefersReducedMotion && preset.previewVideoUrl;

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
					"group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
					variant === "featured" &&
						"border-2 border-[var(--color-border-accent)] shadow-[var(--shadow-glow-md)]",
					className,
				)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				<a href={`/preset/${preset.slug}`} className="absolute inset-0 z-0">
					<span className="sr-only">{preset.title}</span>
				</a>

				<div className="relative aspect-[4/3] w-full overflow-hidden">
					{showVideo ? (
						<video
							ref={videoRef}
							src={preset.previewVideoUrl}
							autoPlay
							muted
							loop
							playsInline
							className="h-full w-full object-cover"
						/>
					) : (
						<img
							src={preset.thumbnailUrl}
							alt={`${preset.title} by ${preset.creator.displayName} — ${preset.category} preset`}
							className="h-full w-full object-cover"
							loading="lazy"
						/>
					)}

					<div className="absolute left-3 top-3 flex gap-2">
						<Badge variant="category" value={preset.category} size="sm" />
						<Badge variant="difficulty" value={preset.difficulty} size="sm" />
					</div>

					{variant === "featured" && (
						<div className="absolute bottom-3 right-3 rounded-[var(--radius-md)] bg-[var(--color-bg-accent)] px-2 py-1 text-[var(--font-size-label-sm)] font-medium text-[var(--color-text-accent)]">
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

					<h3 className="mb-1 text-[var(--font-size-heading-md)] font-semibold text-[var(--color-text-primary)]">
						{preset.title}
					</h3>
					<p className="mb-4 text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)]">
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
							<Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBookmark}
							aria-label={isBookmarked ? "Remove bookmark" : "Bookmark preset"}
							aria-pressed={isBookmarked}
						>
							<Bookmark
								className={cn("h-4 w-4", isBookmarked && "fill-current")}
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
