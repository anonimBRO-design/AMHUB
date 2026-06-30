import * as React from "react";
import { cn } from "../../lib/utils";

export interface VideoPlayerProps {
	src: string;
	thumbnailUrl: string;
	context: "card" | "detail";
	autoplayOnHover?: boolean;
	loop?: boolean;
	className?: string;
}

export const VideoPlayer = ({
	src,
	thumbnailUrl,
	context,
	autoplayOnHover = true,
	loop = true,
	className,
}: VideoPlayerProps) => {
	const videoRef = React.useRef<HTMLVideoElement>(null);

	const handleMouseEnter = () => {
		if (context === "card" && autoplayOnHover && videoRef.current) {
			videoRef.current.play();
		}
	};

	const handleMouseLeave = () => {
		if (context === "card" && autoplayOnHover && videoRef.current) {
			videoRef.current.pause();
			videoRef.current.currentTime = 0;
		}
	};

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-[var(--radius-lg)]",
				className,
			)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<img
				src={thumbnailUrl}
				alt="Video thumbnail"
				className={cn(
					"h-full w-full object-cover transition-opacity duration-300",
					context === "card" ? "group-hover:opacity-0" : "hidden",
				)}
			/>
			<video
				ref={videoRef}
				src={src}
				muted
				loop={loop}
				className="absolute inset-0 h-full w-full object-cover"
				controls={context === "detail"}
			/>
		</div>
	);
};
