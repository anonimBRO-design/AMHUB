"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { CommentSection } from "./CommentSection";
import { CreatorCard } from "./CreatorCard";
import { Hero } from "./Hero";
import { InstallSection } from "./InstallSection";
import { MobilePresetView } from "./MobilePresetView";
import { RelatedPresets } from "./RelatedPresets";
import { StickyActionBar } from "./StickyActionBar";
import { TagList } from "./TagList";

interface CommentItem {
	id: string;
	content: string;
	createdAt: string;
	user: {
		username: string;
		displayName: string;
		avatarUrl?: string | null;
	};
}

interface PresetDetailClientProps {
	preset: PresetCardPreset & {
		fileType?: string;
		fileUrl?: string | null;
		amLink?: string | null;
	};
	relatedPresets: PresetCardPreset[];
	comments?: CommentItem[];
}

export function PresetDetailClient({
	preset,
	relatedPresets,
	comments = [],
}: PresetDetailClientProps) {
	const presetForMobile = {
		...preset,
		likeCount: preset.likeCount,
		commentCount: comments.length || preset.commentCount,
		viewCount: preset.viewCount,
		downloadCount: preset.downloadCount,
		createdAt: preset.createdAt,
		fileSize: preset.fileType?.toUpperCase() || "XML",
		downloadUrl: preset.fileUrl || preset.amLink || "#",
		comments: comments,
	};

	return (
		<div>
			{/* Dedicated Native Mobile Composition (max-width: 768px) */}
			<MobilePresetView preset={presetForMobile} />

			{/* Desktop and Tablet Layout (Hidden on Mobile) */}
			<div className="hidden md:block space-y-8 pb-24 sm:pb-12 max-w-5xl mx-auto">
				<Hero preset={preset} />

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
					<div className="lg:col-span-2 space-y-6">
						<InstallSection preset={preset} />
						<TagList preset={preset} />
						<CommentSection
							presetId={preset.id}
							initialComments={comments}
							commentCount={comments.length || preset.commentCount}
						/>
					</div>

					<div className="space-y-6">
						<CreatorCard creator={preset.creator} />
					</div>
				</div>

				<RelatedPresets presets={relatedPresets} category={preset.category} />
				<StickyActionBar preset={preset} />
			</div>
		</div>
	);
}
