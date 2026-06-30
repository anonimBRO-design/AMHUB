import * as React from "react";
import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { DownloadButton } from "../../molecules/download-button/download-button";
import type { PresetCardPreset } from "../../molecules/preset-card/preset-card";
import { VideoPlayer } from "../../molecules/video-player/video-player";

export interface PresetDetailProps {
	preset: PresetCardPreset & {
		fileType: "flstudio" | "ableton" | "logic" | "studioone";
	};
	onLike: () => void;
	onBookmark: () => void;
	onFollow: () => void;
	relatedPresets: PresetCardPreset[];
}

export const PresetDetail = ({
	preset,
	onLike,
	onBookmark,
	onFollow,
}: PresetDetailProps) => {
	return (
		<article className="grid grid-cols-1 md:grid-cols-5 gap-8">
			<div className="md:col-span-3">
				<VideoPlayer
					src={preset.previewVideoUrl || ""}
					thumbnailUrl={preset.thumbnailUrl}
					context="detail"
				/>
			</div>
			<div className="md:col-span-2 space-y-4">
				<div className="flex items-center gap-3">
					<Avatar
						src={preset.creator.avatarUrl}
						alt={preset.creator.displayName}
						displayName={preset.creator.displayName}
						size="md"
					/>
					<span className="font-semibold">{preset.creator.displayName}</span>
					<Button variant="secondary" size="sm" onClick={onFollow}>
						Follow
					</Button>
				</div>
				<h1 className="text-3xl font-bold">{preset.title}</h1>
				<p className="text-gray-600">{preset.description}</p>
				<DownloadButton
					presetId={preset.id}
					fileType={
						preset.fileType === "flstudio" ||
						preset.fileType === "ableton" ||
						preset.fileType === "logic" ||
						preset.fileType === "studioone"
							? "xml"
							: "link"
					}
					isAuthenticated={true}
				/>
			</div>
		</article>
	);
};
