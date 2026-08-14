"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const avatarSizesPx = {
	xs: 20,
	sm: 28,
	md: 36,
	lg: 48,
	xl: 64,
	"2xl": 96,
	"3xl": 128,
} as const;

const avatarVariants = cva(
	"relative flex shrink-0 overflow-hidden rounded-full items-center justify-center aspect-square",
	{
		variants: {
			size: {
				xs: "w-5 h-5 min-w-5 min-h-5 max-w-5 max-h-5 text-[8px]",
				sm: "w-7 h-7 min-w-7 min-h-7 max-w-7 max-h-7 text-[11px]",
				md: "w-9 h-9 min-w-9 min-h-9 max-w-9 max-h-9 text-[14px]",
				lg: "w-12 h-12 min-w-12 min-h-12 max-w-12 max-h-12 text-[18px]",
				xl: "w-16 h-16 min-w-16 min-h-16 max-w-16 max-h-16 text-[24px]",
				"2xl": "w-24 h-24 min-w-24 min-h-24 max-w-24 max-h-24 text-[36px]",
				"3xl": "w-32 h-32 min-w-32 min-h-32 max-w-32 max-h-32 text-[48px]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

export interface AvatarProps
	extends VariantProps<typeof avatarVariants>,
		React.HTMLAttributes<HTMLDivElement> {
	src?: string;
	alt: string;
	displayName: string;
	status?: "online" | "offline";
	level?: number;
	isVerified?: boolean;
	ring?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

const getInitials = (name: string) => {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
};

const getSeedColor = (name: string) => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return (Math.abs(hash) % 10) + 1; // 1-10
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
	(
		{
			className,
			size = "md",
			src,
			alt,
			displayName,
			status,
			level,
			isVerified,
			ring,
			style,
			...props
		},
		ref,
	) => {
		const [imageLoaded, setImageLoaded] = React.useState(false);
		const [imageError, setImageError] = React.useState(false);

		const seedColor = getSeedColor(displayName);
		const seedColorVar = `var(--color-avatar-seed-${seedColor})`;
		const pixelDimension = avatarSizesPx[size || "md"] || 36;

		const getLevelGradient = (lvl?: number) => {
			if (!lvl) return "";
			if (lvl <= 2) return "ring-[var(--color-rarity-common)]";
			if (lvl <= 4) return "ring-[var(--color-rarity-rare)]";
			if (lvl <= 6) return "ring-[var(--color-rarity-epic)]";
			return "ring-[var(--color-rarity-legendary-start)]";
		};

		return (
			<div
				ref={ref}
				className={cn(
					avatarVariants({ size }),
					className,
					ring &&
						"ring-2 ring-[var(--color-border-accent)] ring-offset-2 ring-offset-[var(--color-bg-base)]",
					level && "p-0.5 ring-2",
					getLevelGradient(level),
				)}
				style={{
					width: pixelDimension,
					height: pixelDimension,
					minWidth: pixelDimension,
					minHeight: pixelDimension,
					maxWidth: pixelDimension,
					maxHeight: pixelDimension,
					...style,
				}}
				{...props}
			>
				{!imageError && src ? (
					<img
						src={src}
						alt={alt}
						className="h-full w-full object-cover rounded-full pointer-events-none block shrink-0"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							maxWidth: "100%",
							maxHeight: "100%",
						}}
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageError(true)}
					/>
				) : (
					<div
						className="h-full w-full flex items-center justify-center text-[var(--color-text-inverse)] rounded-full"
						style={{ backgroundColor: seedColorVar }}
					>
						{getInitials(displayName)}
					</div>
				)}

				{isVerified && (
					<div
						className="absolute bottom-0 right-0 h-[30%] w-[30%] rounded-full bg-[var(--color-interactive-primary)] border-2 border-[var(--color-bg-base)] flex items-center justify-center text-[var(--color-text-inverse)]"
						aria-label="Verified creator"
						aria-hidden="false"
					>
						<Check className="h-[70%] w-[70%]" />
					</div>
				)}

				{status && (
					<div
						className={cn(
							"absolute bottom-0 right-0 h-[25%] w-[25%] rounded-full border border-[var(--color-bg-base)]",
							status === "online"
								? "bg-[var(--color-text-success)]"
								: "bg-[var(--color-text-tertiary)]",
						)}
						aria-hidden="true"
					/>
				)}
			</div>
		);
	},
);
Avatar.displayName = "Avatar";

export { Avatar };
