import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { cn } from "../../lib/utils";

const creatorCardVariants = cva(
	"flex rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-4 transition-all hover:shadow-[var(--shadow-card-hover)]",
	{
		variants: {
			variant: {
				card: "flex-col items-center gap-3 w-64 text-center",
				mini: "flex-row items-center gap-3 w-full",
				leaderboard: "flex-row items-center gap-4 w-full",
			},
		},
		defaultVariants: {
			variant: "card",
		},
	},
);

export interface CreatorCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof creatorCardVariants> {
	creator: {
		username: string;
		displayName: string;
		avatarUrl?: string;
		bio?: string;
		isVerified: boolean;
		presetCount: number;
		followerCount: number;
		totalDownloads: number;
		level?: number;
		isFollowing?: boolean;
	};
	rank?: number;
	onFollow?: (username: string) => void;
}

export const CreatorCard = React.forwardRef<HTMLDivElement, CreatorCardProps>(
	({ creator, variant = "card", rank, onFollow, className, ...props }, ref) => {
		const [isFollowing, setIsFollowing] = React.useState(!!creator.isFollowing);

		const handleFollow = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsFollowing(!isFollowing);
			onFollow?.(creator.username);
		};

		const handleViewProfile = (e: React.MouseEvent) => {
			e.stopPropagation();
			window.location.href = `/u/${creator.username}`;
		};

		return (
			<div
				ref={ref}
				className={cn(
					creatorCardVariants({ variant }),
					variant === "card" && "relative",
					className,
				)}
				{...props}
			>
				<a href={`/u/${creator.username}`} className="absolute inset-0 z-0">
					<span className="sr-only">{creator.displayName}</span>
				</a>

				<div className="relative z-10 flex w-full flex-col items-center gap-3">
					{variant === "leaderboard" && rank && (
						<span className="text-[var(--font-size-heading-md)] font-bold text-[var(--color-text-tertiary)]">
							#{rank}
						</span>
					)}

					<Avatar
						displayName={creator.displayName}
						src={creator.avatarUrl}
						alt={`${creator.displayName}'s profile photo`}
						size={variant === "card" ? "xl" : "sm"}
						isVerified={creator.isVerified}
						level={creator.level}
					/>

					<div
						className={cn(
							"flex flex-col",
							variant === "card" ? "items-center" : "items-start",
						)}
					>
						<h3 className="text-[var(--font-size-heading-sm)] font-semibold text-[var(--color-text-primary)]">
							{creator.displayName}
						</h3>
						<p className="text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)]">
							@{creator.username}
						</p>
						{variant === "card" && creator.bio && (
							<p className="mt-2 text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)]">
								{creator.bio}
							</p>
						)}
					</div>

					{variant !== "mini" && (
						<div className="mt-auto flex w-full justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3 text-[var(--font-size-body-xs)] text-[var(--color-text-secondary)]">
							<div
								className="flex flex-col items-center"
								aria-label={`${creator.presetCount} Presets`}
							>
								<span className="font-semibold text-[var(--color-text-primary)]">
									{creator.presetCount}
								</span>
								<span>Presets</span>
							</div>
							<div
								className="flex flex-col items-center"
								aria-label={`${creator.followerCount} Followers`}
							>
								<span className="font-semibold text-[var(--color-text-primary)]">
									{creator.followerCount}
								</span>
								<span>Followers</span>
							</div>
							<div
								className="flex flex-col items-center"
								aria-label={`${creator.totalDownloads} Downloads`}
							>
								<span className="font-semibold text-[var(--color-text-primary)]">
									{creator.totalDownloads}
								</span>
								<span>Downloads</span>
							</div>
						</div>
					)}

					{variant === "card" && (
						<div className="mt-3 flex w-full gap-2">
							<Button
								variant={isFollowing ? "secondary" : "default"}
								size="sm"
								className="flex-1"
								onClick={handleFollow}
								aria-label={isFollowing ? "Unfollow" : "Follow"}
								aria-pressed={isFollowing}
							>
								{isFollowing ? "Following" : "Follow"}
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={handleViewProfile}
							>
								View Profile
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	},
);

CreatorCard.displayName = "CreatorCard";
