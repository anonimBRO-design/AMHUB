import { type VariantProps, cva } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const avatarVariants = cva(
	"relative flex shrink-0 overflow-hidden rounded-[var(--radius-full)] items-center justify-center",
	{
		variants: {
			size: {
				xs: "h-[20px] w-[20px] text-[8px]",
				sm: "h-[28px] w-[28px] text-[11px]",
				md: "h-[36px] w-[36px] text-[14px]",
				lg: "h-[48px] w-[48px] text-[18px]",
				xl: "h-[64px] w-[64px] text-[24px]",
				"2xl": "h-[96px] w-[96px] text-[36px]",
				"3xl": "h-[128px] w-[128px] text-[48px]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
	src?: string;
	alt: string;
	displayName: string;
	status?: "online" | "offline";
	level?: number;
	isVerified?: boolean;
	ring?: boolean;
	className?: string;
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
			size,
			src,
			alt,
			displayName,
			status,
			level,
			isVerified,
			ring,
			...props
		},
		ref,
	) => {
		const [imageLoaded, setImageLoaded] = React.useState(false);
		const [imageError, setImageError] = React.useState(false);

		const seedColor = getSeedColor(displayName);
		const seedColorVar = `var(--color-avatar-seed-${seedColor})`;

		const getLevelGradient = (lvl?: number) => {
			if (!lvl) return "";
			if (lvl <= 2) return "ring-[var(--color-rarity-common)]";
			if (lvl <= 4) return "ring-[var(--color-rarity-rare)]";
			if (lvl <= 6) return "ring-[var(--color-rarity-epic)]";
			return "ring-transparent bg-gradient-to-br from-[var(--color-rarity-legendary-start)] to-[var(--color-rarity-legendary-end)]";
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
				{...props}
			>
				{!imageError && src ? (
					<img
						src={src}
						alt={alt}
						className="h-full w-full object-cover rounded-full"
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
