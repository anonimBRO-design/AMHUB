"use client";

import type { PresetCardPreset } from "@presethub/ui";
import { CommentSection } from "./CommentSection";
import { CreatorCard } from "./CreatorCard";
import { Hero } from "./Hero";
import { InstallSection } from "./InstallSection";
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
		isLiked?: boolean;
		isBookmarked?: boolean;
		creator: PresetCardPreset["creator"] & {
			followerCount?: number;
			presetCount?: number;
			isFollowing?: boolean;
		};
	};
	relatedPresets: PresetCardPreset[];
	comments?: CommentItem[];
	currentUserId?: string;
}

export function PresetDetailClient({
	preset,
	relatedPresets,
	comments = [],
	currentUserId,
}: PresetDetailClientProps) {
	return (
		<div className="space-y-8 pb-24 sm:pb-12 max-w-5xl mx-auto px-4 sm:px-0">
			<Hero preset={preset} currentUserId={currentUserId} />

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
	);
}
