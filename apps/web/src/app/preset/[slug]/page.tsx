"use client";

import { type PresetCardPreset, PresetDetail } from "@presethub/ui";
import { use } from "react";

export default function PresetDetailPage({
	params,
}: { params: Promise<{ slug: string }> }) {
	const { slug } = use(params);

	// Placeholder preset data
	const preset: PresetCardPreset & {
		fileType: "flstudio" | "ableton" | "logic" | "studioone";
	} = {
		id: "1",
		slug: slug,
		title: "Deep House Bass",
		description: "A deep house bass preset for FL Studio.",
		thumbnailUrl: "/thumbnail.jpg",
		previewVideoUrl: "/preview.mp4",
		category: "Bass",
		difficulty: "beginner",
		downloadCount: 100,
		likeCount: 50,
		commentCount: 5,
		viewCount: 200,
		creator: {
			username: "producer1",
			displayName: "Producer One",
			avatarUrl: "/avatar.jpg",
			isVerified: false,
		},
		isFeatured: false,
		createdAt: "2024-01-01",
		fileType: "flstudio",
	};

	return (
		<PresetDetail
			preset={preset}
			onLike={() => {}}
			onBookmark={() => {}}
			onFollow={() => {}}
			relatedPresets={[]}
		/>
	);
}
